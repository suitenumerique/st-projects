module.exports.up = (knex) =>
  knex.schema.createTable('user_board_preference', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('user_id').notNullable();
    table.bigInteger('board_id').notNullable();
    table.bigInteger('folder_id').nullable();
    table.specificType('position', 'double precision').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['user_id', 'board_id']);
    table.index('user_id');
    table.index('board_id');
    table.index('folder_id');
    table.index('position');
  });

module.exports.down = (knex) => knex.schema.dropTable('user_board_preference');
