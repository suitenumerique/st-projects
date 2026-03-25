import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from '@gouvfr-lasuite/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableTaskItem from './SortableTaskItem';
import TaskCreate from './TaskCreate';

import styles from './Tasks.module.scss';

const Tasks = React.memo(({ items, canEdit, onCreate, onUpdate, onMove, onDelete }) => {
  const [t] = useTranslation();

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

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        onMove(active.id, newIndex);
      }
    },
    [items, onMove],
  );

  const completedItems = items.filter((item) => item.isCompleted);
  const taskIds = useMemo(() => items.map((item) => item.id), [items]);

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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <div className={styles.tasksWrapper}>
              {items.map((item) => (
                <SortableTaskItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  isCompleted={item.isCompleted}
                  isPersisted={item.isPersisted}
                  canEdit={canEdit}
                  onUpdate={(data) => handleUpdate(item.id, data)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
