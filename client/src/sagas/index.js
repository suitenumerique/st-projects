import { call, fork, put, select, take } from 'redux-saga/effects';

import loginSaga from './login';
import coreSaga from './core';
import { getAccessToken } from '../utils/access-token-storage';
import selectors from '../selectors';
import Paths from '../constants/Paths';
import { LOCATION_CHANGE_HANDLE } from '../lib/redux-router';

export default function* rootSaga() {
  const accessToken = yield call(getAccessToken);

  let initialLocationAction = null;

  if (!accessToken) {
    initialLocationAction = yield take(LOCATION_CHANGE_HANDLE);

    const pathsMatch = yield select(selectors.selectPathsMatch);
    const isBoardPath = pathsMatch && pathsMatch.pattern.path === Paths.BOARDS;

    if (!isBoardPath) {
      yield call(loginSaga);
    }
  }

  yield fork(coreSaga);

  if (initialLocationAction) {
    yield take('CORE_WATCHERS_READY');
    yield put(initialLocationAction);
  }
}
