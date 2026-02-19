import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Checkbox } from '@gouvfr-lasuite/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';

import usePopup from '../../../../lib/popup';
import TaskEdit from '../TaskEdit';
import TaskActionsStep from '../../../../steps/TaskActionsStep';

import styles from './SortableTaskItem.module.scss';

const SortableTaskItem = React.memo(
  ({ id, name, isCompleted, isPersisted, canEdit, onUpdate, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id,
      disabled: !isPersisted || !canEdit,
    });
    const [isTaskActionsPopoverOpen, setIsTaskActionsPopoverOpen] = useState(false);

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    const nameEdit = useRef(null);

    const handleClick = useCallback(() => {
      if (isPersisted && canEdit) {
        nameEdit.current.open();
      }
    }, [isPersisted, canEdit]);

    const handleNameUpdate = useCallback(
      (newName) => {
        onUpdate({
          name: newName,
        });
      },
      [onUpdate],
    );

    const handleToggleChange = useCallback(() => {
      onUpdate({
        isCompleted: !isCompleted,
      });
    }, [isCompleted, onUpdate]);

    const handleNameEdit = useCallback(() => {
      nameEdit.current.open();
    }, []);

    const TaskActionsPopover = usePopup(TaskActionsStep);

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={classNames(
          styles.wrapper,
          isDragging && styles.dragging,
          isTaskActionsPopoverOpen && styles.popoverOpened,
        )}
      >
        <Checkbox
          checked={isCompleted}
          disabled={!isPersisted || !canEdit}
          className={styles.checkbox}
          onChange={handleToggleChange}
        />
        <TaskEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className={classNames(
              styles.taskWrapper,
              canEdit && styles.contentHoverable,
              isPersisted && canEdit && styles.draggable,
            )}
            onClick={handleClick}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...attributes}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...listeners}
          >
            <span className={classNames(styles.task, isCompleted && styles.taskCompleted)}>
              {name}
            </span>
            {isPersisted && canEdit && (
              <TaskActionsPopover
                onNameEdit={handleNameEdit}
                onDelete={onDelete}
                onOpenChange={setIsTaskActionsPopoverOpen}
              >
                <Button
                  className={styles.taskActionsButton}
                  color="neutral"
                  variant="tertiary"
                  size="small"
                  icon={<Icon name="more_horiz" type="outlined" size="small" />}
                />
              </TaskActionsPopover>
            )}
          </div>
        </TaskEdit>
      </div>
    );
  },
);

SortableTaskItem.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default SortableTaskItem;
