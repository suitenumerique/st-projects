import { createSelector } from 'redux-orm';

import orm from '../orm';
import { selectPath } from './router';
import { selectCurrentUserId } from './users';
import { BoardMembershipRoles } from '../constants/Enums';
import { isLocalId } from '../utils/local-id';

export const makeSelectProjectById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Project }, id) => {
      const projectModel = Project.withId(id);

      if (!projectModel) {
        return projectModel;
      }

      return projectModel.ref;
    },
  );

export const selectProjectById = makeSelectProjectById();

export const selectCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  ({ Project }, id) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel.ref;
  },
);

export const selectManagersForCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  (state) => selectCurrentUserId(state),
  ({ Project }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel
      .getOrderedManagersQuerySet()
      .toModelArray()
      .map((projectManagerModel) => ({
        ...projectManagerModel.ref,
        isPersisted: !isLocalId(projectManagerModel.id),
        user: {
          ...projectManagerModel.user.ref,
          isCurrent: projectManagerModel.user.id === currentUserId,
        },
      }));
  },
);

export const selectBoardsForCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  (state) => selectCurrentUserId(state),
  ({ Project }, id, currentUserId) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel
      .getOrderedBoardsModelArrayAvailableForUser(currentUserId)
      .map((boardModel) => ({
        ...boardModel.ref,
        isPersisted: !isLocalId(boardModel.id),
        lists: boardModel
          .getOrderedListsQuerySet()
          .toRefArray()
          .map((list) => ({
            ...list,
            isPersisted: !isLocalId(list.id),
          })),
      }));
  },
);

export const selectBoardsForSpecificProject = createSelector(
  orm,
  (state) => selectCurrentUserId(state),
  (_, projectId) => projectId,
  ({ Project }, currentUserId, id) => {
    if (!id) {
      return id;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel
      .getOrderedBoardsModelArrayAvailableForUser(currentUserId)
      .map((boardModel) => ({
        ...boardModel.ref,
        isPersisted: !isLocalId(boardModel.id),
        lists: boardModel
          .getOrderedListsQuerySet()
          .toRefArray()
          .map((list) => ({
            ...list,
            isPersisted: !isLocalId(list.id),
          })),
      }));
  },
);

export const selectPrivateBoardsForCurrentUser = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  (state) => selectCurrentUserId(state),
  ({ Project }, projectId, currentUserId) => {
    if (!projectId) {
      return [];
    }

    const projectModel = Project.withId(projectId);

    if (!projectModel) {
      return projectModel;
    }

    const projectManagers = projectModel.getOrderedManagersQuerySet().toRefArray();

    return projectModel
      .getOrderedBoardsModelArrayAvailableForUser(currentUserId)
      .filter((boardModel) => {
        const memberships = boardModel.getOrderedMembershipsModelArray();

        return (
          !boardModel.isPublic &&
          (memberships.length === 0 ||
            memberships.every(
              (membership) =>
                projectManagers.findIndex((manager) => manager.userId === membership.userId) !== -1,
            ))
        );
      })
      .map((boardModel) => {
        return {
          ...boardModel.ref,
          isPersisted: !isLocalId(boardModel.id),
        };
      });
  },
);

export const selectSharedBoardsForCurrentUser = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  (state) => selectCurrentUserId(state),
  ({ Project }, projectId, currentUserId) => {
    if (!projectId) {
      return [];
    }

    const projectModel = Project.withId(projectId);

    if (!projectModel) {
      return projectModel;
    }

    const projectManagers = projectModel.getOrderedManagersQuerySet().toRefArray();

    return projectModel
      .getOrderedBoardsModelArrayAvailableForUser(currentUserId)
      .filter((boardModel) => {
        const memberships = boardModel.getOrderedMembershipsModelArray();

        return (
          boardModel.isPublic ||
          (memberships.length > 0 &&
            memberships.some(
              (membership) =>
                projectManagers.findIndex((manager) => manager.userId === membership.userId) === -1,
            ))
        );
      })
      .map((boardModel) => {
        return {
          ...boardModel.ref,
          isPersisted: !isLocalId(boardModel.id),
        };
      });
  },
);

export const selectEditableBoardsForCurrentUser = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  (state) => selectCurrentUserId(state),
  ({ Project }, projectId, currentUserId) => {
    if (!projectId) {
      return [];
    }

    const projectModel = Project.withId(projectId);

    if (!projectModel) {
      return projectModel;
    }

    return projectModel
      .getOrderedBoardsModelArrayAvailableForUser(currentUserId)
      .filter((boardModel) => {
        const memberships = boardModel.getOrderedMembershipsModelArray();

        // Project manager can add boards but cannot interact with them until having membership for it
        return (
          memberships.length > 0 &&
          memberships.some(
            (membership) =>
              membership.user.id === currentUserId &&
              membership.role === BoardMembershipRoles.EDITOR,
          )
        );
      })
      .map((boardModel) => {
        return {
          ...boardModel.ref,
          isPersisted: !isLocalId(boardModel.id),
          lists: boardModel
            .getOrderedListsQuerySet()
            .toRefArray()
            .map((list) => ({
              ...list,
              isPersisted: !isLocalId(list.id),
            })),
        };
      });
  },
);

export const selectIsCurrentUserManagerForCurrentProject = createSelector(
  orm,
  (state) => selectPath(state).projectId,
  (state) => selectCurrentUserId(state),
  ({ Project }, id, currentUserId) => {
    if (!id) {
      return false;
    }

    const projectModel = Project.withId(id);

    if (!projectModel) {
      return false;
    }

    return projectModel.hasManagerForUser(currentUserId);
  },
);

export default {
  selectProjectById,
  selectCurrentProject,
  selectManagersForCurrentProject,
  selectBoardsForCurrentProject,
  selectBoardsForSpecificProject,
  selectIsCurrentUserManagerForCurrentProject,
  selectPrivateBoardsForCurrentUser,
  selectSharedBoardsForCurrentUser,
  selectEditableBoardsForCurrentUser,
};
