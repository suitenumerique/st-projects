import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { CunninghamProvider } from '@gouvfr-lasuite/ui-kit';
import { ModalProvider } from '@openfun/cunningham-react';
import { ReduxRouter } from '../lib/redux-router';
import i18n from '../i18n';

import Paths from '../constants/Paths';
import LoginWrapperContainer from '../containers/LoginWrapperContainer';
import CoreContainer from '../containers/CoreContainer';
import NotFound from './NotFound';

import '../assets/styles/reset.scss';
import '../assets/styles/globals.scss';

function Root({ store, history }) {
  return (
    <Provider store={store}>
      <CunninghamProvider currentLocale={i18n.resolvedLanguage} theme="dsfr-light">
        <ModalProvider>
          <ReduxRouter history={history}>
            <Routes>
              <Route path={Paths.LOGIN} element={<LoginWrapperContainer />} />
              <Route path={Paths.OIDC_CALLBACK} element={<LoginWrapperContainer />} />
              <Route path={Paths.ROOT} element={<CoreContainer />} />
              <Route path={Paths.BOARDS} element={<CoreContainer />} />
              <Route path={Paths.CARDS} element={<CoreContainer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ReduxRouter>
        </ModalProvider>
      </CunninghamProvider>
    </Provider>
  );
}

Root.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
};

export default Root;
