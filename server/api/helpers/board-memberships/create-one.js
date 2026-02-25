const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.board)) {
    return false;
  }

  if (!_.isPlainObject(value.user)) {
    return false;
  }

  return true;
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
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    userAlreadyBoardMember: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (values.role === BoardMembership.Roles.EDITOR) {
      delete values.canComment;
    } else if (values.role === BoardMembership.Roles.VIEWER) {
      if (_.isNil(values.canComment)) {
        values.canComment = false;
      }
    }

    const boardMembership = await BoardMembership.create({
      ...values,
      boardId: values.board.id,
      userId: values.user.id,
    })
      .intercept('E_UNIQUE', 'userAlreadyBoardMember')
      .fetch();

    sails.sockets.broadcast(
      `user:${boardMembership.userId}`,
      'boardMembershipCreate',
      {
        item: boardMembership,
      },
      inputs.request,
    );

    sails.sockets.broadcast(
      `board:${boardMembership.boardId}`,
      'boardMembershipCreate',
      {
        item: boardMembership,
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'boardMembershipCreate',
      data: {
        item: boardMembership,
        included: {
          users: [values.user],
          projects: [inputs.project],
          boards: [values.board],
        },
      },
      user: inputs.actorUser,
    });

    if (sails.hooks.smtp.isActive()) {
      const subject = `Nouveau tableau partagé : ${values.board.name}`;
      const boardUrl = `${process.env.BASE_URL}/boards/${values.board.id}`;
      const body =
        `<p><strong>${inputs.actorUser.name} (${inputs.actorUser.email})</strong> vous a partagé le tableau suivant : ` +
        `<strong>${values.board.name}</strong>.</p>`;

      const html = sails.helpers.utils.buildEmailHtml.with({
        subject,
        heading: 'Nouveau tableau partagé !',
        body,
        buttonUrl: boardUrl,
        buttonLabel: 'Ouvrir le tableau',
      });

      await sails.helpers.utils.sendEmail.with({
        to: values.user.email,
        subject,
        html,
      });
    }

    return boardMembership;
  },
};
