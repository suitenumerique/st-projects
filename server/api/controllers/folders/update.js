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
    position: {
      type: 'number',
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
    },
    parentFolderId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
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

    // Prevent nested folders - always set parentFolderId to null
    const values = {
      ..._.pick(inputs, ['position', 'name']),
      parentFolderId: null,
    };

    const updatedFolder = await sails.helpers.folders.updateOne.with({
      values,
      record: folder,
      actorUser: currentUser,
      request: this.req,
    });

    if (!updatedFolder) {
      throw Errors.FOLDER_NOT_FOUND;
    }

    return {
      item: updatedFolder,
    };
  },
};
