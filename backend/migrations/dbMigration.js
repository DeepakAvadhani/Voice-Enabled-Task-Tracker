const { pool } = require("../config/database");

const migrations = [
  {
    version: 1,
    name: "create_tasks_table",
    up: async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) NOT NULL DEFAULT 'To Do',
          priority VARCHAR(50) DEFAULT 'Medium',
          due_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          voice_transcript TEXT,
          is_voice_created BOOLEAN DEFAULT FALSE,
          
          CONSTRAINT valid_status CHECK (status IN ('To Do', 'In Progress', 'Done')),
          CONSTRAINT valid_priority CHECK (priority IN ('Low', 'Medium', 'High', 'Critical'))
        );
      `);
    },
    down: async () => {
      await pool.query("DROP TABLE IF EXISTS tasks CASCADE;");
    },
  },
  {
    version: 2,
    name: "create_indexes",
    up: async () => {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
        CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
        CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
        CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
      `);
    },
    down: async () => {
      await pool.query(`
        DROP INDEX IF EXISTS idx_tasks_status;
        DROP INDEX IF EXISTS idx_tasks_priority;
        DROP INDEX IF EXISTS idx_tasks_due_date;
        DROP INDEX IF EXISTS idx_tasks_created_at;
      `);
    },
  },
  {
    version: 3,
    name: "create_update_trigger",
    up: async () => {
      await pool.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);
      await pool.query(`
        DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
        CREATE TRIGGER update_tasks_updated_at 
          BEFORE UPDATE ON tasks
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
    },
    down: async () => {
      await pool.query(
        "DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;"
      );
      await pool.query("DROP FUNCTION IF EXISTS update_updated_at_column();");
    },
  },
];

const migrationSchema = `
  CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    version INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

async function initMigrationTable() {
  await pool.query(migrationSchema);
}

async function getExecutedMigrations() {
  const result = await pool.query(
    "SELECT version FROM migrations ORDER BY version"
  );
  return result.rows.map((row) => row.version);
}

async function recordMigration(version, name) {
  await pool.query("INSERT INTO migrations (version, name) VALUES ($1, $2)", [
    version,
    name,
  ]);
}

async function removeMigrationRecord(version) {
  await pool.query("DELETE FROM migrations WHERE version = $1", [version]);
}

async function runMigrations() {
  try {
    console.log("Starting migrations...");

    await initMigrationTable();
    const executedVersions = await getExecutedMigrations();

    for (const migration of migrations) {
      if (!executedVersions.includes(migration.version)) {
        console.log(
          `Running migration ${migration.version}: ${migration.name}`
        );
        await migration.up();
        await recordMigration(migration.version, migration.name);
        console.log(`Migration ${migration.version} completed`);
      } else {
        console.log(`Migration ${migration.version} already executed`);
      }
    }

    console.log("All migrations completed successfully");
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

async function rollbackMigration(targetVersion) {
  try {
    console.log(`Rolling back to version ${targetVersion}...`);

    const executedVersions = await getExecutedMigrations();
    const toRollback = migrations
      .filter(
        (m) => m.version > targetVersion && executedVersions.includes(m.version)
      )
      .sort((a, b) => b.version - a.version);

    for (const migration of toRollback) {
      console.log(
        `Rolling back migration ${migration.version}: ${migration.name}`
      );
      await migration.down();
      await removeMigrationRecord(migration.version);
      console.log(`Rollback of migration ${migration.version} completed`);
    }

    console.log("Rollback completed successfully");
    return true;
  } catch (error) {
    console.error("Rollback failed:", error);
    throw error;
  }
}

module.exports = {
  runMigrations,
  rollbackMigration,
  migrations,
};
