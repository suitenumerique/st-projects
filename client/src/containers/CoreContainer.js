import { connect } from 'react-redux';

import selectors from '../selectors';
import Core from '../components/Core';

const mapStateToProps = (state) => {
  const isInitializing = selectors.selectIsInitializing(state);
  const isSocketDisconnected = selectors.selectIsSocketDisconnected(state);
  const currentModal = selectors.selectCurrentModal(state);
  const currentProject = selectors.selectCurrentProject(state);
  const currentBoard = selectors.selectCurrentBoard(state);
  const currentUser = selectors.selectCurrentUser(state);

  return {
    isInitializing,
    isSocketDisconnected,
    currentModal,
    currentProject,
    currentBoard,
    currentUser,
  };
};

export default connect(mapStateToProps)(Core);
