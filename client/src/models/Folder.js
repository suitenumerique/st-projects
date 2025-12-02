import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'Folder';

  static fields = {
    id: attr(),
    position: attr(),
    name: attr(),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'folders',
    }),
    parentFolderId: fk({
      to: 'Folder',
      as: 'parentFolder',
      relatedName: 'subfolders',
    }),
  };

  static reducer({ type, payload }, Folder) {
    switch (type) {
      case ActionTypes.CORE_INITIALIZE:
        if (payload.folders) {
          payload.folders.forEach((folder) => {
            Folder.upsert(folder);
          });
        }
        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Folder.all().delete();

        if (payload.folders) {
          payload.folders.forEach((folder) => {
            Folder.upsert(folder);
          });
        }
        break;
      case ActionTypes.FOLDER_CREATE:
      case ActionTypes.FOLDER_CREATE_HANDLE:
      case ActionTypes.FOLDER_UPDATE__SUCCESS:
      case ActionTypes.FOLDER_UPDATE_HANDLE:
        Folder.upsert(payload.folder);
        break;
      case ActionTypes.FOLDER_CREATE__SUCCESS:
        Folder.withId(payload.localId).delete();
        Folder.upsert(payload.folder);
        break;
      case ActionTypes.FOLDER_UPDATE:
        Folder.withId(payload.id).update(payload.data);
        break;
      case ActionTypes.FOLDER_DELETE:
        Folder.withId(payload.id).deleteWithRelated();
        break;
      case ActionTypes.FOLDER_DELETE__SUCCESS:
      case ActionTypes.FOLDER_DELETE_HANDLE: {
        const folderModel = Folder.withId(payload.folder.id);

        if (folderModel) {
          folderModel.deleteWithRelated();
        }

        break;
      }
      default:
    }
  }

  getOrderedBoardsQuerySet() {
    // Boards are now associated via user_board_preference, not directly via board.folderId
    // This method is no longer valid - boards should be retrieved via user preferences
    // Returning empty query set for compatibility
    return this.boards || { toModelArray: () => [], toRefArray: () => [] };
  }

  getOrderedSubfoldersQuerySet() {
    return this.subfolders.orderBy('position');
  }

  deleteWithRelated() {
    // Boards are now associated via user_board_preference, not directly via board.folderId
    // Moving boards to parent/root should be handled on the backend when folder is deleted
    // (updating all user board preferences that reference this folder)

    // Move all subfolders to the parent folder or root
    this.subfolders.toModelArray().forEach((subfolderModel) => {
      subfolderModel.update({
        parentFolderId: this.parentFolderId || null,
      });
    });

    this.delete();
  }
}
