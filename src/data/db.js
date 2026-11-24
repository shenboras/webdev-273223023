const { Pool } = require('pg');
const config = require('../config');

const isLocal =
  config.databaseUrl.includes('localhost') ||
  config.databaseUrl.includes('127.0.0.1');

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('database pool error:', err.message);
});

async function checkDb() {
  await pool.query('SELECT 1');
}

module.exports = { pool, checkDb };