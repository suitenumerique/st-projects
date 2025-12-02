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
    const boards = await Board.find({
      folderId: inputs.record.id,
    });

    boards.forEach(async (board) => {
      await Board.updateOne(board.id).set({
        folderId: inputs.record.parentFolderId || null,
      });
    });

    // Move all subfolders to the parent folder or root
    const subfolders = await Folder.find({
      parentFolderId: inputs.record.id,
    });

    subfolders.forEach(async (subfolder) => {
      await Folder.updateOne(subfolder.id).set({
        parentFolderId: inputs.record.parentFolderId || null,
      });
    });

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
