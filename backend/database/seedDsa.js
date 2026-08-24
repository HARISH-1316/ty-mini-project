// ──────────────────────────────────────────────
// DSA Seed Execution Script
// ──────────────────────────────────────────────
// Runs database/seeds/dsa.seed.sql to populate the
// Data Structures and Algorithms topic, subtopics, and content.
// Usage: node database/seedDsa.js
// ──────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, testConnection } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDsa = async () => {
  console.log('🌱 Starting DSA Seed Data insertion...\n');

  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Database connection failed. Cannot seed.');
    process.exit(1);
  }

  const seedPath = path.join(__dirname, 'seeds', 'dsa.seed.sql');
  if (!fs.existsSync(seedPath)) {
    console.error(`❌ Seed file not found at ${seedPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(seedPath, 'utf-8');

  try {
    await pool.query(sql);
    console.log('✅ DSA Seed executed successfully!');

    // Verify inserted count
    const res = await pool.query(
      `SELECT s.subtopic_id, s.title, s.order_index, s.is_published, sc.content_id
       FROM subtopics s
       JOIN topics t ON s.topic_id = t.topic_id
       LEFT JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
       WHERE t.title = 'Data Structures and Algorithms'
       ORDER BY s.order_index`
    );

    console.log(`\n📊 Verified Subtopics inserted: ${res.rows.length}`);
    res.rows.forEach((row) => {
      console.log(`   ${row.order_index}. ${row.title} (Published: ${row.is_published}) — Content ID: ${row.content_id || 'None'}`);
    });
  } catch (err) {
    console.error('❌ Error executing DSA seed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seedDsa();
