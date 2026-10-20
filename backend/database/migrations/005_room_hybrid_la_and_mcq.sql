-- =========================================================
-- Migration 005: Room-Based Hybrid Lab Assessments & MCQs
-- =========================================================
-- 1. Ensure every Lab Assessment belongs to a Room (room_id NOT NULL)
-- 2. Hybrid support: num_coding_questions, num_mcq_questions, marks_per_mcq
-- 3. MCQ Question Bank (lab_mcq_questions)
-- 4. Assessment Selected MCQs (la_selected_mcqs)
-- 5. Student MCQ Allocations (la_student_mcq_allocations)
-- 6. Student MCQ Submissions (la_mcq_submissions)
-- All changes are safe, repeatable, and preserve historical data.
-- =========================================================

-- 1. Ensure faculty with existing lab assessments has at least one room
INSERT INTO rooms (faculty_id, room_name, room_code, description)
SELECT f.faculty_id, 'General Lab Room', UPPER(SUBSTRING(MD5(RANDOM()::TEXT || f.faculty_id::TEXT) FROM 1 FOR 6)), 'Default room for existing lab assessments'
FROM faculty f
WHERE EXISTS (SELECT 1 FROM lab_assessment la WHERE la.faculty_id = f.faculty_id)
  AND NOT EXISTS (SELECT 1 FROM rooms r WHERE r.faculty_id = f.faculty_id);

-- 2. Add room_id and hybrid configuration columns to lab_assessment
ALTER TABLE lab_assessment
  ADD COLUMN IF NOT EXISTS room_id INT REFERENCES rooms(room_id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS num_coding_questions INT NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS num_mcq_questions INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS marks_per_mcq INT NOT NULL DEFAULT 2;

-- Backfill room_id for existing records from faculty's room
UPDATE lab_assessment la
SET room_id = (
  SELECT r.room_id FROM rooms r
  WHERE r.faculty_id = la.faculty_id
  ORDER BY r.room_id ASC
  LIMIT 1
)
WHERE la.room_id IS NULL;

-- Fallback to any room if still null
UPDATE lab_assessment la
SET room_id = (SELECT r.room_id FROM rooms r ORDER BY r.room_id ASC LIMIT 1)
WHERE la.room_id IS NULL;

-- Synchronize num_coding_questions from existing num_questions if num_questions was set
UPDATE lab_assessment
SET num_coding_questions = num_questions
WHERE num_coding_questions = 3 AND num_questions IS NOT NULL AND num_questions <> 3;

-- Enforce room_id NOT NULL
ALTER TABLE lab_assessment
  ALTER COLUMN room_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lab_assessment_room ON lab_assessment(room_id);

-- 3. MCQ Question Bank Table
CREATE TABLE IF NOT EXISTS lab_mcq_questions (
  mcq_id SERIAL PRIMARY KEY,
  topic_id INT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,
  subtopic_id INT REFERENCES subtopics(subtopic_id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  marks INT NOT NULL DEFAULT 2,
  status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_faculty_id INT REFERENCES faculty(faculty_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lab_mcq_topic ON lab_mcq_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_lab_mcq_status ON lab_mcq_questions(status);
CREATE INDEX IF NOT EXISTS idx_lab_mcq_published ON lab_mcq_questions(is_published);
CREATE INDEX IF NOT EXISTS idx_lab_mcq_faculty ON lab_mcq_questions(created_by_faculty_id);

-- 4. Assessment Selected MCQs Pool
CREATE TABLE IF NOT EXISTS la_selected_mcqs (
  id SERIAL PRIMARY KEY,
  lab_id INT NOT NULL REFERENCES lab_assessment(lab_id) ON DELETE CASCADE,
  mcq_id INT NOT NULL REFERENCES lab_mcq_questions(mcq_id) ON DELETE CASCADE,
  question_order INT NOT NULL DEFAULT 1,
  UNIQUE(lab_id, mcq_id)
);

CREATE INDEX IF NOT EXISTS idx_la_sel_mcq_lab ON la_selected_mcqs(lab_id);
CREATE INDEX IF NOT EXISTS idx_la_sel_mcq_mcq ON la_selected_mcqs(mcq_id);

-- 5. Student MCQ Allocations (Persisted per student attempt)
CREATE TABLE IF NOT EXISTS la_student_mcq_allocations (
  allocation_id SERIAL PRIMARY KEY,
  lab_id INT NOT NULL REFERENCES lab_assessment(lab_id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
  mcq_id INT NOT NULL REFERENCES lab_mcq_questions(mcq_id) ON DELETE CASCADE,
  question_order INT NOT NULL,
  is_manual BOOLEAN NOT NULL DEFAULT FALSE,
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lab_id, student_id, mcq_id)
);

CREATE INDEX IF NOT EXISTS idx_la_mcq_alloc_lab_student ON la_student_mcq_allocations(lab_id, student_id);
CREATE INDEX IF NOT EXISTS idx_la_mcq_alloc_mcq ON la_student_mcq_allocations(mcq_id);

-- 6. Student MCQ Submissions within an attempt
CREATE TABLE IF NOT EXISTS la_mcq_submissions (
  submission_id SERIAL PRIMARY KEY,
  attempt_id INT NOT NULL REFERENCES la_attempts(attempt_id) ON DELETE CASCADE,
  mcq_id INT NOT NULL REFERENCES lab_mcq_questions(mcq_id) ON DELETE CASCADE,
  selected_option CHAR(1) CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN DEFAULT FALSE,
  marks_obtained INT NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(attempt_id, mcq_id)
);

CREATE INDEX IF NOT EXISTS idx_la_mcq_sub_attempt ON la_mcq_submissions(attempt_id);
CREATE INDEX IF NOT EXISTS idx_la_mcq_sub_mcq ON la_mcq_submissions(mcq_id);
