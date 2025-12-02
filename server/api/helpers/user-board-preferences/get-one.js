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
  },

  async fn(inputs) {
    return UserBoardPreference.findOne({
      userId: inputs.userId,
      boardId: inputs.boardId,
    });
  },
};
