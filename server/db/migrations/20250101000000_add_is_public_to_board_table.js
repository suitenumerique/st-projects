module.exports.up = (knex) =>
  knex.schema.alterTable('board', (table) => {
    /* Columns */

    table.boolean('is_public').notNullable().defaultTo(false);
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('board', (table) => {
    /* Columns */

    table.dropColumn('is_public');
  });
