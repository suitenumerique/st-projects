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

    // Prevent deletion of owner memberships
    if (boardMembership.role === 'owner') {
      throw Errors.CANNOT_DELETE_OWNER;
    }

    if (boardMembership.userId !== currentUser.id) {
      const isBoardOwner = await sails.helpers.users.isBoardOwner(currentUser.id, board.id);
      const isBoardEditor = await sails.helpers.users.isBoardEditor(currentUser.id, board.id);

      if (!isBoardOwner && !isBoardEditor) {
        throw Errors.BOARD_MEMBERSHIP_NOT_FOUND; // Forbidden
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

    return {
      item: boardMembership,
    };
  },
};
