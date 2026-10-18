-- =========================================================
-- Migration 003: Question Bank Enhancements
-- =========================================================
-- Adds subtopic_id, supported_languages, and is_archived
-- to lab_coding_questions.
-- All changes are ADDITIVE and safe for existing data.
-- =========================================================

ALTER TABLE lab_coding_questions
  ADD COLUMN IF NOT EXISTS subtopic_id INT REFERENCES subtopics(subtopic_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS supported_languages JSONB DEFAULT '["c", "cpp", "java", "python"]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_lab_questions_subtopic ON lab_coding_questions(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_lab_questions_archived ON lab_coding_questions(is_archived);
