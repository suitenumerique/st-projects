import React from 'react';
import PropTypes from 'prop-types';

import HeaderContainer from '../../containers/HeaderContainer';
import ProjectContainer from '../../containers/ProjectContainer';
import BoardActionsContainer from '../../containers/BoardActionsContainer';
import LeftMenuContainer from '../../containers/LeftMenuContainer';

import styles from './Fixed.module.scss';

function Fixed({ projectId, board }) {
  return (
    <div className={styles.wrapper}>
      <HeaderContainer />
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        <LeftMenuContainer />
        <div style={{ flex: 1 }}>
          {/* {projectId && <ProjectContainer />} */}
          {board && !board.isFetching && <BoardActionsContainer />}
        </div>
      </div>
    </div>
  );
}

Fixed.propTypes = {
  projectId: PropTypes.string,
  board: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Fixed.defaultProps = {
  projectId: undefined,
  board: undefined,
};

export default Fixed;
