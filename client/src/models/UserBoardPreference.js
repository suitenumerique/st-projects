import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'UserBoardPreference';

  static fields = {
    id: attr(),
    position: attr(),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'userBoardPreferences',
    }),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'userBoardPreferences',
    }),
    folderId: fk({
      to: 'Folder',
      as: 'folder',
      relatedName: 'userBoardPreferences',
    }),
  };

  static reducer({ type, payload }, UserBoardPreference) {
    switch (type) {
      case ActionTypes.CORE_INITIALIZE:
        if (payload.userBoardPreferences) {
          payload.userBoardPreferences.forEach((preference) => {
            UserBoardPreference.upsert(preference);
          });
        }
        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        UserBoardPreference.all().delete();

        if (payload.userBoardPreferences) {
          payload.userBoardPreferences.forEach((preference) => {
            UserBoardPreference.upsert(preference);
          });
        }
        break;
      case ActionTypes.USER_BOARD_PREFERENCE_CREATE_HANDLE:
      case ActionTypes.USER_BOARD_PREFERENCE_UPDATE_HANDLE:
        UserBoardPreference.upsert(payload.userBoardPreference);
        break;
      case ActionTypes.USER_BOARD_PREFERENCE_DELETE_HANDLE: {
        const preferenceModel = UserBoardPreference.withId(payload.userBoardPreference.id);

        if (preferenceModel) {
          preferenceModel.delete();
        }

        break;
      }
      default:
    }
  }
}
