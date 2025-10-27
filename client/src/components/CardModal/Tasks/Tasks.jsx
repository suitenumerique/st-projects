import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
// import { DragDropContext, Droppable } from 'react-beautiful-dnd';

// import DroppableTypes from '../../../constants/DroppableTypes';
import TaskItem from './TaskItem';
import TaskCreate from './TaskCreate';

import styles from './Tasks.module.scss';

const Tasks = React.memo(({ items, canEdit, onCreate, onUpdate, onDelete }) => {
  // onMove
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
      {/* <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks" type={DroppableTypes.TASK}>
          {({ innerRef, droppableProps, placeholder }) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <div {...droppableProps} ref={innerRef}>
              {items.map((item, index) => (
                <Item
                  key={item.id}
                  id={item.id}
                  index={index}
                  name={item.name}
                  isCompleted={item.isCompleted}
                  isPersisted={item.isPersisted}
                  canEdit={canEdit}
                  onUpdate={(data) => handleUpdate(item.id, data)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
              {placeholder}
              {canEdit && (
                <Add onCreate={onCreate}>
                  <button type="button" className={styles.taskButton}>
                    <span className={styles.taskButtonText}>
                      {items.length > 0 ? t('action.addAnotherTask') : t('action.addTask')}
                    </span>
                  </button>
                </Add>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext> */}
      {items.length > 0 && (
        <div className={styles.tasksWrapper}>
          {items.map((item, index) => (
            <TaskItem
              key={item.id}
              id={item.id}
              index={index}
              name={item.name}
              isCompleted={item.isCompleted}
              isPersisted={item.isPersisted}
              canEdit={canEdit}
              onUpdate={(data) => handleUpdate(item.id, data)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}
      {canEdit && (
        <TaskCreate onCreate={onCreate}>
          <Button color="tertiary" size="small" icon={<Icon type="outlined" name="add" />}>
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
  // onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default Tasks;
