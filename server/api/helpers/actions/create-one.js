const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
    return false;
  }

  if (!_.isPlainObject(value.user)) {
    return false;
  }

  return true;
};

const truncateString = (string, maxLength = 30) =>
  string.length > maxLength ? `${string.substring(0, 30)}...` : string;

const buildAndSendMarkdownMessage = async (card, action, actorUser, send) => {
  const cardLink = `<${sails.config.custom.baseUrl}/cards/${card.id}|${card.name}>`;

  let markdown;
  switch (action.type) {
    case Action.Types.CREATE_CARD:
      markdown = `${cardLink} was created by ${actorUser.name} in *${action.data.list.name}*`;

      break;
    case Action.Types.MOVE_CARD:
      markdown = `${cardLink} was moved by ${actorUser.name} to *${action.data.toList.name}*`;

      break;
    case Action.Types.COMMENT_CARD:
      // TODO: truncate text?
      markdown = `*${actorUser.name}* commented on ${cardLink}:\n>${action.data.text}`;

      break;
    case Action.Types.ADD_MEMBER_TO_CARD:
      markdown = `${actorUser.name} assigned *${action.data.member.name}* to ${cardLink}`;

      break;
    case Action.Types.CHANGE_DUE_DATE:
      markdown = `${actorUser.name} changed the due date of ${cardLink}`;

      break;
    case Action.Types.ADD_ATTACHMENT:
      markdown = `${actorUser.name} added an attachment to ${cardLink}`;

      break;
    default:
      return;
  }

  await send(markdown);
};

const buildAndSendHtmlMessage = async (card, action, actorUser, send) => {
  const cardLink = `<a href="${sails.config.custom.baseUrl}/cards/${card.id}">${card.name}</a>`;

  let html;
  switch (action.type) {
    case Action.Types.CREATE_CARD:
      html = `${cardLink} was created by ${actorUser.name} in <b>${action.data.list.name}</b>`;

      break;
    case Action.Types.MOVE_CARD:
      html = `${cardLink} was moved by ${actorUser.name} to <b>${action.data.toList.name}</b>`;

      break;
    case Action.Types.COMMENT_CARD: {
      html = `<b>${actorUser.name}</b> commented on ${cardLink}:\n<i>${truncateString(action.data.text)}</i>`;

      break;
    }
    case Action.Types.ADD_MEMBER_TO_CARD:
      html = `${actorUser.name} assigned <b>${action.data.member.name}</b> to ${cardLink}`;

      break;
    case Action.Types.CHANGE_DUE_DATE:
      html = `${actorUser.name} changed the due date of ${cardLink}`;

      break;
    case Action.Types.ADD_ATTACHMENT:
      html = `${actorUser.name} added an attachment to ${cardLink}`;

      break;
    default:
      return;
  }

  await send(html);
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    project: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    list: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const action = await Action.create({
      ...values,
      cardId: values.card.id,
      userId: values.user.id,
    }).fetch();

    sails.sockets.broadcast(
      `board:${values.card.boardId}`,
      'actionCreate',
      {
        item: action,
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'actionCreate',
      data: {
        item: action,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [values.card],
        },
      },
      user: values.user,
    });

    if (action.type === Action.Types.ADD_MEMBER_TO_CARD) {
      if (action.data.member.id !== action.userId) {
        await sails.helpers.notifications.createOne.with({
          values: {
            userId: action.data.member.id,
            action,
          },
          project: inputs.project,
          board: inputs.board,
          list: inputs.list,
          card: values.card,
          actorUser: values.user,
        });
      }
    } else {
      const subscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(
        action.cardId,
        action.userId,
      );

      await Promise.all(
        subscriptionUserIds.map(async (userId) =>
          sails.helpers.notifications.createOne.with({
            values: {
              userId,
              action,
            },
            project: inputs.project,
            board: inputs.board,
            list: inputs.list,
            card: values.card,
            actorUser: values.user,
          }),
        ),
      );
    }

    if (sails.config.custom.slackBotToken) {
      buildAndSendMarkdownMessage(
        values.card,
        action,
        values.user,
        sails.helpers.utils.sendSlackMessage,
      );
    }

    if (sails.config.custom.googleChatWebhookUrl) {
      buildAndSendMarkdownMessage(
        values.card,
        action,
        values.user,
        sails.helpers.utils.sendGoogleChatMessage,
      );
    }

    if (sails.config.custom.telegramBotToken) {
      buildAndSendHtmlMessage(
        values.card,
        action,
        values.user,
        sails.helpers.utils.sendTelegramMessage,
      );
    }

    return action;
  },
};
