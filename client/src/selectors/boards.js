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

export const selectIsPrivateBoard = createSelector(
  orm,
  (_, id) => id,
  (state) => selectCurrentUserId(state),
  ({ Board }, id, currentUserId) => {
    if (!id) {
      return false;
    }

    const boardModel = Board.withId(id);

    if (!boardModel) {
      return false;
    }

    const memberships = boardModel.getOrderedMembershipsModelArray();

    return memberships.length === 1 && memberships[0].user.id === currentUserId;
  },
);

export const selectAllBoards = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ Board, Project }, currentUserId) => {
    const allBoards = Board.all().toRefArray();

    const allBoardsMapped = allBoards.map((board) => {
      const boardModel = Board.withId(board.id);
      const memberships = boardModel.getOrderedMembershipsModelArray();
      const project = Project.withId(boardModel.projectId);

      if (!project) {
        return null;
      }

      return {
        ...board,
        project: project.ref,
        isPrivate:
          !board.isPublic && memberships.length === 1 && memberships[0].user.id === currentUserId,
        isOwner:
          memberships.find(
            (membership) => membership.user.id === currentUserId && membership.role === 'owner',
          ) !== undefined,
      };
    });

    return allBoardsMapped.filter((board) => board !== null);
  },
);

export default {
  makeSelectBoardById,
  selectBoardById,
  selectCurrentBoard,
  selectMembershipsForCurrentBoard,
  selectCurrentUserMembershipForCurrentBoard,
  selectLabelsForCurrentBoard,
  selectListIdsForCurrentBoard,
  selectFilterUsersForCurrentBoard,
  selectFilterLabelsForCurrentBoard,
  selectFilterTextForCurrentBoard,
  selectIsBoardWithIdExists,
  selectIsPrivateBoard,
  selectAllBoards,
};
