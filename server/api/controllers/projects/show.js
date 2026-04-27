const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
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
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.findOne(inputs.id);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    let boards = await sails.helpers.projects.getBoards(project.id);
    let boardIds = sails.helpers.utils.mapRecords(boards);

    const userBoardMemberships = await sails.helpers.boardMemberships.getMany({
      boardId: boardIds,
      userId: currentUser.id,
    });

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      if (userBoardMemberships.length === 0) {
        throw Errors.PROJECT_NOT_FOUND; // Forbidden
      }

      boardIds = sails.helpers.utils.mapRecords(userBoardMemberships, 'boardId');
      boards = boards.filter((board) => boardIds.includes(board.id));
    }

    const projectManagers = await sails.helpers.projects.getProjectManagers(project.id);

    // Get all board memberships for the visible boards (not just current user's),
    // it will help adjusting UI depending on if a board is shared or not
    const allBoardMemberships = await sails.helpers.boardMemberships.getMany({
      boardId: boardIds,
    });

    const projectManagerUserIds = sails.helpers.utils.mapRecords(projectManagers, 'userId');
    const memberUserIds = sails.helpers.utils.mapRecords(allBoardMemberships, 'userId', true);
    const uniqueUserIds = [...new Set([...projectManagerUserIds, ...memberUserIds])];
    const users = await sails.helpers.users.getMany(uniqueUserIds);

    return {
      item: project,
      included: {
        users,
        projectManagers,
        boards,
        boardMemberships: allBoardMemberships,
      },
    };
  },
};
