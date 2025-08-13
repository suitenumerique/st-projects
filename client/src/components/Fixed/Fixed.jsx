import React from 'react';
import PropTypes from 'prop-types';

import HeaderContainer from '../../containers/HeaderContainer';
import BoardActionsContainer from '../../containers/BoardActionsContainer';
import LeftMenuContainer from '../../containers/LeftMenuContainer';

import styles from './Fixed.module.scss';

function Fixed({ board, currentUser, currentUserMembership }) {
  return (
    <div className={styles.wrapper}>
      <HeaderContainer />
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        {currentUser && (!board || currentUserMembership) && <LeftMenuContainer />}
        <div style={{ flex: 1 }}>{board && !board.isFetching && <BoardActionsContainer />}</div>
      </div>
    </div>
  );
}

Fixed.propTypes = {
  board: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  currentUser: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  currentUserMembership: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Fixed.defaultProps = {
  board: undefined,
  currentUser: undefined,
  currentUserMembership: undefined,
};

export default Fixed;
