module.exports = {
  async fn() {
    const { currentUser } = this.req;

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

    const managerUserIds = sails.helpers.utils.mapRecords(projectManagers, 'userId', true);

    const managerBoards = await sails.helpers.projects.getBoards(managerProjectIds);

    membershipBoards = membershipBoards.filter((membershipBoard) =>
      membershipProjectIds.includes(membershipBoard.projectId),
    );

    const boards = [...managerBoards, ...membershipBoards];
    const boardIds = sails.helpers.utils.mapRecords(boards);

    // Get all board memberships for these boards (not just current user's), it will help adjusting UI depending on if it's shared or not
    const allBoardMemberships = await sails.helpers.boardMemberships.getMany({
      boardId: boardIds,
    });

    const memberUserIds = sails.helpers.utils.mapRecords(allBoardMemberships, 'userId', true);

    const uniqueUserIds = [...new Set([...managerUserIds, ...memberUserIds])];
    const users = await sails.helpers.users.getMany(uniqueUserIds);

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
