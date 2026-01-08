const rimraf = require('rimraf');

const Errors = {
  AVATAR_UPDATE_DISABLED: {
    avatarUpdateDisabled: 'Avatar update disabled',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  NO_FILE_WAS_UPLOADED: {
    noFileWasUploaded: 'No file was uploaded',
  },
  FILE_IS_NOT_IMAGE: {
    fileIsNotImage: 'File is not image',
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
    userNotFound: {
      responseType: 'notFound',
    },
    noFileWasUploaded: {
      responseType: 'unprocessableEntity',
    },
    fileIsNotImage: {
      responseType: 'unprocessableEntity',
    },
    uploadError: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs, exits) {
    // If any avatar we would want to rely of the one provided by OIDC, so for now the generated 2 letters avatar
    // is fine. In the future if namesakes are too much colliding we would add colors (or try to infer the organization from the email)
    throw Errors.AVATAR_UPDATE_DISABLED;

    /* eslint-disable no-unreachable */
    const { currentUser } = this.req;

    let user;
    if (currentUser.isAdmin) {
      user = await sails.helpers.users.getOne(inputs.id);

      if (!user) {
        throw Errors.USER_NOT_FOUND;
      }
    } else if (inputs.id !== currentUser.id) {
      throw Errors.USER_NOT_FOUND; // Forbidden
    } else {
      user = currentUser;
    }

    let files;
    try {
      files = await sails.helpers.utils.receiveFile('file', this.req);
    } catch (error) {
      return exits.uploadError(error.message); // TODO: add error
    }

    if (files.length === 0) {
      throw Errors.NO_FILE_WAS_UPLOADED;
    }

    const file = _.last(files);

    const fileData = await sails.helpers.users
      .processUploadedAvatarFile(file)
      .intercept('fileIsNotImage', () => {
        try {
          rimraf.sync(file.fd);
        } catch (error) {
          console.warn(error.stack); // eslint-disable-line no-console
        }

        return Errors.FILE_IS_NOT_IMAGE;
      });

    user = await sails.helpers.users.updateOne.with({
      record: user,
      values: {
        avatar: fileData,
      },
      actorUser: currentUser,
      request: this.req,
    });

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    return exits.success({
      item: user,
    });
    /* eslint-enable no-unreachable */
  },
};
