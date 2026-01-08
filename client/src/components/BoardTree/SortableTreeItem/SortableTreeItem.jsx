import React from 'react';
import PropTypes from 'prop-types';
import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { useDndContext } from '@dnd-kit/core';

import BoardTreeItem from '../BoardTreeItem';

import styles from './SortableTreeItem.module.scss';

const SortableTreeItem = React.memo(
  ({ id, data, children, isExpanded, onToggle, disabled, disableHover, ...props }) => {
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

    if (isOver && active && over && active.id !== over.id) {
      const activeSortable = active.data.current?.sortable;
      const overSortable = over.data.current?.sortable;

      const activeType = active.data.current?.type;
      const overType = over.data.current?.type;

      if (activeType === 'board' && overType === 'folder') {
        const parentId = active.data.current?.parentId;
        const folderId = over.id;
        if (parentId !== folderId) {
          isDropTarget = true;
        }
      } else if (
        (activeSortable && overSortable) ||
        (activeType === 'board' && overType === 'board')
      ) {
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
          const activeRect = active.rect.current.translated;
          const overRect = over.rect;

          if (activeRect && overRect) {
            const activeCenterY = activeRect.top + activeRect.height / 2;
            const overCenterY = overRect.top + overRect.height / 2;

            if (activeCenterY > overCenterY) {
              showLineBottom = true;
            } else {
              showLineTop = true;
            }
          } else {
            showLineBottom = true;
          }
        }
      }
    }

    const style = {
      transform: undefined,
      transition: isDragging ? undefined : transition,
      opacity: isDragging ? 0.3 : 1,
      zIndex: isDragging ? 999 : 'auto',
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
        {isExpanded && children && <div className={styles.nestedContainer}>{children}</div>}
      </div>
    );
  },
);

SortableTreeItem.propTypes = {
  id: PropTypes.string.isRequired,
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

export default SortableTreeItem;
