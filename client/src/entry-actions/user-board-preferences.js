import ActionTypes from '../constants/ActionTypes';

const handleUserBoardPreferenceCreate = (userBoardPreference) => ({
  type: ActionTypes.USER_BOARD_PREFERENCE_CREATE_HANDLE,
  payload: {
    userBoardPreference,
  },
});

const handleUserBoardPreferenceUpdate = (userBoardPreference) => ({
  type: ActionTypes.USER_BOARD_PREFERENCE_UPDATE_HANDLE,
  payload: {
    userBoardPreference,
  },
});

const handleUserBoardPreferenceDelete = (userBoardPreference) => ({
  type: ActionTypes.USER_BOARD_PREFERENCE_DELETE_HANDLE,
  payload: {
    userBoardPreference,
  },
});

export default {
  handleUserBoardPreferenceCreate,
  handleUserBoardPreferenceUpdate,
  handleUserBoardPreferenceDelete,
};
