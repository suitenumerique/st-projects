import { connect } from 'react-redux';

import selectors from '../selectors';
import Core from '../components/Core';

const mapStateToProps = (state) => {
  const config = selectors.selectConfig(state);
  const isInitializing = selectors.selectIsInitializing(state);
  const isSocketDisconnected = selectors.selectIsSocketDisconnected(state);
  const currentUser = selectors.selectCurrentUser(state);
  const currentModal = selectors.selectCurrentModal(state);
  const currentProject = selectors.selectCurrentProject(state);
  const currentBoard = selectors.selectCurrentBoard(state);

  return {
    theme: config ? config.theme : null,
    isInitializing,
    isSocketDisconnected,
    currentUser,
    currentModal,
    currentProject,
    currentBoard,
  };
};

export default connect(mapStateToProps)(Core);
