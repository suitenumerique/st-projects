module.exports.up = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.bigInteger('folder_id').nullable();
    table.index('folder_id');
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.dropColumn('folder_id');
  });
