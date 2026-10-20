// ──────────────────────────────────────────────
// Password Reset Token Model — PostgreSQL DAL
// ──────────────────────────────────────────────

import { query } from '../config/database.js';

const PasswordResetTokenModel = {
  create: async ({ user_id, token_hash, expires_at }) => {
    const sql = `
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING token_id, user_id, expires_at, created_at
    `;
    const result = await query(sql, [user_id, token_hash, expires_at]);
    return result.rows[0];
  },

  findValidToken: async (token_hash) => {
    const sql = `
      SELECT t.*, u.email, u.name, u.role, u.approval_status
      FROM password_reset_tokens t
      JOIN users u ON t.user_id = u.user_id
      WHERE t.token_hash = $1
        AND t.used_at IS NULL
        AND t.expires_at > CURRENT_TIMESTAMP
      ORDER BY t.created_at DESC
      LIMIT 1
    `;
    const result = await query(sql, [token_hash]);
    return result.rows[0] || null;
  },

  markAsUsed: async (tokenId) => {
    const sql = `
      UPDATE password_reset_tokens
      SET used_at = CURRENT_TIMESTAMP
      WHERE token_id = $1
      RETURNING *
    `;
    const result = await query(sql, [tokenId]);
    return result.rows[0] || null;
  },

  invalidateAllForUser: async (userId) => {
    const sql = `
      UPDATE password_reset_tokens
      SET used_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND used_at IS NULL
    `;
    await query(sql, [userId]);
  },
};

export default PasswordResetTokenModel;
