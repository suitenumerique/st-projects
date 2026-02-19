import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';

import SortableTaskItem from './SortableTaskItem';
import TaskCreate from './TaskCreate';

import styles from './Tasks.module.scss';

const Tasks = React.memo(({ items, canEdit, onCreate, onUpdate, onMove, onDelete }) => {
  const [t] = useTranslation();

  const handleUpdate = useCallback(
    (id, data) => {
      onUpdate(id, data);
    },
    [onUpdate],
  );

  const handleDelete = useCallback(
    (id) => {
      onDelete(id);
    },
    [onDelete],
  );

  /**
   * @type {NonNullable<
   *   import("react").ComponentProps<
   *     typeof import("@dnd-kit/react").DragDropProvider
   *   >["onDragEnd"]
   * >}
   */
  const handleDragEnd = useCallback(
    (event) => {
      const { source } = event.operation;

      if (event.canceled || !source || !isSortable(source)) {
        return;
      }

      if (source.index !== source.initialIndex) {
        onMove(source.id, source.index);
      }
    },
    [onMove],
  );

  const completedItems = items.filter((item) => item.isCompleted);

  return (
    <>
      {items.length > 0 && (
        <div className={styles.progressWrapper}>
          <div className={styles.progressBackground}>
            <div
              className={styles.progressBar}
              style={{ width: `${(completedItems.length / items.length) * 100}%` }}
            />
          </div>
          <div className={styles.count}>
            {completedItems.length}/{items.length}
          </div>
        </div>
      )}
      {items.length > 0 && (
        <DragDropProvider onDragEnd={handleDragEnd}>
          <div className={styles.tasksWrapper}>
            {items.map((item, itemIndex) => (
              <SortableTaskItem
                key={item.id}
                id={item.id}
                index={itemIndex}
                name={item.name}
                isCompleted={item.isCompleted}
                isPersisted={item.isPersisted}
                canEdit={canEdit}
                onUpdate={(data) => handleUpdate(item.id, data)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        </DragDropProvider>
      )}
      {canEdit && (
        <TaskCreate onCreate={onCreate}>
          <Button
            color="brand"
            variant="secondary"
            size="small"
            icon={<Icon type="outlined" name="add" />}
          >
            {items.length > 0 ? t('action.addAnotherTask') : t('action.addTask')}
          </Button>
        </TaskCreate>
      )}
    </>
  );
});

Tasks.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default Tasks;
