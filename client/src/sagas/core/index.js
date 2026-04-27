import { nanoid } from 'nanoid';
import { all, apply, call, fork, select, take } from 'redux-saga/effects';

import watchers from './watchers';
import services from './services';
import selectors from '../../selectors';
import { socket } from '../../api';
import { getIdToken } from '../../utils/access-token-storage';
import ActionTypes from '../../constants/ActionTypes';
import Paths from '../../constants/Paths';

export default function* coreSaga() {
  yield all(watchers.map((watcher) => fork(watcher)));

  yield apply(socket, socket.connect);
  yield fork(services.initializeCore);

  yield take(ActionTypes.LOGOUT);

  const oidcConfig = yield select(selectors.selectOidcConfig);

  if (oidcConfig && oidcConfig.endSessionUrl) {
    const idToken = yield call(getIdToken);
    const state = nanoid();

    let logoutUrl = oidcConfig.endSessionUrl;
    if (idToken) {
      logoutUrl += `&id_token_hint=${encodeURIComponent(idToken)}`;
    }
    logoutUrl += `&state=${encodeURIComponent(state)}`;

    window.location.href = logoutUrl;
  } else {
    window.location.href = Paths.LOGIN;
  }
}
