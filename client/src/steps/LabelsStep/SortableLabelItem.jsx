import React from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';

import Label from '../../ui/Label';

import styles from './LabelsStep.module.scss';

function SortableLabelItem({ label, currentIds, canEdit, onSelect, onDeselect, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: label.id,
    disabled: !canEdit,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames(isDragging && styles.dragging)}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...attributes}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(canEdit ? listeners : {})}
    >
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
