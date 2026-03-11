const Errors = {
  BOARD_MEMBERSHIP_NOT_FOUND: {
    boardMembershipNotFound: 'Board membership not found',
  },
  CANNOT_DELETE_OWNER: {
    cannotDeleteOwner: 'Cannot delete owner membership',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    boardMembershipNotFound: {
      responseType: 'notFound',
    },
    cannotDeleteOwner: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const path = await sails.helpers.boardMemberships
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.BOARD_MEMBERSHIP_NOT_FOUND);

    let { boardMembership } = path;
    const { board, project } = path;

    if (boardMembership.role === 'owner') {
      throw Errors.CANNOT_DELETE_OWNER;
    }

    if (boardMembership.userId !== currentUser.id) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        const isBoardOwner = await sails.helpers.users.isBoardOwner(currentUser.id, board.id);
        const isBoardEditor = await sails.helpers.users.isBoardEditor(currentUser.id, board.id);

        if (!isBoardOwner && !isBoardEditor) {
          throw Errors.BOARD_MEMBERSHIP_NOT_FOUND; // Forbidden
        }
      }
    }

    boardMembership = await sails.helpers.boardMemberships.deleteOne.with({
      project,
      board,
      record: boardMembership,
      actorUser: currentUser,
      request: this.req,
    });

    if (!boardMembership) {
      throw Errors.BOARD_MEMBERSHIP_NOT_FOUND;
    }

    if (!board.isPublic) {
      const memberships = await BoardMembership.find({
        boardId: board.id,
      });

      if (memberships.length === 1) {
        const remainingUserId = memberships[0].userId;

        const existingPreference = await UserBoardPreference.findOne({
          userId: remainingUserId,
          boardId: board.id,
        });

        if (existingPreference && existingPreference.folderId) {
          await sails.helpers.userBoardPreferences.deleteOne.with({
            userId: remainingUserId,
            boardId: board.id,
            actorUser: currentUser,
            request: this.req,
          });
        }
      }
    }

    return {
      item: boardMembership,
    };
  },
};
