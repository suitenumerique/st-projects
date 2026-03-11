import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import actions from '../actions';
import ProjectSettingsModal from '../components/ProjectSettingsModal';

const mapStateToProps = (state) => {
  const { name, background, backgroundImage, isBackgroundImageUpdating } =
    selectors.selectCurrentProject(state);

  const managers = selectors.selectManagersForCurrentProject(state);

  const searchedUsers = selectors.selectSearchedUsers(state);
  const isSearchingUsers = selectors.selectIsSearchingUsers(state);

  return {
    name,
    background,
    backgroundImage,
    isBackgroundImageUpdating,
    managers,
    searchedUsers,
    isSearchingUsers,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: entryActions.updateCurrentProject,
      onBackgroundImageUpdate: entryActions.updateCurrentProjectBackgroundImage,
      onDelete: entryActions.deleteCurrentProject,
      onManagerCreate: entryActions.createManagerInCurrentProject,
      onManagerDelete: entryActions.deleteProjectManager,
      onClose: entryActions.closeModal,
      onSearchUsers: actions.searchUsers,
      onClearUserSearch: actions.clearUserSearch,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSettingsModal);
