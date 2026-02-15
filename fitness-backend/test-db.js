const { Pool } = require('pg');
require('dotenv').config();

console.log('Starting test...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    console.log('Connecting to database...');
    const result = await pool.query('SELECT NOW()');
    console.log('SUCCESS!', result.rows[0]);
  } catch (error) {
    console.log('ERROR:', error.message);
  } finally {
    await pool.end();
  }
}

test();