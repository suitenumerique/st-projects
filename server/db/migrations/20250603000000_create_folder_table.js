module.exports.up = (knex) =>
  knex.schema.createTable('folder', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('project_id').notNullable();
    table.bigInteger('parent_folder_id').nullable();
    table.specificType('position', 'double precision').notNullable();
    table.text('name').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('project_id');
    table.index('parent_folder_id');
    table.index('position');
  });

module.exports.down = (knex) => knex.schema.dropTable('folder');
