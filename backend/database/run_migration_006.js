import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('Running Migration 006: Auth Approvals, Password Reset, and Theory Videos...');
  const sqlPath = path.join(__dirname, 'migrations', '006_auth_approvals_reset_and_theory_videos.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  try {
    await query(sql);
    console.log('Migration 006 completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
