module.exports = {
  inputs: {
    board: {
      type: 'ref',
      required: true,
    },
    targetProject: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { board, targetProject, actorUser } = inputs;

    // Get all lists and their cards from the source board
    const lists = await List.find({ boardId: board.id });
    const listIds = sails.helpers.utils.mapRecords(lists);
    const cards = await Card.find({ listId: listIds });

    // Get all labels from the source board
    const labels = await Label.find({ boardId: board.id });
    const cardLabels = await CardLabel.find({ cardId: cards.map((card) => card.id) });

    // Get the position for the new board
    const boards = await sails.helpers.projects.getBoards(targetProject.id);
    const { position } = sails.helpers.utils.insertToPositionables(boards.length * 65535, boards);

    // Create the new board
    const newBoard = await Board.create({
      name: board.name,
      position,
      projectId: targetProject.id,
    }).fetch();

    // Create board membership for the actor
    await BoardMembership.create({
      boardId: newBoard.id,
      userId: actorUser.id,
      role: BoardMembership.Roles.EDITOR,
    });

    // Create new labels
    const newLabels = await Promise.all(
      labels.map((label) =>
        Label.create({
          name: label.name,
          color: label.color,
          boardId: newBoard.id,
          position: label.position,
        }).fetch(),
      ),
    );

    // Create new lists and maintain their order
    const newLists = await Promise.all(
      lists.map((list) =>
        List.create({
          name: list.name,
          position: list.position,
          boardId: newBoard.id,
        }).fetch(),
      ),
    );

    // Create a map of old list IDs to new list IDs
    const listIdMap = {};
    lists.forEach((list, index) => {
      listIdMap[list.id] = newLists[index].id;
    });

    // Create a map of old label IDs to new label IDs
    const labelIdMap = {};
    labels.forEach((label, index) => {
      labelIdMap[label.id] = newLabels[index].id;
    });

    // Create new cards with their tasks and attachments
    await Promise.all(
      cards.map(async (card) => {
        const newCard = await Card.create({
          name: card.name,
          description: card.description,
          position: card.position,
          listId: listIdMap[card.listId],
          boardId: newBoard.id,
          creatorUserId: actorUser.id,
        }).fetch();

        // Copy tasks
        const tasks = await Task.find({ cardId: card.id });
        await Promise.all(
          tasks.map((task) =>
            Task.create({
              name: task.name,
              position: task.position,
              isCompleted: task.isCompleted,
              cardId: newCard.id,
            }),
          ),
        );

        // Copy attachments (only in production)
        if (sails.config.environment === 'production') {
          const attachments = await Attachment.find({ cardId: card.id });
          await Promise.all(
            attachments.map((attachment) =>
              Attachment.create({
                name: attachment.name,
                path: attachment.path,
                cardId: newCard.id,
              }),
            ),
          );
        }

        // Create a card label for each label
        await Promise.all(
          cardLabels
            .filter((cardLabel) => cardLabel.cardId === card.id)
            .map((cardLabel) =>
              CardLabel.create({
                cardId: newCard.id,
                labelId: labelIdMap[cardLabel.labelId],
              }),
            ),
        );
      }),
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'boardDuplicate',
      data: {
        item: newBoard,
        included: {
          projects: [targetProject],
        },
      },
      user: inputs.actorUser,
    });

    return newBoard;
  },
};
