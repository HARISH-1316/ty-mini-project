import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, testConnection } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('Testing DB connection...');
  const ok = await testConnection();
  if (!ok) {
    console.error('Database connection failed.');
    process.exit(1);
  }

  // Check if la_attempts already exists
  const check = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_name = 'la_attempts'"
  );
  if (check.rows.length > 0) {
    console.log('Migration 002 already applied! Tables exist.');
  } else {
    console.log('Applying Migration 002...');
    const migrationFile = path.join(__dirname, 'migrations', '002_lab_assessment_v2.sql');
    const sql = fs.readFileSync(migrationFile, 'utf-8');
    await pool.query(sql);
    console.log('Migration 002 applied successfully!');
  }

  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
  console.log('Current Tables:', tables.rows.map(r => r.table_name).join(', '));

  await pool.end();
}

run().catch(err => {
  console.error('Error running migration:', err);
  process.exit(1);
});
