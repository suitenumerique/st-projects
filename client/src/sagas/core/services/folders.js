import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createFolder(data) {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  // Force parentFolderId to null to prevent nested folders
  const nextData = {
    ...data,
    parentFolderId: null,
    position: yield select(selectors.selectNextFolderPosition, currentUserId, null),
  };

  const localId = yield call(createLocalId);

  yield put(
    actions.createFolder({
      ...nextData,
      userId: currentUserId,
      id: localId,
    }),
  );

  let folder;

  try {
    ({ item: folder } = yield call(request, api.createFolder, nextData));
  } catch (error) {
    yield put(actions.createFolder.failure(localId, error));
    return;
  }

  yield put(actions.createFolder.success(localId, folder));
}

export function* handleFolderCreate(folder) {
  yield put(actions.handleFolderCreate(folder));
}

export function* updateFolder(id, data) {
  yield put(actions.updateFolder(id, data));

  let folder;

  try {
    ({ item: folder } = yield call(request, api.updateFolder, id, data));
  } catch (error) {
    yield put(actions.updateFolder.failure(id, error));
    return;
  }

  yield put(actions.updateFolder.success(folder));
}

export function* handleFolderUpdate(folder) {
  yield put(actions.handleFolderUpdate(folder));
}

export function* deleteFolder(id) {
  yield put(actions.deleteFolder(id));

  let folder;

  try {
    ({ item: folder } = yield call(request, api.deleteFolder, id));
  } catch (error) {
    yield put(actions.deleteFolder.failure(id, error));
    return;
  }

  yield put(actions.deleteFolder.success(folder));
}

export function* handleFolderDelete(folder) {
  yield put(actions.handleFolderDelete(folder));
}

export default {
  createFolder,
  handleFolderCreate,
  updateFolder,
  handleFolderUpdate,
  deleteFolder,
  handleFolderDelete,
};
