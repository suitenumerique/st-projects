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

// Enhanced selector that includes related data - use with caution as it may impact performance
export const selectCardsWithDetailsForCurrentBoard = createSelector(
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

    // Get filtered cards from each list instead of all cards from board
    const filteredCards = [];
    const lists = boardModel.lists.toModelArray();

    lists.forEach((listModel) => {
      const listFilteredCards = listModel.getFilteredOrderedCardsModelArray();
      listFilteredCards.forEach((cardModel) => {
        filteredCards.push({
          ...cardModel.ref,
          isPersisted: !isLocalId(cardModel.id),
          coverUrl: cardModel.coverAttachment && cardModel.coverAttachment.coverUrl,
          users: cardModel.users.toRefArray(),
          labels: cardModel.labels.toRefArray(),
          tasks: cardModel
            .getOrderedTasksQuerySet()
            .toRefArray()
            .map((task) => ({
              ...task,
              isPersisted: !isLocalId(task.id),
            })),
          attachments: cardModel
            .getOrderedAttachmentsQuerySet()
            .toRefArray()
            .map((attachment) => ({
              ...attachment,
              isCover: attachment.id === cardModel.coverAttachmentId,
              isPersisted: !isLocalId(attachment.id),
            })),
          attachmentsTotal: cardModel.attachments.count(),
          notificationsTotal: cardModel.getUnreadNotificationsQuerySet().count(),
          lastActivityId: cardModel.getFilteredOrderedInCardActivitiesQuerySet().last()?.id,
        });
      });
    });

    return filteredCards;
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

export const selectPrivateBoards = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  ({ Board, Project }, currentUserId) => {
    const privateBoards = Board.all()
      .toRefArray()
      .filter((board) => {
        const boardModel = Board.withId(board.id);
        const memberships = boardModel.getOrderedMembershipsModelArray();
        return (
          !board.isPublic && memberships.length === 1 && memberships[0].user.id === currentUserId
        );
      })
      .map((board) => {
        const boardModel = Board.withId(board.id);
        const project = Project.withId(boardModel.projectId);

        if (!project) {
          return null;
        }

        return board;
      })
      .filter((board) => board !== null);

    return privateBoards;
  },
);

export const selectSharedBoards = createSelector(orm, ({ Board, Project }) => {
  const sharedBoards = Board.all()
    .toRefArray()
    .filter((board) => {
      const boardModel = Board.withId(board.id);
      const memberships = boardModel.getOrderedMembershipsModelArray();
      return board.isPublic || memberships.length > 1;
    })
    .map((board) => {
      const boardModel = Board.withId(board.id);
      const project = Project.withId(boardModel.projectId);

      if (!project) {
        return null;
      }

      return board;
    })
    .filter((board) => board !== null);

  return sharedBoards;
});

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
  makeSelectCurrentUserMembershipForBoardById,
  selectLabelsForCurrentBoard,
  selectListIdsForCurrentBoard,
  selectListsForCurrentBoard,
  selectCardsForCurrentBoard,
  selectCardsWithDetailsForCurrentBoard,
  selectFilterUsersForCurrentBoard,
  selectFilterLabelsForCurrentBoard,
  selectFilterTextForCurrentBoard,
  selectIsBoardWithIdExists,
  selectPrivateBoards,
  selectSharedBoards,
  selectAllBoards,
};
