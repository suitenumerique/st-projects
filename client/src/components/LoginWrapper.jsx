import React from 'react';
import PropTypes from 'prop-types';

import LoginContainer from '../containers/LoginContainer';

const LoginWrapper = React.memo(({ isInitializing }) => {
  if (isInitializing) {
    return <p>Chargement...</p>;
  }

  return <LoginContainer />;
});

LoginWrapper.propTypes = {
  isInitializing: PropTypes.bool.isRequired,
};

export default LoginWrapper;
