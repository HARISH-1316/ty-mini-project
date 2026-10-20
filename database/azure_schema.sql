-- =====================================================================
-- WCE VIRTUAL LAB — COMPLETE AZURE POSTGRESQL PRODUCTION SCHEMA
-- =====================================================================
-- Target Database : wce_virtual_lab (Azure Database for PostgreSQL)
-- Compatibility   : PostgreSQL 14, 15, 16+
-- Safe execution  : Fully idempotent (IF NOT EXISTS & DO $$ BEGIN blocks)
--                   Does NOT drop databases, tables, or existing records.
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- 1. ENUM TYPES
-- ─────────────────────────────────────────────────────────────────────

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

DO $$ BEGIN
    CREATE TYPE quiz_type_enum AS ENUM ('prerequisite', 'subtopic', 'final');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE assessment_type_enum AS ENUM ('topic', 'subtopic', 'lab', 'assignment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ─────────────────────────────────────────────────────────────────────
-- 2. USERS & PROFILES (with Registration Approval Workflow)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    approval_status VARCHAR(20) NOT NULL DEFAULT 'approved'
        CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    approval_decision_at TIMESTAMP,
    approval_decision_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student (
    student_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL
        REFERENCES users(user_id) ON DELETE CASCADE,
    roll_number VARCHAR(30) UNIQUE NOT NULL,
    course VARCHAR(100),
    year INT,
    phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS faculty (
    faculty_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL
        REFERENCES users(user_id) ON DELETE CASCADE,
    designation VARCHAR(100),
    department VARCHAR(100),
    specialization VARCHAR(100),
    phone VARCHAR(20)
);


-- ─────────────────────────────────────────────────────────────────────
-- 3. ROOMS & STUDENT ENROLLMENTS
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rooms (
    room_id SERIAL PRIMARY KEY,
    faculty_id INT NOT NULL
        REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    room_name VARCHAR(150) NOT NULL,
    room_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_rooms (
    student_room_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL
        REFERENCES student(student_id) ON DELETE CASCADE,
    room_id INT NOT NULL
        REFERENCES rooms(room_id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, room_id)
);


-- ─────────────────────────────────────────────────────────────────────
-- 4. CURRICULUM TOPICS, SUBTOPICS & THEORY CONTENT
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS topics (
    topic_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subtopics (
    subtopic_id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    order_index INT,
    is_published BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS subtopic_content (
    content_id SERIAL PRIMARY KEY,
    subtopic_id INT NOT NULL
        REFERENCES subtopics(subtopic_id) ON DELETE CASCADE,
    aim TEXT,
    theory TEXT,
    video_explanation_url TEXT,
    time_limit INT DEFAULT 15
);

CREATE TABLE IF NOT EXISTS topic_video_references (
    video_id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    channel_name VARCHAR(150) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    order_index INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_topics (
    room_topic_id SERIAL PRIMARY KEY,
    room_id INT NOT NULL
        REFERENCES rooms(room_id) ON DELETE CASCADE,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id) ON DELETE CASCADE,
    order_index INT,
    UNIQUE(room_id, topic_id)
);


-- ─────────────────────────────────────────────────────────────────────
-- 5. STUDENT LEARNING PROGRESS
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS progress (
    progress_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL
        REFERENCES student(student_id) ON DELETE CASCADE,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id) ON DELETE CASCADE,
    status progress_status DEFAULT 'Not Started',
    time_spent INT DEFAULT 0,
    last_accessed TIMESTAMP,
    UNIQUE(student_id, topic_id)
);

CREATE TABLE IF NOT EXISTS subtopic_progress (
    subtopic_progress_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL
        REFERENCES student(student_id) ON DELETE CASCADE,
    subtopic_id INT NOT NULL
        REFERENCES subtopics(subtopic_id) ON DELETE CASCADE,
    aim_viewed BOOLEAN DEFAULT FALSE,
    theory_viewed BOOLEAN DEFAULT FALSE,
    video_viewed BOOLEAN DEFAULT FALSE,
    status progress_status DEFAULT 'Not Started',
    time_spent INT DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subtopic_id)
);


-- ─────────────────────────────────────────────────────────────────────
-- 6. PREREQUISITES & TOPIC QUIZZES
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS prerequisite (
    prereq_id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id) ON DELETE CASCADE,
    description TEXT,
    content TEXT,
    order_index INT
);

CREATE TABLE IF NOT EXISTS prerequisite_quiz (
    prereq_quiz_id SERIAL PRIMARY KEY,
    prereq_id INT NOT NULL
        REFERENCES prerequisite(prereq_id) ON DELETE CASCADE,
    title VARCHAR(200),
    total_marks INT,
    passing_criteria INT,
    time_limit INT DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prerequisite_quiz_questions (
    pq_question_id SERIAL PRIMARY KEY,
    prereq_quiz_id INT NOT NULL
        REFERENCES prerequisite_quiz(prereq_quiz_id) ON DELETE CASCADE,
    question_text TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option CHAR(1),
    marks INT,
    order_index INT
);

CREATE TABLE IF NOT EXISTS final_quiz (
    final_quiz_id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id) ON DELETE CASCADE,
    title VARCHAR(200),
    total_marks INT,
    time_limit INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS final_quiz_questions (
    fq_question_id SERIAL PRIMARY KEY,
    final_quiz_id INT NOT NULL
        REFERENCES final_quiz(final_quiz_id) ON DELETE CASCADE,
    question_text TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option CHAR(1),
    marks INT,
    order_index INT
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    attempt_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL
        REFERENCES student(student_id) ON DELETE CASCADE,
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


-- ─────────────────────────────────────────────────────────────────────
-- 7. TOPIC & SUBTOPIC CODING ASSESSMENTS
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS topic_coding_assessment (
    tca_id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id) ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    total_marks INT,
    time_limit INT
);

CREATE TABLE IF NOT EXISTS tca_questions (
    tca_question_id SERIAL PRIMARY KEY,
    tca_id INT NOT NULL
        REFERENCES topic_coding_assessment(tca_id) ON DELETE CASCADE,
    title VARCHAR(200),
    problem_statement TEXT,
    constraints TEXT,
    sample_input TEXT,
    sample_output TEXT,
    marks INT,
    order_index INT
);

CREATE TABLE IF NOT EXISTS tca_test_cases (
    tca_testcase_id SERIAL PRIMARY KEY,
    tca_question_id INT NOT NULL
        REFERENCES tca_questions(tca_question_id) ON DELETE CASCADE,
    input TEXT,
    expected_output TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    order_index INT
);

CREATE TABLE IF NOT EXISTS subtopic_coding_assessment (
    scca_id SERIAL PRIMARY KEY,
    content_id INT NOT NULL
        REFERENCES subtopic_content(content_id) ON DELETE CASCADE,
    title VARCHAR(200),
    problem_statement TEXT,
    constraints TEXT,
    sample_input TEXT,
    sample_output TEXT,
    marks INT,
    order_index INT
);

CREATE TABLE IF NOT EXISTS subtopic_coding_test_cases (
    scca_testcase_id SERIAL PRIMARY KEY,
    scca_id INT NOT NULL
        REFERENCES subtopic_coding_assessment(scca_id) ON DELETE CASCADE,
    input TEXT,
    expected_output TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    order_index INT
);

CREATE TABLE IF NOT EXISTS subtopic_quiz_questions (
    stq_id SERIAL PRIMARY KEY,
    content_id INT NOT NULL
        REFERENCES subtopic_content(content_id) ON DELETE CASCADE,
    question_text TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option CHAR(1),
    marks INT,
    order_index INT
);


-- ─────────────────────────────────────────────────────────────────────
-- 8. FEEDBACK & CODING SUBMISSIONS
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subtopic_feedback (
    feedback_id SERIAL PRIMARY KEY,
    content_id INT NOT NULL
        REFERENCES subtopic_content(content_id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topic_feedback (
    feedback_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL
        REFERENCES student(student_id) ON DELETE CASCADE,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, topic_id)
);

CREATE TABLE IF NOT EXISTS coding_submissions (
    submission_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL
        REFERENCES student(student_id) ON DELETE CASCADE,
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


-- ─────────────────────────────────────────────────────────────────────
-- 9. ROOM-BASED LAB ASSESSMENTS & QUESTION BANKS (CODING + MCQ)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lab_assessment (
    lab_id SERIAL PRIMARY KEY,
    faculty_id INT NOT NULL
        REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    room_id INT NOT NULL
        REFERENCES rooms(room_id) ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration INT,
    total_marks INT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'active', 'completed', 'cancelled')),
    allocation_mode VARCHAR(30) NOT NULL DEFAULT 'random'
        CHECK (allocation_mode IN ('specific', 'random', 'hybrid')),
    num_questions INT NOT NULL DEFAULT 5,
    num_coding_questions INT NOT NULL DEFAULT 3,
    num_mcq_questions INT NOT NULL DEFAULT 0,
    marks_per_question INT NOT NULL DEFAULT 10,
    marks_per_mcq INT NOT NULL DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coding Question Bank
CREATE TABLE IF NOT EXISTS lab_coding_questions (
    lab_question_id SERIAL PRIMARY KEY,
    topic_id INT
        REFERENCES topics(topic_id) ON DELETE SET NULL,
    subtopic_id INT
        REFERENCES subtopics(subtopic_id) ON DELETE SET NULL,
    lab_id INT
        REFERENCES lab_assessment(lab_id) ON DELETE CASCADE,
    title VARCHAR(300),
    problem_statement TEXT,
    input_format TEXT,
    output_format TEXT,
    constraints TEXT,
    sample_input TEXT,
    sample_output TEXT,
    explanation TEXT,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (difficulty IN ('easy', 'medium', 'hard')),
    marks INT NOT NULL DEFAULT 10,
    order_index INT,
    created_by_faculty_id INT
        REFERENCES faculty(faculty_id) ON DELETE SET NULL,
    supported_languages JSONB DEFAULT '["c", "cpp", "java", "python"]'::jsonb,
    is_archived BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'published', 'archived')),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_test_cases (
    lab_testcase_id SERIAL PRIMARY KEY,
    lab_question_id INT NOT NULL
        REFERENCES lab_coding_questions(lab_question_id) ON DELETE CASCADE,
    input TEXT,
    expected_output TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    order_index INT
);

-- Assessment ↔ Topics Many-to-Many
CREATE TABLE IF NOT EXISTS la_assessment_topics (
    id SERIAL PRIMARY KEY,
    lab_id INT NOT NULL
        REFERENCES lab_assessment(lab_id) ON DELETE CASCADE,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id) ON DELETE CASCADE,
    UNIQUE(lab_id, topic_id)
);

-- Selected Coding Questions (Mode A)
CREATE TABLE IF NOT EXISTS la_selected_questions (
    id SERIAL PRIMARY KEY,
    lab_id INT NOT NULL
        REFERENCES lab_assessment(lab_id) ON DELETE CASCADE,
    lab_question_id INT NOT NULL
        REFERENCES lab_coding_questions(lab_question_id) ON DELETE CASCADE,
    question_order INT NOT NULL DEFAULT 1,
    UNIQUE(lab_id, lab_question_id)
);

-- Student Coding Question Allocations (Immutable per attempt)
CREATE TABLE IF NOT EXISTS la_student_allocations (
    allocation_id SERIAL PRIMARY KEY,
    lab_id INT NOT NULL
        REFERENCES lab_assessment(lab_id) ON DELETE CASCADE,
    student_id INT NOT NULL
        REFERENCES student(student_id) ON DELETE CASCADE,
    lab_question_id INT NOT NULL
        REFERENCES lab_coding_questions(lab_question_id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    is_manual BOOLEAN NOT NULL DEFAULT FALSE,
    allocated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lab_id, student_id, lab_question_id)
);

-- Student Assessment Attempt Sessions
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
        CHECK (status IN ('in_progress', 'submitted', 'timed_out', 'expired')),
    total_marks INT NOT NULL DEFAULT 0,
    obtained_marks INT NOT NULL DEFAULT 0,
    UNIQUE(lab_id, student_id)
);

-- Student Coding Submissions within Attempt
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

-- MCQ Question Bank for Lab Assessments
CREATE TABLE IF NOT EXISTS lab_mcq_questions (
    mcq_id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL
        REFERENCES topics(topic_id) ON DELETE CASCADE,
    subtopic_id INT
        REFERENCES subtopics(subtopic_id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option CHAR(1) NOT NULL
        CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (difficulty IN ('easy', 'medium', 'hard')),
    marks INT NOT NULL DEFAULT 2,
    status VARCHAR(20) NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'published', 'archived')),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_faculty_id INT
        REFERENCES faculty(faculty_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Selected MCQs for Lab Assessment (Mode A)
CREATE TABLE IF NOT EXISTS la_selected_mcqs (
    id SERIAL PRIMARY KEY,
    lab_id INT NOT NULL
        REFERENCES lab_assessment(lab_id) ON DELETE CASCADE,
    mcq_id INT NOT NULL
        REFERENCES lab_mcq_questions(mcq_id) ON DELETE CASCADE,
    question_order INT NOT NULL DEFAULT 1,
    UNIQUE(lab_id, mcq_id)
);

-- Student MCQ Allocations (Immutable per attempt)
CREATE TABLE IF NOT EXISTS la_student_mcq_allocations (
    allocation_id SERIAL PRIMARY KEY,
    lab_id INT NOT NULL
        REFERENCES lab_assessment(lab_id) ON DELETE CASCADE,
    student_id INT NOT NULL
        REFERENCES student(student_id) ON DELETE CASCADE,
    mcq_id INT NOT NULL
        REFERENCES lab_mcq_questions(mcq_id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    is_manual BOOLEAN NOT NULL DEFAULT FALSE,
    allocated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lab_id, student_id, mcq_id)
);

-- Student MCQ Submissions within Attempt
CREATE TABLE IF NOT EXISTS la_mcq_submissions (
    submission_id SERIAL PRIMARY KEY,
    attempt_id INT NOT NULL
        REFERENCES la_attempts(attempt_id) ON DELETE CASCADE,
    mcq_id INT NOT NULL
        REFERENCES lab_mcq_questions(mcq_id) ON DELETE CASCADE,
    selected_option CHAR(1)
        CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN DEFAULT FALSE,
    marks_obtained INT NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attempt_id, mcq_id)
);


-- ─────────────────────────────────────────────────────────────────────
-- 10. ASSIGNMENTS & HOMEWORK SUBMISSIONS
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assignments (
    assignment_id SERIAL PRIMARY KEY,
    faculty_id INT NOT NULL
        REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    deadline TIMESTAMP,
    total_marks INT
);

CREATE TABLE IF NOT EXISTS assignment_questions (
    asg_question_id SERIAL PRIMARY KEY,
    assignment_id INT NOT NULL
        REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    problem_statement TEXT,
    constraints TEXT,
    marks INT,
    order_index INT
);

CREATE TABLE IF NOT EXISTS assignment_test_cases (
    asg_testcase_id SERIAL PRIMARY KEY,
    asg_question_id INT NOT NULL
        REFERENCES assignment_questions(asg_question_id) ON DELETE CASCADE,
    input TEXT,
    expected_output TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    order_index INT
);


-- ─────────────────────────────────────────────────────────────────────
-- 11. PASSWORD RESET RECOVERY TOKENS
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL
        REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ─────────────────────────────────────────────────────────────────────
-- 12. EXPRESS SESSION STORE (connect-pg-simple)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "session" (
    "sid" VARCHAR NOT NULL COLLATE "default",
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);


-- ─────────────────────────────────────────────────────────────────────
-- 13. INDEXES FOR QUERY OPTIMIZATION
-- ─────────────────────────────────────────────────────────────────────

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, approval_status);

