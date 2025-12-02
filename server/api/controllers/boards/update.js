const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    position: {
      type: 'number',
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
    },
    isPublic: {
      type: 'boolean',
    },
    folderId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const path = await sails.helpers.boards
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    let { board } = path;
    const { project } = path;

    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    // const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    const isBoardOwner = await sails.helpers.users.isBoardOwner(currentUser.id, board.id);
    const isBoardEditor = await sails.helpers.users.isBoardEditor(currentUser.id, board.id);

    if (!isBoardOwner && !isBoardEditor) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['position', 'name', 'isPublic', 'folderId']);

    // Separate user-specific preferences from global board properties
    const userPreferenceValues = {};
    const boardValues = {};

    if (!_.isUndefined(values.position)) {
      userPreferenceValues.position = values.position;
    }
    if (!_.isUndefined(values.folderId)) {
      userPreferenceValues.folderId = values.folderId;
    }
    if (!_.isUndefined(values.name)) {
      boardValues.name = values.name;
    }
    if (!_.isUndefined(values.isPublic)) {
      boardValues.isPublic = values.isPublic;
    }

    // Update user board preference if position or folderId changed
    let userBoardPreference;
    if (Object.keys(userPreferenceValues).length > 0) {
      userBoardPreference = await sails.helpers.userBoardPreferences.upsertOne.with({
        userId: currentUser.id,
        boardId: board.id,
        values: userPreferenceValues,
        actorUser: currentUser,
        request: this.req,
      });
    }

    // Update board properties if name or isPublic changed
    if (Object.keys(boardValues).length > 0) {
      board = await sails.helpers.boards.updateOne.with({
        values: boardValues,
        project,
        record: board,
        actorUser: currentUser,
        request: this.req,
      });
    }

    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    const result = {
      item: board,
    };

    // Include the updated user board preference in the response
    if (userBoardPreference) {
      result.included = {
        userBoardPreferences: [userBoardPreference],
      };
    }

    return result;
  },
};
