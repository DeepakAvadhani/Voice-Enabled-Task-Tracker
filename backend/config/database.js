const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: "127.0.0.1",
  user: "postgres",
  password: "admin",
  database: "task_tracker",
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool
  .connect()
  .then((client) => {
    console.log("Connected to the database");
    client.release();
  })
  .catch((e) => {
    console.error("Database connection error: ", e);
    process.exit(1);
  });

const query = (text, params) => pool.query(text, params); //

module.exports = { pool, query };
