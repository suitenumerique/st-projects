const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);
const criteriaValidator = (value) => _.isArray(value) || _.isPlainObject(value);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
    criteria: {
      type: 'json',
      custom: criteriaValidator,
    },
  },

  async fn(inputs) {
    return sails.helpers.boardMemberships.getMany({
      userId: inputs.idOrIds,
      ...inputs.criteria,
    });
  },
};
