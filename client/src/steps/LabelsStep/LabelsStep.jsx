import pick from 'lodash/pick';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from '@openfun/cunningham-react';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import PopoverHeader from '../../ui/Popover/PopoverHeader';

import { useField, useSteps } from '../../hooks';
import LabelCreateStep from '../LabelCreateStep';
import LabelEditStep from '../LabelEditStep';
import SortableLabelItem from './SortableLabelItem';

import styles from './LabelsStep.module.scss';

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
    onMove,
    onDelete,
    onBack,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();
    const [search, handleSearchChange] = useField('');
    const [sortedItems, setSortedItems] = useState(items);
    const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

    const filteredItems = useMemo(
      () =>
        sortedItems.filter(
          (label) =>
            (label.name && label.name.toLowerCase().includes(cleanSearch)) ||
            label.color.includes(cleanSearch),
        ),
      [sortedItems, cleanSearch],
    );

    useEffect(() => {
      setSortedItems(items);
    }, [items]);

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

    const handleDragEnd = useCallback(
      (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) {
          return;
        }

        const oldIndex = sortedItems.findIndex((item) => item.id === active.id);
        const newIndex = sortedItems.findIndex((item) => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newSortedItems = arrayMove(sortedItems, oldIndex, newIndex);
          setSortedItems(newSortedItems);

          onMove(active.id, newIndex);
        }
      },
      [sortedItems, onMove],
    );

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

    if (step) {
      switch (step.type) {
        case StepTypes.ADD:
          return (
            <LabelCreateStep
              defaultData={{
                name: search,
              }}
              onCreate={onCreate}
              onBack={handleBack}
            />
          );
        case StepTypes.EDIT: {
          const currentItem = sortedItems.find((item) => item.id === step.params.id);

          if (currentItem) {
            return (
              <LabelEditStep
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
          <div className={styles.searchContainer}>
            <Icon name="search" type="outlined" aria-hidden="true" />
            <input
              ref={searchField}
              value={search}
              name="search"
              className={styles.search}
              onChange={(event) => handleSearchChange(event, { value: event.target.value })}
              placeholder={t('common.searchLabels')}
            />
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className={styles.filterList}>
                {filteredItems.map((label) => (
                  <SortableLabelItem
                    key={label.id}
                    label={label}
                    currentIds={currentIds}
                    canEdit={canEdit}
                    onSelect={handleSelect}
                    onDeselect={handleDeselect}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  title: PropTypes.string,
  canEdit: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

LabelsStep.defaultProps = {
  title: 'common.labels',
  canEdit: true,
  onBack: undefined,
};

export default LabelsStep;
