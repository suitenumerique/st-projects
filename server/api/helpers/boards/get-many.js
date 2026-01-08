const criteriaValidator = (value) => _.isArray(value) || _.isPlainObject(value);

module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: criteriaValidator,
    },
  },

  async fn(inputs) {
    // Boards are now ordered by user preferences, not by a global position
    return Board.find(inputs.criteria);
  },
};
