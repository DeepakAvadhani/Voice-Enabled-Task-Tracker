const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
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
  });

const query = (text, params) => pool.query(text, params); //

module.exports = { pool, query };
