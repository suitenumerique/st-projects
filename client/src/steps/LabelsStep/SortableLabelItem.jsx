import React from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import { KeyboardSensor, PointerSensor } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import classNames from 'classnames';

import Label from '../../ui/Label';

import styles from './LabelsStep.module.scss';

function SortableLabelItem({ label, index, currentIds, canEdit, onSelect, onDeselect, onEdit }) {
  const sortable = useSortable({
    id: label.id,
    index,
    group: 'labels',
    type: 'Label',
    accept: ['Label'],
    disabled: !canEdit,
    sensors: [KeyboardSensor, PointerSensor],
  });

  return (
    <div ref={sortable.ref} className={classNames(sortable.isDragging && styles.dragging)}>
      <div className={classNames(styles.filterItem, canEdit && styles.draggable)}>
        <Checkbox
          checked={currentIds.includes(label.id)}
          onChange={() => {
            if (currentIds.includes(label.id)) {
              onDeselect(label.id);
            } else {
              onSelect(label.id);
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
            <Button
              size="small"
              color="neutral"
              variant="tertiary"
              onClick={() => onEdit(label.id)}
            >
              <Icon size="small" name="edit" type="outlined" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

SortableLabelItem.propTypes = {
  label: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    color: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  currentIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

SortableLabelItem.defaultProps = {
  canEdit: true,
};

export default React.memo(SortableLabelItem);
