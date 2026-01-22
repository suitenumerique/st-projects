module.exports = {
  inputs: {
    query: {
      required: true,
      type: 'string',
      description: 'Query filtering users on name and email',
      minLength: 1,
    },
    currentUserId: {
      required: true,
      type: 'string',
      description: 'ID of the current user making the search',
    },
    excludeUserIds: {
      type: ['string'],
      description: 'Array of user IDs to exclude from search results',
      default: [],
    },
  },

  async fn(inputs) {
    const resultsLimit = 5;
    const { query, currentUserId, excludeUserIds } = inputs;

    // Current user should not be found in the search, also other that could be already considered out the search logic
    const allExcludedUserIds = excludeUserIds
      ? [currentUserId, ...excludeUserIds]
      : [currentUserId];

    // First, try to find exact email match
    const exactEmailQuery = {
      email: query,
      id: {
        '!=': allExcludedUserIds,
      },
    };
    const exactEmailMatch = await User.findOne(exactEmailQuery);

    // Find all users who share boards or projects with the current user for "contains" search
    let usersInSharedContexts = [];

    // Get all boards where current user is a member
    const currentUserBoardMemberships = await BoardMembership.find({ userId: currentUserId });
    const currentUserBoardIds = currentUserBoardMemberships.map((bm) => bm.boardId);

    // Get all projects where current user is a manager
    const currentUserProjectManagements = await ProjectManager.find({ userId: currentUserId });
    const currentUserProjectIds = currentUserProjectManagements.map((pm) => pm.projectId);

    // Find all users in the same boards
    let userIdsInSameBoards = [];
    if (currentUserBoardIds.length > 0) {
      const sameBoardMemberships = await BoardMembership.find({
        boardId: currentUserBoardIds,
      });
      userIdsInSameBoards = sameBoardMemberships.map((bm) => bm.userId);
    }

    // Find all users in the same projects
    let userIdsInSameProjects = [];
    if (currentUserProjectIds.length > 0) {
      const sameProjectManagements = await ProjectManager.find({
        projectId: currentUserProjectIds,
      });
      userIdsInSameProjects = sameProjectManagements.map((pm) => pm.userId);
    }

    // Combine all user IDs from shared contexts (excluding needed ones)
    const allSharedUserIds = [
      ...new Set([...userIdsInSameBoards, ...userIdsInSameProjects]),
    ].filter((id) => !allExcludedUserIds.includes(id));

    if (allSharedUserIds.length > 0) {
      const containsQuery = {
        id: { in: allSharedUserIds },
        or: [{ name: { contains: query } }, { email: { contains: query } }],
      };

      usersInSharedContexts = await User.find(containsQuery).limit(5);
    }

    const results = [];

    if (exactEmailMatch) {
      results.push(exactEmailMatch);
    }

    // Add contains matches, making sure we don't duplicate the exact email match
    // eslint-disable-next-line no-restricted-syntax
    for (const user of usersInSharedContexts) {
      if (results.length >= resultsLimit) {
        break; // Respect the limit of 5
      }

      if (!exactEmailMatch || user.id !== exactEmailMatch.id) {
        results.push(user);
      }
    }

    return results;
  },
};
