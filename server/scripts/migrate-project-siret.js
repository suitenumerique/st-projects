#!/usr/bin/env node

/**
 * Usage: NODE_ENV=production node scripts/migrate-project-siret.js
 */

/* eslint-disable no-console */

const knex = require('knex');

const dbConfig = {
  client: 'postgresql',
  // connection: process.env.DATABASE_URL,
  connection: 'postgresql://postgres@localhost:5433/planka',
};

const db = knex(dbConfig);

async function migrateProjectSiret() {
  let transaction;

  try {
    console.log('info', 'Starting project SIRET migration...');

    // Start transaction
    transaction = await db.transaction();

    // Get all projects without SIRET
    const projectsWithoutSiret = await transaction('project')
      .whereNull('siret')
      .select('id', 'name');

    console.log('info', `Found ${projectsWithoutSiret.length} projects without SIRET`, {
      projectCount: projectsWithoutSiret.length,
    });

    if (projectsWithoutSiret.length === 0) {
      console.log('info', 'No projects without SIRET found. Migration complete.');
      await transaction.commit();
      return;
    }

    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // eslint-disable-next-line no-restricted-syntax
    for (const project of projectsWithoutSiret) {
      try {
        console.log('info', `Processing project: ${project.name} (ID: ${project.id})`);

        // eslint-disable-next-line no-await-in-loop
        const projectManagers = await transaction('project_manager')
          .where('project_id', project.id)
          .select('user_id');

        console.log('info', `Project has ${projectManagers.length} project managers`, {
          projectId: project.id,
          projectName: project.name,
          managerCount: projectManagers.length,
        });

        // Skip if there are multiple project managers
        if (projectManagers.length !== 1) {
          console.log('warn', `Skipping project with ${projectManagers.length} managers`, {
            projectId: project.id,
            projectName: project.name,
            managerCount: projectManagers.length,
          });
          skippedCount += 1;
          // eslint-disable-next-line no-continue
          continue;
        }

        const projectManagerUserId = projectManagers[0].user_id;

        // eslint-disable-next-line no-await-in-loop
        const projectManager = await transaction('user_account')
          .where('id', projectManagerUserId)
          .select('id', 'name', 'siret')
          .first();

        if (!projectManager) {
          console.log('error', `Project manager user not found`, {
            projectId: project.id,
            projectName: project.name,
            userId: projectManagerUserId,
          });
          errorCount += 1;
          // eslint-disable-next-line no-continue
          continue;
        }

        // Skip if project manager doesn't have SIRET
        if (!projectManager.siret) {
          console.log('warn', `Project manager has no SIRET, skipping`, {
            projectId: project.id,
            projectName: project.name,
            userId: projectManagerUserId,
            userName: projectManager.name,
          });

          skippedCount += 1;
          // eslint-disable-next-line no-continue
          continue;
        }

        console.log('info', `Project manager has SIRET: ${projectManager.siret}`, {
          projectId: project.id,
          projectName: project.name,
          userId: projectManagerUserId,
          userName: projectManager.name,
          siret: projectManager.siret,
        });

        // Find or create project with matching SIRET
        // eslint-disable-next-line no-await-in-loop
        const targetProject = await transaction('project')
          .where('siret', projectManager.siret)
          .first();

        if (!targetProject) {
          console.log('error', `No project found with SIRET ${projectManager.siret}`, {
            projectId: project.id,
            projectName: project.name,
            managerSiret: projectManager.siret,
          });

          errorCount += 1;
          // eslint-disable-next-line no-continue
          continue;
        }

        // Skip if target project is the same as current project
        if (targetProject.id === project.id) {
          console.log('info', `Target project is the same as current project, skipping`, {
            projectId: project.id,
            projectName: project.name,
            targetProjectId: targetProject.id,
          });
          skippedCount += 1;
          // eslint-disable-next-line no-continue
          continue;
        }

        console.log(
          'info',
          `Found target project: ${targetProject.name} (ID: ${targetProject.id})`,
          {
            projectId: project.id,
            projectName: project.name,
            targetProjectId: targetProject.id,
            targetProjectName: targetProject.name,
            siret: projectManager.siret,
          },
        );

        // Get all boards linked to the current project
        // eslint-disable-next-line no-await-in-loop
        const boards = await transaction('board')
          .where('project_id', project.id)
          .select('id', 'name');
        console.log('info', `Found ${boards.length} boards to migrate`, {
          projectId: project.id,
          projectName: project.name,
          boardCount: boards.length,
        });

        // Process each board
        // eslint-disable-next-line no-restricted-syntax
        for (const board of boards) {
          try {
            console.log('info', `Processing board: ${board.name} (ID: ${board.id})`);
            // Check if project manager has board membership
            // eslint-disable-next-line no-await-in-loop
            const boardMembership = await transaction('board_membership')
              .where({
                board_id: board.id,
                user_id: projectManagerUserId,
              })
              .first();
            if (!boardMembership) {
              console.log('warn', `Project manager has no board membership, creating one`, {
                boardId: board.id,
                boardName: board.name,
                userId: projectManagerUserId,
                userName: projectManager.name,
              });
              // Create board membership with owner role
              // // eslint-disable-next-line no-await-in-loop
              // await transaction('board_membership').insert({ /// HHERE
              //   board_id: board.id,
              //   user_id: projectManagerUserId,
              //   role: 'owner',
              //   can_comment: true,
              //   created_at: new Date(),
              //   updated_at: new Date(),
              // });
            } else {
              // Update existing board membership to owner role
              console.log('info', `Updating board membership role to owner`, {
                boardId: board.id,
                boardName: board.name,
                userId: projectManagerUserId,
                userName: projectManager.name,
                oldRole: boardMembership.role,
              });
              // // eslint-disable-next-line no-await-in-loop
              // await transaction('board_membership').where('id', boardMembership.id).update({ // HHERE
              //   role: 'owner',
              //   can_comment: true,
              //   updated_at: new Date(),
              // });
            }
            // Update board's project_id to target project
            console.log(
              'info',
              `Updating board project_id from ${project.id} to ${targetProject.id}`,
              {
                boardId: board.id,
                boardName: board.name,
                oldProjectId: project.id,
                newProjectId: targetProject.id,
              },
            );
            // // eslint-disable-next-line no-await-in-loop
            // await transaction('board').where('id', board.id).update({ // HHERE
            //   project_id: targetProject.id,
            //   updated_at: new Date(),
            // });
          } catch (boardError) {
            console.log('error', `Error processing board ${board.name}`, {
              boardId: board.id,
              boardName: board.name,
              error: boardError.message,
            });
            errorCount += 1;
          }
        }
        // Update the original project to have the SIRET
        console.log('info', `Updating project ${project.name} with SIRET ${projectManager.siret}`, {
          projectId: project.id,
          projectName: project.name,
          siret: projectManager.siret,
        });
        // // eslint-disable-next-line no-await-in-loop
        // await transaction('project').where('id', project.id).update({ // HHERE
        //   siret: projectManager.siret,
        //   updated_at: new Date(),
        // });

        processedCount += 1;
        console.log('info', `Successfully processed project: ${project.name}`, {
          projectId: project.id,
          projectName: project.name,
          processedCount,
          skippedCount,
          errorCount,
        });
      } catch (projectError) {
        console.log('error', `Error processing project ${project.name}`, {
          projectId: project.id,
          projectName: project.name,
          error: projectError.message,
        });
        errorCount += 1;
      }
    }

    await transaction.commit();

    console.log('info', 'Migration completed successfully', {
      processedCount,
      skippedCount,
      errorCount,
      totalProjects: projectsWithoutSiret.length,
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
