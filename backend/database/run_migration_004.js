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

  console.log('Applying Migration 004...');
  const migrationFile = path.join(__dirname, 'migrations', '004_question_bank_and_la_allocation.sql');
  const sql = fs.readFileSync(migrationFile, 'utf-8');
  await pool.query(sql);
  console.log('Migration 004 applied successfully!');

  const topics = await pool.query('SELECT topic_id, title FROM topics ORDER BY topic_id');
  console.log('\n--- ALL CURRENT TOPICS ---');
  console.table(topics.rows);

  await pool.end();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
