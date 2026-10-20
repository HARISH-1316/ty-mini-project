// ──────────────────────────────────────────────
// User Model — PostgreSQL Data Access Layer
// ──────────────────────────────────────────────
// Pure data-access layer. No business logic here.
// Every method maps directly to a parameterised
// SQL query against the `users` table.
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

// Columns returned in safe (non-auth) queries — excludes password_hash
const SAFE_COLUMNS = 'user_id, name, email, role, approval_status, rejection_reason, approval_decision_at, approval_decision_by, created_at, last_login';

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
  create: async ({ name, email, password_hash, role, approval_status = 'pending' }, client = null) => {
    const executor = client || { query: query };
    const result = await executor.query(
      `INSERT INTO users (name, email, password_hash, role, approval_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${SAFE_COLUMNS}`,
      [name, email, password_hash, role, approval_status]
    );
    return result.rows[0];
  },

  /**
   * Return all users WITHOUT password_hash.
   */
  findAll: async () => {
    const result = await query(
      `SELECT ${SAFE_COLUMNS} FROM users ORDER BY created_at DESC`
    );
    return result.rows;
  },

  /**
   * List users for administrator approval workflows with joined student/faculty details.
   */
  findApprovals: async ({ status = null, role = null } = {}) => {
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`u.approval_status = $${params.length}`);
    }

    if (role) {
      params.push(role);
      conditions.push(`u.role = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        u.user_id,
        u.name,
        u.email,
        u.role,
        u.approval_status,
        u.rejection_reason,
        u.approval_decision_at,
        u.approval_decision_by,
        decider.name AS approved_by_name,
        u.created_at,
        u.last_login,
        s.roll_number,
        s.course,
        s.year,
        s.phone AS student_phone,
        f.department,
        f.designation,
        f.specialization,
        f.phone AS faculty_phone
      FROM users u
      LEFT JOIN student s ON u.user_id = s.user_id
      LEFT JOIN faculty f ON u.user_id = f.user_id
      LEFT JOIN users decider ON u.approval_decision_by = decider.user_id
      ${whereClause}
      ORDER BY
        CASE WHEN u.approval_status = 'pending' THEN 0 ELSE 1 END,
        u.created_at DESC
    `;

    const result = await query(sql, params);
    return result.rows;
  },

  /**
   * Update approval status (approve or reject) and record decision metadata.
   */
  setApprovalStatus: async (userId, { status, rejection_reason = null, decisionByUserId = null }, client = null) => {
    const executor = client || { query: query };
    const result = await executor.query(
      `UPDATE users
       SET approval_status = $1,
           rejection_reason = $2,
           approval_decision_at = CURRENT_TIMESTAMP,
           approval_decision_by = $3
       WHERE user_id = $4
       RETURNING ${SAFE_COLUMNS}`,
      [status, rejection_reason, decisionByUserId, userId]
    );

    // If account was rejected, revoke active sessions
    if (status === 'rejected') {
      try {
        await executor.query(
          `DELETE FROM "session"
           WHERE sess::text LIKE '%"user":' || $1::text || ',%'
              OR sess::text LIKE '%"user": ' || $1::text || ',%'
              OR sess::text LIKE '%"user":' || $1::text || '}%'
              OR sess::text LIKE '%"user": ' || $1::text || '}%'`,
          [userId]
        );
      } catch (sessErr) {
        // Log but don't fail transaction if session table delete has minor issue
        console.warn('Session revocation notice:', sessErr.message);
      }
    }

    return result.rows[0] || null;
  },

  /**
   * Update a user's password hash and revoke old sessions.
   */
  updatePassword: async (userId, newPasswordHash, client = null) => {
    const executor = client || { query: query };
    const result = await executor.query(
      `UPDATE users SET password_hash = $1 WHERE user_id = $2 RETURNING ${SAFE_COLUMNS}`,
      [newPasswordHash, userId]
    );

    // Invalidate sessions on password change
    try {
      await executor.query(
        `DELETE FROM "session"
         WHERE sess::text LIKE '%"user":' || $1::text || ',%'
            OR sess::text LIKE '%"user": ' || $1::text || ',%'
            OR sess::text LIKE '%"user":' || $1::text || '}%'
            OR sess::text LIKE '%"user": ' || $1::text || '}%'`,
        [userId]
      );
    } catch (sessErr) {
      console.warn('Session revocation notice:', sessErr.message);
    }

    return result.rows[0] || null;
  },

  /**
   * Update a user's role (restricted).
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
