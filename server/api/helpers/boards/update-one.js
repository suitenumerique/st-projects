const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
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
    project: {
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
    const { values } = inputs;

    // const projectManagerUserIds = await sails.helpers.projects.getManagerUserIds(
    //   inputs.record.projectId,
    // );

    const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(inputs.record.id);
    // const boardRelatedUserIds = _.union(projectManagerUserIds, boardMemberUserIds);
    const boardRelatedUserIds = boardMemberUserIds;

    // Position is now handled via user preferences, not board properties
    // Remove position from values if present
    const boardValues = _.omit(values, 'position', 'folderId');

    const board = await Board.updateOne(inputs.record.id).set({ ...boardValues });

    if (board) {
      boardRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'boardUpdate',
          {
            item: board,
          },
          inputs.request,
        );
      });

      sails.helpers.utils.sendWebhooks.with({
        event: 'boardUpdate',
        data: {
          item: board,
          included: {
            projects: [inputs.project],
          },
        },
        prevData: {
          item: inputs.record,
        },
        user: inputs.actorUser,
      });
    }

    return board;
  },
};
