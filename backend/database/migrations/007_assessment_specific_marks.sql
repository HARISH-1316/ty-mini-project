-- ============================================================
-- Migration 007: Assessment-Specific Marks & Constraints Support
-- ============================================================
-- Ensures faculty-configured marks for assessments override question bank marks.
-- Adds assessment-level marks to selected questions and student allocations,
-- and tracks max_marks on submissions for accurate reporting.

-- 1. Assessment-specific marks on la_selected_questions (Mode A & Mode C)
ALTER TABLE la_selected_questions
  ADD COLUMN IF NOT EXISTS marks INT NOT NULL DEFAULT 10;

-- 2. Snapshot marks on la_student_allocations
ALTER TABLE la_student_allocations
  ADD COLUMN IF NOT EXISTS marks INT NOT NULL DEFAULT 10;

-- 3. Assessment-specific marks on la_selected_mcqs
ALTER TABLE la_selected_mcqs
  ADD COLUMN IF NOT EXISTS marks INT NOT NULL DEFAULT 2;

-- 4. Snapshot marks on la_student_mcq_allocations
ALTER TABLE la_student_mcq_allocations
  ADD COLUMN IF NOT EXISTS marks INT NOT NULL DEFAULT 2;

-- 5. Track max_marks snapshot on question submissions
ALTER TABLE la_question_submissions
  ADD COLUMN IF NOT EXISTS max_marks INT NOT NULL DEFAULT 10;

-- 6. Backfill existing records safely
-- Backfill la_selected_questions marks from lab_assessment.marks_per_question if available
UPDATE la_selected_questions lsq
SET marks = COALESCE(la.marks_per_question, 10)
FROM lab_assessment la
WHERE lsq.lab_id = la.lab_id
  AND (lsq.marks IS NULL OR lsq.marks = 10)
  AND la.marks_per_question IS NOT NULL;

-- Backfill la_student_allocations marks from lab_assessment
UPDATE la_student_allocations lsa
SET marks = COALESCE(la.marks_per_question, 10)
FROM lab_assessment la
WHERE lsa.lab_id = la.lab_id
  AND (lsa.marks IS NULL OR lsa.marks = 10)
  AND la.marks_per_question IS NOT NULL;

-- Backfill la_student_allocations marks from la_selected_questions where available
UPDATE la_student_allocations lsa
SET marks = lsq.marks
FROM la_selected_questions lsq
WHERE lsa.lab_id = lsq.lab_id
  AND lsa.lab_question_id = lsq.lab_question_id
  AND lsq.marks IS NOT NULL;

-- Backfill la_question_submissions max_marks from lab_assessment
UPDATE la_question_submissions lqs
SET max_marks = COALESCE(la.marks_per_question, 10)
FROM la_attempts att
JOIN lab_assessment la ON att.lab_id = la.lab_id
WHERE lqs.attempt_id = att.attempt_id;

-- Backfill la_question_submissions max_marks from la_student_allocations where available
UPDATE la_question_submissions lqs
SET max_marks = lsa.marks
FROM la_attempts att, la_student_allocations lsa
WHERE lqs.attempt_id = att.attempt_id
  AND att.lab_id = lsa.lab_id
  AND att.student_id = lsa.student_id
  AND lqs.lab_question_id = lsa.lab_question_id
  AND lsa.marks IS NOT NULL;
