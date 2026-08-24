// ──────────────────────────────────────────────
// Coding Assessments & Test Cases Seed Script
// ──────────────────────────────────────────────
// Runs database/seeds/coding.seed.sql to populate
// topic and subtopic coding questions with test cases.
// Usage: node database/seedCoding.js
// ──────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, testConnection } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedCodingAssessments = async () => {
  console.log('💻 Starting Coding Assessment & Test Cases Seed...\n');

  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Database connection failed. Cannot seed coding questions.');
    process.exit(1);
  }

  const seedPath = path.join(__dirname, 'seeds', 'coding.seed.sql');
  if (!fs.existsSync(seedPath)) {
    console.error(`❌ Seed file not found at ${seedPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(seedPath, 'utf-8');

  try {
    await pool.query(sql);
    console.log('✅ Coding Assessments SQL Seed executed successfully.\n');

    // 1. Verify Topic Coding Assessments & Questions
    const tcaRes = await pool.query(
      `SELECT tca.tca_id, tca.title, COUNT(tq.tca_question_id)::int as question_count,
              COALESCE(SUM(tq.marks), 0)::int as total_marks
       FROM topic_coding_assessment tca
       LEFT JOIN tca_questions tq ON tca.tca_id = tq.tca_id
       GROUP BY tca.tca_id, tca.title`
    );

    console.log('========================================');
    console.log('TOPIC CODING ASSESSMENTS:');
    console.log('========================================');
    for (const row of tcaRes.rows) {
      console.log(`  Assessment #${row.tca_id}: "${row.title}" → ${row.question_count} questions (${row.total_marks} marks)`);

      const qRes = await pool.query(
        `SELECT tq.tca_question_id, tq.title, tq.marks, COUNT(tc.tca_testcase_id)::int as testcase_count
         FROM tca_questions tq
         LEFT JOIN tca_test_cases tc ON tq.tca_question_id = tc.tca_question_id
         WHERE tq.tca_id = $1
         GROUP BY tq.tca_question_id, tq.title, tq.marks, tq.order_index
         ORDER BY tq.order_index`,
        [row.tca_id]
      );
      qRes.rows.forEach((q) => {
        console.log(`    - Q${q.tca_question_id}: "${q.title}" (${q.marks} marks) → ${q.testcase_count} test cases`);
      });
    }

    // 2. Verify Subtopic Coding Assessments
    const sccaRes = await pool.query(
      `SELECT s.title as subtopic_title, scca.scca_id, scca.title as question_title, scca.marks,
              COUNT(tc.scca_testcase_id)::int as testcase_count
       FROM subtopic_coding_assessment scca
       JOIN subtopic_content sc ON scca.content_id = sc.content_id
       JOIN subtopics s ON sc.subtopic_id = s.subtopic_id
       LEFT JOIN subtopic_coding_test_cases tc ON scca.scca_id = tc.scca_id
       GROUP BY s.title, scca.scca_id, scca.title, scca.marks
       ORDER BY s.title, scca.scca_id`
    );

    console.log('\n========================================');
    console.log('SUBTOPIC CODING ASSESSMENTS:');
    console.log('========================================');
    for (const row of sccaRes.rows) {
      console.log(`  [${row.subtopic_title}] Q#${row.scca_id}: "${row.question_title}" (${row.marks} marks) → ${row.testcase_count} test cases`);
    }

    console.log('\n✅ Coding Assessment Seeding and Verification Complete!\n');
  } catch (err) {
    console.error('❌ Error seeding coding assessments:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seedCodingAssessments();
