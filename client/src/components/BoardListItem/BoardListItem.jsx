import React from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
// import { useTranslation } from 'react-i18next';
import { Icon } from '@gouvfr-lasuite/ui-kit';
import classNames from 'classnames';
import styles from './BoardListItem.module.scss';

import BoardEditStep from '../../steps/BoardEditStep';
import usePopup from '../../lib/popup/use-popup';

export default function BoardListItem({
  board,
  handleClick,
  isActive,
  showDescription,
  editable,
  projectName,
  onUpdate,
  onDelete,
}) {
  // const [t] = useTranslation();

  const BoardEditStepPopover = usePopup(BoardEditStep);

  return (
    <div
      className={classNames(styles.itemWrapper, isActive && styles.itemWrapperActive)}
      onClick={() => handleClick(board)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick(board)}
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
      <div>
        <p className={styles.itemName}>{board.name}</p>
        {projectName && <p className={styles.itemProjectName}>{projectName}</p>}
      </div>
      {editable && (
        <BoardEditStepPopover
          defaultData={pick(board, 'name')}
          onUpdate={onUpdate}
          onDelete={onDelete}
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
        </BoardEditStepPopover>
      )}
      {showDescription && <div className={styles.itemDescription}>{board.description}</div>}
    </div>
  );
}

BoardListItem.propTypes = {
  board: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  handleClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
  showDescription: PropTypes.bool,
  editable: PropTypes.bool,
  projectName: PropTypes.string,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
};

BoardListItem.defaultProps = {
  showDescription: false,
  editable: true,
  isActive: false,
  projectName: undefined,
  onUpdate: () => {},
  onDelete: () => {},
};
