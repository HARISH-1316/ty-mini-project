-- =========================================================
-- Migration 006: Auth Approvals, Password Reset, and Theory Videos
-- =========================================================
-- 1. Add approval_status and decision metadata to users table
-- 2. Create password_reset_tokens table for secure recovery
-- 3. Create topic_video_references table for verified YouTube videos
-- 4. Ensure all existing users are marked 'approved' so existing accounts are preserved
-- =========================================================

-- 1. Users Approval Status
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'approved'
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS approval_decision_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS approval_decision_by INT REFERENCES users(user_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, approval_status);

-- 2. Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pwd_reset_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_pwd_reset_hash ON password_reset_tokens(token_hash);

-- 3. Topic Video References
CREATE TABLE IF NOT EXISTS topic_video_references (
  video_id SERIAL PRIMARY KEY,
  topic_id INT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  channel_name VARCHAR(150) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  order_index INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_topic_videos_topic ON topic_video_references(topic_id);
