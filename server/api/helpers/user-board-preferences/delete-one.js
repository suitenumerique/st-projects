module.exports = {
  inputs: {
    userId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    boardId: {
      type: 'string',
      regex: /^[0-9]+$/,
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
    const preference = await UserBoardPreference.findOne({
      userId: inputs.userId,
      boardId: inputs.boardId,
    });

    if (preference) {
      await UserBoardPreference.destroyOne({
        userId: inputs.userId,
        boardId: inputs.boardId,
      });

      sails.sockets.broadcast(
        `user:${inputs.userId}`,
        'userBoardPreferenceDelete',
        {
          item: preference,
        },
        inputs.request,
      );
    }

    return preference;
  },
};
