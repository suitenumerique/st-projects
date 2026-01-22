import { call, select } from 'redux-saga/effects';

import selectors from '../selectors';
import Paths from '../constants/Paths';
import loginSaga from './login';
import coreSaga from './core';
import { getAccessToken } from '../utils/access-token-storage';

export default function* rootSaga() {
  const accessToken = yield call(getAccessToken);

  if (!accessToken) {
    const pathsMatch = yield select(selectors.selectPathsMatch);
    const isBoardPath = pathsMatch && pathsMatch.pattern.path === Paths.BOARDS;
    const hasBoardId = isBoardPath && pathsMatch.params && pathsMatch.params.id;

    if (!isBoardPath || !hasBoardId) {
      yield call(loginSaga);
    }
  }

  yield call(coreSaga);
}
