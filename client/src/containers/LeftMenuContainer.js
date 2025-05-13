import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import ModalTypes from '../constants/ModalTypes';
import entryActions from '../entry-actions';
import LeftMenu from '../components/LeftMenu';

const mapStateToProps = (state) => {
  const { boardId } = selectors.selectPath(state);
  const boards = selectors.selectBoardsForCurrentProject(state);
  const currentProject = selectors.selectCurrentProject(state);
  const projects = selectors.selectProjectsForCurrentUser(state);
  const isCurrentUserManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);
  const currentModal = selectors.selectCurrentModal(state);

  return {
    boards,
    currentBoardId: boardId,
    currentProject,
    projects,
    canEditProject: isCurrentUserManager,
    isSettingsModalOpened: currentModal === ModalTypes.PROJECT_SETTINGS,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onProjectSettingsClick: entryActions.openProjectSettingsModal,
      onProjectAdd: entryActions.openProjectAddModal,
      onBoardAdd: entryActions.createBoardInCurrentProject,
      onBoardUpdate: entryActions.updateBoard,
      onBoardDelete: entryActions.deleteBoard,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(LeftMenu);
