-- =========================================================
-- Migration 002: Lab Assessment Module v2
-- =========================================================
-- Extends existing lab_assessment and lab_coding_questions tables
-- and adds new tables for topics, allocations, attempts, and submissions.
-- All changes are ADDITIVE — no existing data is dropped or modified.
-- Run with: psql -U <user> -d <db> -f 002_lab_assessment_v2.sql
-- =========================================================

-- ──────────────────────────────────────────────────────────
-- 1. Extend lab_assessment with status, num_questions, marks_per_question
-- ──────────────────────────────────────────────────────────

ALTER TABLE lab_assessment
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','active','completed','cancelled')),
  ADD COLUMN IF NOT EXISTS num_questions INT NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS marks_per_question INT NOT NULL DEFAULT 10;

ALTER TABLE lab_assessment
  ALTER COLUMN start_time TYPE TIMESTAMPTZ,
  ALTER COLUMN end_time TYPE TIMESTAMPTZ;

-- ──────────────────────────────────────────────────────────
-- 2. Extend lab_coding_questions as a proper question bank
--    lab_id becomes nullable so questions exist independently
-- ──────────────────────────────────────────────────────────

ALTER TABLE lab_coding_questions
  ADD COLUMN IF NOT EXISTS topic_id INT
    REFERENCES topics(topic_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS title VARCHAR(300),
  ADD COLUMN IF NOT EXISTS input_format TEXT,
  ADD COLUMN IF NOT EXISTS output_format TEXT,
  ADD COLUMN IF NOT EXISTS sample_input TEXT,
  ADD COLUMN IF NOT EXISTS sample_output TEXT,
  ADD COLUMN IF NOT EXISTS explanation TEXT,
  ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) NOT NULL DEFAULT 'medium'
    CHECK (difficulty IN ('easy','medium','hard')),
  ADD COLUMN IF NOT EXISTS created_by_faculty_id INT
    REFERENCES faculty(faculty_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Make lab_id nullable so questions can exist in the bank without belonging to a specific lab
ALTER TABLE lab_coding_questions ALTER COLUMN lab_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lab_questions_topic ON lab_coding_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_lab_questions_faculty ON lab_coding_questions(created_by_faculty_id);

-- ──────────────────────────────────────────────────────────
-- 3. Assessment ↔ Topics (many-to-many)
-- ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS la_assessment_topics (
  id SERIAL PRIMARY KEY,
  lab_id INT NOT NULL
    REFERENCES lab_assessment(lab_id) ON DELETE CASCADE,
  topic_id INT NOT NULL
    REFERENCES topics(topic_id) ON DELETE CASCADE,
  UNIQUE(lab_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_la_topics_lab ON la_assessment_topics(lab_id);
CREATE INDEX IF NOT EXISTS idx_la_topics_topic ON la_assessment_topics(topic_id);

-- ──────────────────────────────────────────────────────────
-- 4. Student question allocations
--    Persisted once per (student, lab) — never regenerated
-- ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS la_student_allocations (
  allocation_id SERIAL PRIMARY KEY,
  lab_id INT NOT NULL
    REFERENCES lab_assessment(lab_id) ON DELETE CASCADE,
  student_id INT NOT NULL
    REFERENCES student(student_id) ON DELETE CASCADE,
  lab_question_id INT NOT NULL
    REFERENCES lab_coding_questions(lab_question_id) ON DELETE CASCADE,
  question_order INT NOT NULL,
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lab_id, student_id, lab_question_id)
);

CREATE INDEX IF NOT EXISTS idx_la_alloc_lab_student
  ON la_student_allocations(lab_id, student_id);

-- ──────────────────────────────────────────────────────────
-- 5. Student attempts — one per (student, lab)
-- ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS la_attempts (
  attempt_id SERIAL PRIMARY KEY,
  lab_id INT NOT NULL
    REFERENCES lab_assessment(lab_id) ON DELETE CASCADE,
  student_id INT NOT NULL
    REFERENCES student(student_id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  effective_deadline TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress','submitted','timed_out','expired')),
  total_marks INT NOT NULL DEFAULT 0,
  obtained_marks INT NOT NULL DEFAULT 0,
  UNIQUE(lab_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_la_attempts_lab_student
  ON la_attempts(lab_id, student_id);
CREATE INDEX IF NOT EXISTS idx_la_attempts_student
  ON la_attempts(student_id);

-- ──────────────────────────────────────────────────────────
-- 6. Per-question submissions within an attempt
-- ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS la_question_submissions (
  submission_id SERIAL PRIMARY KEY,
  attempt_id INT NOT NULL
    REFERENCES la_attempts(attempt_id) ON DELETE CASCADE,
  lab_question_id INT NOT NULL
    REFERENCES lab_coding_questions(lab_question_id) ON DELETE CASCADE,
  source_code TEXT,
  language VARCHAR(20),
  status VARCHAR(30) NOT NULL DEFAULT 'not_attempted'
    CHECK (status IN (
      'not_attempted',
      'attempted',
      'accepted',
      'partially_correct',
      'wrong_answer',
      'compilation_error',
      'runtime_error',
      'time_limit_exceeded'
    )),
  passed_test_cases INT NOT NULL DEFAULT 0,
  total_test_cases INT NOT NULL DEFAULT 0,
  marks_obtained INT NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  UNIQUE(attempt_id, lab_question_id)
);

CREATE INDEX IF NOT EXISTS idx_la_qsub_attempt
  ON la_question_submissions(attempt_id);
