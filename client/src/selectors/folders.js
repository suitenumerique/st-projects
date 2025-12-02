import { createSelector } from 'redux-orm';
import isUndefined from 'lodash/isUndefined';

import orm from '../orm';
import { selectCurrentUserId } from './users';
import { isLocalId } from '../utils/local-id';
import Config from '../constants/Config';

export const selectFoldersForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ Folder }, userId) => {
    if (!userId) {
      return [];
    }

    return Folder.all()
      .toRefArray()
      .filter((folder) => folder.userId === userId)
      .map((folder) => ({
        ...folder,
        isPersisted: !isLocalId(folder.id),
      }));
  },
);

const nextPosition = (items, index, excludedId) => {
  const filteredItems = isUndefined(excludedId)
    ? items
    : items.filter((item) => item.id !== excludedId);

  if (isUndefined(index)) {
    const lastItem = filteredItems[filteredItems.length - 1];

    return (lastItem ? lastItem.position : 0) + Config.POSITION_GAP;
  }

  const prevItem = filteredItems[index - 1];
  const nextItem = filteredItems[index];

  const prevPosition = prevItem ? prevItem.position : 0;

  if (!nextItem) {
    return prevPosition + Config.POSITION_GAP;
  }

  return prevPosition + (nextItem.position - prevPosition) / 2;
};

export const selectNextFolderPosition = createSelector(
  orm,
  (state, userId) => userId,
  (state, userId, parentFolderId) => parentFolderId,
  (state, userId, parentFolderId, index) => index,
  (state, userId, parentFolderId, index, excludedId) => excludedId,
  ({ Folder }, userId, parentFolderId, index, excludedId) => {
    if (!userId) {
      return 0;
    }

    const folders = Folder.all()
      .toRefArray()
      .filter(
        (folder) =>
          folder.userId === userId &&
          (parentFolderId ? folder.parentFolderId === parentFolderId : !folder.parentFolderId),
      )
      .sort((a, b) => a.position - b.position);

    return nextPosition(folders, index, excludedId);
  },
);

export default {
  selectFoldersForCurrentUser,
  selectNextFolderPosition,
};
