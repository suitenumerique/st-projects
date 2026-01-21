const POSITION_GAP = 65535; // TODO: move to config

module.exports = {
  inputs: {
    board: {
      type: 'ref',
      required: true,
    },
    trelloBoard: {
      type: 'json',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const trelloToProjectsLabels = {};

    const getTrelloLists = () => inputs.trelloBoard.lists.filter((list) => !list.closed);

    const getUsedTrelloLabels = () => {
      const result = {};
      inputs.trelloBoard.cards
        .map((card) => card.labels)
        .flat()
        .forEach((label) => {
          result[label.id] = label;
        });

      return Object.values(result);
    };

    const getTrelloCardsOfList = (listId) =>
      inputs.trelloBoard.cards.filter((card) => card.idList === listId && !card.closed);

    const getAllTrelloCheckItemsOfCard = (cardId) =>
      inputs.trelloBoard.checklists
        .filter((checklist) => checklist.idCard === cardId)
        .map((checklist) => checklist.checkItems)
        .flat();

    const getTrelloCommentsOfCard = (cardId) =>
      inputs.trelloBoard.actions.filter(
        (action) =>
          action.type === 'commentCard' &&
          action.data &&
          action.data.card &&
          action.data.card.id === cardId,
      );

    const getProjectsLabelColor = (trelloLabelColor) =>
      Label.COLORS.find((color) => color.indexOf(trelloLabelColor) !== -1) || 'desert-sand';

    const importCardLabels = async (projectsCard, trelloCard) => {
      return Promise.all(
        trelloCard.labels.map(async (trelloLabel) => {
          return CardLabel.create({
            cardId: projectsCard.id,
            labelId: trelloToProjectsLabels[trelloLabel.id].id,
          });
        }),
      );
    };

    const importTasks = async (projectsCard, trelloCard) => {
      // TODO find workaround for tasks/checklist mismapping, see issue trello2projects#5
      return Promise.all(
        getAllTrelloCheckItemsOfCard(trelloCard.id).map(async (trelloCheckItem) => {
          return Task.create({
            cardId: projectsCard.id,
            position: trelloCheckItem.pos,
            name: trelloCheckItem.name,
            isCompleted: trelloCheckItem.state === 'complete',
          }).fetch();
        }),
      );
    };

    const importComments = async (projectsCard, trelloCard) => {
      const trelloComments = getTrelloCommentsOfCard(trelloCard.id);
      trelloComments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return Promise.all(
        trelloComments.map(async (trelloComment) => {
          return Action.create({
            cardId: projectsCard.id,
            userId: inputs.actorUser.id,
            type: 'commentCard',
            data: {
              text:
                `${trelloComment.data.text}\n\n---\n*Note: imported comment, originally posted by ` +
                `\n${trelloComment.memberCreator.fullName} (${trelloComment.memberCreator.username}) on ${trelloComment.date}*`,
            },
          }).fetch();
        }),
      );
    };

    const importCards = async (projectsList, trelloList) => {
      return Promise.all(
        getTrelloCardsOfList(trelloList.id).map(async (trelloCard) => {
          const projectsCard = await Card.create({
            boardId: inputs.board.id,
            listId: projectsList.id,
            creatorUserId: inputs.actorUser.id,
            position: trelloCard.pos,
            name: trelloCard.name,
            description: trelloCard.desc || null,
            dueDate: trelloCard.due,
          }).fetch();

          await importCardLabels(projectsCard, trelloCard);
          await importTasks(projectsCard, trelloCard);
          await importComments(projectsCard, trelloCard);

          return projectsCard;
        }),
      );
    };

    const importLabels = async () => {
      return Promise.all(
        getUsedTrelloLabels().map(async (trelloLabel, index) => {
          const projectsLabel = await Label.create({
            boardId: inputs.board.id,
            position: POSITION_GAP * (index + 1),
            name: trelloLabel.name || null,
            color: getProjectsLabelColor(trelloLabel.color),
          }).fetch();

          trelloToProjectsLabels[trelloLabel.id] = projectsLabel;
        }),
      );
    };

    const importLists = async () => {
      return Promise.all(
        getTrelloLists().map(async (trelloList) => {
          const projectsList = await List.create({
            boardId: inputs.board.id,
            name: trelloList.name,
            position: trelloList.pos,
          }).fetch();

          return importCards(projectsList, trelloList);
        }),
      );
    };

    await importLabels();
    await importLists();
  },
};