-- Student & Faculty
CREATE INDEX IF NOT EXISTS idx_student_user ON student(user_id);
CREATE INDEX IF NOT EXISTS idx_student_roll ON student(roll_number);
CREATE INDEX IF NOT EXISTS idx_faculty_user ON faculty(user_id);

-- Rooms
CREATE INDEX IF NOT EXISTS idx_rooms_faculty ON rooms(faculty_id);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_student_rooms_student ON student_rooms(student_id);
CREATE INDEX IF NOT EXISTS idx_student_rooms_room ON student_rooms(room_id);
CREATE INDEX IF NOT EXISTS idx_room_topics_room ON room_topics(room_id);
CREATE INDEX IF NOT EXISTS idx_room_topics_topic ON room_topics(topic_id);

-- Topics, Subtopics & Videos
CREATE INDEX IF NOT EXISTS idx_subtopics_topic ON subtopics(topic_id);
CREATE INDEX IF NOT EXISTS idx_content_subtopic ON subtopic_content(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_topic_videos_topic ON topic_video_references(topic_id);

-- Progress
CREATE INDEX IF NOT EXISTS idx_progress_student ON progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_topic ON progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_subtopic_progress_student ON subtopic_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_subtopic_progress_subtopic ON subtopic_progress(subtopic_id);

-- Quizzes
CREATE INDEX IF NOT EXISTS idx_prerequisite_topic ON prerequisite(topic_id);
CREATE INDEX IF NOT EXISTS idx_pq_questions_quiz ON prerequisite_quiz_questions(prereq_quiz_id);
CREATE INDEX IF NOT EXISTS idx_final_quiz_topic ON final_quiz(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_ref ON quiz_attempts(quiz_type, quiz_ref_id);

-- Coding Assessments
CREATE INDEX IF NOT EXISTS idx_tca_topic ON topic_coding_assessment(topic_id);
CREATE INDEX IF NOT EXISTS idx_tca_questions_tca ON tca_questions(tca_id);
CREATE INDEX IF NOT EXISTS idx_tca_testcases_q ON tca_test_cases(tca_question_id);
CREATE INDEX IF NOT EXISTS idx_scca_testcases_q ON subtopic_coding_test_cases(scca_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_student ON coding_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_ref ON coding_submissions(assessment_type, assessment_ref_id);

-- Feedback
CREATE INDEX IF NOT EXISTS idx_topic_feedback_student ON topic_feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_topic_feedback_topic ON topic_feedback(topic_id);

-- Lab Assessments & Question Banks
CREATE INDEX IF NOT EXISTS idx_lab_assessment_faculty ON lab_assessment(faculty_id);
CREATE INDEX IF NOT EXISTS idx_lab_assessment_room ON lab_assessment(room_id);
CREATE INDEX IF NOT EXISTS idx_lab_questions_topic ON lab_coding_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_lab_questions_subtopic ON lab_coding_questions(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_lab_questions_faculty ON lab_coding_questions(created_by_faculty_id);
CREATE INDEX IF NOT EXISTS idx_lab_questions_status ON lab_coding_questions(status);
CREATE INDEX IF NOT EXISTS idx_lab_questions_published ON lab_coding_questions(is_published);
CREATE INDEX IF NOT EXISTS idx_lab_questions_archived ON lab_coding_questions(is_archived);
CREATE INDEX IF NOT EXISTS idx_la_topics_lab ON la_assessment_topics(lab_id);
CREATE INDEX IF NOT EXISTS idx_la_topics_topic ON la_assessment_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_la_sel_q_lab ON la_selected_questions(lab_id);
CREATE INDEX IF NOT EXISTS idx_la_sel_q_question ON la_selected_questions(lab_question_id);
CREATE INDEX IF NOT EXISTS idx_la_alloc_lab_student ON la_student_allocations(lab_id, student_id);
CREATE INDEX IF NOT EXISTS idx_la_attempts_lab_student ON la_attempts(lab_id, student_id);
CREATE INDEX IF NOT EXISTS idx_la_attempts_student ON la_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_la_qsub_attempt ON la_question_submissions(attempt_id);

-- Lab MCQ Question Bank & Allocations
CREATE INDEX IF NOT EXISTS idx_lab_mcq_topic ON lab_mcq_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_lab_mcq_status ON lab_mcq_questions(status);
CREATE INDEX IF NOT EXISTS idx_lab_mcq_published ON lab_mcq_questions(is_published);
CREATE INDEX IF NOT EXISTS idx_lab_mcq_faculty ON lab_mcq_questions(created_by_faculty_id);
CREATE INDEX IF NOT EXISTS idx_la_sel_mcq_lab ON la_selected_mcqs(lab_id);
CREATE INDEX IF NOT EXISTS idx_la_sel_mcq_mcq ON la_selected_mcqs(mcq_id);
CREATE INDEX IF NOT EXISTS idx_la_mcq_alloc_lab_student ON la_student_mcq_allocations(lab_id, student_id);
CREATE INDEX IF NOT EXISTS idx_la_mcq_alloc_mcq ON la_student_mcq_allocations(mcq_id);
CREATE INDEX IF NOT EXISTS idx_la_mcq_sub_attempt ON la_mcq_submissions(attempt_id);
CREATE INDEX IF NOT EXISTS idx_la_mcq_sub_mcq ON la_mcq_submissions(mcq_id);

-- Assignments
CREATE INDEX IF NOT EXISTS idx_assignment_faculty ON assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_asg_questions_asg ON assignment_questions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_asg_testcases_q ON assignment_test_cases(asg_question_id);

-- Password Reset & Session
CREATE INDEX IF NOT EXISTS idx_pwd_reset_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_pwd_reset_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");


-- ─────────────────────────────────────────────────────────────────────
-- 14. CURRICULUM TOPICS CATALOGUE (Idempotent Seed)
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO topics (title, description)
SELECT 'Introduction to Data Structures and Algorithms', 'Foundational concepts of data structures, abstract data types, memory representations, and fundamental algorithms.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Introduction to Data Structures and Algorithms');

INSERT INTO topics (title, description)
SELECT 'Complexity Analysis', 'Asymptotic notations (Big O, Omega, Theta), time complexity, space complexity, and recurrence relation analysis.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Complexity Analysis');

INSERT INTO topics (title, description)
SELECT 'Arrays', 'Linear contiguous memory data structures, traversal, two-pointer techniques, prefix sums, and sliding window algorithms.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Arrays');

INSERT INTO topics (title, description)
SELECT 'Strings', 'Character sequences, string manipulation, pattern matching, palindrome validation, and frequency hashing.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Strings');

