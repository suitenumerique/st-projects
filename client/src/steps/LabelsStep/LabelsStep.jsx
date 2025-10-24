import pick from 'lodash/pick';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
// import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Input, Button, Checkbox } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';

// eslint-disable-next-line import/no-extraneous-dependencies
// import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
// eslint-disable-next-line import/no-extraneous-dependencies
// import { DragDropProvider } from '@dnd-kit/react';
import Label from '../../ui/Label';

// import SortableItem from './SortableItem';

import PopoverHeader from '../../ui/Popover/PopoverHeader';

import { useField, useSteps } from '../../hooks';
import AddStep from './AddStep';
import EditStep from './EditStep';

import styles from './LabelsStep.module.scss';
// import globalStyles from '../../assets/styles/styles.module.scss';

const StepTypes = {
  ADD: 'ADD',
  EDIT: 'EDIT',
};

const LabelsStep = React.memo(
  ({
    items,
    currentIds,
    title = 'common.labels',
    canEdit = true,
    onSelect,
    onDeselect,
    onCreate,
    onUpdate,
    // onMove,
    onDelete,
    onBack,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();
    const [search, handleSearchChange] = useField('');
    const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

    const filteredItems = useMemo(
      () =>
        items.filter(
          (label) =>
            (label.name && label.name.toLowerCase().includes(cleanSearch)) ||
            label.color.includes(cleanSearch),
        ),
      [items, cleanSearch],
    );

    // @dnd-kit/react handles sensors automatically

    const searchField = useRef(null);

    const handleAddClick = useCallback(() => {
      openStep(StepTypes.ADD);
    }, [openStep]);

    const handleEdit = useCallback(
      (id) => {
        openStep(StepTypes.EDIT, {
          id,
        });
      },
      [openStep],
    );

    const handleSelect = useCallback(
      (id) => {
        onSelect(id);
      },
      [onSelect],
    );

    const handleDeselect = useCallback(
      (id) => {
        onDeselect(id);
      },
      [onDeselect],
    );

    // const handleDragStart = useCallback(() => {
    //   document.body.classList.add(globalStyles.dragging);
    // }, []);

    // const handleDragEnd = useCallback(
    //   (event) => {
    //     const { active, over } = event;

    //     if (!over || active.id === over.id) {
    //       return;
    //     }

    //     const sourceIndex = filteredItems.findIndex((item) => item.id === active.id);
    //     const destinationIndex = filteredItems.findIndex((item) => item.id === over.id);

    //     if (sourceIndex === -1 || destinationIndex === -1) {
    //       return;
    //     }

    //     const draggedItem = filteredItems[destinationIndex];
    //     const originalIndex = items.findIndex((item) => item.id === draggedItem.id);

    //     onMove(active.id, originalIndex);
    //   },
    //   [onMove, filteredItems, items],
    // );

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

    useEffect(() => {
      searchField.current.focus({
        preventScroll: true,
      });
    }, []);

    if (step) {
      switch (step.type) {
        case StepTypes.ADD:
          return (
            <AddStep
              defaultData={{
                name: search,
              }}
              onCreate={onCreate}
              onBack={handleBack}
            />
          );
        case StepTypes.EDIT: {
          const currentItem = items.find((item) => item.id === step.params.id);

          if (currentItem) {
            return (
              <EditStep
                defaultData={pick(currentItem, ['name', 'color'])}
                onUpdate={(data) => handleUpdate(currentItem.id, data)}
                onDelete={() => handleDelete(currentItem.id)}
                onBack={handleBack}
              />
            );
          }

          openStep(null);

          break;
        }
        default:
      }
    }

    return (
      <>
        <PopoverHeader
          onBack={onBack}
          title={t(title, {
            context: 'title',
          })}
        />
        <>
          <Input
            ref={searchField}
            value={search}
            label={t('common.searchLabels')}
            icon={<Icon name="search" type="outlined" aria-hidden="true" />}
            onChange={(event) => handleSearchChange(event, { value: event.target.value })}
            className={styles.search}
          />
          <div className={styles.filterList}>
            {filteredItems.map((label) => (
              <div key={label.id} className={styles.filterItem}>
                <Checkbox
                  checked={currentIds.includes(label.id)}
                  onChange={() => {
                    if (currentIds.includes(label.id)) {
                      handleDeselect(label.id);
                    } else {
                      handleSelect(label.id);
                    }
                  }}
                  label={
                    <div className={styles.filterLabel}>
                      <Label name={label.name} color={label.color} size="small" />
                    </div>
                  }
                />
                {canEdit && (
                  <div className={styles.itemActions}>
                    <Button size="small" color="tertiary-text" onClick={() => handleEdit(label.id)}>
                      <Icon size="small" name="edit" type="outlined" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {canEdit && (
            <Button
              size="small"
              color="tertiary"
              onClick={handleAddClick}
              className={styles.addButton}
              icon={<Icon size="small" name="add" type="outlined" aria-hidden="true" />}
            >
              {t('action.createNewLabel')}
            </Button>
          )}
        </>
      </>
    );
  },
);

LabelsStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  items: PropTypes.array.isRequired,
  currentIds: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  title: PropTypes.string,
  canEdit: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  // onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

LabelsStep.defaultProps = {
  title: 'common.labels',
  canEdit: true,
  onBack: undefined,
};

export default LabelsStep;
