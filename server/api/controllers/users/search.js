module.exports = {
  inputs: {
    query: {
      type: 'string',
      required: true,
    },
    excludeUserIds: {
      type: ['string'],
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const users = await sails.helpers.users.searchMany.with({
      query: inputs.query,
      excludeUserIds: inputs.excludeUserIds,
      currentUserId: currentUser.id,
    });

    return {
      items: users,
    };
  },
};
