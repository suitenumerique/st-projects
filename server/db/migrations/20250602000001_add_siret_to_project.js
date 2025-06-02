module.exports.up = async (knex) => {
  return knex.schema.table('project', (table) => {
    table.string('siret').nullable();
  });
};

module.exports.down = async (knex) => {
  return knex.schema.table('project', (table) => {
    table.dropColumn('siret');
  });
};
