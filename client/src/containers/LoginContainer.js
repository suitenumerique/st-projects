import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import Login from '../components/Login';

const mapStateToProps = (state) => {
  const oidcConfig = selectors.selectOidcConfig(state);

  const config = selectors.selectConfig(state);
  const {
    reactAppDefaultEmail,
    reactAppDefaultPassword,
    reactAppFeedbackWidgetApiUrl,
    reactAppFeedbackWidgetPath,
    reactAppFeedbackWidgetChannel,
  } = config || {};

  // const {
  //   ui: {
  //     authenticateForm: { data: defaultData, isSubmitting, isSubmittingUsingOidc, error },
  //   },
  // } = state;

  return {
    isOidcEnforced: !!oidcConfig && oidcConfig.isEnforced,
    reactAppDefaultEmail,
    reactAppDefaultPassword,
    reactAppFeedbackWidgetApiUrl,
    reactAppFeedbackWidgetPath,
    reactAppFeedbackWidgetChannel,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onAuthenticate: entryActions.authenticate,
      onAuthenticateUsingOidc: entryActions.authenticateUsingOidc,
      // onMessageDismiss: entryActions.clearAuthenticateError,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Login);
