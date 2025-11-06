import React from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import classNames from 'classnames';
// import { useTranslation } from 'react-i18next';
import styles from './BoardListItem.module.scss';

import BoardActionsStep from '../../steps/BoardActionsStep';
import usePopup from '../../lib/popup/use-popup';

export default function BoardListItem({
  board,
  project,
  showDescription,
  editable,
  isActive,
  currentUser,
  canEdit,
  handleClick,
  onBoardUpdate,
  onBoardDelete,
  // onBoardDuplicate,
}) {
  // const [t] = useTranslation();

  const BoardActionsPopover = usePopup(BoardActionsStep);

  return (
    <div
      className={classNames(styles.itemWrapper, isActive && styles.itemWrapperActive)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      key={board.id}
    >
      <div className={styles.itemIcon}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 5H4C3.44772 5 3 5.44772 3 6V10C3 10.5523 3.44772 11 4 11H8C8.55228 11 9 10.5523 9 10V6C9 5.44772 8.55228 5 8 5Z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M3 17L5 19L9 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 6H21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 12H21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 18H21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className={styles.itemContent}>
        <p className={styles.itemName}>{board.name}</p>
        {project && project.siret !== currentUser.siret && (
          <p className={styles.itemProjectName}>{project.name}</p>
        )}
      </div>
      {editable && canEdit && (
        <BoardActionsPopover
          defaultData={pick(board, 'name')}
          onUpdate={(data) => onBoardUpdate(board.id, data)}
          onDelete={() => onBoardDelete(board.id)}
        >
          <div
            type="button"
            className={styles.itemEdit}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()}
            role="button"
            tabIndex={0}
          >
            <Icon type="outlined" name="more_horiz" size="medium" />
          </div>
        </BoardActionsPopover>
      )}
      {showDescription && <div className={styles.itemDescription}>{board.description}</div>}
    </div>
  );
}

BoardListItem.propTypes = {
  board: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  project: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  showDescription: PropTypes.bool,
  editable: PropTypes.bool.isRequired,
  isActive: PropTypes.bool,
  currentUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  handleClick: PropTypes.func.isRequired,
  onBoardUpdate: PropTypes.func,
  onBoardDelete: PropTypes.func,
};

BoardListItem.defaultProps = {
  showDescription: false,
  isActive: false,
  onBoardUpdate: () => {},
  onBoardDelete: () => {},
};
