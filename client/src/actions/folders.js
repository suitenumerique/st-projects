import ActionTypes from '../constants/ActionTypes';

const createFolder = (folder) => ({
  type: ActionTypes.FOLDER_CREATE,
  payload: {
    folder,
  },
});

createFolder.success = (localId, folder) => ({
  type: ActionTypes.FOLDER_CREATE__SUCCESS,
  payload: {
    localId,
    folder,
  },
});

createFolder.failure = (localId, error) => ({
  type: ActionTypes.FOLDER_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleFolderCreate = (folder) => ({
  type: ActionTypes.FOLDER_CREATE_HANDLE,
  payload: {
    folder,
  },
});

const updateFolder = (id, data) => ({
  type: ActionTypes.FOLDER_UPDATE,
  payload: {
    id,
    data,
  },
});

updateFolder.success = (folder) => ({
  type: ActionTypes.FOLDER_UPDATE__SUCCESS,
  payload: {
    folder,
  },
});

updateFolder.failure = (id, error) => ({
  type: ActionTypes.FOLDER_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleFolderUpdate = (folder) => ({
  type: ActionTypes.FOLDER_UPDATE_HANDLE,
  payload: {
    folder,
  },
});

const deleteFolder = (id) => ({
  type: ActionTypes.FOLDER_DELETE,
  payload: {
    id,
  },
});

deleteFolder.success = (folder) => ({
  type: ActionTypes.FOLDER_DELETE__SUCCESS,
  payload: {
    folder,
  },
});

deleteFolder.failure = (id, error) => ({
  type: ActionTypes.FOLDER_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleFolderDelete = (folder) => ({
  type: ActionTypes.FOLDER_DELETE_HANDLE,
  payload: {
    folder,
  },
});

export default {
  createFolder,
  handleFolderCreate,
  updateFolder,
  handleFolderUpdate,
  deleteFolder,
  handleFolderDelete,
};
