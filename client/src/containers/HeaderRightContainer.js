import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import HeaderRight from '../components/HeaderRight';

const mapStateToProps = (state) => {
  const currentUser = selectors.selectCurrentUser(state);
  const notifications = selectors.selectNotificationsForCurrentUser(state);
  const config = selectors.selectConfig(state);

  return {
    currentUser,
    notifications,
    gaufre: config.theme?.gaufre,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onNotificationMarkAsRead: entryActions.deleteNotification,
      onSettingsClick: entryActions.openUserSettingsModal,
      onLogin: entryActions.authenticateUsingOidc,
      onLogout: entryActions.logout,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(HeaderRight);
