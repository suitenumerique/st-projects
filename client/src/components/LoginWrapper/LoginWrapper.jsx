import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from '@gouvfr-lasuite/ui-kit';

import LoginContainer from '../../containers/LoginContainer';

import styles from './LoginWrapper.module.scss';

const LoginWrapper = React.memo(({ isInitializing }) => {
  if (isInitializing) {
    return (
      <div className={styles.loading}>
        <Spinner size="xl" />
      </div>
    );
  }

  return <LoginContainer />;
});

LoginWrapper.propTypes = {
  isInitializing: PropTypes.bool.isRequired,
};

export default LoginWrapper;
