--
-- PostgreSQL database dump
--

\restrict s32NmSgVcoJpdwCz1IKfSMf6pPbSDi26pRIrQomMNLTnDC0nDQ7jzIOHQT3YrjG

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: assessment_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.assessment_type_enum AS ENUM (
    'topic',
    'subtopic',
    'lab',
    'assignment'
);


--
-- Name: progress_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.progress_status AS ENUM (
    'Not Started',
    'In Progress',
    'Completed'
);


--
-- Name: quiz_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quiz_type_enum AS ENUM (
    'prerequisite',
    'subtopic',
    'final'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'student',
    'faculty',
    'admin'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assignment_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignment_questions (
    asg_question_id integer NOT NULL,
    assignment_id integer NOT NULL,
    problem_statement text,
    constraints text,
    marks integer,
    order_index integer
);


--
-- Name: assignment_questions_asg_question_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assignment_questions_asg_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assignment_questions_asg_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assignment_questions_asg_question_id_seq OWNED BY public.assignment_questions.asg_question_id;


--
-- Name: assignment_test_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignment_test_cases (
    asg_testcase_id integer NOT NULL,
    asg_question_id integer NOT NULL,
    input text,
    expected_output text,
    is_hidden boolean DEFAULT false,
    order_index integer
);


--
-- Name: assignment_test_cases_asg_testcase_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assignment_test_cases_asg_testcase_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assignment_test_cases_asg_testcase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assignment_test_cases_asg_testcase_id_seq OWNED BY public.assignment_test_cases.asg_testcase_id;


--
-- Name: assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignments (
    assignment_id integer NOT NULL,
    faculty_id integer NOT NULL,
    title character varying(200),
    description text,
    deadline timestamp without time zone,
    total_marks integer
);


--
-- Name: assignments_assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assignments_assignment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assignments_assignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assignments_assignment_id_seq OWNED BY public.assignments.assignment_id;


--
-- Name: coding_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coding_submissions (
    submission_id integer NOT NULL,
    student_id integer NOT NULL,
    assessment_type public.assessment_type_enum DEFAULT 'topic'::public.assessment_type_enum NOT NULL,
    assessment_ref_id integer NOT NULL,
    question_id integer,
    source_code text,
    language character varying(50) DEFAULT 'cpp'::character varying,
    status character varying(50) DEFAULT 'Completed'::character varying,
    score integer DEFAULT 0,
    total_marks integer DEFAULT 0,
    questions_solved integer DEFAULT 0,
    total_questions integer DEFAULT 0,
    percentage numeric(5,2) DEFAULT 0,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: coding_submissions_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.coding_submissions_submission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coding_submissions_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.coding_submissions_submission_id_seq OWNED BY public.coding_submissions.submission_id;


--
-- Name: faculty; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faculty (
    faculty_id integer NOT NULL,
    user_id integer NOT NULL,
    designation character varying(100),
    department character varying(100),
    specialization character varying(100),
    phone character varying(20)
);


--
-- Name: faculty_faculty_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faculty_faculty_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faculty_faculty_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faculty_faculty_id_seq OWNED BY public.faculty.faculty_id;


--
-- Name: final_quiz; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.final_quiz (
    final_quiz_id integer NOT NULL,
    topic_id integer NOT NULL,
    title character varying(200),
    total_marks integer,
    time_limit integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: final_quiz_final_quiz_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.final_quiz_final_quiz_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: final_quiz_final_quiz_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.final_quiz_final_quiz_id_seq OWNED BY public.final_quiz.final_quiz_id;


--
-- Name: final_quiz_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.final_quiz_questions (
    fq_question_id integer NOT NULL,
    final_quiz_id integer NOT NULL,
    question_text text,
    option_a text,
    option_b text,
    option_c text,
    option_d text,
    correct_option character(1),
    marks integer,
    order_index integer
);


--
-- Name: final_quiz_questions_fq_question_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.final_quiz_questions_fq_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: final_quiz_questions_fq_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.final_quiz_questions_fq_question_id_seq OWNED BY public.final_quiz_questions.fq_question_id;


--
-- Name: la_assessment_topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.la_assessment_topics (
    id integer NOT NULL,
    lab_id integer NOT NULL,
    topic_id integer NOT NULL
);


--
-- Name: la_assessment_topics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.la_assessment_topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: la_assessment_topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.la_assessment_topics_id_seq OWNED BY public.la_assessment_topics.id;


--
-- Name: la_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.la_attempts (
    attempt_id integer NOT NULL,
    lab_id integer NOT NULL,
    student_id integer NOT NULL,
    started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    effective_deadline timestamp with time zone NOT NULL,
    submitted_at timestamp with time zone,
    status character varying(20) DEFAULT 'in_progress'::character varying NOT NULL,
    total_marks integer DEFAULT 0 NOT NULL,
    obtained_marks integer DEFAULT 0 NOT NULL,
    CONSTRAINT la_attempts_status_check CHECK (((status)::text = ANY ((ARRAY['in_progress'::character varying, 'submitted'::character varying, 'timed_out'::character varying, 'expired'::character varying])::text[])))
);


--
-- Name: la_attempts_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.la_attempts_attempt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: la_attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.la_attempts_attempt_id_seq OWNED BY public.la_attempts.attempt_id;


--
-- Name: la_mcq_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.la_mcq_submissions (
    submission_id integer NOT NULL,
    attempt_id integer NOT NULL,
    mcq_id integer NOT NULL,
    selected_option character(1),
    is_correct boolean DEFAULT false,
    marks_obtained integer DEFAULT 0 NOT NULL,
    submitted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT la_mcq_submissions_selected_option_check CHECK ((selected_option = ANY (ARRAY['A'::bpchar, 'B'::bpchar, 'C'::bpchar, 'D'::bpchar])))
);


--
-- Name: la_mcq_submissions_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.la_mcq_submissions_submission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: la_mcq_submissions_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.la_mcq_submissions_submission_id_seq OWNED BY public.la_mcq_submissions.submission_id;


--
-- Name: la_question_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.la_question_submissions (
    submission_id integer NOT NULL,
    attempt_id integer NOT NULL,
    lab_question_id integer NOT NULL,
    source_code text,
    language character varying(20),
    status character varying(30) DEFAULT 'not_attempted'::character varying NOT NULL,
    passed_test_cases integer DEFAULT 0 NOT NULL,
    total_test_cases integer DEFAULT 0 NOT NULL,
    marks_obtained integer DEFAULT 0 NOT NULL,
    submitted_at timestamp with time zone,
    CONSTRAINT la_question_submissions_status_check CHECK (((status)::text = ANY ((ARRAY['not_attempted'::character varying, 'attempted'::character varying, 'accepted'::character varying, 'partially_correct'::character varying, 'wrong_answer'::character varying, 'compilation_error'::character varying, 'runtime_error'::character varying, 'time_limit_exceeded'::character varying])::text[])))
);


--
-- Name: la_question_submissions_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.la_question_submissions_submission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: la_question_submissions_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.la_question_submissions_submission_id_seq OWNED BY public.la_question_submissions.submission_id;


--
-- Name: la_selected_mcqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.la_selected_mcqs (
    id integer NOT NULL,
    lab_id integer NOT NULL,
    mcq_id integer NOT NULL,
    question_order integer DEFAULT 1 NOT NULL
);


--
-- Name: la_selected_mcqs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.la_selected_mcqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: la_selected_mcqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.la_selected_mcqs_id_seq OWNED BY public.la_selected_mcqs.id;


--
-- Name: la_selected_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.la_selected_questions (
    id integer NOT NULL,
    lab_id integer NOT NULL,
    lab_question_id integer NOT NULL,
    question_order integer DEFAULT 1 NOT NULL
);


--
-- Name: la_selected_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.la_selected_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: la_selected_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.la_selected_questions_id_seq OWNED BY public.la_selected_questions.id;


--
-- Name: la_student_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.la_student_allocations (
    allocation_id integer NOT NULL,
    lab_id integer NOT NULL,
    student_id integer NOT NULL,
    lab_question_id integer NOT NULL,
    question_order integer NOT NULL,
    is_manual boolean DEFAULT false NOT NULL,
    allocated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: la_student_allocations_allocation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.la_student_allocations_allocation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: la_student_allocations_allocation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.la_student_allocations_allocation_id_seq OWNED BY public.la_student_allocations.allocation_id;


--
-- Name: la_student_mcq_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.la_student_mcq_allocations (
    allocation_id integer NOT NULL,
    lab_id integer NOT NULL,
    student_id integer NOT NULL,
    mcq_id integer NOT NULL,
    question_order integer NOT NULL,
    is_manual boolean DEFAULT false NOT NULL,
    allocated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: la_student_mcq_allocations_allocation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.la_student_mcq_allocations_allocation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: la_student_mcq_allocations_allocation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.la_student_mcq_allocations_allocation_id_seq OWNED BY public.la_student_mcq_allocations.allocation_id;


--
-- Name: lab_assessment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lab_assessment (
    lab_id integer NOT NULL,
    faculty_id integer NOT NULL,
    room_id integer NOT NULL,
    title character varying(200),
    description text,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    duration integer,
    total_marks integer,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    allocation_mode character varying(30) DEFAULT 'random'::character varying NOT NULL,
    num_questions integer DEFAULT 5 NOT NULL,
    num_coding_questions integer DEFAULT 3 NOT NULL,
    num_mcq_questions integer DEFAULT 0 NOT NULL,
    marks_per_question integer DEFAULT 10 NOT NULL,
    marks_per_mcq integer DEFAULT 2 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT lab_assessment_allocation_mode_check CHECK (((allocation_mode)::text = ANY ((ARRAY['specific'::character varying, 'random'::character varying, 'hybrid'::character varying])::text[]))),
    CONSTRAINT lab_assessment_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying, 'active'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: lab_assessment_lab_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lab_assessment_lab_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lab_assessment_lab_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lab_assessment_lab_id_seq OWNED BY public.lab_assessment.lab_id;


--
-- Name: lab_coding_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lab_coding_questions (
    lab_question_id integer NOT NULL,
    topic_id integer,
    subtopic_id integer,
    lab_id integer,
    title character varying(300),
    problem_statement text,
    input_format text,
    output_format text,
    constraints text,
    sample_input text,
    sample_output text,
    explanation text,
    difficulty character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    marks integer DEFAULT 10 NOT NULL,
    order_index integer,
    created_by_faculty_id integer,
    supported_languages jsonb DEFAULT '["c", "cpp", "java", "python"]'::jsonb,
    is_archived boolean DEFAULT false,
    status character varying(20) DEFAULT 'published'::character varying NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT lab_coding_questions_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying])::text[]))),
    CONSTRAINT lab_coding_questions_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying, 'archived'::character varying])::text[])))
);


