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
  const privateFolders = folders.filter((folder) => folder.isPrivate);
  const sharedFolders = folders.filter((folder) => !folder.isPrivate);
  const userBoardPreferences = selectors.selectUserBoardPreferencesForCurrentUser(state);
  const canEdit = true; // TODO: determine based on permissions

  const config = selectors.selectConfig(state);

  const { templateBoards } = config;

  return {
    currentBoardId: boardId,
    privateBoards,
    sharedBoards,
    privateFolders,
    sharedFolders,
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
      onBoardUpdate: entryActions.updateBoard,
      onBoardDelete: entryActions.deleteBoard,
      onFolderAdd: entryActions.createFolder,
      onFolderUpdate: entryActions.updateFolder,
      onFolderDelete: entryActions.deleteFolder,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(LeftMenu);
