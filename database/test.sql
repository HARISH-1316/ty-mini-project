INSERT INTO users (
    name,
    email,
    password_hash,
    role,
    approval_status
)
VALUES (
    'Harish',
    'harishprabhakaran90@gmail.com',
    '$2b$12$NU/r05hJcrmkE6onfc5dZet5uhodHrDUg4Ora7NWmGRkcYbZT0fJW',
    'admin',
    'approved'
)
RETURNING user_id, name, email, role, approval_status;