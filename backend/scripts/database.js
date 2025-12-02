const { pool } = require("../config/database");

const createTables = `CREATE TABLE IF NOT EXISTS tasks (
id SERIAL PRIMARY KEY,
title VARCHAR(255) NOT NULL,
description TEXT,
status VARCHAR(50) NOT NULL DEFAULT 'To Do',
priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
due_date TIMESTAMP,
voice_transcript TEXT,
is_voice_ BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT valid_status CHECK (status IN ('To Do', 'In Progress', 'Completed')),
CONSTRAINT valid_priority CHECK (priority IN ('Low', 'Medium', 'High','Urgent'))
);`;

const tableIndex = `CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);`;

const updateTrigger = `CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON tasks;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();`;

const initializeDatabase = async () => {
  try {
    console.log("Database is initializing");
    await pool.query(createTables);
    console.log("Tables created or already exists");
    await pool.query(tableIndex);
    console.log("Indexes created or already exists");
    await pool.query(updateTrigger);
    console.log("Update trigger created or already exists");
    console.log("Database initialized successfully");
    process.exit(0);
  } catch (e) {
    console.error("Error initializing the database: ", e);
    process.exit(1);
  }
};

initializeDatabase();
