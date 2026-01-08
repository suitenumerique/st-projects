import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import BoardTreeContent from './BoardTreeContent';
import SortableTreeItem from './SortableTreeItem';

import { enrichBoardWithUserPreference } from '../../selectors/user-board-preferences';
import styles from './BoardTree.module.scss';

const calculateNewPosition = (itemsInList, active, over) => {
  const overIndex = itemsInList.findIndex((i) => i.id === over.id);

  // Dropped at the end or invalid
  if (overIndex === -1) {
    const lastItem = itemsInList[itemsInList.length - 1];
    return (lastItem?.position ?? 0) + 65535;
  }

  // Determine Direction
  const activeIndex = itemsInList.findIndex((i) => i.id === active.id);
  let isMovingDown;

  if (activeIndex !== -1) {
    isMovingDown = activeIndex < overIndex;
  } else {
    // Cross-container logic: use geometry
    const activeTop = active.rect.current.translated?.top || 0;
    const overTop = over.rect?.top || 0;
    isMovingDown = activeTop > overTop;
  }

  const targetItem = itemsInList[overIndex];
  const targetPos = targetItem.position ?? 0;

  if (isMovingDown) {
    const nextItem = itemsInList[overIndex + 1];
    const nextPos = nextItem ? (nextItem.position ?? targetPos + 65535) : targetPos + 65535;
    return Math.floor(targetPos + (nextPos - targetPos) / 2);
  }

  const prevItem = itemsInList[overIndex - 1];
  const prevPos = prevItem ? (prevItem.position ?? 0) : Math.max(0, targetPos - 65535);
  return Math.floor(prevPos + (targetPos - prevPos) / 2);
};

const BoardTree = React.memo(
  ({
    boards,
    folders,
    userBoardPreferences = [],
    currentBoardId,
    onBoardClick,
    onBoardUpdate,
    onBoardDelete,
    onFolderEdit,
    onFolderUpdate,
    onFolderDelete,
    canEdit,
  }) => {
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [activeId, setActiveId] = useState(null);
    const [activeItemData, setActiveItemData] = useState(null);

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5,
        },
      }),
    );

    const { rootFolders, rootBoards, nestedBoardsMap, flatItems } = useMemo(() => {
      const byPos = (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity);

      const preferenceMap = new Map();
      userBoardPreferences.forEach((pref) => preferenceMap.set(pref.boardId, pref));
      const enrichedBoards = boards.map((b) =>
        enrichBoardWithUserPreference(b, preferenceMap.get(b.id)),
      );

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

      processedFolders.forEach((f) => {
        // eslint-disable-next-line no-param-reassign
        f.children = _nestedMap[f.data.id] || [];
      });

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

      if (!over || active.id === over.id) return;

      const activeItem = flatItems[active.id];

      if (activeItem.type === 'board') {
        let targetFolderId = null;
        let targetPosition = 0;

        // Case A: Dropped into the Empty Root Zone (Moving out of folder)
        if (over.id === 'root-board-drop-zone' || over.data.current?.type === 'root-zone') {
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
    const renderBoardList = (items) => (
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableTreeItem
            key={item.id}
            id={item.id}
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
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <BoardTreeContent
          activeId={activeId}
          rootFolders={rootFolders}
          rootBoards={rootBoards}
          expandedFolders={expandedFolders}
          renderBoardList={renderBoardList}
          handleToggle={handleToggle}
          onFolderEdit={onFolderEdit}
          onFolderUpdate={onFolderUpdate}
          onFolderDelete={onFolderDelete}
          canEdit={canEdit}
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
            <div className={styles.dragOverlayItem}>
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
  onFolderEdit: PropTypes.func.isRequired,
  onFolderUpdate: PropTypes.func.isRequired,
  onFolderDelete: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
};

BoardTree.defaultProps = {
  currentBoardId: undefined,
  userBoardPreferences: [],
};

export default BoardTree;
