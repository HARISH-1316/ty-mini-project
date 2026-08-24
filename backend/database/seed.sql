-- =========================================================
-- WCE VIRTUAL LAB — SEED DATA
-- =========================================================
-- Creates standard accounts for initial testing & operation:
-- 1. Admin: admin@wcelab.ac.in / Admin@123
-- 2. Faculty: faculty@wcelab.ac.in / Faculty@123
-- 3. Student: student@wcelab.ac.in / Student@123
-- =========================================================

BEGIN;

-- 1. Default Admin User
INSERT INTO users (name, email, password_hash, role)
VALUES (
    'System Administrator',
    'admin@wcelab.ac.in',
    '$2b$12$LJ3m4ys3Lgv1MBRFqh8cFeEGi9JGUZ5HsBVZN3BQHX.IuW8VKsXm6',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- 2. Default Faculty User & Profile
DO $$
DECLARE
    v_user_id INT;
    v_faculty_id INT;
BEGIN
    INSERT INTO users (name, email, password_hash, role)
    VALUES (
        'Prof. Harish Patil',
        'faculty@wcelab.ac.in',
        '$2b$12$LJ3m4ys3Lgv1MBRFqh8cFeEGi9JGUZ5HsBVZN3BQHX.IuW8VKsXm6',
        'faculty'
    )
    ON CONFLICT (email) DO UPDATE SET role = 'faculty'
    RETURNING user_id INTO v_user_id;

    IF v_user_id IS NOT NULL THEN
        INSERT INTO faculty (user_id, designation, department, specialization, phone)
        VALUES (
            v_user_id,
            'Assistant Professor',
            'Computer Science and Engineering',
            'Algorithms and Data Structures',
            '9876543210'
        )
        ON CONFLICT (user_id) DO NOTHING
        RETURNING faculty_id INTO v_faculty_id;
    END IF;
END $$;

-- 3. Default Student User & Profile
DO $$
DECLARE
    v_user_id INT;
    v_student_id INT;
BEGIN
    INSERT INTO users (name, email, password_hash, role)
    VALUES (
        'Harish Student',
        'student@wcelab.ac.in',
        '$2b$12$LJ3m4ys3Lgv1MBRFqh8cFeEGi9JGUZ5HsBVZN3BQHX.IuW8VKsXm6',
        'student'
    )
    ON CONFLICT (email) DO UPDATE SET role = 'student'
    RETURNING user_id INTO v_user_id;

    IF v_user_id IS NOT NULL THEN
        INSERT INTO student (user_id, roll_number, course, year, phone)
        VALUES (
            v_user_id,
            '2026BTECS001',
            'Computer Science and Engineering',
            3,
            '9123456789'
        )
        ON CONFLICT (user_id) DO NOTHING
        RETURNING student_id INTO v_student_id;
    END IF;
END $$;

-- 4. Create standard room and enroll student
DO $$
DECLARE
    v_faculty_id INT;
    v_student_id INT;
    v_room_id INT;
    v_topic_id INT;
BEGIN
    SELECT faculty_id INTO v_faculty_id FROM faculty f JOIN users u ON f.user_id = u.user_id WHERE u.email = 'faculty@wcelab.ac.in' LIMIT 1;
    SELECT student_id INTO v_student_id FROM student s JOIN users u ON s.user_id = u.user_id WHERE u.email = 'student@wcelab.ac.in' LIMIT 1;
    SELECT topic_id INTO v_topic_id FROM topics WHERE title = 'Data Structures and Algorithms' LIMIT 1;

    IF v_faculty_id IS NOT NULL THEN
        SELECT room_id INTO v_room_id FROM rooms WHERE faculty_id = v_faculty_id AND room_name = 'CSE — DSA Lab (Batch A)' LIMIT 1;
        IF v_room_id IS NULL THEN
            INSERT INTO rooms (faculty_id, room_name, room_code, description)
            VALUES (v_faculty_id, 'CSE — DSA Lab (Batch A)', 'DSA2026', 'Virtual lab for second & third year Computer Science students.')
            RETURNING room_id INTO v_room_id;
        END IF;

        IF v_topic_id IS NOT NULL AND v_room_id IS NOT NULL THEN
            INSERT INTO room_topics (room_id, topic_id, order_index)
            VALUES (v_room_id, v_topic_id, 1)
            ON CONFLICT (room_id, topic_id) DO NOTHING;
        END IF;

        IF v_student_id IS NOT NULL AND v_room_id IS NOT NULL THEN
            INSERT INTO student_rooms (student_id, room_id)
            VALUES (v_student_id, v_room_id)
            ON CONFLICT (student_id, room_id) DO NOTHING;
        END IF;
    END IF;
END $$;

COMMIT;
