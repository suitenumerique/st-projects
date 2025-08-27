module.exports = {
  async fn() {
    const { currentUser } = this.req;

    // Retrieve project with same SIRET as the user
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

    return {
      items: projects,
      included: {
        boards,
        boardMemberships: allBoardMemberships,
      },
    };
  },
};
