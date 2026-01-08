const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isFinite(value.position)) {
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
    actorUser: {
      type: 'ref',
      required: true,
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const folders = await sails.helpers.folders.getMany.with({
      criteria: {
        userId: inputs.actorUser.id,
        parentFolderId: values.parentFolderId || null,
      },
    });

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      values.position,
      folders,
    );

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await Folder.update({
        id,
        userId: inputs.actorUser.id,
      }).set({
        position: nextPosition,
      });

      sails.sockets.broadcast(`user:${inputs.actorUser.id}`, 'folderUpdate', {
        item: {
          id,
          position: nextPosition,
        },
      });
    });

    const folder = await Folder.create({
      ...values,
      position,
      userId: inputs.actorUser.id,
    }).fetch();

    sails.sockets.broadcast(
      `user:${inputs.actorUser.id}`,
      'folderCreate',
      {
        item: folder,
        requestId: inputs.requestId,
      },
      inputs.request,
    );

    return {
      folder,
    };
  },
};
