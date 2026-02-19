import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import loginServices from '../../login/services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* coreWatchers() {
  yield all([
    takeEvery(EntryActionTypes.LOGOUT, ({ payload: { invalidateAccessToken } }) =>
      services.logout(invalidateAccessToken),
    ),
    takeEvery(EntryActionTypes.USING_OIDC_AUTHENTICATE, () =>
      loginServices.authenticateUsingOidc(),
    ),
  ]);
}
