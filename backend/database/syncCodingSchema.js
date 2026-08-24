// ──────────────────────────────────────────────
// Sync Coding Assessment Schema
// ──────────────────────────────────────────────
// Adds tables and columns for TCA test cases and Subtopic Coding test cases.
// Usage: node database/syncCodingSchema.js
// ──────────────────────────────────────────────

import { pool, testConnection } from '../config/database.js';

const syncCodingSchema = async () => {
  console.log('🔄 Checking and updating Coding Assessment Schema...\n');

  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Database connection failed.');
    process.exit(1);
  }

  try {
    // 1. Add title column to tca_questions if not exists
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tca_questions' AND column_name = 'title'
        ) THEN
          ALTER TABLE tca_questions ADD COLUMN title VARCHAR(200);
        END IF;
      END $$;
    `);

    // 2. Add title column to subtopic_coding_assessment if not exists
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'subtopic_coding_assessment' AND column_name = 'title'
        ) THEN
          ALTER TABLE subtopic_coding_assessment ADD COLUMN title VARCHAR(200);
        END IF;
      END $$;
    `);

    // 3. Create tca_test_cases table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tca_test_cases (
        tca_testcase_id SERIAL PRIMARY KEY,
        tca_question_id INT NOT NULL
          REFERENCES tca_questions(tca_question_id)
          ON DELETE CASCADE,
        input TEXT,
        expected_output TEXT,
        is_hidden BOOLEAN DEFAULT FALSE,
        order_index INT
      );
      CREATE INDEX IF NOT EXISTS idx_tca_testcases_q ON tca_test_cases(tca_question_id);
    `);

    // 4. Create subtopic_coding_test_cases table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subtopic_coding_test_cases (
        scca_testcase_id SERIAL PRIMARY KEY,
        scca_id INT NOT NULL
          REFERENCES subtopic_coding_assessment(scca_id)
          ON DELETE CASCADE,
        input TEXT,
        expected_output TEXT,
        is_hidden BOOLEAN DEFAULT FALSE,
        order_index INT
      );
      CREATE INDEX IF NOT EXISTS idx_scca_testcases_q ON subtopic_coding_test_cases(scca_id);
    `);

    console.log('✅ Coding assessment schema synchronized successfully!');
  } catch (err) {
    console.error('❌ Error synchronizing coding schema:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

syncCodingSchema();