INSERT INTO topics (title, description)
SELECT 'Linked Lists', 'Singly linked lists, doubly linked lists, circular lists, pointer manipulation, reversal, and cycle detection.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Linked Lists');

INSERT INTO topics (title, description)
SELECT 'Stacks', 'Last-In First-Out (LIFO) abstract data type, stack implementations, parentheses validation, and monotonic stacks.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Stacks');

INSERT INTO topics (title, description)
SELECT 'Queues', 'First-In First-Out (FIFO) structures, circular queues, deques, priority queues, and sliding window buffers.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Queues');

INSERT INTO topics (title, description)
SELECT 'Recursion', 'Recursive function calls, base cases, call stacks, divide-and-conquer principles, and backtracking.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Recursion');

INSERT INTO topics (title, description)
SELECT 'Searching Algorithms', 'Linear search, binary search on sorted collections, search space optimization, and ternary search.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Searching Algorithms');

INSERT INTO topics (title, description)
SELECT 'Sorting Algorithms', 'Comparison-based sorting (Bubble, Insertion, Selection, Merge, Quick, Heap sort) and non-comparison sorting.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Sorting Algorithms');

INSERT INTO topics (title, description)
SELECT 'Hashing', 'Hash tables, hash functions, collision resolution (chaining, open addressing), and frequency counting.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Hashing');

