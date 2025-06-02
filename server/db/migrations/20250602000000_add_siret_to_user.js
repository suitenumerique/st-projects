module.exports.up = async (knex) => {
  return knex.schema.table('user_account', (table) => {
    table.string('siret').nullable();
  });
};

module.exports.down = async (knex) => {
  return knex.schema.table('user_account', (table) => {
    table.dropColumn('siret');
  });
};
