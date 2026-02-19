import pick from 'lodash/pick';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';

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
    includeCardsWithoutLabels,
    title = 'common.labels',
    canEdit = true,
    displayNoLabelOption = false,
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
      <div style={{ width: '300px' }}>
        <PopoverHeader
          onBack={onBack}
          title={t(title, {
            context: 'title',
          })}
        />
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
        <div className={styles.filterList}>
          {displayNoLabelOption && (
            <div className={styles.filterItem}>
              <Checkbox
                checked={includeCardsWithoutLabels}
                onChange={() => {
                  if (includeCardsWithoutLabels) {
                    handleDeselect(null);
                  } else {
                    handleSelect(null);
                  }
                }}
                label={
                  <div className={styles.filterLabel}>
                    <div className={styles.noLabel}>
                      <Icon name="label_off" type="outlined" size="small" aria-hidden="true" />
                    </div>
                    <span className={styles.labelName}>Aucune étiquette</span>
                  </div>
                }
              />
            </div>
          )}
          {filteredItems.length > 0 && (
            <DragDropProvider onDragEnd={handleDragEnd}>
              {filteredItems.map((label, labelIndex) => (
                <SortableLabelItem
                  key={label.id}
                  label={label}
                  index={labelIndex}
                  currentIds={currentIds}
                  canEdit={canEdit}
                  onSelect={handleSelect}
                  onDeselect={handleDeselect}
                  onEdit={handleEdit}
                />
              ))}
            </DragDropProvider>
          )}
        </div>
        {canEdit && (
          <Button
            size="small"
            color="brand"
            variant="tertiary"
            onClick={handleAddClick}
            className={styles.addButton}
            icon={<Icon size="small" name="add" type="outlined" aria-hidden="true" />}
          >
            {t('action.createNewLabel')}
          </Button>
        )}
      </div>
    );
  },
);

LabelsStep.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  includeCardsWithoutLabels: PropTypes.bool.isRequired,
  title: PropTypes.string,
  canEdit: PropTypes.bool,
  displayNoLabelOption: PropTypes.bool.isRequired,
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
