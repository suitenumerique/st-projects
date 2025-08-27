import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import ProjectSettingsModal from '../components/ProjectSettingsModal';

const mapStateToProps = (state) => {
  const users = selectors.selectUsers(state);

  const { name } = selectors.selectCurrentProject(state);

  const managers = selectors.selectManagersForCurrentProject(state);

  return {
    name,
    managers,
    allUsers: users,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: entryActions.updateCurrentProject,
      onDelete: entryActions.deleteCurrentProject,
      onClose: entryActions.closeModal,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSettingsModal);
