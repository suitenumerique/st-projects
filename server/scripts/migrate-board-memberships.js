#!/usr/bin/env node

/**
 * Usage: NODE_ENV=production node scripts/migrate-project-siret.js
 */

/* eslint-disable no-console */

const knex = require('knex');

const dbConfig = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
  // connection: 'postgresql://postgres@localhost:5433/planka',
};

const db = knex(dbConfig);

async function migrateProjectSiret() {
  let transaction;

  try {
    console.log('info', 'Starting board memberships migration...');

    // Start transaction
    transaction = await db.transaction();

    const boards = await transaction('board').select('id', 'name');
    let processedCount = 0;
    let skippedCount = 0;

    // eslint-disable-next-line no-restricted-syntax
    for (const board of boards) {
      // eslint-disable-next-line no-await-in-loop
      const boardMemberships = await transaction('board_membership')
        .where('board_id', board.id)
        .where('role', 'owner')
        .orderBy('created_at', 'asc');

      if (boardMemberships.length === 0) {
        console.log('info', `No board memberships found for board ${board.name}`, {
          boardId: board.id,
          boardName: board.name,
        });
        skippedCount += 1;
        // eslint-disable-next-line no-continue
        continue;
      } else {
        console.log('info', `Board memberships found for board ${board.name}`, {
          boardId: board.id,
          boardName: board.name,
          boardMembershipCount: boardMemberships.length,
        });

        // check if we have a board_membership with the role owner
        const boardMembershipOwner = boardMemberships.find(
          (boardMembership) => boardMembership.role === 'owner',
        );
        if (boardMembershipOwner) {
          console.log('info', `Board membership with role owner found for board ${board.name}`, {
            boardId: board.id,
            boardName: board.name,
          });
          skippedCount += 1;
          // eslint-disable-next-line no-continue
          continue;
        } else {
          console.log('info', `No board membership with role owner found for board ${board.name}`, {
            boardId: board.id,
            boardName: board.name,
          });

          // update the first created board_membership to owner
          // eslint-disable-next-line no-await-in-loop
          await transaction('board_membership').orderBy('created_at', 'asc').first().update({
            role: 'owner',
            updated_at: new Date(),
          });
          processedCount += 1;
        }
      }
    }

    await transaction.commit();

    console.log('info', 'Migration completed successfully', {
      processedCount,
      skippedCount,
    });
  } catch (error) {
    console.log('error', 'Migration failed', {
      error: error.message,
      stack: error.stack,
    });

    // Rollback transaction if it exists
    if (transaction) {
      try {
        await transaction.rollback();
        console.log('info', 'Transaction rolled back');
      } catch (rollbackError) {
        console.log('error', 'Failed to rollback transaction', {
          error: rollbackError.message,
        });
      }
    }

    process.exit(1);
  } finally {
    // Close database connection
    try {
      await db.destroy();
      console.log('info', 'Database connection closed');
    } catch (closeError) {
      console.log('error', 'Failed to close database connection', {
        error: closeError.message,
      });
    }
  }
}

if (require.main === module) {
  migrateProjectSiret()
    .then(() => {
      console.log('info', 'Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.log('error', 'Migration script failed', {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });
}

// eslint-enable no-console

module.exports = { migrateProjectSiret };
