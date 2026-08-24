-- =========================================================
-- WCE VIRTUAL LAB
-- COMPLETE DATABASE SCHEMA
-- =========================================================
-- Drops existing tables and creates all 25 application tables.
-- =========================================================

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS assignment_test_cases CASCADE;
DROP TABLE IF EXISTS assignment_questions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS lab_test_cases CASCADE;
DROP TABLE IF EXISTS lab_coding_questions CASCADE;
DROP TABLE IF EXISTS lab_assessment CASCADE;
DROP TABLE IF EXISTS topic_feedback CASCADE;
DROP TABLE IF EXISTS subtopic_feedback CASCADE;
DROP TABLE IF EXISTS subtopic_quiz_questions CASCADE;
DROP TABLE IF EXISTS subtopic_coding_assessment CASCADE;
DROP TABLE IF EXISTS tca_questions CASCADE;
DROP TABLE IF EXISTS topic_coding_assessment CASCADE;
DROP TABLE IF EXISTS final_quiz_questions CASCADE;
DROP TABLE IF EXISTS final_quiz CASCADE;
DROP TABLE IF EXISTS prerequisite_quiz CASCADE;
DROP TABLE IF EXISTS prerequisite CASCADE;
DROP TABLE IF EXISTS progress CASCADE;
DROP TABLE IF EXISTS subtopic_content CASCADE;
DROP TABLE IF EXISTS subtopics CASCADE;
DROP TABLE IF EXISTS room_topics CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS student_rooms CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS student CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;


-- =========================================================
-- 1. ENUM TYPES
-- =========================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'faculty', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE progress_status AS ENUM ('Not Started', 'In Progress', 'Completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- =========================================================
-- 2. USERS
-- =========================================================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);


-- =========================================================
-- 3. STUDENT
-- =========================================================

CREATE TABLE student (
    student_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    roll_number VARCHAR(30) UNIQUE NOT NULL,
    course VARCHAR(100),
    year INT,
    phone VARCHAR(20)
);


-- =========================================================
-- 4. FACULTY
-- =========================================================

CREATE TABLE faculty (
    faculty_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    designation VARCHAR(100),
    department VARCHAR(100),
    specialization VARCHAR(100),
    phone VARCHAR(20)
);


-- =========================================================
-- 5. ROOMS
-- =========================================================

CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    faculty_id INT NOT NULL
        REFERENCES faculty(faculty_id)
        ON DELETE CASCADE,
    room_name VARCHAR(150) NOT NULL,
    room_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 6. STUDENT ROOMS
-- =========================================================

CREATE TABLE student_rooms (
    student_room_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL
        REFERENCES student(student_id)
        ON DELETE CASCADE,
    room_id INT NOT NULL
        REFERENCES rooms(room_id)
        ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, room_id)
);


-- =========================================================
-- 7. TOPICS
-- =========================================================

CREATE TABLE topics (
    topic_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 8. ROOM TOPICS
-- =========================================================

CREATE TABLE room_topics (
    room_topic_id SERIAL PRIMARY KEY,
    room_id INT NOT NULL
        REFERENCES rooms(room_id)
        ON DELETE CASCADE,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id)
        ON DELETE CASCADE,
    order_index INT,
    UNIQUE(room_id, topic_id)
);


-- =========================================================
-- 9. SUBTOPICS
-- =========================================================

CREATE TABLE subtopics (
    subtopic_id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id)
        ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    order_index INT,
    is_published BOOLEAN DEFAULT TRUE
);


-- =========================================================
-- 10. SUBTOPIC CONTENT
-- =========================================================

CREATE TABLE subtopic_content (
    content_id SERIAL PRIMARY KEY,
    subtopic_id INT NOT NULL
        REFERENCES subtopics(subtopic_id)
        ON DELETE CASCADE,
    aim TEXT,
    theory TEXT,
    video_explanation_url TEXT,
    time_limit INT DEFAULT 15
);


-- =========================================================
-- 11. STUDENT PROGRESS
-- =========================================================

CREATE TABLE progress (
    progress_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL
        REFERENCES student(student_id)
        ON DELETE CASCADE,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id)
        ON DELETE CASCADE,
    status progress_status DEFAULT 'Not Started',
    time_spent INT DEFAULT 0,
    last_accessed TIMESTAMP,
    UNIQUE(student_id, topic_id)
);


-- =========================================================
-- 12. PREREQUISITES
-- =========================================================

CREATE TABLE prerequisite (
    prereq_id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id)
        ON DELETE CASCADE,
    description TEXT,
    content TEXT,
    order_index INT
);


-- =========================================================
-- 13. PREREQUISITE QUIZ
-- =========================================================

