module.exports.up = (knex) =>
  knex.schema.table('board', (table) => {
    // Dropping the column will automatically drop any indexes on it in PostgreSQL
    table.dropColumn('position');
  });

module.exports.down = (knex) =>
  knex.schema.table('board', (table) => {
    table.specificType('position', 'double precision').notNullable().defaultTo(0);
    table.index('position');
  });
