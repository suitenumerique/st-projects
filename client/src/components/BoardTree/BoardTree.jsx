import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
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
  useDndContext,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  defaultAnimateLayoutChanges,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import BoardTreeItem from './BoardTreeItem';
import { enrichBoardWithUserPreference } from '../../selectors/user-board-preferences';
import styles from './BoardTree.module.scss';

const calculateNewPosition = (itemsInList, active, over) => {
  const activeId = active.id;
  const overId = over.id;
  const activeIndex = itemsInList.findIndex((i) => i.id === activeId);
  const overIndex = itemsInList.findIndex((i) => i.id === overId);

  // If dropped at the end or on container
  if (overIndex === -1) {
    return itemsInList.length > 0
      ? (itemsInList[itemsInList.length - 1].position ?? 0) + 65535
      : 65535;
  }

  // Determine Direction
  let isMovingDown;

  // SCENARIO A: Reordering within the same list
  if (activeIndex !== -1) {
    isMovingDown = activeIndex < overIndex;
  }
  // SCENARIO B: Moving between lists (Cross-Container)
  else {
    // Use Geometry (Center-to-Center) to determine insertion point
    const activeRect = active.rect.current.translated;
    const overRect = over.rect;

    if (activeRect && overRect) {
      const activeCenterY = activeRect.top + activeRect.height / 2;
      const overCenterY = overRect.top + overRect.height / 2;
      isMovingDown = activeCenterY > overCenterY;
    } else {
      // Fallback if rects unavailable (should be rare)
      isMovingDown = true; // Default to Insert After
    }
  }

  let newPosition;

  if (isMovingDown) {
    // Insert AFTER the target
    const targetItem = itemsInList[overIndex];
    const nextItem = itemsInList[overIndex + 1];
    const targetPos = targetItem.position ?? 0;
    const nextPos = nextItem ? (nextItem.position ?? targetPos + 65535) : targetPos + 65535;
    newPosition = targetPos + (nextPos - targetPos) / 2;
  } else {
    // Insert BEFORE the target
    const targetItem = itemsInList[overIndex];
    const prevItem = itemsInList[overIndex - 1];
    const targetPos = targetItem.position ?? 0;
    const prevPos = prevItem ? (prevItem.position ?? 0) : Math.max(0, targetPos - 65535);
    newPosition = prevPos + (targetPos - prevPos) / 2;
  }
  return Math.floor(newPosition);
};

