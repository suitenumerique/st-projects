module.exports.up = (knex) =>
  knex.schema.alterTable('folder', (table) => {
    table.dropIndex('project_id');
    table.dropColumn('project_id');
    table.bigInteger('user_id').notNullable();
    table.index('user_id');
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('folder', (table) => {
    table.dropIndex('user_id');
    table.dropColumn('user_id');
    table.bigInteger('project_id').notNullable();
    table.index('project_id');
  });
