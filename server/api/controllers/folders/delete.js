const Errors = {
  FOLDER_NOT_FOUND: {
    folderNotFound: 'Folder not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    folderNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const folder = await Folder.findOne(inputs.id);

    if (!folder) {
      throw Errors.FOLDER_NOT_FOUND;
    }

    // Check that the folder belongs to the current user
    if (folder.userId !== currentUser.id) {
      throw Errors.FOLDER_NOT_FOUND; // Forbidden
    }

    const deletedFolder = await sails.helpers.folders.deleteOne.with({
      record: folder,
      actorUser: currentUser,
      request: this.req,
    });

    if (!deletedFolder) {
      throw Errors.FOLDER_NOT_FOUND;
    }

    return {
      item: deletedFolder,
    };
  },
};
