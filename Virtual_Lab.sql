
CREATE TYPE user_role AS ENUM ('student','faculty');
CREATE TYPE progress_status AS ENUM ('Not Started','In Progress','Completed');

CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);


CREATE TABLE student(
    student_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    roll_number VARCHAR(30) UNIQUE NOT NULL,
    course VARCHAR(100),
    year INT,
    phone VARCHAR(20)
);

CREATE TABLE faculty(
    faculty_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    designation VARCHAR(100),
    department VARCHAR(100),
    specialization VARCHAR(100),
    phone VARCHAR(20)
);

CREATE TABLE topics(
    topic_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subtopics(
    subtopic_id SERIAL PRIMARY KEY,
    topic_id INT REFERENCES topics(topic_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    order_index INT,
    is_published BOOLEAN DEFAULT TRUE
);

CREATE TABLE subtopic_content(
    content_id SERIAL PRIMARY KEY,
    subtopic_id INT REFERENCES subtopics(subtopic_id) ON DELETE CASCADE,
    aim TEXT,
    theory TEXT,
    video_explanation_url TEXT
);

CREATE TABLE progress(
    progress_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(student_id) ON DELETE CASCADE,
    topic_id INT REFERENCES topics(topic_id) ON DELETE CASCADE,
    status progress_status DEFAULT 'Not Started',
    time_spent INT DEFAULT 0,
    last_accessed TIMESTAMP,
    UNIQUE(student_id, topic_id)
);

CREATE TABLE prerequisite(
    prereq_id SERIAL PRIMARY KEY,
    topic_id INT REFERENCES topics(topic_id) ON DELETE CASCADE,
    description TEXT,
    content TEXT,
    order_index INT
);

CREATE TABLE prerequisite_quiz(
    prereq_quiz_id SERIAL PRIMARY KEY,
    prereq_id INT REFERENCES prerequisite(prereq_id) ON DELETE CASCADE,
    title VARCHAR(200),
    total_marks INT,
    passing_criteria INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE final_quiz(
    final_quiz_id SERIAL PRIMARY KEY,
    topic_id INT REFERENCES topics(topic_id) ON DELETE CASCADE,
    title VARCHAR(200),
    total_marks INT,
    time_limit INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE final_quiz_questions(
    fq_question_id SERIAL PRIMARY KEY,
    final_quiz_id INT REFERENCES final_quiz(final_quiz_id) ON DELETE CASCADE,
    question_text TEXT,
    option_a TEXT, option_b TEXT, option_c TEXT, option_d TEXT,
    correct_option CHAR(1),
    marks INT,
    order_index INT
);

CREATE TABLE topic_coding_assessment(
    tca_id SERIAL PRIMARY KEY,
    topic_id INT REFERENCES topics(topic_id) ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    total_marks INT,
    time_limit INT
);

CREATE TABLE tca_questions(
    tca_question_id SERIAL PRIMARY KEY,
    tca_id INT REFERENCES topic_coding_assessment(tca_id) ON DELETE CASCADE,
    problem_statement TEXT,
    constraints TEXT,
    sample_input TEXT,
    sample_output TEXT,
    marks INT,
    order_index INT
);

CREATE TABLE subtopic_coding_assessment(
    scca_id SERIAL PRIMARY KEY,
    content_id INT REFERENCES subtopic_content(content_id) ON DELETE CASCADE,
    problem_statement TEXT,
    constraints TEXT,
    sample_input TEXT,
    sample_output TEXT,
    marks INT,
    order_index INT
);

CREATE TABLE subtopic_quiz_questions(
    stq_id SERIAL PRIMARY KEY,
    content_id INT REFERENCES subtopic_content(content_id) ON DELETE CASCADE,
    question_text TEXT,
    option_a TEXT, option_b TEXT, option_c TEXT, option_d TEXT,
    correct_option CHAR(1),
    marks INT,
    order_index INT
);

CREATE TABLE subtopic_feedback(
    feedback_id SERIAL PRIMARY KEY,
    content_id INT REFERENCES subtopic_content(content_id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lab_assessment(
    lab_id SERIAL PRIMARY KEY,
    faculty_id INT REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration INT,
    total_marks INT
);

CREATE TABLE lab_coding_questions(
    lab_question_id SERIAL PRIMARY KEY,
    lab_id INT REFERENCES lab_assessment(lab_id) ON DELETE CASCADE,
    problem_statement TEXT,
    constraints TEXT,
    marks INT,
    order_index INT
);

CREATE TABLE lab_test_cases(
    lab_testcase_id SERIAL PRIMARY KEY,
    lab_question_id INT REFERENCES lab_coding_questions(lab_question_id) ON DELETE CASCADE,
    input TEXT,
    expected_output TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    order_index INT
);

CREATE TABLE assignments(
    assignment_id SERIAL PRIMARY KEY,
    faculty_id INT REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    deadline TIMESTAMP,
    total_marks INT
);

CREATE TABLE assignment_questions(
    asg_question_id SERIAL PRIMARY KEY,
    assignment_id INT REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    problem_statement TEXT,
    constraints TEXT,
    marks INT,
    order_index INT
);

CREATE TABLE assignment_test_cases(
    asg_testcase_id SERIAL PRIMARY KEY,
    asg_question_id INT REFERENCES assignment_questions(asg_question_id) ON DELETE CASCADE,
    input TEXT,
    expected_output TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    order_index INT
);

CREATE INDEX idx_progress_student ON progress(student_id);
CREATE INDEX idx_subtopics_topic ON subtopics(topic_id);
CREATE INDEX idx_content_subtopic ON subtopic_content(subtopic_id);



ALTER TABLE student
ADD CONSTRAINT fk_student_user
FOREIGN KEY (user_id)
REFERENCES users(user_id)
ON DELETE CASCADE

ALTER TABLE faculty
ADD CONSTRAINT fk_faculty_user
FOREIGN KEY (user_id)
REFERENCES users(user_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE subtopics
ADD CONSTRAINT fk_subtopic_topic
FOREIGN KEY (topic_id)
REFERENCES topics(topic_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE subtopic_content
ADD CONSTRAINT fk_content_subtopic
FOREIGN KEY (subtopic_id)
REFERENCES subtopics(subtopic_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE prerequisite
ADD CONSTRAINT fk_prerequisite_topic
FOREIGN KEY (topic_id)
REFERENCES topics(topic_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE prerequisite_quiz
ADD CONSTRAINT fk_prerequisite_quiz
FOREIGN KEY (prereq_id)
REFERENCES prerequisite(prereq_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE final_quiz
ADD CONSTRAINT fk_finalquiz_topic
FOREIGN KEY (topic_id)
REFERENCES topics(topic_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE final_quiz_questions
ADD CONSTRAINT fk_finalquiz_question
FOREIGN KEY (final_quiz_id)
REFERENCES final_quiz(final_quiz_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE topic_coding_assessment
ADD CONSTRAINT fk_tca_topic
FOREIGN KEY (topic_id)
REFERENCES topics(topic_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE tca_questions
ADD CONSTRAINT fk_tca_question
FOREIGN KEY (tca_id)
REFERENCES topic_coding_assessment(tca_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE subtopic_coding_assessment
ADD CONSTRAINT fk_subtopic_assessment
FOREIGN KEY (content_id)
REFERENCES subtopic_content(content_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE subtopic_quiz_questions
ADD CONSTRAINT fk_subtopic_quiz
FOREIGN KEY (content_id)
REFERENCES subtopic_content(content_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE subtopic_feedback
ADD CONSTRAINT fk_subtopic_feedback
FOREIGN KEY (content_id)
REFERENCES subtopic_content(content_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE progress
ADD CONSTRAINT fk_progress_student
FOREIGN KEY (student_id)
REFERENCES student(student_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE progress
ADD CONSTRAINT fk_progress_topic
FOREIGN KEY (topic_id)
REFERENCES topics(topic_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE lab_assessment
ADD CONSTRAINT fk_lab_faculty
FOREIGN KEY (faculty_id)
REFERENCES faculty(faculty_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE lab_coding_questions
ADD CONSTRAINT fk_lab_question
FOREIGN KEY (lab_id)
REFERENCES lab_assessment(lab_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE lab_test_cases
ADD CONSTRAINT fk_lab_testcase
FOREIGN KEY (lab_question_id)
REFERENCES lab_coding_questions(lab_question_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE assignments
ADD CONSTRAINT fk_assignment_faculty
FOREIGN KEY (faculty_id)
REFERENCES faculty(faculty_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE assignment_questions
ADD CONSTRAINT fk_assignment_question
FOREIGN KEY (assignment_id)
REFERENCES assignments(assignment_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE assignment_test_cases
ADD CONSTRAINT fk_assignment_testcase
FOREIGN KEY (asg_question_id)
REFERENCES assignment_questions(asg_question_id)
ON DELETE CASCADE
ON UPDATE CASCADE;




























