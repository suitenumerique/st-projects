module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const { organizationIdClaim } = sails.config.custom;

    if (organizationIdClaim) {
      // Org mode: user is auto-assigned to the project matching their organization ID claim
      const userProject = await sails.helpers.projects.getOne({
        siret: currentUser.siret,
      });

      const boardMemberships = await sails.helpers.users.getBoardMemberships([currentUser.id], {
        role: {
          '!=': 'public_reader',
        },
      });
      const membershipBoardIds = sails.helpers.utils.mapRecords(boardMemberships, 'boardId');
      const membershipBoards = await sails.helpers.boards.getMany({
        id: membershipBoardIds,
      });

      const membershipProjectIds = sails.helpers.utils
        .mapRecords(membershipBoards, 'projectId', true)
        .filter((projectId) => projectId !== userProject.id);

      const membershipProjects = await sails.helpers.projects.getMany(membershipProjectIds);

      const projects = [userProject, ...membershipProjects];
      const boards = [...membershipBoards];
      const allBoardMemberships = await sails.helpers.boards.getBoardMemberships(membershipBoardIds);

      const folders = await sails.helpers.folders.getMany.with({
        criteria: {
          userId: currentUser.id,
        },
      });

      const userBoardPreferences = await sails.helpers.userBoardPreferences.getMany({
        userId: currentUser.id,
      });

      return {
        items: projects,
        included: {
          boards,
          boardMemberships: allBoardMemberships,
          folders,
          userBoardPreferences,
        },
      };
    }

    // Free mode: users manage their own projects
    const managerProjectIds = await sails.helpers.users.getManagerProjectIds(currentUser.id);
    const managerProjects = await sails.helpers.projects.getMany(managerProjectIds);

    const boardMemberships = await sails.helpers.users.getBoardMemberships(currentUser.id);
    const membershipBoardIds = sails.helpers.utils.mapRecords(boardMemberships, 'boardId');

    let membershipBoards = await sails.helpers.boards.getMany({
      id: membershipBoardIds,
      projectId: {
        '!=': managerProjectIds,
      },
    });

    let membershipProjectIds = sails.helpers.utils.mapRecords(membershipBoards, 'projectId', true);
    const membershipProjects = await sails.helpers.projects.getMany(membershipProjectIds);

    membershipProjectIds = sails.helpers.utils.mapRecords(membershipProjects);

    const projectIds = [...managerProjectIds, ...membershipProjectIds];
    const projects = [...managerProjects, ...membershipProjects];

    const projectManagers = await sails.helpers.projects.getProjectManagers(projectIds);

    const userIds = sails.helpers.utils.mapRecords(projectManagers, 'userId', true);
    const users = await sails.helpers.users.getMany(userIds);

    const managerBoards = await sails.helpers.projects.getBoards(managerProjectIds);

    membershipBoards = membershipBoards.filter((membershipBoard) =>
      membershipProjectIds.includes(membershipBoard.projectId),
    );

    const boards = [...managerBoards, ...membershipBoards];
    const boardIds = sails.helpers.utils.mapRecords(boards);

    const allBoardMemberships = await sails.helpers.boardMemberships.getMany({
      boardId: boardIds,
    });

    return {
      items: projects,
      included: {
        users,
        projectManagers,
        boards,
        boardMemberships: allBoardMemberships,
      },
    };
  },
};
