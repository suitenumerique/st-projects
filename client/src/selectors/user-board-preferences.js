import { createSelector } from 'redux-orm';
import isUndefined from 'lodash/isUndefined';

import orm from '../orm';
import { selectCurrentUserId } from './users';
import Config from '../constants/Config';

// Get user board preference for a specific board
export const selectUserBoardPreference = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  (_, boardId) => boardId,
  ({ UserBoardPreference }, userId, boardId) => {
    if (!userId || !boardId) {
      return null;
    }

    return UserBoardPreference.all()
      .toRefArray()
      .find((pref) => pref.userId === userId && pref.boardId === boardId);
  },
);

// Enrich a board with user preferences
export const enrichBoardWithUserPreference = (board, userPreference) => {
  if (!userPreference) {
    return {
      ...board,
      position: undefined,
      folderId: undefined,
    };
  }

  return {
    ...board,
    position: userPreference.position,
    folderId: userPreference.folderId,
  };
};

// Get all user board preferences for current user
export const selectUserBoardPreferencesForCurrentUser = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ UserBoardPreference }, userId) => {
    if (!userId) {
      return [];
    }

    return UserBoardPreference.all()
      .toRefArray()
      .filter((pref) => pref.userId === userId);
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

// Get ordered boards for a folder (or root if folderId is null) based on user preferences
const getOrderedBoardsForFolder = (UserBoardPreference, userId, folderId) => {
  if (!userId) {
    return [];
  }

  const preferences = UserBoardPreference.all()
    .toRefArray()
    .filter(
      (pref) =>
        pref.userId === userId &&
        (folderId === null ? !pref.folderId : pref.folderId === folderId) &&
        pref.position !== undefined,
    )
    .sort((a, b) => a.position - b.position);

  return preferences;
};

// Select next board position for a folder (or root if folderId is null)
export const selectNextBoardPositionForFolder = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  (_, folderId) => folderId,
  (_, __, index) => index,
  (_, __, ___, excludedBoardId) => excludedBoardId,
  ({ UserBoardPreference }, userId, folderId, index, excludedBoardId) => {
    if (!userId) {
      return 0;
    }

    const orderedPreferences = getOrderedBoardsForFolder(UserBoardPreference, userId, folderId);

    // Map to items with id and position for nextPosition helper
    const items = orderedPreferences.map((pref) => ({
      id: pref.boardId,
      position: pref.position,
    }));

    return nextPosition(items, index, excludedBoardId);
  },
);

export default {
  selectUserBoardPreference,
  enrichBoardWithUserPreference,
  selectUserBoardPreferencesForCurrentUser,
  selectNextBoardPositionForFolder,
};
