import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration007() {
  console.log('🚀 Running Migration 007: Assessment-Specific Marks...');
  const migrationPath = path.join(__dirname, 'migrations', '007_assessment_specific_marks.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    await query(sql);
    console.log('✅ Migration 007 completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration 007 failed:', err);
    process.exit(1);
  }
}

runMigration007();
