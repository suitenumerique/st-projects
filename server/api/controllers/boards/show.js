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
    subscribe: {
      type: 'boolean',
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers.boards
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    if (!board.isPublic) {
      if (!currentUser) {
        throw Errors.BOARD_NOT_FOUND; // Forbidden
      }

      const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, board.id);
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isBoardMember && !isProjectManager) {
        throw Errors.BOARD_NOT_FOUND; // Forbidden
      }
    }

    const boardMemberships = await sails.helpers.boards.getBoardMemberships(board.id);

    const userIds = sails.helpers.utils.mapRecords(boardMemberships, 'userId');
    let users = await sails.helpers.users.getMany(userIds);

    // For public links while not being logged in, at least mask the email of users
    if (board.isPublic && !currentUser) {
      users = users.map((user) => {
        return {
          ...user.toJSON(), // Do not spread directly to keep private properties omitted
          email: '**masked**',
        };
      });
    }

    const labels = await sails.helpers.boards.getLabels(board.id);
    const lists = await sails.helpers.boards.getLists(board.id);

    const cards = await sails.helpers.boards.getCards(board.id);
    const cardIds = sails.helpers.utils.mapRecords(cards);

    let cardSubscriptions = [];
    if (currentUser) {
      cardSubscriptions = await sails.helpers.cardSubscriptions.getMany({
        cardId: cardIds,
        userId: currentUser.id,
      });
    }

    const cardMemberships = await sails.helpers.cards.getCardMemberships(cardIds);
    const cardLabels = await sails.helpers.cards.getCardLabels(cardIds);
    const tasks = await sails.helpers.cards.getTasks(cardIds);
    const attachments = await sails.helpers.cards.getAttachments(cardIds);

    const isSubscribedByCardId = cardSubscriptions.reduce(
      (result, cardSubscription) => ({
        ...result,
        [cardSubscription.cardId]: true,
      }),
      {},
    );

    cards.forEach((card) => {
      // eslint-disable-next-line no-param-reassign
      card.isSubscribed = isSubscribedByCardId[card.id] || false;
    });

    if (inputs.subscribe && this.req.isSocket) {
      sails.sockets.join(this.req, `board:${board.id}`);
    }

    return {
      item: board,
      included: {
        users,
        boardMemberships,
        labels,
        lists,
        cards,
        cardMemberships,
        cardLabels,
        tasks,
        attachments,
        projects: [project],
      },
    };
  },
};
