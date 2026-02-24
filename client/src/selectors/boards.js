import { createSelector } from 'redux-orm';

import orm from '../orm';
import { selectPath } from './router';
import { selectCurrentUserId } from './users';
import { isLocalId } from '../utils/local-id';

export const makeSelectBoardById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Board }, id) => {
      const boardModel = Board.withId(id);

      if (!boardModel) {
        return boardModel;
      }

      return boardModel.ref;
    },
  );

export const selectBoardById = makeSelectBoardById();

export const selectCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.ref;
  },
);

export const selectMembershipsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  (state) => selectCurrentUserId(state),
  ({ Board }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.getOrderedMembershipsModelArray().map((boardMembershipModel) => ({
      ...boardMembershipModel.ref,
      isPersisted: !isLocalId(boardMembershipModel.id),
      user: {
        ...boardMembershipModel.user.ref,
        isCurrent: boardMembershipModel.user.id === currentUserId,
      },
    }));
  },
);

export const selectCurrentUserMembershipForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  (state) => selectCurrentUserId(state),
  ({ Board }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    const boardMembershipModel = boardModel.getMembershipModelForUser(currentUserId);

    if (!boardMembershipModel) {
      return boardMembershipModel;
    }

    return boardMembershipModel.ref;
  },
);

export const makeSelectCurrentUserMembershipForBoardById = () =>
  createSelector(
    orm,
    (_, boardId) => boardId,
    (state) => selectCurrentUserId(state),
    ({ Board }, boardId, currentUserId) => {
      if (!boardId) {
        return boardId;
      }

      const boardModel = Board.withId(boardId);

      if (!boardModel) {
        return boardModel;
      }

      const boardMembershipModel = boardModel.getMembershipModelForUser(currentUserId);

      if (!boardMembershipModel) {
        return boardMembershipModel;
      }

      return boardMembershipModel.ref;
    },
  );

export const selectLabelsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel
      .getOrderedLabelsQuerySet()
      .toRefArray()
      .map((label) => ({
        ...label,
        isPersisted: !isLocalId(label.id),
      }));
  },
);

export const selectListIdsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel
      .getOrderedListsQuerySet()
      .toRefArray()
      .map((list) => list.id);
  },
);

export const selectListsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel
      .getOrderedListsQuerySet()
      .toRefArray()
      .map((list) => ({
        ...list,
        isPersisted: !isLocalId(list.id),
      }));
  },
);

export const selectCardsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel
      .getOrderedCardsQuerySet()
      .toRefArray()
      .map((card) => ({
        ...card,
        isPersisted: !isLocalId(card.id),
      }));
  },
);

export const selectFilterUsersForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.filterUsers.toRefArray();
  },
);

export const selectIncludeCardsWithoutMembersForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return false;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return false;
    }

    return boardModel.includeCardsWithoutMembers || false;
  },
);

export const selectIncludeCardsWithoutLabelsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return false;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return false;
    }

    return boardModel.includeCardsWithoutLabels || false;
  },
);

export const selectFilterLabelsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.filterLabels.toRefArray();
  },
);

export const selectFilterTextForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, id) => {
    if (!id) {
      return id;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return boardModel;
    }

    return boardModel.filterText;
  },
);

export const selectIsBoardWithIdExists = createSelector(
  orm,
  (_, id) => id,
  ({ Board }, id) => Board.idExists(id),
);

export default {
  makeSelectBoardById,
  selectBoardById,
  selectCurrentBoard,
  selectMembershipsForCurrentBoard,
  selectCurrentUserMembershipForCurrentBoard,
  makeSelectCurrentUserMembershipForBoardById,
  selectLabelsForCurrentBoard,
  selectListIdsForCurrentBoard,
  selectListsForCurrentBoard,
  selectFilterUsersForCurrentBoard,
  selectIncludeCardsWithoutMembersForCurrentBoard,
  selectIncludeCardsWithoutLabelsForCurrentBoard,
  selectFilterLabelsForCurrentBoard,
  selectFilterTextForCurrentBoard,
  selectIsBoardWithIdExists,
};
