-- =========================================================
-- WCE VIRTUAL LAB — SEED DATA
-- =========================================================
-- Creates a default admin account for initial system setup.
-- Password: Admin@123 (bcrypt hash with 12 rounds)
-- =========================================================

-- Default admin user
-- Email: admin@wcelab.ac.in
-- Password: Admin@123
INSERT INTO users (name, email, password_hash, role)
VALUES (
    'System Administrator',
    'admin@wcelab.ac.in',
    '$2b$12$LJ3m4ys3Lgv1MBRFqh8cFeEGi9JGUZ5HsBVZN3BQHX.IuW8VKsXm6',
    'admin'
)
ON CONFLICT (email) DO NOTHING;
