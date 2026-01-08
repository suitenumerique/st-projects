import React, { useState } from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import classNames from 'classnames';
// import { useTranslation } from 'react-i18next';
import styles from './FolderListItem.module.scss';

import FolderActionsStep from '../../../steps/FolderActionsStep';
import usePopup from '../../../lib/popup/use-popup';

export default function BoardListItem({
  folder,
  isDropTarget,
  disableHover,
  onToggle,
  isExpanded,
  canEdit,
  onEdit,
  onDelete,
}) {
  // const [t] = useTranslation();
  const [isFolderActionsPopoverOpen, setIsFolderActionsPopoverOpen] = useState(false);

  const FolderActionsPopover = usePopup(FolderActionsStep);

  return (
    <div
      className={classNames(
        styles.itemWrapper,
        isDropTarget && styles.itemDropTarget,
        isFolderActionsPopoverOpen && styles.popoverOpened,
        disableHover && styles.disableHover,
      )}
    >
      <div className={styles.itemHeader}>
        <button
          type="button"
          className={styles.itemToggle}
          onClick={onToggle}
          aria-expanded={isExpanded}
        >
          <Icon name={isExpanded ? 'expand_more' : 'chevron_right'} type="outlined" size="small" />
        </button>
        <Icon name="folder" type="filled" size="small" className={styles.itemIcon} />
        <span className={styles.itemName}>{folder.name}</span>
        {canEdit && (
          <FolderActionsPopover
            defaultData={pick(folder, 'name')}
            onDelete={() => onDelete(folder.id)}
            onEdit={() => onEdit(folder)}
            onOpenChange={setIsFolderActionsPopoverOpen}
          >
            <button
              type="button"
              className={styles.itemActions}
              onClick={(e) => e.stopPropagation()}
            >
              <Icon type="outlined" name="more_horiz" size="medium" />
            </button>
          </FolderActionsPopover>
        )}
      </div>
    </div>
  );
}

BoardListItem.propTypes = {
  folder: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isDropTarget: PropTypes.bool,
  disableHover: PropTypes.bool,
  onToggle: PropTypes.func,
  isExpanded: PropTypes.bool,
  canEdit: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

BoardListItem.defaultProps = {
  isDropTarget: false,
  disableHover: false,
  onToggle: () => {},
  isExpanded: false,
  canEdit: false,
  onEdit: () => {},
  onDelete: () => {},
};
