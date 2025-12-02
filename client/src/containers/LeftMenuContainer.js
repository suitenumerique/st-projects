import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import LeftMenu from '../components/LeftMenu';

const mapStateToProps = (state) => {
  const { boardId } = selectors.selectPath(state);
  const privateBoards = selectors.selectPrivateBoardsForCurrentUser(state);
  const sharedBoards = selectors.selectSharedBoardsForCurrentUser(state);
  const folders = selectors.selectFoldersForCurrentUser(state);
  const userBoardPreferences = selectors.selectUserBoardPreferencesForCurrentUser(state);
  const canEdit = true; // TODO: determine based on permissions

  const config = selectors.selectConfig(state);

  const { templateBoards } = config;

  return {
    currentBoardId: boardId,
    privateBoards,
    sharedBoards,
    folders,
    userBoardPreferences,
    canEdit,
    templateBoards,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onBoardAdd: entryActions.createBoardInCurrentProject,
      onBoardDuplicate: entryActions.duplicateBoard,
      onBoardUpdate: (id, data) => dispatch(entryActions.updateBoard(id, data)),
      onBoardDelete: (id) => dispatch(entryActions.deleteBoard(id)),
      onFolderUpdate: (id, data) => dispatch(entryActions.updateFolder(id, data)),
      onFolderDelete: (id) => dispatch(entryActions.deleteFolder(id)),
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(LeftMenu);
