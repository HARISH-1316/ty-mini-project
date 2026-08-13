// ──────────────────────────────────────────────
// User Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────
// Pure data-access layer. No business logic here.
// Every method maps directly to a parameterised
// SQL query against the `users` table.
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

// Columns returned in safe (non-auth) queries — excludes password_hash
const SAFE_COLUMNS = 'user_id, name, email, role, created_at, last_login';

const UserModel = {
  /**
   * Find a user by email (includes password_hash for auth comparison).
   */
  findByEmail: async (email) => {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a user by ID (includes password_hash for deserialisation).
   */
  findById: async (userId) => {
    const result = await query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a user by ID — safe version (no password_hash).
   */
  findByIdSafe: async (userId) => {
    const result = await query(
      `SELECT ${SAFE_COLUMNS} FROM users WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new user.
   * Returns the created user WITHOUT password_hash.
   */
  create: async ({ name, email, password_hash, role }, client = null) => {
    const executor = client || { query: query };
    const result = await executor.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING ${SAFE_COLUMNS}`,
      [name, email, password_hash, role]
    );
    return result.rows[0];
  },

  /**
   * Return all users WITHOUT password_hash.
   * Used by admin to list users.
   */
  findAll: async () => {
    const result = await query(
      `SELECT ${SAFE_COLUMNS} FROM users ORDER BY created_at DESC`
    );
    return result.rows;
  },

  /**
   * Update a user's role.
   * Returns the updated user WITHOUT password_hash.
   */
  updateRole: async (userId, role, client = null) => {
    const executor = client || { query: query };
    const result = await executor.query(
      `UPDATE users SET role = $1 WHERE user_id = $2
       RETURNING ${SAFE_COLUMNS}`,
      [role, userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Update the last_login timestamp for a user.
   */
  updateLastLogin: async (userId) => {
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [userId]
    );
  },

  /**
   * Delete a user by ID.
   */
  deleteById: async (userId, client = null) => {
    const executor = client || { query: query };
    const result = await executor.query(
      'DELETE FROM users WHERE user_id = $1 RETURNING user_id',
      [userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Count users with a specific role.
   */
  countByRole: async (role, client = null) => {
    const executor = client || { query: query };
    const result = await executor.query(
      'SELECT COUNT(*) FROM users WHERE role = $1',
      [role]
    );
    return parseInt(result.rows[0].count, 10);
  },
};

export default UserModel;
