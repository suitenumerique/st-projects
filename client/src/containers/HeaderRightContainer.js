import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import HeaderRight from '../components/HeaderRight';

const mapStateToProps = (state) => {
  const currentUser = selectors.selectCurrentUser(state);
  // const notifications = selectors.selectNotificationsForCurrentUser(state);
  const config = selectors.selectConfig(state);

  const { reactAppLagaufreWidgetApiUrl, reactAppLagaufreWidgetPath } = config;

  return {
    currentUser,
    // notifications,
    reactAppLagaufreWidgetApiUrl,
    reactAppLagaufreWidgetPath,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      // onLanguageUpdate: entryActions.updateCurrentUserLanguage,
      // onNotificationDelete: entryActions.deleteNotification,
      onLogin: entryActions.authenticateUsingOidc,
      onLogout: entryActions.logout,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(HeaderRight);