function SortableTreeItem({
  id,
  depth,
  data,
  children,
  isExpanded,
  onToggle,
  disabled,
  disableHover,
  ...props
}) {
  const { attributes, listeners, setNodeRef, transition, isDragging, isOver } = useSortable({
    id,
    data: { type: data.type, parentId: data.parentId, entity: data },
    disabled,
    animateLayoutChanges: (args) => {
      const { isSorting, wasDragging } = args;
      if (isSorting || wasDragging) {
        return defaultAnimateLayoutChanges(args);
      }
      return true;
    },
  });

  const { active, over } = useDndContext();

  let showLineTop = false;
  let showLineBottom = false;
  let isDropTarget = false;

  console.log('active', active);
  console.log('over', over);

  if (isOver && active && over && active.id !== over.id) {
    const activeSortable = active.data.current?.sortable;
    const overSortable = over.data.current?.sortable;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // Case 1: Dragging Board OVER Folder -> Highlight Folder (Drop Inside)
    if (activeType === 'board' && overType === 'folder') {
      // Check if the board is already in this folder
      const parentId = active.data.current?.parentId;
      const folderId = over.id;

      // Only highlight as drop target if it's NOT the current parent
      if (parentId !== folderId) {
        isDropTarget = true;
      }
      // Do NOT show lines, because we are dropping inside, not reordering
    }
    // Case 2: Standard Reordering (Board<->Board)
    // Relaxed condition: Check types OR sortables (to handle single-item lists where sortables might be undefined)
    else if ((activeSortable && overSortable) || (activeType === 'board' && overType === 'board')) {
      // If both sortables exist AND are in same container, use Index Logic (Stable)
      if (
        activeSortable &&
        overSortable &&
        activeSortable.containerId === overSortable.containerId
      ) {
        const activeIndex = activeSortable.index;
        const overIndex = overSortable.index;

        if (activeIndex < overIndex) {
          showLineBottom = true;
        } else {
          showLineTop = true;
        }
      } else {
        // Different containers OR missing sortable data: Use Geometry Logic (Dynamic)
        const activeRect = active.rect.current.translated;
        const overRect = over.rect;

        if (activeRect && overRect) {
          const activeCenterY = activeRect.top + activeRect.height / 2;
          const overCenterY = overRect.top + overRect.height / 2;

          if (activeCenterY > overCenterY) {
            showLineBottom = true; // Insert After
          } else {
            showLineTop = true; // Insert Before
          }
        } else {
          // Fallback
          showLineBottom = true;
        }
      }
    }
  }

  const style = {
    // 3. CHANGE THIS: Use Translate instead of Transform
    // - If useLineIndicator (Boards): Disable transform for ALL items (static list).
    // - If !useLineIndicator (Folders): Enable transform always (standard reordering).
    // NOTE: We use Translate to avoid scale distortion.
    // FORCE transform to undefined to prevent any reordering/shifting during drag.
    // The list should remain static, with only the drop line indicating position.
    transform: undefined,

    // 4. CHANGE THIS: Disable transition ONLY for the item being dragged
    transition: isDragging ? undefined : transition,

    // 5. Reduce opacity while dragging (standard practice)
    // This keeps it visible but indicates it is the source.
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 'auto',

    // 6. Ensure "touch-action" is set here if not in CSS
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
      {showLineTop && <div className={styles.dropLineTop} />}
      <BoardTreeItem
        item={{ ...data, id, children }}
        isExpanded={isExpanded}
        onToggle={onToggle}
        isDropTarget={isDropTarget}
        disableHover={disableHover}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
      {showLineBottom && <div className={styles.dropLineBottom} />}
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
  disabled: PropTypes.bool,
  disableHover: PropTypes.bool,
};

SortableTreeItem.defaultProps = {
  children: null,
  isExpanded: false,
  disabled: false,
  disableHover: false,
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
        .sort((a, b) => a.name.localeCompare(b.name))
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

      // --- SCENARIO 2: Dragging a BOARD ---
      if (activeItem.type === 'board') {
        let targetFolderId = null;
        let targetPosition = 0;

        // Case A: Dropped into the Empty Root Zone (Moving out of folder)
        if (over.id === ROOT_BOARD_ZONE_ID || over.data.current?.type === 'root-zone') {
          targetFolderId = null;
          targetPosition = 65535;
        }
        // Case B: Moving into folder
        else if (flatItems[over.id]?.type === 'folder') {
          targetFolderId = flatItems[over.id].data.id;
          const targetList = nestedBoardsMap[targetFolderId] || [];
          const firstBoard = targetList[0];
          const firstPos = firstBoard?.position ?? 0;
          targetPosition = targetList.length > 0 ? Math.max(1, firstPos / 2) : 65535;
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
            targetPosition = calculateNewPosition(siblings, active, over);
          } else {
            // It is at root
            targetFolderId = null;
            targetPosition = calculateNewPosition(rootBoards, active, over);
          }
        } else {
          // Dropped somewhere invalid
          return;
        }

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
            disableHover={!!activeId}
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
        <BoardTreeContent
          activeId={activeId}
          rootFolders={rootFolders}
          rootBoards={rootBoards}
          expandedFolders={expandedFolders}
          renderBoardList={renderBoardList}
          handleToggle={handleToggle}
          onFolderUpdate={onFolderUpdate}
          onFolderDelete={onFolderDelete}
          canEdit={canEdit}
          ROOT_BOARD_ZONE_ID={ROOT_BOARD_ZONE_ID}
        />

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
              <span>{activeItemData.data.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  },
);

// eslint-disable-next-line react/prop-types
function BoardTreeContent({
  activeId,
  rootFolders,
  rootBoards,
  expandedFolders,
  renderBoardList,
  handleToggle,
  onFolderUpdate,
  onFolderDelete,
  canEdit,
  ROOT_BOARD_ZONE_ID,
}) {
  // Register the root zone as droppable - NOW CORRECTLY INSIDE DndContext
  const { setNodeRef: setRootZoneRef, isOver: isOverRootZone } = useDroppable({
    id: ROOT_BOARD_ZONE_ID,
    data: { type: 'root-zone' },
  });

  return (
    <div className={styles.tree}>
      {rootFolders.length > 0 && (
        <div className={styles.folderSection}>
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
                disabled
                disableHover={!!activeId}
              >
                {isExpanded && renderBoardList(folder.children, 1)}
              </SortableTreeItem>
            );
          })}
        </div>
      )}

      <div ref={setRootZoneRef} className={styles.rootBoardSection}>
        {rootBoards.length > 0
          ? renderBoardList(rootBoards, 0)
          : isOverRootZone && <div className={styles.dropLine} />}
      </div>
    </div>
  );
}

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

BoardTreeContent.propTypes = {
  activeId: PropTypes.string,
  rootFolders: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  rootBoards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  expandedFolders: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  renderBoardList: PropTypes.func.isRequired,
  handleToggle: PropTypes.func.isRequired,
  onFolderUpdate: PropTypes.func.isRequired,
  onFolderDelete: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
  ROOT_BOARD_ZONE_ID: PropTypes.string.isRequired,
};

BoardTreeContent.defaultProps = {
  activeId: null,
};

export default BoardTree;