--
-- Name: lab_coding_questions_lab_question_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lab_coding_questions_lab_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lab_coding_questions_lab_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lab_coding_questions_lab_question_id_seq OWNED BY public.lab_coding_questions.lab_question_id;


--
-- Name: lab_mcq_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lab_mcq_questions (
    mcq_id integer NOT NULL,
    topic_id integer NOT NULL,
    subtopic_id integer,
    question_text text NOT NULL,
    option_a text NOT NULL,
    option_b text NOT NULL,
    option_c text NOT NULL,
    option_d text NOT NULL,
    correct_option character(1) NOT NULL,
    explanation text,
    difficulty character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    marks integer DEFAULT 2 NOT NULL,
    status character varying(20) DEFAULT 'published'::character varying NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_by_faculty_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT lab_mcq_questions_correct_option_check CHECK ((correct_option = ANY (ARRAY['A'::bpchar, 'B'::bpchar, 'C'::bpchar, 'D'::bpchar]))),
    CONSTRAINT lab_mcq_questions_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying])::text[]))),
    CONSTRAINT lab_mcq_questions_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying, 'archived'::character varying])::text[])))
);


--
-- Name: lab_mcq_questions_mcq_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lab_mcq_questions_mcq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lab_mcq_questions_mcq_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lab_mcq_questions_mcq_id_seq OWNED BY public.lab_mcq_questions.mcq_id;


--
-- Name: lab_test_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lab_test_cases (
    lab_testcase_id integer NOT NULL,
    lab_question_id integer NOT NULL,
    input text,
    expected_output text,
    is_hidden boolean DEFAULT false,
    order_index integer
);


--
-- Name: lab_test_cases_lab_testcase_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lab_test_cases_lab_testcase_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lab_test_cases_lab_testcase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lab_test_cases_lab_testcase_id_seq OWNED BY public.lab_test_cases.lab_testcase_id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    token_id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_tokens_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_tokens_token_id_seq OWNED BY public.password_reset_tokens.token_id;


--
-- Name: prerequisite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prerequisite (
    prereq_id integer NOT NULL,
    topic_id integer NOT NULL,
    description text,
    content text,
    order_index integer
);


--
-- Name: prerequisite_prereq_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prerequisite_prereq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prerequisite_prereq_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prerequisite_prereq_id_seq OWNED BY public.prerequisite.prereq_id;


