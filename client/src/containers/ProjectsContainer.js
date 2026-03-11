import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import Projects from '../components/Projects';

const mapStateToProps = (state) => {
  const { allowAllToCreateProjects, isOrgMode } = selectors.selectConfig(state);
  const currentUser = selectors.selectCurrentUser(state);
  const projects = selectors.selectProjectsForCurrentUser(state);

  return {
    currentUser,
    items: projects,
    canAdd: !isOrgMode && (allowAllToCreateProjects || currentUser.isAdmin),
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onAdd: entryActions.openProjectAddModal,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Projects);
