module.exports.up = async (knex) => {
  await knex.schema.table('user_account', (table) => {
    table.renameColumn('siret', 'organization_id');
  });
  await knex.schema.table('project', (table) => {
    table.renameColumn('siret', 'organization_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.table('user_account', (table) => {
    table.renameColumn('organization_id', 'siret');
  });
  await knex.schema.table('project', (table) => {
    table.renameColumn('organization_id', 'siret');
  });
};
