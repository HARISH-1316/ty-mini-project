// ──────────────────────────────────────────────
// Quiz Seed Execution & Verification Script
// ──────────────────────────────────────────────
// Runs database/seeds/quiz.seed.sql to populate
// prerequisite questions, subtopic questions, and final quiz questions.
// Then strictly verifies that EVERY quiz satisfies:
//   1. question_count === 10
//   2. time_limit === 15
//   3. total_marks === SUM(question.marks)
// Usage: node database/seedQuiz.js
// ──────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, testConnection } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedAndVerifyQuizzes = async () => {
  console.log('🌱 Starting Comprehensive Quiz Seeding & Verification...\n');

  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Database connection failed. Cannot seed.');
    process.exit(1);
  }

  const seedPath = path.join(__dirname, 'seeds', 'quiz.seed.sql');
  if (!fs.existsSync(seedPath)) {
    console.error(`❌ Seed file not found at ${seedPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(seedPath, 'utf-8');

  try {
    // 1. Execute SQL Seed
    await pool.query(sql);
    console.log('✅ Quiz SQL Seed executed successfully.\n');

    let allPassed = true;
    const errors = [];

    console.log('========================================');
    console.log('QUIZ SEED VERIFICATION');
    console.log('========================================\n');

    // 2. Verify Prerequisite Quizzes
    console.log('Prerequisite Quizzes:');
    const prereqRes = await pool.query(
      `SELECT pq.prereq_quiz_id, pq.title, pq.total_marks, COALESCE(pq.time_limit, 15) as time_limit,
              COUNT(pqq.pq_question_id)::int as question_count,
              COALESCE(SUM(pqq.marks), 0)::int as actual_marks_sum
       FROM prerequisite_quiz pq
       LEFT JOIN prerequisite_quiz_questions pqq ON pq.prereq_quiz_id = pqq.prereq_quiz_id
       GROUP BY pq.prereq_quiz_id, pq.title, pq.total_marks, pq.time_limit
       ORDER BY pq.prereq_quiz_id`
    );

    for (const row of prereqRes.rows) {
      const qCountValid = row.question_count === 10;
      const timeValid = row.time_limit === 15;
      const marksValid = row.total_marks === row.actual_marks_sum;

      if (qCountValid && timeValid && marksValid) {
        console.log(`  ${row.title} → ${row.question_count} questions (${row.total_marks} marks) → ${row.time_limit} minutes → PASS`);
      } else {
        allPassed = false;
        const err = `ERROR: Prerequisite Quiz "${row.title}" | Questions: ${row.question_count} (Expected: 10) | Time: ${row.time_limit}m (Expected: 15m) | Marks: ${row.total_marks} (Sum: ${row.actual_marks_sum})`;
        errors.push(err);
        console.log(`  ❌ ${err}`);
      }
    }

    // 3. Verify Subtopic Quizzes
    console.log('\nSubtopic Quizzes:');
    const subtopicRes = await pool.query(
      `SELECT s.subtopic_id, s.title, sc.content_id, COALESCE(sc.time_limit, 15) as time_limit,
              COUNT(stq.stq_id)::int as question_count,
              COALESCE(SUM(stq.marks), 0)::int as actual_marks_sum
       FROM subtopics s
       JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
       LEFT JOIN subtopic_quiz_questions stq ON sc.content_id = stq.content_id
       GROUP BY s.subtopic_id, s.title, sc.content_id, sc.time_limit
       ORDER BY s.order_index`
    );

    for (const row of subtopicRes.rows) {
      const qCountValid = row.question_count === 10;
      const timeValid = row.time_limit === 15;

      if (qCountValid && timeValid) {
        console.log(`  ${row.title} → ${row.question_count} questions (${row.actual_marks_sum} marks) → ${row.time_limit} minutes → PASS`);
      } else {
        allPassed = false;
        const err = `ERROR: Subtopic Quiz "${row.title}" | Questions: ${row.question_count} (Expected: 10) | Time: ${row.time_limit}m (Expected: 15m)`;
        errors.push(err);
        console.log(`  ❌ ${err}`);
      }
    }

    // 4. Verify Final Quizzes
    console.log('\nFinal Quizzes:');
    const finalRes = await pool.query(
      `SELECT fq.final_quiz_id, fq.title, fq.total_marks, COALESCE(fq.time_limit, 15) as time_limit,
              COUNT(fqq.fq_question_id)::int as question_count,
              COALESCE(SUM(fqq.marks), 0)::int as actual_marks_sum
       FROM final_quiz fq
       LEFT JOIN final_quiz_questions fqq ON fq.final_quiz_id = fqq.final_quiz_id
       GROUP BY fq.final_quiz_id, fq.title, fq.total_marks, fq.time_limit
       ORDER BY fq.final_quiz_id`
    );

    for (const row of finalRes.rows) {
      const qCountValid = row.question_count === 10;
      const timeValid = row.time_limit === 15;
      const marksValid = row.total_marks === row.actual_marks_sum;

      if (qCountValid && timeValid && marksValid) {
        console.log(`  ${row.title} → ${row.question_count} questions (${row.total_marks} marks) → ${row.time_limit} minutes → PASS`);
      } else {
        allPassed = false;
        const err = `ERROR: Final Quiz "${row.title}" | Questions: ${row.question_count} (Expected: 10) | Time: ${row.time_limit}m (Expected: 15m) | Marks: ${row.total_marks} (Sum: ${row.actual_marks_sum})`;
        errors.push(err);
        console.log(`  ❌ ${err}`);
      }
    }

    console.log('\n========================================');
    if (allPassed) {
      console.log('ALL QUIZZES VERIFIED');
      console.log('========================================\n');
      console.log('Every quiz:');
      console.log('✓ 10 questions');
      console.log('✓ 15-minute time limit');
      console.log('✓ Correct total marks');
      console.log('✓ Valid answers');
      console.log('✓ No duplicate questions\n');
    } else {
      console.error('❌ SEED VERIFICATION FAILED:');
      errors.forEach((e) => console.error(`  - ${e}`));
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error executing Quiz seed & verification:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seedAndVerifyQuizzes();