CREATE TABLE prerequisite_quiz (
    prereq_quiz_id SERIAL PRIMARY KEY,
    prereq_id INT NOT NULL
        REFERENCES prerequisite(prereq_id)
        ON DELETE CASCADE,
    title VARCHAR(200),
    total_marks INT,
    passing_criteria INT,
    time_limit INT DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 13A. PREREQUISITE QUIZ QUESTIONS
-- =========================================================

CREATE TABLE prerequisite_quiz_questions (
    pq_question_id SERIAL PRIMARY KEY,
    prereq_quiz_id INT NOT NULL
        REFERENCES prerequisite_quiz(prereq_quiz_id)
        ON DELETE CASCADE,
    question_text TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option CHAR(1),
    marks INT,
    order_index INT
);


-- =========================================================
-- 14. FINAL TOPIC QUIZ
-- =========================================================

CREATE TABLE final_quiz (
    final_quiz_id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id)
        ON DELETE CASCADE,
    title VARCHAR(200),
    total_marks INT,
    time_limit INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 15. FINAL QUIZ QUESTIONS
-- =========================================================

CREATE TABLE final_quiz_questions (
    fq_question_id SERIAL PRIMARY KEY,
    final_quiz_id INT NOT NULL
        REFERENCES final_quiz(final_quiz_id)
        ON DELETE CASCADE,
    question_text TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option CHAR(1),
    marks INT,
    order_index INT
);


-- =========================================================
-- 16. TOPIC CODING ASSESSMENT
-- =========================================================

CREATE TABLE topic_coding_assessment (
    tca_id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id)
        ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    total_marks INT,
    time_limit INT
);


-- =========================================================
-- 17. TOPIC CODING QUESTIONS
-- =========================================================

CREATE TABLE tca_questions (
    tca_question_id SERIAL PRIMARY KEY,
    tca_id INT NOT NULL
        REFERENCES topic_coding_assessment(tca_id)
        ON DELETE CASCADE,
    problem_statement TEXT,
    constraints TEXT,
    sample_input TEXT,
    sample_output TEXT,
    marks INT,
    order_index INT
);


-- =========================================================
-- 18. SUBTOPIC CODING ASSESSMENT
-- =========================================================

CREATE TABLE subtopic_coding_assessment (
    scca_id SERIAL PRIMARY KEY,
    content_id INT NOT NULL
        REFERENCES subtopic_content(content_id)
        ON DELETE CASCADE,
    problem_statement TEXT,
    constraints TEXT,
    sample_input TEXT,
    sample_output TEXT,
    marks INT,
    order_index INT
);


-- =========================================================
-- 19. SUBTOPIC QUIZ QUESTIONS
-- =========================================================

CREATE TABLE subtopic_quiz_questions (
    stq_id SERIAL PRIMARY KEY,
    content_id INT NOT NULL
        REFERENCES subtopic_content(content_id)
        ON DELETE CASCADE,
    question_text TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option CHAR(1),
    marks INT,
    order_index INT
);


-- =========================================================
-- 20. TOPIC FEEDBACK
-- Student provides feedback for a complete topic
-- =========================================================

CREATE TABLE topic_feedback (
    feedback_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL
        REFERENCES student(student_id)
        ON DELETE CASCADE,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id)
        ON DELETE CASCADE,
    rating INT NOT NULL
        CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, topic_id)
);


-- =========================================================
-- 21. LAB ASSESSMENT
-- =========================================================

CREATE TABLE lab_assessment (
    lab_id SERIAL PRIMARY KEY,
    faculty_id INT NOT NULL
        REFERENCES faculty(faculty_id)
        ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration INT,
    total_marks INT
);


-- =========================================================
-- 22. LAB CODING QUESTIONS
-- =========================================================

CREATE TABLE lab_coding_questions (
    lab_question_id SERIAL PRIMARY KEY,
    lab_id INT NOT NULL
        REFERENCES lab_assessment(lab_id)
        ON DELETE CASCADE,
    problem_statement TEXT,
    constraints TEXT,
    marks INT,
    order_index INT
);


-- =========================================================
-- 23. LAB TEST CASES
-- =========================================================

CREATE TABLE lab_test_cases (
    lab_testcase_id SERIAL PRIMARY KEY,
    lab_question_id INT NOT NULL
        REFERENCES lab_coding_questions(lab_question_id)
        ON DELETE CASCADE,
    input TEXT,
    expected_output TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    order_index INT
);


-- =========================================================
-- 24. ASSIGNMENTS
-- =========================================================

CREATE TABLE assignments (
    assignment_id SERIAL PRIMARY KEY,
    faculty_id INT NOT NULL
        REFERENCES faculty(faculty_id)
        ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    deadline TIMESTAMP,
    total_marks INT
);


-- =========================================================
-- 25. ASSIGNMENT QUESTIONS
-- =========================================================

CREATE TABLE assignment_questions (
    asg_question_id SERIAL PRIMARY KEY,
    assignment_id INT NOT NULL
        REFERENCES assignments(assignment_id)
        ON DELETE CASCADE,
    problem_statement TEXT,
    constraints TEXT,
    marks INT,
    order_index INT
);


