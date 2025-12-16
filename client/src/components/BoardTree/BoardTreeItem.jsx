import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import pick from 'lodash/pick';

import BoardListItem from '../BoardListItem/BoardListItem';
import BoardActionsStep from '../../steps/BoardActionsStep';
import usePopup from '../../lib/popup/use-popup';
import styles from './BoardTree.module.scss';

const BoardTreeItem = React.memo(
  ({
    item,
    isExpanded,
    isActive,
    isDropTarget,
    canEdit,
    onToggle,
    onClick,
    onUpdate,
    onDelete,
    disableHover,
  }) => {
    const [, setIsActionsPopoverOpen] = useState(false);
    const BoardActionsPopover = usePopup(BoardActionsStep);

    if (item.type === 'board') {
      return (
        <div className={styles.boardItem}>
          <BoardListItem
            board={item.data}
            project={item.data.project}
            showDescription={false}
            editable={canEdit}
            isActive={isActive}
            currentUser={item.data.currentUser}
            canEdit={canEdit}
            handleClick={onClick}
            onBoardUpdate={onUpdate}
            onBoardDelete={onDelete}
            disableHover={disableHover}
          />
        </div>
      );
    }

    return (
      <div
        className={classNames(
          styles.folderItem,
          isDropTarget && styles.folderItemDropTarget,
          disableHover && styles.disableHover,
        )}
      >
        <div className={styles.folderHeader}>
          <button
            type="button"
            className={styles.folderToggle}
            onClick={onToggle}
            aria-expanded={isExpanded}
          >
            <Icon
              name={isExpanded ? 'expand_more' : 'chevron_right'}
              type="outlined"
              size="small"
            />
          </button>
          <Icon name="folder" type="filled" size="small" className={styles.folderIcon} />
          <span className={styles.folderName}>{item.data.name}</span>
          {canEdit && (
            <BoardActionsPopover
              defaultData={pick(item.data, 'name')}
              onUpdate={(data) => onUpdate(item.data.id, data)}
              onDelete={() => onDelete(item.data.id)}
              onOpenChange={setIsActionsPopoverOpen}
            >
              <button
                type="button"
                className={styles.folderActions}
                onClick={(e) => e.stopPropagation()}
              >
                <Icon type="outlined" name="more_horiz" size="medium" />
              </button>
            </BoardActionsPopover>
          )}
        </div>
      </div>
    );
  },
);

BoardTreeItem.propTypes = {
  item: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isExpanded: PropTypes.bool,
  isActive: PropTypes.bool,
  isDropTarget: PropTypes.bool,
  canEdit: PropTypes.bool.isRequired,
  onToggle: PropTypes.func,
  onClick: PropTypes.func,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  disableHover: PropTypes.bool,
};

BoardTreeItem.defaultProps = {
  isExpanded: false,
  isActive: false,
  isDropTarget: false,
  disableHover: false,
  onToggle: null,
  onClick: null,
};

export default BoardTreeItem;