--
-- Name: prerequisite_quiz; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prerequisite_quiz (
    prereq_quiz_id integer NOT NULL,
    prereq_id integer NOT NULL,
    title character varying(200),
    total_marks integer,
    passing_criteria integer,
    time_limit integer DEFAULT 15,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: prerequisite_quiz_prereq_quiz_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prerequisite_quiz_prereq_quiz_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prerequisite_quiz_prereq_quiz_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prerequisite_quiz_prereq_quiz_id_seq OWNED BY public.prerequisite_quiz.prereq_quiz_id;


--
-- Name: prerequisite_quiz_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prerequisite_quiz_questions (
    pq_question_id integer NOT NULL,
    prereq_quiz_id integer NOT NULL,
    question_text text,
    option_a text,
    option_b text,
    option_c text,
    option_d text,
    correct_option character(1),
    marks integer,
    order_index integer
);


--
-- Name: prerequisite_quiz_questions_pq_question_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prerequisite_quiz_questions_pq_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prerequisite_quiz_questions_pq_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prerequisite_quiz_questions_pq_question_id_seq OWNED BY public.prerequisite_quiz_questions.pq_question_id;


--
-- Name: progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.progress (
    progress_id integer NOT NULL,
    student_id integer NOT NULL,
    topic_id integer NOT NULL,
    status public.progress_status DEFAULT 'Not Started'::public.progress_status,
    time_spent integer DEFAULT 0,
    last_accessed timestamp without time zone
);


--
-- Name: progress_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.progress_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.progress_progress_id_seq OWNED BY public.progress.progress_id;


--
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_attempts (
    attempt_id integer NOT NULL,
    student_id integer NOT NULL,
    quiz_type public.quiz_type_enum NOT NULL,
    quiz_ref_id integer NOT NULL,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    submitted_at timestamp without time zone,
    score integer DEFAULT 0,
    total_marks integer DEFAULT 0,
    percentage numeric(5,2) DEFAULT 0,
    correct_answers integer DEFAULT 0,
    incorrect_answers integer DEFAULT 0,
    unanswered integer DEFAULT 0,
    passed boolean,
    answers jsonb
);


--
-- Name: quiz_attempts_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quiz_attempts_attempt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quiz_attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quiz_attempts_attempt_id_seq OWNED BY public.quiz_attempts.attempt_id;


--
-- Name: room_topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.room_topics (
    room_topic_id integer NOT NULL,
    room_id integer NOT NULL,
    topic_id integer NOT NULL,
    order_index integer
);


--
-- Name: room_topics_room_topic_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.room_topics_room_topic_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: room_topics_room_topic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.room_topics_room_topic_id_seq OWNED BY public.room_topics.room_topic_id;


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rooms (
    room_id integer NOT NULL,
    faculty_id integer NOT NULL,
    room_name character varying(150) NOT NULL,
    room_code character varying(20) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: rooms_room_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rooms_room_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rooms_room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rooms_room_id_seq OWNED BY public.rooms.room_id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: student; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student (
    student_id integer NOT NULL,
    user_id integer NOT NULL,
    roll_number character varying(30) NOT NULL,
    course character varying(100),
    year integer,
    phone character varying(20)
);


--
-- Name: student_rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_rooms (
    student_room_id integer NOT NULL,
    student_id integer NOT NULL,
    room_id integer NOT NULL,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: student_rooms_student_room_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_rooms_student_room_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_rooms_student_room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_rooms_student_room_id_seq OWNED BY public.student_rooms.student_room_id;


--
-- Name: student_student_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_student_id_seq OWNED BY public.student.student_id;


--
-- Name: subtopic_coding_assessment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subtopic_coding_assessment (
    scca_id integer NOT NULL,
    content_id integer NOT NULL,
    title character varying(200),
    problem_statement text,
    constraints text,
    sample_input text,
    sample_output text,
    marks integer,
    order_index integer
);


--
-- Name: subtopic_coding_assessment_scca_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subtopic_coding_assessment_scca_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subtopic_coding_assessment_scca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subtopic_coding_assessment_scca_id_seq OWNED BY public.subtopic_coding_assessment.scca_id;


--
-- Name: subtopic_coding_test_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subtopic_coding_test_cases (
    scca_testcase_id integer NOT NULL,
    scca_id integer NOT NULL,
    input text,
    expected_output text,
    is_hidden boolean DEFAULT false,
    order_index integer
);


--
-- Name: subtopic_coding_test_cases_scca_testcase_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subtopic_coding_test_cases_scca_testcase_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subtopic_coding_test_cases_scca_testcase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subtopic_coding_test_cases_scca_testcase_id_seq OWNED BY public.subtopic_coding_test_cases.scca_testcase_id;


--
-- Name: subtopic_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subtopic_content (
    content_id integer NOT NULL,
    subtopic_id integer NOT NULL,
    aim text,
    theory text,
    video_explanation_url text,
    time_limit integer DEFAULT 15
);


--
-- Name: subtopic_content_content_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subtopic_content_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subtopic_content_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subtopic_content_content_id_seq OWNED BY public.subtopic_content.content_id;


--
-- Name: subtopic_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subtopic_feedback (
    feedback_id integer NOT NULL,
    content_id integer NOT NULL,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT subtopic_feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: subtopic_feedback_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subtopic_feedback_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subtopic_feedback_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subtopic_feedback_feedback_id_seq OWNED BY public.subtopic_feedback.feedback_id;


--
-- Name: subtopic_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subtopic_progress (
    subtopic_progress_id integer NOT NULL,
    student_id integer NOT NULL,
    subtopic_id integer NOT NULL,
    aim_viewed boolean DEFAULT false,
    theory_viewed boolean DEFAULT false,
    video_viewed boolean DEFAULT false,
    status public.progress_status DEFAULT 'Not Started'::public.progress_status,
    time_spent integer DEFAULT 0,
    last_accessed timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: subtopic_progress_subtopic_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subtopic_progress_subtopic_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subtopic_progress_subtopic_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subtopic_progress_subtopic_progress_id_seq OWNED BY public.subtopic_progress.subtopic_progress_id;


--
-- Name: subtopic_quiz_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subtopic_quiz_questions (
    stq_id integer NOT NULL,
    content_id integer NOT NULL,
    question_text text,
    option_a text,
    option_b text,
    option_c text,
    option_d text,
    correct_option character(1),
    marks integer,
    order_index integer
);


--
-- Name: subtopic_quiz_questions_stq_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subtopic_quiz_questions_stq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subtopic_quiz_questions_stq_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subtopic_quiz_questions_stq_id_seq OWNED BY public.subtopic_quiz_questions.stq_id;


--
-- Name: subtopics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subtopics (
    subtopic_id integer NOT NULL,
    topic_id integer NOT NULL,
    title character varying(200) NOT NULL,
    order_index integer,
    is_published boolean DEFAULT true
);


--
-- Name: subtopics_subtopic_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subtopics_subtopic_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subtopics_subtopic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subtopics_subtopic_id_seq OWNED BY public.subtopics.subtopic_id;


--
-- Name: tca_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tca_questions (
    tca_question_id integer NOT NULL,
    tca_id integer NOT NULL,
    title character varying(200),
    problem_statement text,
    constraints text,
    sample_input text,
    sample_output text,
    marks integer,
    order_index integer
);


--
-- Name: tca_questions_tca_question_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tca_questions_tca_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tca_questions_tca_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tca_questions_tca_question_id_seq OWNED BY public.tca_questions.tca_question_id;


--
-- Name: tca_test_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tca_test_cases (
    tca_testcase_id integer NOT NULL,
    tca_question_id integer NOT NULL,
    input text,
    expected_output text,
    is_hidden boolean DEFAULT false,
    order_index integer
);


--
-- Name: tca_test_cases_tca_testcase_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tca_test_cases_tca_testcase_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tca_test_cases_tca_testcase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tca_test_cases_tca_testcase_id_seq OWNED BY public.tca_test_cases.tca_testcase_id;


--
-- Name: topic_coding_assessment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topic_coding_assessment (
    tca_id integer NOT NULL,
    topic_id integer NOT NULL,
    title character varying(200),
    description text,
    total_marks integer,
    time_limit integer
);


--
-- Name: topic_coding_assessment_tca_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.topic_coding_assessment_tca_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: topic_coding_assessment_tca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.topic_coding_assessment_tca_id_seq OWNED BY public.topic_coding_assessment.tca_id;


--
-- Name: topic_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topic_feedback (
    feedback_id integer NOT NULL,
    student_id integer NOT NULL,
    topic_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT topic_feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: topic_feedback_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.topic_feedback_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: topic_feedback_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.topic_feedback_feedback_id_seq OWNED BY public.topic_feedback.feedback_id;


--
-- Name: topic_video_references; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topic_video_references (
    video_id integer NOT NULL,
    topic_id integer NOT NULL,
    title character varying(255) NOT NULL,
    channel_name character varying(150) NOT NULL,
    url text NOT NULL,
    description text,
    order_index integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: topic_video_references_video_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.topic_video_references_video_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: topic_video_references_video_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.topic_video_references_video_id_seq OWNED BY public.topic_video_references.video_id;


--
-- Name: topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topics (
    topic_id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: topics_topic_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.topics_topic_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: topics_topic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.topics_topic_id_seq OWNED BY public.topics.topic_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    role public.user_role NOT NULL,
    approval_status character varying(20) DEFAULT 'approved'::character varying NOT NULL,
    rejection_reason text,
    approval_decision_at timestamp without time zone,
    approval_decision_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    CONSTRAINT users_approval_status_check CHECK (((approval_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: assignment_questions asg_question_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment_questions ALTER COLUMN asg_question_id SET DEFAULT nextval('public.assignment_questions_asg_question_id_seq'::regclass);


--
-- Name: assignment_test_cases asg_testcase_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment_test_cases ALTER COLUMN asg_testcase_id SET DEFAULT nextval('public.assignment_test_cases_asg_testcase_id_seq'::regclass);


--
-- Name: assignments assignment_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments ALTER COLUMN assignment_id SET DEFAULT nextval('public.assignments_assignment_id_seq'::regclass);


--
-- Name: coding_submissions submission_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coding_submissions ALTER COLUMN submission_id SET DEFAULT nextval('public.coding_submissions_submission_id_seq'::regclass);


--
-- Name: faculty faculty_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty ALTER COLUMN faculty_id SET DEFAULT nextval('public.faculty_faculty_id_seq'::regclass);


--
-- Name: final_quiz final_quiz_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.final_quiz ALTER COLUMN final_quiz_id SET DEFAULT nextval('public.final_quiz_final_quiz_id_seq'::regclass);


--
-- Name: final_quiz_questions fq_question_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.final_quiz_questions ALTER COLUMN fq_question_id SET DEFAULT nextval('public.final_quiz_questions_fq_question_id_seq'::regclass);


--
-- Name: la_assessment_topics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_assessment_topics ALTER COLUMN id SET DEFAULT nextval('public.la_assessment_topics_id_seq'::regclass);


--
-- Name: la_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.la_attempts_attempt_id_seq'::regclass);


--
-- Name: la_mcq_submissions submission_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_mcq_submissions ALTER COLUMN submission_id SET DEFAULT nextval('public.la_mcq_submissions_submission_id_seq'::regclass);


--
-- Name: la_question_submissions submission_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_question_submissions ALTER COLUMN submission_id SET DEFAULT nextval('public.la_question_submissions_submission_id_seq'::regclass);


--
-- Name: la_selected_mcqs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_selected_mcqs ALTER COLUMN id SET DEFAULT nextval('public.la_selected_mcqs_id_seq'::regclass);


--
-- Name: la_selected_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_selected_questions ALTER COLUMN id SET DEFAULT nextval('public.la_selected_questions_id_seq'::regclass);


--
-- Name: la_student_allocations allocation_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_student_allocations ALTER COLUMN allocation_id SET DEFAULT nextval('public.la_student_allocations_allocation_id_seq'::regclass);


--
-- Name: la_student_mcq_allocations allocation_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_student_mcq_allocations ALTER COLUMN allocation_id SET DEFAULT nextval('public.la_student_mcq_allocations_allocation_id_seq'::regclass);


--
-- Name: lab_assessment lab_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_assessment ALTER COLUMN lab_id SET DEFAULT nextval('public.lab_assessment_lab_id_seq'::regclass);


--
-- Name: lab_coding_questions lab_question_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_coding_questions ALTER COLUMN lab_question_id SET DEFAULT nextval('public.lab_coding_questions_lab_question_id_seq'::regclass);


--
-- Name: lab_mcq_questions mcq_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_mcq_questions ALTER COLUMN mcq_id SET DEFAULT nextval('public.lab_mcq_questions_mcq_id_seq'::regclass);


--
-- Name: lab_test_cases lab_testcase_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_test_cases ALTER COLUMN lab_testcase_id SET DEFAULT nextval('public.lab_test_cases_lab_testcase_id_seq'::regclass);


--
-- Name: password_reset_tokens token_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN token_id SET DEFAULT nextval('public.password_reset_tokens_token_id_seq'::regclass);


--
-- Name: prerequisite prereq_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prerequisite ALTER COLUMN prereq_id SET DEFAULT nextval('public.prerequisite_prereq_id_seq'::regclass);


--
-- Name: prerequisite_quiz prereq_quiz_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prerequisite_quiz ALTER COLUMN prereq_quiz_id SET DEFAULT nextval('public.prerequisite_quiz_prereq_quiz_id_seq'::regclass);


--
-- Name: prerequisite_quiz_questions pq_question_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prerequisite_quiz_questions ALTER COLUMN pq_question_id SET DEFAULT nextval('public.prerequisite_quiz_questions_pq_question_id_seq'::regclass);


--
-- Name: progress progress_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress ALTER COLUMN progress_id SET DEFAULT nextval('public.progress_progress_id_seq'::regclass);


--
-- Name: quiz_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.quiz_attempts_attempt_id_seq'::regclass);


--
-- Name: room_topics room_topic_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_topics ALTER COLUMN room_topic_id SET DEFAULT nextval('public.room_topics_room_topic_id_seq'::regclass);


--
-- Name: rooms room_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms ALTER COLUMN room_id SET DEFAULT nextval('public.rooms_room_id_seq'::regclass);


--
-- Name: student student_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student ALTER COLUMN student_id SET DEFAULT nextval('public.student_student_id_seq'::regclass);


--
-- Name: student_rooms student_room_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_rooms ALTER COLUMN student_room_id SET DEFAULT nextval('public.student_rooms_student_room_id_seq'::regclass);


--
-- Name: subtopic_coding_assessment scca_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_coding_assessment ALTER COLUMN scca_id SET DEFAULT nextval('public.subtopic_coding_assessment_scca_id_seq'::regclass);


--
-- Name: subtopic_coding_test_cases scca_testcase_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_coding_test_cases ALTER COLUMN scca_testcase_id SET DEFAULT nextval('public.subtopic_coding_test_cases_scca_testcase_id_seq'::regclass);


--
-- Name: subtopic_content content_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_content ALTER COLUMN content_id SET DEFAULT nextval('public.subtopic_content_content_id_seq'::regclass);


--
-- Name: subtopic_feedback feedback_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_feedback ALTER COLUMN feedback_id SET DEFAULT nextval('public.subtopic_feedback_feedback_id_seq'::regclass);


--
-- Name: subtopic_progress subtopic_progress_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_progress ALTER COLUMN subtopic_progress_id SET DEFAULT nextval('public.subtopic_progress_subtopic_progress_id_seq'::regclass);


--
-- Name: subtopic_quiz_questions stq_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_quiz_questions ALTER COLUMN stq_id SET DEFAULT nextval('public.subtopic_quiz_questions_stq_id_seq'::regclass);


--
-- Name: subtopics subtopic_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopics ALTER COLUMN subtopic_id SET DEFAULT nextval('public.subtopics_subtopic_id_seq'::regclass);


--
-- Name: tca_questions tca_question_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tca_questions ALTER COLUMN tca_question_id SET DEFAULT nextval('public.tca_questions_tca_question_id_seq'::regclass);


--
-- Name: tca_test_cases tca_testcase_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tca_test_cases ALTER COLUMN tca_testcase_id SET DEFAULT nextval('public.tca_test_cases_tca_testcase_id_seq'::regclass);


--
-- Name: topic_coding_assessment tca_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_coding_assessment ALTER COLUMN tca_id SET DEFAULT nextval('public.topic_coding_assessment_tca_id_seq'::regclass);


--
-- Name: topic_feedback feedback_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_feedback ALTER COLUMN feedback_id SET DEFAULT nextval('public.topic_feedback_feedback_id_seq'::regclass);


--
-- Name: topic_video_references video_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_video_references ALTER COLUMN video_id SET DEFAULT nextval('public.topic_video_references_video_id_seq'::regclass);


--
-- Name: topics topic_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics ALTER COLUMN topic_id SET DEFAULT nextval('public.topics_topic_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: assignment_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assignment_questions (asg_question_id, assignment_id, problem_statement, constraints, marks, order_index) FROM stdin;
\.


--
-- Data for Name: assignment_test_cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assignment_test_cases (asg_testcase_id, asg_question_id, input, expected_output, is_hidden, order_index) FROM stdin;
\.


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assignments (assignment_id, faculty_id, title, description, deadline, total_marks) FROM stdin;
\.


--
-- Data for Name: coding_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coding_submissions (submission_id, student_id, assessment_type, assessment_ref_id, question_id, source_code, language, status, score, total_marks, questions_solved, total_questions, percentage, submitted_at) FROM stdin;
\.


--
-- Data for Name: faculty; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faculty (faculty_id, user_id, designation, department, specialization, phone) FROM stdin;
1	5	Assistant Prof	CSE	DSA	9865743219
\.


--
-- Data for Name: final_quiz; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.final_quiz (final_quiz_id, topic_id, title, total_marks, time_limit, created_at) FROM stdin;
1	3	Arrays — Final Quiz	10	15	2026-10-20 14:01:06.680854
\.


--
-- Data for Name: final_quiz_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.final_quiz_questions (fq_question_id, final_quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) FROM stdin;
\.


--
-- Data for Name: la_assessment_topics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.la_assessment_topics (id, lab_id, topic_id) FROM stdin;
\.


--
-- Data for Name: la_attempts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.la_attempts (attempt_id, lab_id, student_id, started_at, effective_deadline, submitted_at, status, total_marks, obtained_marks) FROM stdin;
\.


--
-- Data for Name: la_mcq_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.la_mcq_submissions (submission_id, attempt_id, mcq_id, selected_option, is_correct, marks_obtained, submitted_at) FROM stdin;
\.


--
-- Data for Name: la_question_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.la_question_submissions (submission_id, attempt_id, lab_question_id, source_code, language, status, passed_test_cases, total_test_cases, marks_obtained, submitted_at) FROM stdin;
\.


--
-- Data for Name: la_selected_mcqs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.la_selected_mcqs (id, lab_id, mcq_id, question_order) FROM stdin;
\.


--
-- Data for Name: la_selected_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.la_selected_questions (id, lab_id, lab_question_id, question_order) FROM stdin;
\.


--
-- Data for Name: la_student_allocations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.la_student_allocations (allocation_id, lab_id, student_id, lab_question_id, question_order, is_manual, allocated_at) FROM stdin;
\.


--
-- Data for Name: la_student_mcq_allocations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.la_student_mcq_allocations (allocation_id, lab_id, student_id, mcq_id, question_order, is_manual, allocated_at) FROM stdin;
\.


--
-- Data for Name: lab_assessment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lab_assessment (lab_id, faculty_id, room_id, title, description, start_time, end_time, duration, total_marks, status, allocation_mode, num_questions, num_coding_questions, num_mcq_questions, marks_per_question, marks_per_mcq, created_at) FROM stdin;
\.


--
-- Data for Name: lab_coding_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lab_coding_questions (lab_question_id, topic_id, subtopic_id, lab_id, title, problem_statement, input_format, output_format, constraints, sample_input, sample_output, explanation, difficulty, marks, order_index, created_by_faculty_id, supported_languages, is_archived, status, is_published, created_at) FROM stdin;
\.


--
-- Data for Name: lab_mcq_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lab_mcq_questions (mcq_id, topic_id, subtopic_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, marks, status, is_published, created_by_faculty_id, created_at) FROM stdin;
\.


--
-- Data for Name: lab_test_cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lab_test_cases (lab_testcase_id, lab_question_id, input, expected_output, is_hidden, order_index) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (token_id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: prerequisite; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prerequisite (prereq_id, topic_id, description, content, order_index) FROM stdin;
1	3	Prerequisites for Arrays	Basic concepts required before starting Arrays.	1
\.


--
-- Data for Name: prerequisite_quiz; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prerequisite_quiz (prereq_quiz_id, prereq_id, title, total_marks, passing_criteria, time_limit, created_at) FROM stdin;
1	1	Arrays — Prerequisite Quiz	12	50	15	2026-10-20 14:00:45.600143
\.


--
-- Data for Name: prerequisite_quiz_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prerequisite_quiz_questions (pq_question_id, prereq_quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) FROM stdin;
\.


--
-- Data for Name: progress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.progress (progress_id, student_id, topic_id, status, time_spent, last_accessed) FROM stdin;
\.


--
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quiz_attempts (attempt_id, student_id, quiz_type, quiz_ref_id, started_at, submitted_at, score, total_marks, percentage, correct_answers, incorrect_answers, unanswered, passed, answers) FROM stdin;
\.


--
-- Data for Name: room_topics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.room_topics (room_topic_id, room_id, topic_id, order_index) FROM stdin;
1	1	1	\N
2	1	2	\N
3	1	3	\N
4	1	4	\N
5	1	17	\N
6	1	16	\N
7	1	15	\N
8	1	14	\N
9	1	13	\N
10	1	12	\N
11	1	11	\N
12	1	10	\N
13	1	9	\N
14	1	8	\N
15	1	7	\N
16	1	6	\N
17	1	5	\N
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rooms (room_id, faculty_id, room_name, room_code, description, created_at) FROM stdin;
1	1	DSA	F50A23	DSA	2026-10-20 13:58:56.987553
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
O1-rxji8xW2L4yhy6v10hy6uB-XSL6PW	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T13:56:40.917Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2026-10-21 13:58:19
Y4zM4SQA61PQPFQLSsfIQmU4JHjK6k_G	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T13:57:11.280Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2026-10-21 14:01:14
m1QYyKnefnljM1TzHJIUhfuwM_kQR9Nc	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T13:58:24.401Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":5}}	2026-10-21 14:00:26
\.


--
-- Data for Name: student; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student (student_id, user_id, roll_number, course, year, phone) FROM stdin;
1	1	245100150	CSE	3	9876543219
\.


--
-- Data for Name: student_rooms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_rooms (student_room_id, student_id, room_id, joined_at) FROM stdin;
1	1	1	2026-10-20 14:00:40.080408
\.


--
-- Data for Name: subtopic_coding_assessment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subtopic_coding_assessment (scca_id, content_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index) FROM stdin;
\.


--
-- Data for Name: subtopic_coding_test_cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subtopic_coding_test_cases (scca_testcase_id, scca_id, input, expected_output, is_hidden, order_index) FROM stdin;
\.


--
-- Data for Name: subtopic_content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subtopic_content (content_id, subtopic_id, aim, theory, video_explanation_url, time_limit) FROM stdin;
\.


--
-- Data for Name: subtopic_feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subtopic_feedback (feedback_id, content_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: subtopic_progress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subtopic_progress (subtopic_progress_id, student_id, subtopic_id, aim_viewed, theory_viewed, video_viewed, status, time_spent, last_accessed) FROM stdin;
\.


--
-- Data for Name: subtopic_quiz_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subtopic_quiz_questions (stq_id, content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) FROM stdin;
\.


--
-- Data for Name: subtopics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subtopics (subtopic_id, topic_id, title, order_index, is_published) FROM stdin;
\.


--
-- Data for Name: tca_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tca_questions (tca_question_id, tca_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index) FROM stdin;
\.


--
-- Data for Name: tca_test_cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tca_test_cases (tca_testcase_id, tca_question_id, input, expected_output, is_hidden, order_index) FROM stdin;
\.


--
-- Data for Name: topic_coding_assessment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.topic_coding_assessment (tca_id, topic_id, title, description, total_marks, time_limit) FROM stdin;
\.


--
-- Data for Name: topic_feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.topic_feedback (feedback_id, student_id, topic_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: topic_video_references; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.topic_video_references (video_id, topic_id, title, channel_name, url, description, order_index, created_at) FROM stdin;
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.topics (topic_id, title, description, created_at) FROM stdin;
1	Introduction to Data Structures and Algorithms	Foundational concepts of data structures, abstract data types, memory representations, and fundamental algorithms.	2026-10-20 13:45:05.256011
2	Complexity Analysis	Asymptotic notations (Big O, Omega, Theta), time complexity, space complexity, and recurrence relation analysis.	2026-10-20 13:45:05.344396
3	Arrays	Linear contiguous memory data structures, traversal, two-pointer techniques, prefix sums, and sliding window algorithms.	2026-10-20 13:45:05.360998
4	Strings	Character sequences, string manipulation, pattern matching, palindrome validation, and frequency hashing.	2026-10-20 13:45:05.380211
5	Linked Lists	Singly linked lists, doubly linked lists, circular lists, pointer manipulation, reversal, and cycle detection.	2026-10-20 13:45:05.452356
6	Stacks	Last-In First-Out (LIFO) abstract data type, stack implementations, parentheses validation, and monotonic stacks.	2026-10-20 13:45:05.468932
7	Queues	First-In First-Out (FIFO) structures, circular queues, deques, priority queues, and sliding window buffers.	2026-10-20 13:45:05.484818
8	Recursion	Recursive function calls, base cases, call stacks, divide-and-conquer principles, and backtracking.	2026-10-20 13:45:05.501384
9	Searching Algorithms	Linear search, binary search on sorted collections, search space optimization, and ternary search.	2026-10-20 13:45:05.517879
10	Sorting Algorithms	Comparison-based sorting (Bubble, Insertion, Selection, Merge, Quick, Heap sort) and non-comparison sorting.	2026-10-20 13:45:05.538805
11	Hashing	Hash tables, hash functions, collision resolution (chaining, open addressing), and frequency counting.	2026-10-20 13:45:05.753241
12	Trees	Hierarchical data structures, binary trees, tree traversals (inorder, preorder, postorder, level-order), height, and diameter.	2026-10-20 13:45:05.769262
13	Binary Search Trees	Ordered binary trees, BST search, insertion, deletion, range queries, and BST property validation.	2026-10-20 13:45:05.7848
14	Heaps and Priority Queues	Min-heaps, max-heaps, heapify operations, priority queues, and Top-K elements optimization.	2026-10-20 13:45:05.821423
15	Graphs	Vertices and edges representations (adjacency matrix, list), BFS, DFS, cycle detection, connected components, and shortest paths.	2026-10-20 13:45:05.836469
16	Greedy Algorithms	Greedy choice property, interval scheduling, fractional knapsack, activity selection, and Huffman encoding.	2026-10-20 13:45:05.854768
17	Dynamic Programming	Overlapping subproblems, optimal substructure, memoization, tabulation, and standard DP optimizations.	2026-10-20 13:45:05.869393
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (user_id, name, email, password_hash, role, approval_status, rejection_reason, approval_decision_at, approval_decision_by, created_at, last_login) FROM stdin;
4	Harish	harishprabhakaran90@gmail.com	$2b$12$NU/r05hJcrmkE6onfc5dZet5uhodHrDUg4Ora7NWmGRkcYbZT0fJW	admin	approved	\N	\N	\N	2026-10-20 13:56:23.689089	2026-10-20 13:56:40.908182
1	student	student1@wcelab.ac.in	$2b$12$SftCkNCcQiw0QKTOND6F4ON89XcwUSeEHbd69DvgQ0fDHo6ME3jAu	student	approved	\N	2026-10-20 13:57:01.695837	4	2026-10-20 13:50:44.670489	2026-10-20 13:57:11.305969
5	teacher	teacher1@wcelab.ac.in	$2b$12$RAeaNe7mJpgIp7SiRTW0XOT.imo4IV2f5koYXs63njwOxs1blxLhW	faculty	approved	\N	2026-10-20 13:58:18.085369	4	2026-10-20 13:58:04.622265	2026-10-20 13:58:24.427402
\.


--
-- Name: assignment_questions_asg_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.assignment_questions_asg_question_id_seq', 1, false);


--
-- Name: assignment_test_cases_asg_testcase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.assignment_test_cases_asg_testcase_id_seq', 1, false);


--
-- Name: assignments_assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.assignments_assignment_id_seq', 1, false);


--
-- Name: coding_submissions_submission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.coding_submissions_submission_id_seq', 1, false);


--
-- Name: faculty_faculty_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.faculty_faculty_id_seq', 1, true);


--
-- Name: final_quiz_final_quiz_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.final_quiz_final_quiz_id_seq', 1, true);


--
-- Name: final_quiz_questions_fq_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.final_quiz_questions_fq_question_id_seq', 1, false);


--
-- Name: la_assessment_topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.la_assessment_topics_id_seq', 1, false);


--
-- Name: la_attempts_attempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.la_attempts_attempt_id_seq', 1, false);


--
-- Name: la_mcq_submissions_submission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.la_mcq_submissions_submission_id_seq', 1, false);


--
-- Name: la_question_submissions_submission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.la_question_submissions_submission_id_seq', 1, false);


--
-- Name: la_selected_mcqs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.la_selected_mcqs_id_seq', 1, false);


--
-- Name: la_selected_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.la_selected_questions_id_seq', 1, false);


--
-- Name: la_student_allocations_allocation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.la_student_allocations_allocation_id_seq', 1, false);


--
-- Name: la_student_mcq_allocations_allocation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.la_student_mcq_allocations_allocation_id_seq', 1, false);


--
-- Name: lab_assessment_lab_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lab_assessment_lab_id_seq', 1, false);


--
-- Name: lab_coding_questions_lab_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lab_coding_questions_lab_question_id_seq', 1, false);


--
-- Name: lab_mcq_questions_mcq_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lab_mcq_questions_mcq_id_seq', 1, false);


--
-- Name: lab_test_cases_lab_testcase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lab_test_cases_lab_testcase_id_seq', 1, false);


--
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_tokens_token_id_seq', 1, false);


--
-- Name: prerequisite_prereq_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.prerequisite_prereq_id_seq', 1, true);


--
-- Name: prerequisite_quiz_prereq_quiz_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.prerequisite_quiz_prereq_quiz_id_seq', 1, true);


--
-- Name: prerequisite_quiz_questions_pq_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.prerequisite_quiz_questions_pq_question_id_seq', 1, false);


--
-- Name: progress_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.progress_progress_id_seq', 1, false);


--
-- Name: quiz_attempts_attempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quiz_attempts_attempt_id_seq', 1, false);


--
-- Name: room_topics_room_topic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.room_topics_room_topic_id_seq', 17, true);


--
-- Name: rooms_room_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rooms_room_id_seq', 1, true);


--
-- Name: student_rooms_student_room_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_rooms_student_room_id_seq', 1, true);


--
-- Name: student_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_student_id_seq', 1, true);


--
-- Name: subtopic_coding_assessment_scca_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subtopic_coding_assessment_scca_id_seq', 1, false);


--
-- Name: subtopic_coding_test_cases_scca_testcase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subtopic_coding_test_cases_scca_testcase_id_seq', 1, false);


--
-- Name: subtopic_content_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subtopic_content_content_id_seq', 1, false);


--
-- Name: subtopic_feedback_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subtopic_feedback_feedback_id_seq', 1, false);


--
-- Name: subtopic_progress_subtopic_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subtopic_progress_subtopic_progress_id_seq', 1, false);


--
-- Name: subtopic_quiz_questions_stq_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subtopic_quiz_questions_stq_id_seq', 1, false);


--
-- Name: subtopics_subtopic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subtopics_subtopic_id_seq', 1, false);


--
-- Name: tca_questions_tca_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tca_questions_tca_question_id_seq', 1, false);


--
-- Name: tca_test_cases_tca_testcase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tca_test_cases_tca_testcase_id_seq', 1, false);


--
-- Name: topic_coding_assessment_tca_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.topic_coding_assessment_tca_id_seq', 1, false);


--
-- Name: topic_feedback_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.topic_feedback_feedback_id_seq', 1, false);


--
-- Name: topic_video_references_video_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.topic_video_references_video_id_seq', 1, false);


--
-- Name: topics_topic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.topics_topic_id_seq', 17, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_user_id_seq', 5, true);


--
-- Name: assignment_questions assignment_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment_questions
    ADD CONSTRAINT assignment_questions_pkey PRIMARY KEY (asg_question_id);


--
-- Name: assignment_test_cases assignment_test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment_test_cases
    ADD CONSTRAINT assignment_test_cases_pkey PRIMARY KEY (asg_testcase_id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (assignment_id);


--
-- Name: coding_submissions coding_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coding_submissions
    ADD CONSTRAINT coding_submissions_pkey PRIMARY KEY (submission_id);


--
-- Name: faculty faculty_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_pkey PRIMARY KEY (faculty_id);


--
-- Name: faculty faculty_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_user_id_key UNIQUE (user_id);


--
-- Name: final_quiz final_quiz_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.final_quiz
    ADD CONSTRAINT final_quiz_pkey PRIMARY KEY (final_quiz_id);


--
-- Name: final_quiz_questions final_quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.final_quiz_questions
    ADD CONSTRAINT final_quiz_questions_pkey PRIMARY KEY (fq_question_id);


--
-- Name: la_assessment_topics la_assessment_topics_lab_id_topic_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_assessment_topics
    ADD CONSTRAINT la_assessment_topics_lab_id_topic_id_key UNIQUE (lab_id, topic_id);


--
-- Name: la_assessment_topics la_assessment_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_assessment_topics
    ADD CONSTRAINT la_assessment_topics_pkey PRIMARY KEY (id);


--
-- Name: la_attempts la_attempts_lab_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_attempts
    ADD CONSTRAINT la_attempts_lab_id_student_id_key UNIQUE (lab_id, student_id);


--
-- Name: la_attempts la_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_attempts
    ADD CONSTRAINT la_attempts_pkey PRIMARY KEY (attempt_id);


--
-- Name: la_mcq_submissions la_mcq_submissions_attempt_id_mcq_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_mcq_submissions
    ADD CONSTRAINT la_mcq_submissions_attempt_id_mcq_id_key UNIQUE (attempt_id, mcq_id);


--
-- Name: la_mcq_submissions la_mcq_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_mcq_submissions
    ADD CONSTRAINT la_mcq_submissions_pkey PRIMARY KEY (submission_id);


--
-- Name: la_question_submissions la_question_submissions_attempt_id_lab_question_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_question_submissions
    ADD CONSTRAINT la_question_submissions_attempt_id_lab_question_id_key UNIQUE (attempt_id, lab_question_id);


--
-- Name: la_question_submissions la_question_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_question_submissions
    ADD CONSTRAINT la_question_submissions_pkey PRIMARY KEY (submission_id);


--
-- Name: la_selected_mcqs la_selected_mcqs_lab_id_mcq_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_selected_mcqs
    ADD CONSTRAINT la_selected_mcqs_lab_id_mcq_id_key UNIQUE (lab_id, mcq_id);


--
-- Name: la_selected_mcqs la_selected_mcqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_selected_mcqs
    ADD CONSTRAINT la_selected_mcqs_pkey PRIMARY KEY (id);


--
-- Name: la_selected_questions la_selected_questions_lab_id_lab_question_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_selected_questions
    ADD CONSTRAINT la_selected_questions_lab_id_lab_question_id_key UNIQUE (lab_id, lab_question_id);


--
-- Name: la_selected_questions la_selected_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_selected_questions
    ADD CONSTRAINT la_selected_questions_pkey PRIMARY KEY (id);


--
-- Name: la_student_allocations la_student_allocations_lab_id_student_id_lab_question_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_student_allocations
    ADD CONSTRAINT la_student_allocations_lab_id_student_id_lab_question_id_key UNIQUE (lab_id, student_id, lab_question_id);


--
-- Name: la_student_allocations la_student_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_student_allocations
    ADD CONSTRAINT la_student_allocations_pkey PRIMARY KEY (allocation_id);


--
-- Name: la_student_mcq_allocations la_student_mcq_allocations_lab_id_student_id_mcq_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_student_mcq_allocations
    ADD CONSTRAINT la_student_mcq_allocations_lab_id_student_id_mcq_id_key UNIQUE (lab_id, student_id, mcq_id);


--
-- Name: la_student_mcq_allocations la_student_mcq_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_student_mcq_allocations
    ADD CONSTRAINT la_student_mcq_allocations_pkey PRIMARY KEY (allocation_id);


--
-- Name: lab_assessment lab_assessment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_assessment
    ADD CONSTRAINT lab_assessment_pkey PRIMARY KEY (lab_id);


--
-- Name: lab_coding_questions lab_coding_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_coding_questions
    ADD CONSTRAINT lab_coding_questions_pkey PRIMARY KEY (lab_question_id);


--
-- Name: lab_mcq_questions lab_mcq_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_mcq_questions
    ADD CONSTRAINT lab_mcq_questions_pkey PRIMARY KEY (mcq_id);


--
-- Name: lab_test_cases lab_test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_test_cases
    ADD CONSTRAINT lab_test_cases_pkey PRIMARY KEY (lab_testcase_id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (token_id);


--
-- Name: prerequisite prerequisite_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prerequisite
    ADD CONSTRAINT prerequisite_pkey PRIMARY KEY (prereq_id);


--
-- Name: prerequisite_quiz prerequisite_quiz_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prerequisite_quiz
    ADD CONSTRAINT prerequisite_quiz_pkey PRIMARY KEY (prereq_quiz_id);


--
-- Name: prerequisite_quiz_questions prerequisite_quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prerequisite_quiz_questions
    ADD CONSTRAINT prerequisite_quiz_questions_pkey PRIMARY KEY (pq_question_id);


--
-- Name: progress progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_pkey PRIMARY KEY (progress_id);


--
-- Name: progress progress_student_id_topic_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_student_id_topic_id_key UNIQUE (student_id, topic_id);


--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (attempt_id);


--
-- Name: room_topics room_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_topics
    ADD CONSTRAINT room_topics_pkey PRIMARY KEY (room_topic_id);


--
-- Name: room_topics room_topics_room_id_topic_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_topics
    ADD CONSTRAINT room_topics_room_id_topic_id_key UNIQUE (room_id, topic_id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (room_id);


--
-- Name: rooms rooms_room_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_room_code_key UNIQUE (room_code);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: student student_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_pkey PRIMARY KEY (student_id);


--
-- Name: student student_roll_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_roll_number_key UNIQUE (roll_number);


--
-- Name: student_rooms student_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_rooms
    ADD CONSTRAINT student_rooms_pkey PRIMARY KEY (student_room_id);


--
-- Name: student_rooms student_rooms_student_id_room_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_rooms
    ADD CONSTRAINT student_rooms_student_id_room_id_key UNIQUE (student_id, room_id);


--
-- Name: student student_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_user_id_key UNIQUE (user_id);


--
-- Name: subtopic_coding_assessment subtopic_coding_assessment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_coding_assessment
    ADD CONSTRAINT subtopic_coding_assessment_pkey PRIMARY KEY (scca_id);


--
-- Name: subtopic_coding_test_cases subtopic_coding_test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_coding_test_cases
    ADD CONSTRAINT subtopic_coding_test_cases_pkey PRIMARY KEY (scca_testcase_id);


--
-- Name: subtopic_content subtopic_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_content
    ADD CONSTRAINT subtopic_content_pkey PRIMARY KEY (content_id);


--
-- Name: subtopic_feedback subtopic_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_feedback
    ADD CONSTRAINT subtopic_feedback_pkey PRIMARY KEY (feedback_id);


--
-- Name: subtopic_progress subtopic_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_progress
    ADD CONSTRAINT subtopic_progress_pkey PRIMARY KEY (subtopic_progress_id);


--
-- Name: subtopic_progress subtopic_progress_student_id_subtopic_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_progress
    ADD CONSTRAINT subtopic_progress_student_id_subtopic_id_key UNIQUE (student_id, subtopic_id);


--
-- Name: subtopic_quiz_questions subtopic_quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_quiz_questions
    ADD CONSTRAINT subtopic_quiz_questions_pkey PRIMARY KEY (stq_id);


--
-- Name: subtopics subtopics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopics
    ADD CONSTRAINT subtopics_pkey PRIMARY KEY (subtopic_id);


--
-- Name: tca_questions tca_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tca_questions
    ADD CONSTRAINT tca_questions_pkey PRIMARY KEY (tca_question_id);


--
-- Name: tca_test_cases tca_test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tca_test_cases
    ADD CONSTRAINT tca_test_cases_pkey PRIMARY KEY (tca_testcase_id);


--
-- Name: topic_coding_assessment topic_coding_assessment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_coding_assessment
    ADD CONSTRAINT topic_coding_assessment_pkey PRIMARY KEY (tca_id);


--
-- Name: topic_feedback topic_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_feedback
    ADD CONSTRAINT topic_feedback_pkey PRIMARY KEY (feedback_id);


--
-- Name: topic_feedback topic_feedback_student_id_topic_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_feedback
    ADD CONSTRAINT topic_feedback_student_id_topic_id_key UNIQUE (student_id, topic_id);


--
-- Name: topic_video_references topic_video_references_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_video_references
    ADD CONSTRAINT topic_video_references_pkey PRIMARY KEY (video_id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (topic_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: idx_asg_questions_asg; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asg_questions_asg ON public.assignment_questions USING btree (assignment_id);


--
-- Name: idx_asg_testcases_q; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asg_testcases_q ON public.assignment_test_cases USING btree (asg_question_id);


--
-- Name: idx_assignment_faculty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assignment_faculty ON public.assignments USING btree (faculty_id);


--
-- Name: idx_coding_submissions_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coding_submissions_ref ON public.coding_submissions USING btree (assessment_type, assessment_ref_id);


--
-- Name: idx_coding_submissions_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_coding_submissions_student ON public.coding_submissions USING btree (student_id);


--
-- Name: idx_content_subtopic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_subtopic ON public.subtopic_content USING btree (subtopic_id);


--
-- Name: idx_faculty_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_faculty_user ON public.faculty USING btree (user_id);


--
-- Name: idx_final_quiz_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_final_quiz_topic ON public.final_quiz USING btree (topic_id);


--
-- Name: idx_la_alloc_lab_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_la_alloc_lab_student ON public.la_student_allocations USING btree (lab_id, student_id);


--
-- Name: idx_la_attempts_lab_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_la_attempts_lab_student ON public.la_attempts USING btree (lab_id, student_id);


--
-- Name: idx_la_attempts_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_la_attempts_student ON public.la_attempts USING btree (student_id);


--
-- Name: idx_la_mcq_alloc_lab_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_la_mcq_alloc_lab_student ON public.la_student_mcq_allocations USING btree (lab_id, student_id);


--
-- Name: idx_la_mcq_alloc_mcq; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_la_mcq_alloc_mcq ON public.la_student_mcq_allocations USING btree (mcq_id);


--
-- Name: idx_la_mcq_sub_attempt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_la_mcq_sub_attempt ON public.la_mcq_submissions USING btree (attempt_id);


--
-- Name: idx_la_mcq_sub_mcq; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_la_mcq_sub_mcq ON public.la_mcq_submissions USING btree (mcq_id);


--
-- Name: idx_la_qsub_attempt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_la_qsub_attempt ON public.la_question_submissions USING btree (attempt_id);


--
-- Name: idx_la_sel_mcq_lab; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_la_sel_mcq_lab ON public.la_selected_mcqs USING btree (lab_id);


--
-- Name: idx_la_sel_mcq_mcq; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_la_sel_mcq_mcq ON public.la_selected_mcqs USING btree (mcq_id);


--
-- Name: idx_la_sel_q_lab; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_la_sel_q_lab ON public.la_selected_questions USING btree (lab_id);


--
-- Name: idx_la_sel_q_question; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_la_sel_q_question ON public.la_selected_questions USING btree (lab_question_id);


--
-- Name: idx_la_topics_lab; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_la_topics_lab ON public.la_assessment_topics USING btree (lab_id);


--
-- Name: idx_la_topics_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_la_topics_topic ON public.la_assessment_topics USING btree (topic_id);


--
-- Name: idx_lab_assessment_faculty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lab_assessment_faculty ON public.lab_assessment USING btree (faculty_id);


--
-- Name: idx_lab_assessment_room; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lab_assessment_room ON public.lab_assessment USING btree (room_id);


--
-- Name: idx_lab_mcq_faculty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lab_mcq_faculty ON public.lab_mcq_questions USING btree (created_by_faculty_id);


--
-- Name: idx_lab_mcq_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lab_mcq_published ON public.lab_mcq_questions USING btree (is_published);


--
-- Name: idx_lab_mcq_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lab_mcq_status ON public.lab_mcq_questions USING btree (status);


--
-- Name: idx_lab_mcq_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lab_mcq_topic ON public.lab_mcq_questions USING btree (topic_id);


--
-- Name: idx_lab_questions_archived; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lab_questions_archived ON public.lab_coding_questions USING btree (is_archived);


--
-- Name: idx_lab_questions_faculty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lab_questions_faculty ON public.lab_coding_questions USING btree (created_by_faculty_id);


--
-- Name: idx_lab_questions_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lab_questions_published ON public.lab_coding_questions USING btree (is_published);


--
-- Name: idx_lab_questions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lab_questions_status ON public.lab_coding_questions USING btree (status);


--
-- Name: idx_lab_questions_subtopic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lab_questions_subtopic ON public.lab_coding_questions USING btree (subtopic_id);


--
-- Name: idx_lab_questions_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lab_questions_topic ON public.lab_coding_questions USING btree (topic_id);


--
-- Name: idx_pq_questions_quiz; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pq_questions_quiz ON public.prerequisite_quiz_questions USING btree (prereq_quiz_id);


--
-- Name: idx_prerequisite_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prerequisite_topic ON public.prerequisite USING btree (topic_id);


--
-- Name: idx_progress_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progress_student ON public.progress USING btree (student_id);


--
-- Name: idx_progress_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_progress_topic ON public.progress USING btree (topic_id);


--
-- Name: idx_pwd_reset_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pwd_reset_hash ON public.password_reset_tokens USING btree (token_hash);


--
-- Name: idx_pwd_reset_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pwd_reset_user ON public.password_reset_tokens USING btree (user_id);


--
-- Name: idx_quiz_attempts_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quiz_attempts_ref ON public.quiz_attempts USING btree (quiz_type, quiz_ref_id);


--
-- Name: idx_quiz_attempts_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quiz_attempts_student ON public.quiz_attempts USING btree (student_id);


--
-- Name: idx_room_topics_room; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_room_topics_room ON public.room_topics USING btree (room_id);


--
-- Name: idx_room_topics_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_room_topics_topic ON public.room_topics USING btree (topic_id);


--
-- Name: idx_rooms_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rooms_code ON public.rooms USING btree (room_code);


--
-- Name: idx_rooms_faculty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rooms_faculty ON public.rooms USING btree (faculty_id);


--
-- Name: idx_scca_testcases_q; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scca_testcases_q ON public.subtopic_coding_test_cases USING btree (scca_id);


--
-- Name: idx_student_roll; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_roll ON public.student USING btree (roll_number);


--
-- Name: idx_student_rooms_room; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_rooms_room ON public.student_rooms USING btree (room_id);


--
-- Name: idx_student_rooms_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_rooms_student ON public.student_rooms USING btree (student_id);


--
-- Name: idx_student_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_user ON public.student USING btree (user_id);


--
-- Name: idx_subtopic_progress_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subtopic_progress_student ON public.subtopic_progress USING btree (student_id);


--
-- Name: idx_subtopic_progress_subtopic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subtopic_progress_subtopic ON public.subtopic_progress USING btree (subtopic_id);


--
-- Name: idx_subtopics_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subtopics_topic ON public.subtopics USING btree (topic_id);


--
-- Name: idx_tca_questions_tca; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tca_questions_tca ON public.tca_questions USING btree (tca_id);


--
-- Name: idx_tca_testcases_q; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tca_testcases_q ON public.tca_test_cases USING btree (tca_question_id);


--
-- Name: idx_tca_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tca_topic ON public.topic_coding_assessment USING btree (topic_id);


--
-- Name: idx_topic_feedback_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_topic_feedback_student ON public.topic_feedback USING btree (student_id);


--
-- Name: idx_topic_feedback_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_topic_feedback_topic ON public.topic_feedback USING btree (topic_id);


--
-- Name: idx_topic_videos_topic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_topic_videos_topic ON public.topic_video_references USING btree (topic_id);


--
-- Name: idx_users_approval_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_approval_status ON public.users USING btree (approval_status);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role_status ON public.users USING btree (role, approval_status);


--
-- Name: assignment_questions assignment_questions_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment_questions
    ADD CONSTRAINT assignment_questions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(assignment_id) ON DELETE CASCADE;


--
-- Name: assignment_test_cases assignment_test_cases_asg_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment_test_cases
    ADD CONSTRAINT assignment_test_cases_asg_question_id_fkey FOREIGN KEY (asg_question_id) REFERENCES public.assignment_questions(asg_question_id) ON DELETE CASCADE;


--
-- Name: assignments assignments_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculty(faculty_id) ON DELETE CASCADE;


--
-- Name: coding_submissions coding_submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coding_submissions
    ADD CONSTRAINT coding_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: faculty faculty_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: final_quiz_questions final_quiz_questions_final_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.final_quiz_questions
    ADD CONSTRAINT final_quiz_questions_final_quiz_id_fkey FOREIGN KEY (final_quiz_id) REFERENCES public.final_quiz(final_quiz_id) ON DELETE CASCADE;


--
-- Name: final_quiz final_quiz_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.final_quiz
    ADD CONSTRAINT final_quiz_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: la_assessment_topics la_assessment_topics_lab_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_assessment_topics
    ADD CONSTRAINT la_assessment_topics_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.lab_assessment(lab_id) ON DELETE CASCADE;


--
-- Name: la_assessment_topics la_assessment_topics_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_assessment_topics
    ADD CONSTRAINT la_assessment_topics_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: la_attempts la_attempts_lab_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_attempts
    ADD CONSTRAINT la_attempts_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.lab_assessment(lab_id) ON DELETE CASCADE;


--
-- Name: la_attempts la_attempts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_attempts
    ADD CONSTRAINT la_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: la_mcq_submissions la_mcq_submissions_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_mcq_submissions
    ADD CONSTRAINT la_mcq_submissions_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.la_attempts(attempt_id) ON DELETE CASCADE;


--
-- Name: la_mcq_submissions la_mcq_submissions_mcq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_mcq_submissions
    ADD CONSTRAINT la_mcq_submissions_mcq_id_fkey FOREIGN KEY (mcq_id) REFERENCES public.lab_mcq_questions(mcq_id) ON DELETE CASCADE;


--
-- Name: la_question_submissions la_question_submissions_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_question_submissions
    ADD CONSTRAINT la_question_submissions_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.la_attempts(attempt_id) ON DELETE CASCADE;


--
-- Name: la_question_submissions la_question_submissions_lab_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_question_submissions
    ADD CONSTRAINT la_question_submissions_lab_question_id_fkey FOREIGN KEY (lab_question_id) REFERENCES public.lab_coding_questions(lab_question_id) ON DELETE CASCADE;


--
-- Name: la_selected_mcqs la_selected_mcqs_lab_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_selected_mcqs
    ADD CONSTRAINT la_selected_mcqs_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.lab_assessment(lab_id) ON DELETE CASCADE;


--
-- Name: la_selected_mcqs la_selected_mcqs_mcq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_selected_mcqs
    ADD CONSTRAINT la_selected_mcqs_mcq_id_fkey FOREIGN KEY (mcq_id) REFERENCES public.lab_mcq_questions(mcq_id) ON DELETE CASCADE;


--
-- Name: la_selected_questions la_selected_questions_lab_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_selected_questions
    ADD CONSTRAINT la_selected_questions_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.lab_assessment(lab_id) ON DELETE CASCADE;


--
-- Name: la_selected_questions la_selected_questions_lab_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_selected_questions
    ADD CONSTRAINT la_selected_questions_lab_question_id_fkey FOREIGN KEY (lab_question_id) REFERENCES public.lab_coding_questions(lab_question_id) ON DELETE CASCADE;


--
-- Name: la_student_allocations la_student_allocations_lab_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_student_allocations
    ADD CONSTRAINT la_student_allocations_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.lab_assessment(lab_id) ON DELETE CASCADE;


--
-- Name: la_student_allocations la_student_allocations_lab_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_student_allocations
    ADD CONSTRAINT la_student_allocations_lab_question_id_fkey FOREIGN KEY (lab_question_id) REFERENCES public.lab_coding_questions(lab_question_id) ON DELETE CASCADE;


--
-- Name: la_student_allocations la_student_allocations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_student_allocations
    ADD CONSTRAINT la_student_allocations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: la_student_mcq_allocations la_student_mcq_allocations_lab_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_student_mcq_allocations
    ADD CONSTRAINT la_student_mcq_allocations_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.lab_assessment(lab_id) ON DELETE CASCADE;


--
-- Name: la_student_mcq_allocations la_student_mcq_allocations_mcq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_student_mcq_allocations
    ADD CONSTRAINT la_student_mcq_allocations_mcq_id_fkey FOREIGN KEY (mcq_id) REFERENCES public.lab_mcq_questions(mcq_id) ON DELETE CASCADE;


--
-- Name: la_student_mcq_allocations la_student_mcq_allocations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.la_student_mcq_allocations
    ADD CONSTRAINT la_student_mcq_allocations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: lab_assessment lab_assessment_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_assessment
    ADD CONSTRAINT lab_assessment_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculty(faculty_id) ON DELETE CASCADE;


--
-- Name: lab_assessment lab_assessment_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_assessment
    ADD CONSTRAINT lab_assessment_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE;


--
-- Name: lab_coding_questions lab_coding_questions_created_by_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_coding_questions
    ADD CONSTRAINT lab_coding_questions_created_by_faculty_id_fkey FOREIGN KEY (created_by_faculty_id) REFERENCES public.faculty(faculty_id) ON DELETE SET NULL;


--
-- Name: lab_coding_questions lab_coding_questions_lab_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_coding_questions
    ADD CONSTRAINT lab_coding_questions_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.lab_assessment(lab_id) ON DELETE CASCADE;


--
-- Name: lab_coding_questions lab_coding_questions_subtopic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_coding_questions
    ADD CONSTRAINT lab_coding_questions_subtopic_id_fkey FOREIGN KEY (subtopic_id) REFERENCES public.subtopics(subtopic_id) ON DELETE SET NULL;


--
-- Name: lab_coding_questions lab_coding_questions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_coding_questions
    ADD CONSTRAINT lab_coding_questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE SET NULL;


--
-- Name: lab_mcq_questions lab_mcq_questions_created_by_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_mcq_questions
    ADD CONSTRAINT lab_mcq_questions_created_by_faculty_id_fkey FOREIGN KEY (created_by_faculty_id) REFERENCES public.faculty(faculty_id) ON DELETE SET NULL;


--
-- Name: lab_mcq_questions lab_mcq_questions_subtopic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_mcq_questions
    ADD CONSTRAINT lab_mcq_questions_subtopic_id_fkey FOREIGN KEY (subtopic_id) REFERENCES public.subtopics(subtopic_id) ON DELETE SET NULL;


--
-- Name: lab_mcq_questions lab_mcq_questions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_mcq_questions
    ADD CONSTRAINT lab_mcq_questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: lab_test_cases lab_test_cases_lab_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_test_cases
    ADD CONSTRAINT lab_test_cases_lab_question_id_fkey FOREIGN KEY (lab_question_id) REFERENCES public.lab_coding_questions(lab_question_id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: prerequisite_quiz prerequisite_quiz_prereq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prerequisite_quiz
    ADD CONSTRAINT prerequisite_quiz_prereq_id_fkey FOREIGN KEY (prereq_id) REFERENCES public.prerequisite(prereq_id) ON DELETE CASCADE;


--
-- Name: prerequisite_quiz_questions prerequisite_quiz_questions_prereq_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prerequisite_quiz_questions
    ADD CONSTRAINT prerequisite_quiz_questions_prereq_quiz_id_fkey FOREIGN KEY (prereq_quiz_id) REFERENCES public.prerequisite_quiz(prereq_quiz_id) ON DELETE CASCADE;


--
-- Name: prerequisite prerequisite_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prerequisite
    ADD CONSTRAINT prerequisite_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: progress progress_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: progress progress_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: room_topics room_topics_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_topics
    ADD CONSTRAINT room_topics_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE;


--
-- Name: room_topics room_topics_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_topics
    ADD CONSTRAINT room_topics_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: rooms rooms_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculty(faculty_id) ON DELETE CASCADE;


--
-- Name: student_rooms student_rooms_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_rooms
    ADD CONSTRAINT student_rooms_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE;


--
-- Name: student_rooms student_rooms_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_rooms
    ADD CONSTRAINT student_rooms_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: student student_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: subtopic_coding_assessment subtopic_coding_assessment_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_coding_assessment
    ADD CONSTRAINT subtopic_coding_assessment_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.subtopic_content(content_id) ON DELETE CASCADE;


--
-- Name: subtopic_coding_test_cases subtopic_coding_test_cases_scca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_coding_test_cases
    ADD CONSTRAINT subtopic_coding_test_cases_scca_id_fkey FOREIGN KEY (scca_id) REFERENCES public.subtopic_coding_assessment(scca_id) ON DELETE CASCADE;


--
-- Name: subtopic_content subtopic_content_subtopic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_content
    ADD CONSTRAINT subtopic_content_subtopic_id_fkey FOREIGN KEY (subtopic_id) REFERENCES public.subtopics(subtopic_id) ON DELETE CASCADE;


--
-- Name: subtopic_feedback subtopic_feedback_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_feedback
    ADD CONSTRAINT subtopic_feedback_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.subtopic_content(content_id) ON DELETE CASCADE;


--
-- Name: subtopic_progress subtopic_progress_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_progress
    ADD CONSTRAINT subtopic_progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: subtopic_progress subtopic_progress_subtopic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_progress
    ADD CONSTRAINT subtopic_progress_subtopic_id_fkey FOREIGN KEY (subtopic_id) REFERENCES public.subtopics(subtopic_id) ON DELETE CASCADE;


--
-- Name: subtopic_quiz_questions subtopic_quiz_questions_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopic_quiz_questions
    ADD CONSTRAINT subtopic_quiz_questions_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.subtopic_content(content_id) ON DELETE CASCADE;


--
-- Name: subtopics subtopics_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtopics
    ADD CONSTRAINT subtopics_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: tca_questions tca_questions_tca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tca_questions
    ADD CONSTRAINT tca_questions_tca_id_fkey FOREIGN KEY (tca_id) REFERENCES public.topic_coding_assessment(tca_id) ON DELETE CASCADE;


--
-- Name: tca_test_cases tca_test_cases_tca_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tca_test_cases
    ADD CONSTRAINT tca_test_cases_tca_question_id_fkey FOREIGN KEY (tca_question_id) REFERENCES public.tca_questions(tca_question_id) ON DELETE CASCADE;


--
-- Name: topic_coding_assessment topic_coding_assessment_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_coding_assessment
    ADD CONSTRAINT topic_coding_assessment_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: topic_feedback topic_feedback_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_feedback
    ADD CONSTRAINT topic_feedback_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: topic_feedback topic_feedback_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_feedback
    ADD CONSTRAINT topic_feedback_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: topic_video_references topic_video_references_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topic_video_references
    ADD CONSTRAINT topic_video_references_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: users users_approval_decision_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_approval_decision_by_fkey FOREIGN KEY (approval_decision_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict s32NmSgVcoJpdwCz1IKfSMf6pPbSDi26pRIrQomMNLTnDC0nDQ7jzIOHQT3YrjG

