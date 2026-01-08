const { v4: uuid } = require('uuid');

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

    // Create the new board (position is now user-specific)
    const newBoard = await Board.create({
      name: board.name,
      projectId: targetProject.id,
    }).fetch();

    // Create board membership for the actor
    await BoardMembership.create({
      boardId: newBoard.id,
      userId: actorUser.id,
      role: BoardMembership.Roles.OWNER,
    });

    // Create user board preference for the actor (creator)
    // Position will be calculated automatically by the upsert helper
    await sails.helpers.userBoardPreferences.upsertOne.with({
      userId: actorUser.id,
      boardId: newBoard.id,
      values: {},
      actorUser,
      request: inputs.request,
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

        // Copy attachments
        const attachments = await Attachment.find({ cardId: card.id });
        await Promise.all(
          attachments.map(async (attachment) => {
            const fileManager = sails.hooks['file-manager'].getInstance();
            const newDirname = uuid();
            const sourceDirPathSegment = `${sails.config.custom.attachmentsPathSegment}/${attachment.dirname}`;
            const targetDirPathSegment = `${sails.config.custom.attachmentsPathSegment}/${newDirname}`;

            if (sails.hooks.s3.isActive()) {
              await fileManager.copy(
                `${sourceDirPathSegment}/${attachment.filename}`,
                `${targetDirPathSegment}/${attachment.filename}`,
              );

              if (attachment.image && attachment.image.thumbnailsExtension) {
                try {
                  await fileManager.copy(
                    `${sourceDirPathSegment}/thumbnails/cover-256.${attachment.image.thumbnailsExtension}`,
                    `${targetDirPathSegment}/thumbnails/cover-256.${attachment.image.thumbnailsExtension}`,
                  );
                } catch (error) {
                  console.warn(error.stack); // eslint-disable-line no-console
                }
              }
            } else {
              await fileManager.copy(sourceDirPathSegment, targetDirPathSegment);
            }

            // Create the new attachment record (duplicate the PostgreSQL row)
            return Attachment.create({
              dirname: newDirname,
              filename: attachment.filename,
              name: attachment.name,
              image: attachment.image,
              cardId: newCard.id,
              creatorUserId: actorUser.id,
            });
          }),
        );

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
