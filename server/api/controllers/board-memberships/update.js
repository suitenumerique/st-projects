const Errors = {
  BOARD_MEMBERSHIP_NOT_FOUND: {
    boardMembershipNotFound: 'Board membership not found',
  },
  CANNOT_UPDATE_OWNER: {
    cannotUpdateOwner: 'Cannot update owner membership',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(BoardMembership.Roles),
    },
    canComment: {
      type: 'boolean',
      allowNull: true,
    },
  },

  exits: {
    boardMembershipNotFound: {
      responseType: 'notFound',
    },
    cannotUpdateOwner: {
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

    // Prevent updating owner memberships
    if (boardMembership.role === 'owner') {
      throw Errors.CANNOT_UPDATE_OWNER;
    }

    const isBoardOwner = await sails.helpers.users.isBoardOwner(currentUser.id, board.id);
    const isBoardEditor = await sails.helpers.users.isBoardEditor(currentUser.id, board.id);

    if (!isBoardOwner && !isBoardEditor) {
      throw Errors.BOARD_MEMBERSHIP_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['role', 'canComment']);

    boardMembership = await sails.helpers.boardMemberships.updateOne.with({
      values,
      project,
      board,
      record: boardMembership,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: boardMembership,
    };
  },
};