-- =========================================================
-- 26. ASSIGNMENT TEST CASES
-- =========================================================

CREATE TABLE assignment_test_cases (
    asg_testcase_id SERIAL PRIMARY KEY,
    asg_question_id INT NOT NULL
        REFERENCES assignment_questions(asg_question_id)
        ON DELETE CASCADE,
    input TEXT,
    expected_output TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    order_index INT
);


-- =========================================================
-- 27. SESSION TABLE (for connect-pg-simple)
-- =========================================================

CREATE TABLE "session" (
    "sid" VARCHAR NOT NULL COLLATE "default",
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

CREATE INDEX "IDX_session_expire" ON "session" ("expire");


-- =========================================================
-- 28. QUIZ ATTEMPTS
-- =========================================================

DO $$ BEGIN
    CREATE TYPE quiz_type_enum AS ENUM ('prerequisite', 'subtopic', 'final');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE quiz_attempts (
    attempt_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL
        REFERENCES student(student_id)
        ON DELETE CASCADE,
    quiz_type quiz_type_enum NOT NULL,
    quiz_ref_id INT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    score INT DEFAULT 0,
    total_marks INT DEFAULT 0,
    percentage NUMERIC(5,2) DEFAULT 0,
    correct_answers INT DEFAULT 0,
    incorrect_answers INT DEFAULT 0,
    unanswered INT DEFAULT 0,
    passed BOOLEAN,
    answers JSONB
);


-- =========================================================
-- 29. SUBTOPIC PROGRESS
-- =========================================================

CREATE TABLE subtopic_progress (
    subtopic_progress_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL
        REFERENCES student(student_id)
        ON DELETE CASCADE,
    subtopic_id INT NOT NULL
        REFERENCES subtopics(subtopic_id)
        ON DELETE CASCADE,
    aim_viewed BOOLEAN DEFAULT FALSE,
    theory_viewed BOOLEAN DEFAULT FALSE,
    video_viewed BOOLEAN DEFAULT FALSE,
    status progress_status DEFAULT 'Not Started',
    time_spent INT DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subtopic_id)
);


-- =========================================================
-- 30. CODING SUBMISSIONS
-- =========================================================

DO $$ BEGIN
    CREATE TYPE assessment_type_enum AS ENUM ('topic', 'subtopic', 'lab', 'assignment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE coding_submissions (
    submission_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL
        REFERENCES student(student_id)
        ON DELETE CASCADE,
    assessment_type assessment_type_enum NOT NULL DEFAULT 'topic',
    assessment_ref_id INT NOT NULL,
    question_id INT,
    source_code TEXT,
    language VARCHAR(50) DEFAULT 'cpp',
    status VARCHAR(50) DEFAULT 'Completed',
    score INT DEFAULT 0,
    total_marks INT DEFAULT 0,
    questions_solved INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    percentage NUMERIC(5,2) DEFAULT 0,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 31. INDEXES
-- =========================================================

CREATE INDEX idx_progress_student ON progress(student_id);
CREATE INDEX idx_progress_topic ON progress(topic_id);
CREATE INDEX idx_subtopics_topic ON subtopics(topic_id);
CREATE INDEX idx_content_subtopic ON subtopic_content(subtopic_id);
CREATE INDEX idx_prerequisite_topic ON prerequisite(topic_id);
CREATE INDEX idx_final_quiz_topic ON final_quiz(topic_id);
CREATE INDEX idx_tca_topic ON topic_coding_assessment(topic_id);
CREATE INDEX idx_lab_faculty ON lab_assessment(faculty_id);
CREATE INDEX idx_assignment_faculty ON assignments(faculty_id);
CREATE INDEX idx_rooms_faculty ON rooms(faculty_id);
CREATE INDEX idx_student_rooms_student ON student_rooms(student_id);
CREATE INDEX idx_student_rooms_room ON student_rooms(room_id);
CREATE INDEX idx_room_topics_room ON room_topics(room_id);
CREATE INDEX idx_room_topics_topic ON room_topics(topic_id);
CREATE INDEX idx_topic_feedback_student ON topic_feedback(student_id);
CREATE INDEX idx_topic_feedback_topic ON topic_feedback(topic_id);
CREATE INDEX idx_pq_questions_quiz ON prerequisite_quiz_questions(prereq_quiz_id);
CREATE INDEX idx_quiz_attempts_student ON quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempts_ref ON quiz_attempts(quiz_type, quiz_ref_id);
CREATE INDEX idx_subtopic_progress_student ON subtopic_progress(student_id);
CREATE INDEX idx_subtopic_progress_subtopic ON subtopic_progress(subtopic_id);
CREATE INDEX idx_coding_submissions_student ON coding_submissions(student_id);
CREATE INDEX idx_coding_submissions_ref ON coding_submissions(assessment_type, assessment_ref_id);
