const Errors = {
  PROJECT_MANAGER_NOT_FOUND: {
    projectManagerNotFound: 'Project manager not found',
  },
  MUST_NOT_BE_LAST_MANAGER: {
    mustNotBeLastManager: 'Must not be last manager',
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
    projectManagerNotFound: {
      responseType: 'notFound',
    },
    mustNotBeLastManager: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let projectManager = await ProjectManager.findOne(inputs.id);

    if (!projectManager) {
      throw Errors.PROJECT_MANAGER_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(
      currentUser.id,
      projectManager.projectId,
    );

    if (!isProjectManager) {
      throw Errors.PROJECT_MANAGER_NOT_FOUND; // Forbidden
    }

    // Prevent orphaning the project: the last manager can never be removed,
    // otherwise nobody could ever manage the project (add members/managers) again
    const managerCount = await ProjectManager.count({
      projectId: projectManager.projectId,
    });

    if (managerCount <= 1) {
      throw Errors.MUST_NOT_BE_LAST_MANAGER;
    }

    projectManager = await sails.helpers.projectManagers.deleteOne.with({
      record: projectManager,
      actorUser: currentUser,
      request: this.req,
    });

    if (!projectManager) {
      throw Errors.PROJECT_MANAGER_NOT_FOUND;
    }

    return {
      item: projectManager,
    };
  },
};
