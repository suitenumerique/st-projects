module.exports.up = (knex) =>
  knex.schema.table('board', (table) => {
    // Dropping the column will automatically drop any indexes on it in PostgreSQL
    table.dropColumn('folder_id');
  });

module.exports.down = (knex) =>
  knex.schema.table('board', (table) => {
    table.bigInteger('folder_id').nullable();
    table.index('folder_id');
  });
