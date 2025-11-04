import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import LeftMenu from '../components/LeftMenu';

const mapStateToProps = (state) => {
  const { boardId } = selectors.selectPath(state);
  const privateBoards = selectors.selectPrivateBoardsForCurrentUser(state);
  const sharedBoards = selectors.selectSharedBoardsForCurrentUser(state);

  const config = selectors.selectConfig(state);

  const {
    templateBoards,
    reactAppFeedbackWidgetApiUrl,
    reactAppFeedbackWidgetPath,
    reactAppFeedbackWidgetChannel,
  } = config;

  return {
    currentBoardId: boardId,
    privateBoards,
    sharedBoards,
    templateBoards,
    reactAppFeedbackWidgetApiUrl,
    reactAppFeedbackWidgetPath,
    reactAppFeedbackWidgetChannel,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onBoardAdd: entryActions.createBoardInCurrentProject,
      onBoardDuplicate: entryActions.duplicateBoard,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(LeftMenu);
