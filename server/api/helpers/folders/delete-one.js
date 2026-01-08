module.exports = {
  inputs: {
    record: {
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

  async fn(inputs) {
    // Move all boards in this folder to the parent folder or root
    const userBoardPreferences = await UserBoardPreference.find({
      folderId: inputs.record.id,
    });

    await Promise.all(
      userBoardPreferences.map(async (preference) => {
        const updatedPreference = await UserBoardPreference.updateOne(preference.id).set({
          folderId: null,
        });

        if (updatedPreference) {
          sails.sockets.broadcast(
            `user:${updatedPreference.userId}`,
            'userBoardPreferenceUpdate',
            {
              item: updatedPreference,
            },
            inputs.request,
          );
        }
      }),
    );

    const folder = await Folder.destroyOne(inputs.record.id);

    if (folder) {
      sails.sockets.broadcast(
        `user:${inputs.record.userId}`,
        'folderDelete',
        {
          item: folder,
        },
        inputs.request,
      );
    }

    return folder;
  },
};
