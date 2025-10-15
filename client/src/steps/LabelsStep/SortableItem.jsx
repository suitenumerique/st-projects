import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useSortable } from '@dnd-kit/sortable';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from '@openfun/cunningham-react';
import { Icon } from '@gouvfr-lasuite/ui-kit';

import styles from './SortableItem.module.scss';
import globalStyles from '../../assets/styles/styles.module.scss';

const SortableItem = React.memo(
  ({ id, name, color, isPersisted, isActive, canEdit, onSelect, onDeselect, onEdit }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id,
      disabled: !canEdit,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const handleToggleClick = useCallback(
      (e) => {
        e.stopPropagation();
        if (isPersisted) {
          if (isActive) {
            onDeselect();
          } else {
            onSelect();
          }
        }
      },
      [isPersisted, isActive, onSelect, onDeselect],
    );

    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggleClick();
        }
      },
      [handleToggleClick],
    );

    return (
      <div ref={setNodeRef} className={styles.wrapper} style={style}>
        <span
          className={classNames(
            styles.name,
            isActive && styles.nameActive,
            globalStyles[`background${upperFirst(camelCase(color))}`],
          )}
          role="button"
          tabIndex={0}
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...(canEdit ? attributes : {})}
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...(canEdit ? listeners : {})}
          /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                     jsx-a11y/no-static-element-interactions */
          onClick={handleToggleClick}
          onKeyDown={handleKeyDown}
        >
          {name}
          {isActive && (
            <Icon className={styles.activeIcon} name="check" type="outlined" aria-hidden="true" />
          )}
        </span>
        {canEdit && (
          <Button
            color="secondary"
            icon={<Icon name="edit" type="outlined" aria-hidden="true" />}
            disabled={!isPersisted}
            className={styles.editButton}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          />
        )}
      </div>
    );
  },
);

SortableItem.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  color: PropTypes.string.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

SortableItem.defaultProps = {
  name: undefined,
};

export default SortableItem;
