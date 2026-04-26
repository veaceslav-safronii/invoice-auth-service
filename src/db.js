const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'invoices_db',
  user: process.env.DB_USER || 'invoice_user',
  password: process.env.DB_PASSWORD || 'invoice_pass',
});

const initDb = async () => {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS auth_schema;

    CREATE TABLE IF NOT EXISTS auth_schema.users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Auth DB schema initialized');
};

module.exports = { pool, initDb };
