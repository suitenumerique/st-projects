import EntryActionTypes from '../constants/EntryActionTypes';

const createFolderInCurrentProject = (data) => ({
  type: EntryActionTypes.FOLDER_IN_CURRENT_PROJECT_CREATE,
  payload: {
    data,
  },
});

const handleFolderCreate = (folder, requestId) => ({
  type: EntryActionTypes.FOLDER_CREATE_HANDLE,
  payload: {
    folder,
    requestId,
  },
});

const updateFolder = (id, data) => ({
  type: EntryActionTypes.FOLDER_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleFolderUpdate = (folder) => ({
  type: EntryActionTypes.FOLDER_UPDATE_HANDLE,
  payload: {
    folder,
  },
});

const deleteFolder = (id) => ({
  type: EntryActionTypes.FOLDER_DELETE,
  payload: {
    id,
  },
});

const handleFolderDelete = (folder) => ({
  type: EntryActionTypes.FOLDER_DELETE_HANDLE,
  payload: {
    folder,
  },
});

export default {
  createFolderInCurrentProject,
  handleFolderCreate,
  updateFolder,
  handleFolderUpdate,
  deleteFolder,
  handleFolderDelete,
};
