module.exports.up = (knex) =>
  knex.schema.alterTable('card', (table) => {
    table.boolean('is_completed').notNullable().defaultTo(false);
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('card', (table) => {
    table.dropColumn('is_completed');
  });
