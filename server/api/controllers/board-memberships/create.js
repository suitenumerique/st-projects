const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  USER_ALREADY_BOARD_MEMBER: {
    userAlreadyBoardMember: 'User already board member',
  },
};

module.exports = {
  inputs: {
    boardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    userId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(BoardMembership.Roles),
      required: true,
    },
    canComment: {
      type: 'boolean',
      allowNull: true,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
    userNotFound: {
      responseType: 'notFound',
    },
    userAlreadyBoardMember: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers.boards
      .getProjectPath(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const isBoardEditor = await sails.helpers.users.isBoardEditor(currentUser.id, board.id);
    const isBoardOwner = await sails.helpers.users.isBoardOwner(currentUser.id, board.id);

    if (!isBoardOwner && !isBoardEditor) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const user = await sails.helpers.users.getOne(inputs.userId);

    if (!user) {
      throw Error.USER_NOT_FOUND;
    }

    const values = _.pick(inputs, ['role', 'canComment']);

    if (!board.isPublic) {
      const membershipsCount = await BoardMembership.count({
        boardId: board.id,
      });

      if (membershipsCount === 1) {
        const userBoardPreference = await UserBoardPreference.findOne({
          userId: currentUser.id,
          boardId: board.id,
        });

        if (userBoardPreference && userBoardPreference.folderId) {
          await sails.helpers.userBoardPreferences.deleteOne.with({
            userId: currentUser.id,
            boardId: board.id,
            actorUser: currentUser,
            request: this.req,
          });
        }
      }
    }

    const boardMembership = await sails.helpers.boardMemberships.createOne
      .with({
        project,
        values: {
          ...values,
          board,
          user,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('userAlreadyBoardMember', () => Errors.USER_ALREADY_BOARD_MEMBER);

    return {
      item: boardMembership,
    };
  },
};
