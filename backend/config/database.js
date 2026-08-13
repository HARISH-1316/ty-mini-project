// ──────────────────────────────────────────────
// PostgreSQL Connection Pool — pg
// ──────────────────────────────────────────────
// Exports a pg.Pool singleton and a convenience
// query() helper used by all models.
// ──────────────────────────────────────────────

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Log connection events in development
if (process.env.NODE_ENV !== 'production') {
  pool.on('connect', () => {
    console.log('📦 New client connected to PostgreSQL');
  });
}

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

/**
 * Execute a parameterised SQL query.
 *
 * @param {string} text  SQL query string with $1, $2, … placeholders
 * @param {any[]}  [params]  Parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

/**
 * Acquire a client from the pool for use in transactions.
 *
 * @returns {Promise<import('pg').PoolClient>}
 */
const getClient = () => pool.connect();

/**
 * Test the database connection.
 *
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`✅ PostgreSQL connected at ${res.rows[0].now}`);
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    return false;
  }
};

export { pool, query, getClient, testConnection };
export default pool;
