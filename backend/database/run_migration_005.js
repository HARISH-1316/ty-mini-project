import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, testConnection } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const connected = await testConnection();
  if (!connected) {
    console.error('Cannot connect to DB');
    process.exit(1);
  }

  const migrationFile = path.join(__dirname, 'migrations', '005_room_hybrid_la_and_mcq.sql');
  const sql = fs.readFileSync(migrationFile, 'utf-8');

  console.log('Running Migration 005...');
  await pool.query(sql);
  console.log('✅ Migration 005 executed successfully.');

  const res = await pool.query(
    "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'lab_assessment' AND column_name IN ('room_id', 'num_coding_questions', 'num_mcq_questions', 'marks_per_mcq')"
  );
  console.log('lab_assessment updated columns:', res.rows);

  const tables = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('lab_mcq_questions', 'la_selected_mcqs', 'la_student_mcq_allocations', 'la_mcq_submissions')"
  );
  console.log('MCQ tables created:', tables.rows.map(r => r.table_name));

  process.exit(0);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
