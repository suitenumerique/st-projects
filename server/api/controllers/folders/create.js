module.exports = {
  inputs: {
    parentFolderId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
      defaultsTo: null,
    },
    position: {
      type: 'number',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    isPrivate: {
      type: 'boolean',
      defaultsTo: true,
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    // Force parentFolderId to null to prevent nested folders
    const values = {
      ..._.pick(inputs, ['position', 'name', 'isPrivate']),
      parentFolderId: null,
    };

    const { folder } = await sails.helpers.folders.createOne.with({
      values,
      actorUser: currentUser,
      requestId: inputs.requestId,
      request: this.req,
    });

    return {
      item: folder,
    };
  },
};
