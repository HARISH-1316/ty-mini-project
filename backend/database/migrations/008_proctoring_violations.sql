-- ──────────────────────────────────────────────
-- Migration 008: Proctoring & Tab Switch Violations
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS la_proctoring_violations (
  violation_id SERIAL PRIMARY KEY,
  lab_id INT NOT NULL REFERENCES lab_assessment(lab_id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
  attempt_id INT REFERENCES la_attempts(attempt_id) ON DELETE CASCADE,
  violation_type VARCHAR(50) NOT NULL, -- 'fullscreen_exit', 'tab_switch', 'window_blur'
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_la_violations_lab_student
  ON la_proctoring_violations(lab_id, student_id);

CREATE INDEX IF NOT EXISTS idx_la_violations_lab
  ON la_proctoring_violations(lab_id);
