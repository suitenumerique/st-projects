import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import pick from 'lodash/pick';

import BoardListItem from '../BoardListItem/BoardListItem';
import BoardActionsStep from '../../steps/BoardActionsStep';
import usePopup from '../../lib/popup/use-popup';
import styles from './BoardTree.module.scss';

const BoardTreeItem = React.memo(
  ({ item, level, isExpanded, isActive, canEdit, onToggle, onClick, onUpdate, onDelete }) => {
    const [, setIsActionsPopoverOpen] = useState(false);
    const BoardActionsPopover = usePopup(BoardActionsStep);

    const style = {
      paddingLeft: `${level * 16}px`,
    };

    if (item.type === 'board') {
      return (
        <div style={style} className={styles.item}>
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
          />
        </div>
      );
    }

    // Folder item
    return (
      <div style={style} className={styles.folderItem}>
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
          <Icon name="folder" type="outlined" size="small" className={styles.folderIcon} />
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
                <Icon type="outlined" name="more_horiz" size="small" />
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
  level: PropTypes.number.isRequired,
  isExpanded: PropTypes.bool,
  isActive: PropTypes.bool,
  canEdit: PropTypes.bool.isRequired,
  onToggle: PropTypes.func,
  onClick: PropTypes.func,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

BoardTreeItem.defaultProps = {
  isExpanded: false,
  isActive: false,
  onToggle: null,
  onClick: null,
};

export default BoardTreeItem;
