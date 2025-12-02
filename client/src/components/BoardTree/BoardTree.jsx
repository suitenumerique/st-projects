import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  useDroppable,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  defaultAnimateLayoutChanges,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from '@gouvfr-lasuite/ui-kit';

import BoardTreeItem from './BoardTreeItem';
import { enrichBoardWithUserPreference } from '../../selectors/user-board-preferences';
import styles from './BoardTree.module.scss';

// ----------------------------------------------------------------------
// HELPER: Position Calculation
// ----------------------------------------------------------------------
const calculateNewPosition = (itemsInList, activeId, overId) => {
  const activeIndex = itemsInList.findIndex((i) => i.id === activeId);
  const overIndex = itemsInList.findIndex((i) => i.id === overId);

  // If dropped at the end or on container
  if (overIndex === -1) {
    return itemsInList.length > 0
      ? (itemsInList[itemsInList.length - 1].position ?? 0) + 65535
      : 65535;
  }

  let newPosition;
  // If we are dragging from outside this list, activeIndex is -1
  // If activeIndex < overIndex, we are moving DOWN
  const isMovingDown = activeIndex !== -1 && activeIndex < overIndex;

  if (isMovingDown) {
    const targetItem = itemsInList[overIndex];
    const nextItem = itemsInList[overIndex + 1];
    const targetPos = targetItem.position ?? 0;
    const nextPos = nextItem ? (nextItem.position ?? targetPos + 65535) : targetPos + 65535;
    newPosition = targetPos + (nextPos - targetPos) / 2;
  } else {
    // Moving UP or Inserting into list
    const targetItem = itemsInList[overIndex];
    const prevItem = itemsInList[overIndex - 1];
    const targetPos = targetItem.position ?? 0;
    const prevPos = prevItem ? (prevItem.position ?? 0) : Math.max(0, targetPos - 65535);
    newPosition = prevPos + (targetPos - prevPos) / 2;
  }
  return Math.floor(newPosition);
};

// ----------------------------------------------------------------------
// COMPONENT: Draggable Item Wrapper
// ----------------------------------------------------------------------
function SortableTreeItem({ id, depth, data, children, isExpanded, onToggle, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: data.type, parentId: data.parentId, entity: data },
    // 2. Add this custom animation strategy
    // This prevents the "jump" or layout thrashing when an item starts/stops dragging
    animateLayoutChanges: (args) => {
      const { isSorting, wasDragging } = args;
      if (isSorting || wasDragging) {
        return defaultAnimateLayoutChanges(args);
      }
      return true;
    },
  });

  const style = {
    // 3. CHANGE THIS: Use Translate instead of Transform
    // 'Translate' moves the item without squishing/scaling it.
    // This eliminates the cumulative error.
    transform: CSS.Translate.toString(transform),

    // 4. CHANGE THIS: Disable transition ONLY for the item being dragged
    // If you animate the item you are holding, it lags behind the mouse (ghost gap misalignment).
    transition: isDragging ? undefined : transition,

    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',

    // 5. Ensure "touch-action" is set here if not in CSS
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...attributes}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...listeners}
      className={styles.sortableWrapper}
    >
      <BoardTreeItem
        item={{ ...data, id, children }}
        level={depth}
        isExpanded={isExpanded}
        onToggle={onToggle}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
      {isExpanded && <div className={styles.nestedContainer}>{children}</div>}
    </div>
  );
}

SortableTreeItem.propTypes = {
  id: PropTypes.string.isRequired,
  depth: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  children: PropTypes.node,
  isExpanded: PropTypes.bool,
  onToggle: PropTypes.func,
};

SortableTreeItem.defaultProps = {
  children: null,
  isExpanded: false,
  onToggle: () => {},
};

