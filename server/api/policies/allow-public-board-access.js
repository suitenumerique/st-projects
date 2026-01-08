module.exports = async function allowPublicBoardAccess(req, res, proceed) {
  // If user is authenticated, allow access
  if (req.currentUser) {
    return proceed();
  }

  // For unauthenticated users, check if they're accessing a public board
  const boardId = req.param('id') || req.param('boardId');

  if (boardId) {
    try {
      const board = await sails.models.board.findOne({ id: boardId });

      if (board && board.isPublic) {
        // Allow access to public boards for unauthenticated users
        return proceed();
      }
    } catch (error) {
      // If there's an error finding the board, proceed with normal authentication
      // This will result in a 401 if the user is not authenticated
    }
  }

  // For all other cases, require authentication
  return res.unauthorized('Access token is missing, invalid or expired');
};
