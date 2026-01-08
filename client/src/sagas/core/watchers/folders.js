import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* foldersWatchers() {
  yield all([
    takeEvery(EntryActionTypes.FOLDER_CREATE, ({ payload: { data } }) =>
      services.createFolder(data),
    ),
    takeEvery(EntryActionTypes.FOLDER_CREATE_HANDLE, ({ payload: { folder, requestId } }) =>
      services.handleFolderCreate(folder, requestId),
    ),
    takeEvery(EntryActionTypes.FOLDER_UPDATE, ({ payload: { id, data } }) =>
      services.updateFolder(id, data),
    ),
    takeEvery(EntryActionTypes.FOLDER_UPDATE_HANDLE, ({ payload: { folder } }) =>
      services.handleFolderUpdate(folder),
    ),
    takeEvery(EntryActionTypes.FOLDER_DELETE, ({ payload: { id } }) => services.deleteFolder(id)),
    takeEvery(EntryActionTypes.FOLDER_DELETE_HANDLE, ({ payload: { folder } }) =>
      services.handleFolderDelete(folder),
    ),
  ]);
}
