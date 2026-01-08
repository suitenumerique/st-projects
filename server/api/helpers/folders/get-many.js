const criteriaValidator = (value) => _.isArray(value) || _.isPlainObject(value);

module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: criteriaValidator,
    },
  },

  async fn(inputs) {
    const { criteria } = inputs;

    if (_.isPlainObject(criteria) && criteria.criteria) {
      return Folder.find(criteria.criteria).sort('position ASC');
    }

    return Folder.find(criteria || {}).sort('position ASC');
  },
};
