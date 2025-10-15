import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import HeaderRight from '../components/HeaderRight';

const mapStateToProps = (state) => {
  const isLogouting = selectors.selectIsLogouting(state);
  const currentUser = selectors.selectCurrentUser(state);
  const notifications = selectors.selectNotificationsForCurrentUser(state);

  return {
    notifications,
    isLogouting,
    currentUser,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onLanguageUpdate: entryActions.updateCurrentUserLanguage,
      onNotificationDelete: entryActions.deleteNotification,
      onLogout: entryActions.logout,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(HeaderRight);
