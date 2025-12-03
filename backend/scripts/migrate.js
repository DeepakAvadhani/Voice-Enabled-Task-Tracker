const { runMigrations, rollbackMigration } = require('../migrations/dbMigration');
const { pool } = require('../config/database');

async function main() {
  const command = process.argv[2];
  const version = process.argv[3];

  try {
    if (command === 'up' || !command) {
      console.log('Running migrations...');
      await runMigrations();
      console.log('Migrations completed successfully!');
    } else if (command === 'down') {
      if (!version) {
        console.error('Please specify target version to rollback');
        process.exit(1);
      }
      console.log(`Rolling back to version ${version}...`);
      await rollbackMigration(parseInt(version));
      console.log('Rollback completed successfully!');
    } else {
      console.log('Unknown command. Use "up" or "down"');
      console.log('Usage:');
      console.log('  npm run migrate up     - Run all pending migrations');
      console.log('  npm run migrate down 1 - Rollback to version 1');
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();