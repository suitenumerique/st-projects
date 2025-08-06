import { call, put, select, take } from 'redux-saga/effects';
import { push } from '../../../lib/redux-router';

import { authenticateUsingOidcCallback } from './login';
import selectors from '../../../selectors';
import ActionTypes from '../../../constants/ActionTypes';
import Paths from '../../../constants/Paths';

export function* goToLogin() {
  yield put(push(Paths.LOGIN));
}

export function* goToRoot() {
  yield put(push(Paths.ROOT));
}

export function* handleLocationChange() {
  const pathsMatch = yield select(selectors.selectPathsMatch);

  if (!pathsMatch) {
    return;
  }

  switch (pathsMatch.pattern.path) {
    case Paths.ROOT:
    case Paths.PROJECTS:
      yield call(goToLogin);
      break;
    case Paths.BOARDS:
    case Paths.CARDS:
      // Don't redirect to login for board/card paths - these could be public boards
      // The core saga will handle authentication for these paths
      break;
    case Paths.OIDC_CALLBACK: {
      const isInitializing = yield select(selectors.selectIsInitializing);

      if (isInitializing) {
        yield take(ActionTypes.LOGIN_INITIALIZE);
      }

      yield call(authenticateUsingOidcCallback);

      break;
    }
    default:
  }
}

export default {
  goToLogin,
  goToRoot,
  handleLocationChange,
};