// ----------------------------------------------------------------------
// MAIN COMPONENT: BoardTree
// ----------------------------------------------------------------------
const BoardTree = React.memo(
  ({
    boards,
    folders,
    userBoardPreferences = [],
    currentBoardId,
    onBoardClick,
    onBoardUpdate,
    onBoardDelete,
    onFolderUpdate,
    onFolderDelete,
    canEdit,
  }) => {
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [activeId, setActiveId] = useState(null);
    const [activeItemData, setActiveItemData] = useState(null);

    // Use a specific ID for the empty space in the root board section
    const ROOT_BOARD_ZONE_ID = 'root-board-drop-zone';

    // Register the root zone as droppable
    const { setNodeRef: setRootZoneRef, isOver: isOverRootZone } = useDroppable({
      id: ROOT_BOARD_ZONE_ID,
    });

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5,
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      }),
    );

    // 1. Process Data
    const { rootFolders, rootBoards, nestedBoardsMap, flatItems } = useMemo(() => {
      const byPos = (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity);

      // Enrich boards
      const preferenceMap = new Map();
      userBoardPreferences.forEach((pref) => preferenceMap.set(pref.boardId, pref));
      const enrichedBoards = boards.map((b) =>
        enrichBoardWithUserPreference(b, preferenceMap.get(b.id)),
      );

      // Process Folders
      const processedFolders = folders
        .filter((f) => !f.parentFolderId)
        .sort(byPos)
        .map((f) => ({
          id: `folder-${f.id}`,
          type: 'folder',
          parentId: null,
          position: f.position,
          data: f,
          children: [],
        }));

      // Segregate Boards
      // eslint-disable-next-line no-underscore-dangle
      const _nestedMap = {};
      // eslint-disable-next-line no-underscore-dangle
      const _rootBoards = [];

      enrichedBoards.sort(byPos).forEach((b) => {
        const item = {
          id: `board-${b.id}`,
          type: 'board',
          parentId: b.folderId ? `folder-${b.folderId}` : null,
          position: b.position,
          data: b,
        };

        if (b.folderId) {
          if (!_nestedMap[b.folderId]) _nestedMap[b.folderId] = [];
          _nestedMap[b.folderId].push(item);
        } else {
          _rootBoards.push(item);
        }
      });

      // Attach nested to folders (for internal logic)
      processedFolders.forEach((f) => {
        // eslint-disable-next-line no-param-reassign
        f.children = _nestedMap[f.data.id] || [];
      });

      // Flat map for O(1) lookup
      // eslint-disable-next-line no-underscore-dangle
      const _flatItems = {};
      [...processedFolders, ..._rootBoards, ...Object.values(_nestedMap).flat()].forEach((i) => {
        _flatItems[i.id] = i;
      });

      return {
        rootFolders: processedFolders,
        rootBoards: _rootBoards,
        nestedBoardsMap: _nestedMap,
        flatItems: _flatItems,
      };
    }, [boards, folders, userBoardPreferences]);

    // 2. Handlers
    const handleToggle = useCallback((folderId) => {
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        if (next.has(folderId)) next.delete(folderId);
        else next.add(folderId);
        return next;
      });
    }, []);

    const handleDragStart = ({ active }) => {
      setActiveId(active.id);
      setActiveItemData(flatItems[active.id]);
    };

    const handleDragEnd = ({ active, over }) => {
      setActiveId(null);
      setActiveItemData(null);

      // Dropped on nothing or dropped on itself
      if (!over || active.id === over.id) return;

      const activeItem = flatItems[active.id];

      // --- SCENARIO 1: Dragging a FOLDER ---
      if (activeItem.type === 'folder') {
        // Folders cannot go into root zone or over boards
        if (over.id === ROOT_BOARD_ZONE_ID || flatItems[over.id]?.type === 'board') {
          return;
        }

        // Must be over another folder
        const newPos = calculateNewPosition(rootFolders, active.id, over.id);
        if (newPos !== activeItem.position) {
          onFolderUpdate(activeItem.data.id, { position: newPos });
        }
        return;
      }

      // --- SCENARIO 2: Dragging a BOARD ---
      if (activeItem.type === 'board') {
        let targetFolderId = null;
        let targetPosition = 0;

        // Case A: Dropped into the Empty Root Zone (Moving out of folder)
        if (over.id === ROOT_BOARD_ZONE_ID) {
          targetFolderId = null;
          // Place at the very end of root boards
          const lastBoard = rootBoards[rootBoards.length - 1];
          targetPosition = lastBoard ? (lastBoard.position ?? 0) + 65535 : 65535;
        }
        // Case B: Dropped onto a Folder (Moving into folder)
        else if (flatItems[over.id]?.type === 'folder') {
          targetFolderId = flatItems[over.id].data.id;
          // Place at the end of that folder's list
          const targetList = nestedBoardsMap[targetFolderId] || [];
          const lastBoard = targetList[targetList.length - 1];
          targetPosition = lastBoard ? (lastBoard.position ?? 0) + 65535 : 65535;

          // Optional: Auto-expand folder on drop
          if (!expandedFolders.has(targetFolderId)) {
            handleToggle(targetFolderId);
          }
        }
        // Case C: Dropped onto another Board (Reordering)
        else if (flatItems[over.id]?.type === 'board') {
          const overBoard = flatItems[over.id];
          const { parentId } = overBoard;

          if (parentId) {
            // It is inside a folder
            targetFolderId = parentId.replace('folder-', '');
            const siblings = nestedBoardsMap[targetFolderId] || [];
            targetPosition = calculateNewPosition(siblings, active.id, over.id);
          } else {
            // It is at Root
            targetFolderId = null;
            targetPosition = calculateNewPosition(rootBoards, active.id, over.id);
          }
        } else {
          // Dropped somewhere invalid
          return;
        }

        // Execute Update
        onBoardUpdate(activeItem.data.id, {
          folderId: targetFolderId,
          position: targetPosition,
        });
      }
    };

    // Helper to render a list of boards (used for both Root and Nested)
    const renderBoardList = (items, level) => (
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableTreeItem
            key={item.id}
            id={item.id}
            depth={level}
            data={item}
            isActive={item.data.id === currentBoardId}
            canEdit={canEdit}
            onUpdate={onBoardUpdate}
            onDelete={onBoardDelete}
            onClick={() => onBoardClick(item.data.id)}
          />
        ))}
      </SortableContext>
    );

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.tree}>
          {/* --- SECTION 1: FOLDERS --- */}
          {rootFolders.length > 0 && (
            <div className={styles.folderSection}>
              <SortableContext
                items={rootFolders.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {rootFolders.map((folder) => {
                  const isExpanded = expandedFolders.has(folder.data.id);
                  return (
                    <SortableTreeItem
                      key={folder.id}
                      id={folder.id}
                      depth={0}
                      data={folder}
                      isExpanded={isExpanded}
                      onToggle={() => handleToggle(folder.data.id)}
                      canEdit={canEdit}
                      onUpdate={onFolderUpdate}
                      onDelete={onFolderDelete}
                    >
                      {/* Only render nested list if expanded */}
                      {isExpanded && renderBoardList(folder.children, 1)}
                    </SortableTreeItem>
                  );
                })}
              </SortableContext>
            </div>
          )}

          {/* --- SECTION 2: ROOT BOARDS --- */}
          <div
            ref={setRootZoneRef}
            className={classNames(styles.boardSection, {
              [styles.boardSectionActive]: isOverRootZone,
            })}
          >
            {rootBoards.length > 0 ? (
              renderBoardList(rootBoards, 0)
            ) : (
              // Visual cue that you can drop here
              <div className={styles.emptyRootPlaceholder}>
                Glissez ici pour sortir un tableau d&apos;un dossier
              </div>
            )}
          </div>
        </div>

        {/* --- DRAG OVERLAY --- */}
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.4',
                },
              },
            }),
          }}
        >
          {activeId && activeItemData ? (
            <div
              className={styles.dragOverlayItem}
              style={{
                marginLeft:
                  activeItemData.type === 'board' && activeItemData.parentId ? '40px' : '0px',
              }}
            >
              <Icon name={activeItemData.type === 'folder' ? 'folder' : 'dashboard'} />
              <span>{activeItemData.data.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  },
);

BoardTree.propTypes = {
  boards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  folders: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  userBoardPreferences: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  currentBoardId: PropTypes.string,
  onBoardClick: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func.isRequired,
  onBoardDelete: PropTypes.func.isRequired,
  onFolderUpdate: PropTypes.func.isRequired,
  onFolderDelete: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
};

BoardTree.defaultProps = {
  currentBoardId: undefined,
  userBoardPreferences: [],
};

export default BoardTree;