INSERT INTO topics (title, description)
SELECT 'Trees', 'Hierarchical data structures, binary trees, tree traversals (inorder, preorder, postorder, level-order), height, and diameter.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Trees');

INSERT INTO topics (title, description)
SELECT 'Binary Search Trees', 'Ordered binary trees, BST search, insertion, deletion, range queries, and BST property validation.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Binary Search Trees');

INSERT INTO topics (title, description)
SELECT 'Heaps and Priority Queues', 'Min-heaps, max-heaps, heapify operations, priority queues, and Top-K elements optimization.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Heaps and Priority Queues');

INSERT INTO topics (title, description)
SELECT 'Graphs', 'Vertices and edges representations (adjacency matrix, list), BFS, DFS, cycle detection, connected components, and shortest paths.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Graphs');

INSERT INTO topics (title, description)
SELECT 'Greedy Algorithms', 'Greedy choice property, interval scheduling, fractional knapsack, activity selection, and Huffman encoding.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Greedy Algorithms');

INSERT INTO topics (title, description)
SELECT 'Dynamic Programming', 'Overlapping subproblems, optimal substructure, memoization, tabulation, and standard DP optimizations.'
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Dynamic Programming');

-- =====================================================================
-- END OF AZURE POSTGRESQL PRODUCTION SCHEMA
-- =====================================================================
