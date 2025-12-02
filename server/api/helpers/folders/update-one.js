const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isUndefined(value.position) && !_.isFinite(value.position)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: valuesValidator,
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
    const { values } = inputs;

    if (!_.isUndefined(values.position)) {
      const folders = await sails.helpers.folders.getMany({
        userId: inputs.record.userId,
        parentFolderId: inputs.record.parentFolderId || null,
        id: {
          '!=': inputs.record.id,
        },
      });

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        folders,
      );

      values.position = position;

      repositions.forEach(async ({ id, position: nextPosition }) => {
        await Folder.update({
          id,
          userId: inputs.record.userId,
        }).set({
          position: nextPosition,
        });

        sails.sockets.broadcast(`user:${inputs.record.userId}`, 'folderUpdate', {
          item: {
            id,
            position: nextPosition,
          },
        });
      });
    }

    const folder = await Folder.updateOne(inputs.record.id).set({ ...values });

    if (folder) {
      sails.sockets.broadcast(
        `user:${inputs.record.userId}`,
        'folderUpdate',
        {
          item: folder,
        },
        inputs.request,
      );
    }

    return folder;
  },
};
