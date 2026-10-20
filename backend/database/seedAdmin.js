// ──────────────────────────────────────────────
// Idempotent Admin Account Provisioning & Rotation
// ──────────────────────────────────────────────
// Ensures an administrative account is provisioned without exposing
// credentials or resetting existing passwords on normal reruns.
// Supports intentional credential rotation via:
//   node database/seedAdmin.js --rotate
// or by setting ROTATE_ADMIN_PASSWORD=true
// ──────────────────────────────────────────────

import bcrypt from 'bcrypt';
import { query } from '../config/database.js';

const SALT_ROUNDS = 12;

async function seedAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@wcelab.ac.in').toLowerCase().trim();
  const adminName = process.env.ADMIN_NAME || 'System Administrator';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Wce2026!';
  const shouldRotate = process.argv.includes('--rotate') || process.env.ROTATE_ADMIN_PASSWORD === 'true';

  console.log(`Checking admin account for email: ${adminEmail}`);

  const existingRes = await query('SELECT user_id, email, role, password_hash, approval_status FROM users WHERE email = $1', [adminEmail]);

  if (existingRes.rows.length > 0) {
    const existing = existingRes.rows[0];
    console.log(`Admin account exists (user_id: ${existing.user_id}, role: ${existing.role}, status: ${existing.approval_status}).`);

    if (shouldRotate) {
      console.log('Rotating admin password to configured ADMIN_PASSWORD...');
      const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
      await query(
        "UPDATE users SET password_hash = $1, role = 'admin', approval_status = 'approved' WHERE user_id = $2",
        [passwordHash, existing.user_id]
      );
      console.log('Admin password rotated successfully.');
    } else {
      if (existing.approval_status !== 'approved' || existing.role !== 'admin') {
        await query("UPDATE users SET role = 'admin', approval_status = 'approved' WHERE user_id = $1", [existing.user_id]);
        console.log('Ensured role is admin and approval_status is approved.');
      } else {
        console.log('Admin account is in approved state. Password retained (use --rotate to update password).');
      }
    }
  } else {
    console.log('Admin account does not exist. Creating new administrator...');
    const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
    const createRes = await query(
      `INSERT INTO users (name, email, password_hash, role, approval_status)
       VALUES ($1, $2, $3, 'admin', 'approved')
       RETURNING user_id, name, email, role, approval_status`,
      [adminName, adminEmail, passwordHash]
    );
    console.log('Admin account created successfully:', createRes.rows[0]);
  }
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Admin provisioning failed:', err);
    process.exit(1);
  });
