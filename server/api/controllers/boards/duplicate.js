const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
};

module.exports = {
  inputs: {
    boardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    targetProjectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board } = await sails.helpers.boards
      .getProjectPath(inputs.boardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const targetProject = await Project.findOne(inputs.targetProjectId);

    if (!targetProject) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    // const isSourceProjectManager = await sails.helpers.users.isProjectManager(
    //   currentUser.id,
    //   project.id,
    // );

    const isTargetProjectManager = await sails.helpers.users.isProjectManager(
      currentUser.id,
      targetProject.id,
    );

    if (!isTargetProjectManager) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const newBoard = await sails.helpers.boards.duplicateOne.with({
      board,
      targetProject,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: newBoard,
    };
  },
};
