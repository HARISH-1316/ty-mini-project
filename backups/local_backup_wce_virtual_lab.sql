--
-- PostgreSQL database dump
--

\restrict g7ojtcq3IVOXRPnx151se6bRULrzkXDxDIrhyvhcZ282lKHaKb38dPA1hA554Ll

-- Dumped from database version 18.4
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
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'STUDENT',
    'FACULTY',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: assessment_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.assessment_type_enum AS ENUM (
    'topic',
    'subtopic',
    'lab',
    'assignment'
);


ALTER TYPE public.assessment_type_enum OWNER TO postgres;

--
-- Name: progress_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.progress_status AS ENUM (
    'Not Started',
    'In Progress',
    'Completed'
);


ALTER TYPE public.progress_status OWNER TO postgres;

--
-- Name: quiz_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.quiz_type_enum AS ENUM (
    'prerequisite',
    'subtopic',
    'final'
);


ALTER TYPE public.quiz_type_enum OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'student',
    'faculty',
    'admin'
);


ALTER TYPE public.user_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assignment_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignment_questions (
    asg_question_id integer NOT NULL,
    assignment_id integer NOT NULL,
    problem_statement text,
    constraints text,
    marks integer,
    order_index integer
);


ALTER TABLE public.assignment_questions OWNER TO postgres;

--
-- Name: assignment_questions_asg_question_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assignment_questions_asg_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignment_questions_asg_question_id_seq OWNER TO postgres;

--
-- Name: assignment_questions_asg_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assignment_questions_asg_question_id_seq OWNED BY public.assignment_questions.asg_question_id;


--
-- Name: assignment_test_cases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignment_test_cases (
    asg_testcase_id integer NOT NULL,
    asg_question_id integer NOT NULL,
    input text,
    expected_output text,
    is_hidden boolean DEFAULT false,
    order_index integer
);


ALTER TABLE public.assignment_test_cases OWNER TO postgres;

--
-- Name: assignment_test_cases_asg_testcase_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assignment_test_cases_asg_testcase_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignment_test_cases_asg_testcase_id_seq OWNER TO postgres;

--
-- Name: assignment_test_cases_asg_testcase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assignment_test_cases_asg_testcase_id_seq OWNED BY public.assignment_test_cases.asg_testcase_id;


--
-- Name: assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignments (
    assignment_id integer NOT NULL,
    faculty_id integer NOT NULL,
    title character varying(200),
    description text,
    deadline timestamp without time zone,
    total_marks integer
);


ALTER TABLE public.assignments OWNER TO postgres;

--
-- Name: assignments_assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assignments_assignment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignments_assignment_id_seq OWNER TO postgres;

--
-- Name: assignments_assignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assignments_assignment_id_seq OWNED BY public.assignments.assignment_id;


--
-- Name: coding_submissions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.coding_submissions OWNER TO postgres;

--
-- Name: coding_submissions_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coding_submissions_submission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coding_submissions_submission_id_seq OWNER TO postgres;

--
-- Name: coding_submissions_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coding_submissions_submission_id_seq OWNED BY public.coding_submissions.submission_id;


--
-- Name: faculty; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faculty (
    faculty_id integer NOT NULL,
    user_id integer NOT NULL,
    designation character varying(100),
    department character varying(100),
    specialization character varying(100),
    phone character varying(20)
);


ALTER TABLE public.faculty OWNER TO postgres;

--
-- Name: faculty_faculty_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.faculty_faculty_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faculty_faculty_id_seq OWNER TO postgres;

--
-- Name: faculty_faculty_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.faculty_faculty_id_seq OWNED BY public.faculty.faculty_id;


--
-- Name: final_quiz; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.final_quiz (
    final_quiz_id integer NOT NULL,
    topic_id integer NOT NULL,
    title character varying(200),
    total_marks integer,
    time_limit integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.final_quiz OWNER TO postgres;

--
-- Name: final_quiz_final_quiz_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.final_quiz_final_quiz_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.final_quiz_final_quiz_id_seq OWNER TO postgres;

--
-- Name: final_quiz_final_quiz_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.final_quiz_final_quiz_id_seq OWNED BY public.final_quiz.final_quiz_id;


--
-- Name: final_quiz_questions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.final_quiz_questions OWNER TO postgres;

--
-- Name: final_quiz_questions_fq_question_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.final_quiz_questions_fq_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.final_quiz_questions_fq_question_id_seq OWNER TO postgres;

--
-- Name: final_quiz_questions_fq_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.final_quiz_questions_fq_question_id_seq OWNED BY public.final_quiz_questions.fq_question_id;


--
-- Name: la_assessment_topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.la_assessment_topics (
    id integer NOT NULL,
    lab_id integer NOT NULL,
    topic_id integer NOT NULL
);


ALTER TABLE public.la_assessment_topics OWNER TO postgres;

--
-- Name: la_assessment_topics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.la_assessment_topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.la_assessment_topics_id_seq OWNER TO postgres;

--
-- Name: la_assessment_topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.la_assessment_topics_id_seq OWNED BY public.la_assessment_topics.id;


--
-- Name: la_attempts; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.la_attempts OWNER TO postgres;

--
-- Name: la_attempts_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.la_attempts_attempt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.la_attempts_attempt_id_seq OWNER TO postgres;

--
-- Name: la_attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.la_attempts_attempt_id_seq OWNED BY public.la_attempts.attempt_id;


--
-- Name: la_mcq_submissions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.la_mcq_submissions OWNER TO postgres;

--
-- Name: la_mcq_submissions_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.la_mcq_submissions_submission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.la_mcq_submissions_submission_id_seq OWNER TO postgres;

--
-- Name: la_mcq_submissions_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.la_mcq_submissions_submission_id_seq OWNED BY public.la_mcq_submissions.submission_id;


--
-- Name: la_question_submissions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.la_question_submissions OWNER TO postgres;

--
-- Name: la_question_submissions_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.la_question_submissions_submission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.la_question_submissions_submission_id_seq OWNER TO postgres;

--
-- Name: la_question_submissions_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.la_question_submissions_submission_id_seq OWNED BY public.la_question_submissions.submission_id;


--
-- Name: la_selected_mcqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.la_selected_mcqs (
    id integer NOT NULL,
    lab_id integer NOT NULL,
    mcq_id integer NOT NULL,
    question_order integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.la_selected_mcqs OWNER TO postgres;

--
-- Name: la_selected_mcqs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.la_selected_mcqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.la_selected_mcqs_id_seq OWNER TO postgres;

--
-- Name: la_selected_mcqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.la_selected_mcqs_id_seq OWNED BY public.la_selected_mcqs.id;


--
-- Name: la_selected_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.la_selected_questions (
    id integer NOT NULL,
    lab_id integer NOT NULL,
    lab_question_id integer NOT NULL,
    question_order integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.la_selected_questions OWNER TO postgres;

--
-- Name: la_selected_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.la_selected_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.la_selected_questions_id_seq OWNER TO postgres;

--
-- Name: la_selected_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.la_selected_questions_id_seq OWNED BY public.la_selected_questions.id;


--
-- Name: la_student_allocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.la_student_allocations (
    allocation_id integer NOT NULL,
    lab_id integer NOT NULL,
    student_id integer NOT NULL,
    lab_question_id integer NOT NULL,
    question_order integer NOT NULL,
    allocated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_manual boolean DEFAULT false NOT NULL
);


ALTER TABLE public.la_student_allocations OWNER TO postgres;

--
-- Name: la_student_allocations_allocation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.la_student_allocations_allocation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.la_student_allocations_allocation_id_seq OWNER TO postgres;

--
-- Name: la_student_allocations_allocation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.la_student_allocations_allocation_id_seq OWNED BY public.la_student_allocations.allocation_id;


--
-- Name: la_student_mcq_allocations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.la_student_mcq_allocations OWNER TO postgres;

--
-- Name: la_student_mcq_allocations_allocation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.la_student_mcq_allocations_allocation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.la_student_mcq_allocations_allocation_id_seq OWNER TO postgres;

--
-- Name: la_student_mcq_allocations_allocation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.la_student_mcq_allocations_allocation_id_seq OWNED BY public.la_student_mcq_allocations.allocation_id;


--
-- Name: lab_assessment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_assessment (
    lab_id integer NOT NULL,
    faculty_id integer NOT NULL,
    title character varying(200),
    description text,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    duration integer,
    total_marks integer,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    num_questions integer DEFAULT 5 NOT NULL,
    marks_per_question integer DEFAULT 10 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    allocation_mode character varying(30) DEFAULT 'random'::character varying NOT NULL,
    room_id integer NOT NULL,
    num_coding_questions integer DEFAULT 3 NOT NULL,
    num_mcq_questions integer DEFAULT 0 NOT NULL,
    marks_per_mcq integer DEFAULT 2 NOT NULL,
    CONSTRAINT lab_assessment_allocation_mode_check CHECK (((allocation_mode)::text = ANY ((ARRAY['specific'::character varying, 'random'::character varying, 'hybrid'::character varying])::text[]))),
    CONSTRAINT lab_assessment_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying, 'active'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.lab_assessment OWNER TO postgres;

--
-- Name: lab_assessment_lab_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_assessment_lab_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lab_assessment_lab_id_seq OWNER TO postgres;

--
-- Name: lab_assessment_lab_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lab_assessment_lab_id_seq OWNED BY public.lab_assessment.lab_id;


--
-- Name: lab_coding_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_coding_questions (
    lab_question_id integer NOT NULL,
    lab_id integer,
    problem_statement text,
    constraints text,
    marks integer,
    order_index integer,
    topic_id integer,
    title character varying(300),
    input_format text,
    output_format text,
    sample_input text,
    sample_output text,
    explanation text,
    difficulty character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    created_by_faculty_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    subtopic_id integer,
    supported_languages jsonb DEFAULT '["c", "cpp", "java", "python"]'::jsonb,
    is_archived boolean DEFAULT false,
    status character varying(20) DEFAULT 'published'::character varying NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    CONSTRAINT lab_coding_questions_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying])::text[]))),
    CONSTRAINT lab_coding_questions_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.lab_coding_questions OWNER TO postgres;

--
-- Name: lab_coding_questions_lab_question_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_coding_questions_lab_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lab_coding_questions_lab_question_id_seq OWNER TO postgres;

--
-- Name: lab_coding_questions_lab_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lab_coding_questions_lab_question_id_seq OWNED BY public.lab_coding_questions.lab_question_id;


--
-- Name: lab_mcq_questions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.lab_mcq_questions OWNER TO postgres;

--
-- Name: lab_mcq_questions_mcq_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_mcq_questions_mcq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lab_mcq_questions_mcq_id_seq OWNER TO postgres;

--
-- Name: lab_mcq_questions_mcq_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lab_mcq_questions_mcq_id_seq OWNED BY public.lab_mcq_questions.mcq_id;


--
-- Name: lab_test_cases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_test_cases (
    lab_testcase_id integer NOT NULL,
    lab_question_id integer NOT NULL,
    input text,
    expected_output text,
    is_hidden boolean DEFAULT false,
    order_index integer
);


ALTER TABLE public.lab_test_cases OWNER TO postgres;

--
-- Name: lab_test_cases_lab_testcase_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lab_test_cases_lab_testcase_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lab_test_cases_lab_testcase_id_seq OWNER TO postgres;

--
-- Name: lab_test_cases_lab_testcase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lab_test_cases_lab_testcase_id_seq OWNED BY public.lab_test_cases.lab_testcase_id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    token_id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_token_id_seq OWNER TO postgres;

--
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_token_id_seq OWNED BY public.password_reset_tokens.token_id;


--
-- Name: prerequisite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prerequisite (
    prereq_id integer NOT NULL,
    topic_id integer NOT NULL,
    description text,
    content text,
    order_index integer
);


ALTER TABLE public.prerequisite OWNER TO postgres;

--
-- Name: prerequisite_prereq_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prerequisite_prereq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prerequisite_prereq_id_seq OWNER TO postgres;

--
-- Name: prerequisite_prereq_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prerequisite_prereq_id_seq OWNED BY public.prerequisite.prereq_id;


--
-- Name: prerequisite_quiz; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prerequisite_quiz (
    prereq_quiz_id integer NOT NULL,
    prereq_id integer NOT NULL,
    title character varying(200),
    total_marks integer,
    passing_criteria integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    time_limit integer DEFAULT 15
);


ALTER TABLE public.prerequisite_quiz OWNER TO postgres;

--
-- Name: prerequisite_quiz_prereq_quiz_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prerequisite_quiz_prereq_quiz_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prerequisite_quiz_prereq_quiz_id_seq OWNER TO postgres;

--
-- Name: prerequisite_quiz_prereq_quiz_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prerequisite_quiz_prereq_quiz_id_seq OWNED BY public.prerequisite_quiz.prereq_quiz_id;


--
-- Name: prerequisite_quiz_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prerequisite_quiz_questions (
    pq_question_id integer NOT NULL,
    prereq_quiz_id integer NOT NULL,
    question_text text NOT NULL,
    option_a text NOT NULL,
    option_b text NOT NULL,
    option_c text NOT NULL,
    option_d text NOT NULL,
    correct_option character(1) NOT NULL,
    marks integer DEFAULT 1,
    order_index integer
);


ALTER TABLE public.prerequisite_quiz_questions OWNER TO postgres;

--
-- Name: prerequisite_quiz_questions_pq_question_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prerequisite_quiz_questions_pq_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prerequisite_quiz_questions_pq_question_id_seq OWNER TO postgres;

--
-- Name: prerequisite_quiz_questions_pq_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prerequisite_quiz_questions_pq_question_id_seq OWNED BY public.prerequisite_quiz_questions.pq_question_id;


--
-- Name: progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progress (
    progress_id integer NOT NULL,
    student_id integer NOT NULL,
    topic_id integer NOT NULL,
    status public.progress_status DEFAULT 'Not Started'::public.progress_status,
    time_spent integer DEFAULT 0,
    last_accessed timestamp without time zone
);


ALTER TABLE public.progress OWNER TO postgres;

--
-- Name: progress_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.progress_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.progress_progress_id_seq OWNER TO postgres;

--
-- Name: progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.progress_progress_id_seq OWNED BY public.progress.progress_id;


--
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.quiz_attempts OWNER TO postgres;

--
-- Name: quiz_attempts_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quiz_attempts_attempt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_attempts_attempt_id_seq OWNER TO postgres;

--
-- Name: quiz_attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quiz_attempts_attempt_id_seq OWNED BY public.quiz_attempts.attempt_id;


--
-- Name: room_topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room_topics (
    room_topic_id integer NOT NULL,
    room_id integer NOT NULL,
    topic_id integer NOT NULL,
    order_index integer
);


ALTER TABLE public.room_topics OWNER TO postgres;

--
-- Name: room_topics_room_topic_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.room_topics_room_topic_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.room_topics_room_topic_id_seq OWNER TO postgres;

--
-- Name: room_topics_room_topic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.room_topics_room_topic_id_seq OWNED BY public.room_topics.room_topic_id;


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    room_id integer NOT NULL,
    faculty_id integer NOT NULL,
    room_name character varying(150) NOT NULL,
    room_code character varying(20) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- Name: rooms_room_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rooms_room_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rooms_room_id_seq OWNER TO postgres;

--
-- Name: rooms_room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rooms_room_id_seq OWNED BY public.rooms.room_id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: student; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student (
    student_id integer NOT NULL,
    user_id integer NOT NULL,
    roll_number character varying(30) NOT NULL,
    course character varying(100),
    year integer,
    phone character varying(20)
);


ALTER TABLE public.student OWNER TO postgres;

--
-- Name: student_rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_rooms (
    student_room_id integer NOT NULL,
    student_id integer NOT NULL,
    room_id integer NOT NULL,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.student_rooms OWNER TO postgres;

--
-- Name: student_rooms_student_room_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_rooms_student_room_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_rooms_student_room_id_seq OWNER TO postgres;

--
-- Name: student_rooms_student_room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_rooms_student_room_id_seq OWNED BY public.student_rooms.student_room_id;


--
-- Name: student_student_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_student_id_seq OWNER TO postgres;

--
-- Name: student_student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_student_id_seq OWNED BY public.student.student_id;


--
-- Name: subtopic_coding_assessment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subtopic_coding_assessment (
    scca_id integer NOT NULL,
    content_id integer NOT NULL,
    problem_statement text,
    constraints text,
    sample_input text,
    sample_output text,
    marks integer,
    order_index integer,
    title character varying(200)
);


ALTER TABLE public.subtopic_coding_assessment OWNER TO postgres;

--
-- Name: subtopic_coding_assessment_scca_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subtopic_coding_assessment_scca_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subtopic_coding_assessment_scca_id_seq OWNER TO postgres;

--
-- Name: subtopic_coding_assessment_scca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subtopic_coding_assessment_scca_id_seq OWNED BY public.subtopic_coding_assessment.scca_id;


--
-- Name: subtopic_coding_test_cases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subtopic_coding_test_cases (
    scca_testcase_id integer NOT NULL,
    scca_id integer NOT NULL,
    input text,
    expected_output text,
    is_hidden boolean DEFAULT false,
    order_index integer
);


ALTER TABLE public.subtopic_coding_test_cases OWNER TO postgres;

--
-- Name: subtopic_coding_test_cases_scca_testcase_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subtopic_coding_test_cases_scca_testcase_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subtopic_coding_test_cases_scca_testcase_id_seq OWNER TO postgres;

--
-- Name: subtopic_coding_test_cases_scca_testcase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subtopic_coding_test_cases_scca_testcase_id_seq OWNED BY public.subtopic_coding_test_cases.scca_testcase_id;


--
-- Name: subtopic_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subtopic_content (
    content_id integer NOT NULL,
    subtopic_id integer NOT NULL,
    aim text,
    theory text,
    video_explanation_url text,
    time_limit integer DEFAULT 15
);


ALTER TABLE public.subtopic_content OWNER TO postgres;

--
-- Name: subtopic_content_content_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subtopic_content_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subtopic_content_content_id_seq OWNER TO postgres;

--
-- Name: subtopic_content_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subtopic_content_content_id_seq OWNED BY public.subtopic_content.content_id;


--
-- Name: subtopic_progress; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.subtopic_progress OWNER TO postgres;

--
-- Name: subtopic_progress_subtopic_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subtopic_progress_subtopic_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subtopic_progress_subtopic_progress_id_seq OWNER TO postgres;

--
-- Name: subtopic_progress_subtopic_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subtopic_progress_subtopic_progress_id_seq OWNED BY public.subtopic_progress.subtopic_progress_id;


--
-- Name: subtopic_quiz_questions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.subtopic_quiz_questions OWNER TO postgres;

--
-- Name: subtopic_quiz_questions_stq_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subtopic_quiz_questions_stq_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subtopic_quiz_questions_stq_id_seq OWNER TO postgres;

--
-- Name: subtopic_quiz_questions_stq_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subtopic_quiz_questions_stq_id_seq OWNED BY public.subtopic_quiz_questions.stq_id;


--
-- Name: subtopics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subtopics (
    subtopic_id integer NOT NULL,
    topic_id integer NOT NULL,
    title character varying(200) NOT NULL,
    order_index integer,
    is_published boolean DEFAULT true
);


ALTER TABLE public.subtopics OWNER TO postgres;

--
-- Name: subtopics_subtopic_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subtopics_subtopic_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subtopics_subtopic_id_seq OWNER TO postgres;

--
-- Name: subtopics_subtopic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subtopics_subtopic_id_seq OWNED BY public.subtopics.subtopic_id;


--
-- Name: tca_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tca_questions (
    tca_question_id integer NOT NULL,
    tca_id integer NOT NULL,
    problem_statement text,
    constraints text,
    sample_input text,
    sample_output text,
    marks integer,
    order_index integer,
    title character varying(200)
);


ALTER TABLE public.tca_questions OWNER TO postgres;

--
-- Name: tca_questions_tca_question_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tca_questions_tca_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tca_questions_tca_question_id_seq OWNER TO postgres;

--
-- Name: tca_questions_tca_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tca_questions_tca_question_id_seq OWNED BY public.tca_questions.tca_question_id;


--
-- Name: tca_test_cases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tca_test_cases (
    tca_testcase_id integer NOT NULL,
    tca_question_id integer NOT NULL,
    input text,
    expected_output text,
    is_hidden boolean DEFAULT false,
    order_index integer
);


ALTER TABLE public.tca_test_cases OWNER TO postgres;

--
-- Name: tca_test_cases_tca_testcase_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tca_test_cases_tca_testcase_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tca_test_cases_tca_testcase_id_seq OWNER TO postgres;

--
-- Name: tca_test_cases_tca_testcase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tca_test_cases_tca_testcase_id_seq OWNED BY public.tca_test_cases.tca_testcase_id;


--
-- Name: topic_coding_assessment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topic_coding_assessment (
    tca_id integer NOT NULL,
    topic_id integer NOT NULL,
    title character varying(200),
    description text,
    total_marks integer,
    time_limit integer
);


ALTER TABLE public.topic_coding_assessment OWNER TO postgres;

--
-- Name: topic_coding_assessment_tca_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.topic_coding_assessment_tca_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.topic_coding_assessment_tca_id_seq OWNER TO postgres;

--
-- Name: topic_coding_assessment_tca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.topic_coding_assessment_tca_id_seq OWNED BY public.topic_coding_assessment.tca_id;


--
-- Name: topic_feedback; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.topic_feedback OWNER TO postgres;

--
-- Name: topic_feedback_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.topic_feedback_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.topic_feedback_feedback_id_seq OWNER TO postgres;

--
-- Name: topic_feedback_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.topic_feedback_feedback_id_seq OWNED BY public.topic_feedback.feedback_id;


--
-- Name: topic_video_references; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.topic_video_references OWNER TO postgres;

--
-- Name: topic_video_references_video_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.topic_video_references_video_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.topic_video_references_video_id_seq OWNER TO postgres;

--
-- Name: topic_video_references_video_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.topic_video_references_video_id_seq OWNED BY public.topic_video_references.video_id;


--
-- Name: topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topics (
    topic_id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.topics OWNER TO postgres;

--
-- Name: topics_topic_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.topics_topic_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.topics_topic_id_seq OWNER TO postgres;

--
-- Name: topics_topic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.topics_topic_id_seq OWNED BY public.topics.topic_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    role public.user_role NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    approval_status character varying(20) DEFAULT 'approved'::character varying NOT NULL,
    rejection_reason text,
    approval_decision_at timestamp without time zone,
    approval_decision_by integer,
    CONSTRAINT users_approval_status_check CHECK (((approval_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: assignment_questions asg_question_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_questions ALTER COLUMN asg_question_id SET DEFAULT nextval('public.assignment_questions_asg_question_id_seq'::regclass);


--
-- Name: assignment_test_cases asg_testcase_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_test_cases ALTER COLUMN asg_testcase_id SET DEFAULT nextval('public.assignment_test_cases_asg_testcase_id_seq'::regclass);


--
-- Name: assignments assignment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments ALTER COLUMN assignment_id SET DEFAULT nextval('public.assignments_assignment_id_seq'::regclass);


--
-- Name: coding_submissions submission_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coding_submissions ALTER COLUMN submission_id SET DEFAULT nextval('public.coding_submissions_submission_id_seq'::regclass);


--
-- Name: faculty faculty_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculty ALTER COLUMN faculty_id SET DEFAULT nextval('public.faculty_faculty_id_seq'::regclass);


--
-- Name: final_quiz final_quiz_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_quiz ALTER COLUMN final_quiz_id SET DEFAULT nextval('public.final_quiz_final_quiz_id_seq'::regclass);


--
-- Name: final_quiz_questions fq_question_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_quiz_questions ALTER COLUMN fq_question_id SET DEFAULT nextval('public.final_quiz_questions_fq_question_id_seq'::regclass);


--
-- Name: la_assessment_topics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_assessment_topics ALTER COLUMN id SET DEFAULT nextval('public.la_assessment_topics_id_seq'::regclass);


--
-- Name: la_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.la_attempts_attempt_id_seq'::regclass);


--
-- Name: la_mcq_submissions submission_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_mcq_submissions ALTER COLUMN submission_id SET DEFAULT nextval('public.la_mcq_submissions_submission_id_seq'::regclass);


--
-- Name: la_question_submissions submission_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_question_submissions ALTER COLUMN submission_id SET DEFAULT nextval('public.la_question_submissions_submission_id_seq'::regclass);


--
-- Name: la_selected_mcqs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_selected_mcqs ALTER COLUMN id SET DEFAULT nextval('public.la_selected_mcqs_id_seq'::regclass);


--
-- Name: la_selected_questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_selected_questions ALTER COLUMN id SET DEFAULT nextval('public.la_selected_questions_id_seq'::regclass);


--
-- Name: la_student_allocations allocation_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_student_allocations ALTER COLUMN allocation_id SET DEFAULT nextval('public.la_student_allocations_allocation_id_seq'::regclass);


--
-- Name: la_student_mcq_allocations allocation_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_student_mcq_allocations ALTER COLUMN allocation_id SET DEFAULT nextval('public.la_student_mcq_allocations_allocation_id_seq'::regclass);


--
-- Name: lab_assessment lab_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_assessment ALTER COLUMN lab_id SET DEFAULT nextval('public.lab_assessment_lab_id_seq'::regclass);


--
-- Name: lab_coding_questions lab_question_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_coding_questions ALTER COLUMN lab_question_id SET DEFAULT nextval('public.lab_coding_questions_lab_question_id_seq'::regclass);


--
-- Name: lab_mcq_questions mcq_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_mcq_questions ALTER COLUMN mcq_id SET DEFAULT nextval('public.lab_mcq_questions_mcq_id_seq'::regclass);


--
-- Name: lab_test_cases lab_testcase_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_test_cases ALTER COLUMN lab_testcase_id SET DEFAULT nextval('public.lab_test_cases_lab_testcase_id_seq'::regclass);


--
-- Name: password_reset_tokens token_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN token_id SET DEFAULT nextval('public.password_reset_tokens_token_id_seq'::regclass);


--
-- Name: prerequisite prereq_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prerequisite ALTER COLUMN prereq_id SET DEFAULT nextval('public.prerequisite_prereq_id_seq'::regclass);


--
-- Name: prerequisite_quiz prereq_quiz_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prerequisite_quiz ALTER COLUMN prereq_quiz_id SET DEFAULT nextval('public.prerequisite_quiz_prereq_quiz_id_seq'::regclass);


--
-- Name: prerequisite_quiz_questions pq_question_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prerequisite_quiz_questions ALTER COLUMN pq_question_id SET DEFAULT nextval('public.prerequisite_quiz_questions_pq_question_id_seq'::regclass);


--
-- Name: progress progress_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress ALTER COLUMN progress_id SET DEFAULT nextval('public.progress_progress_id_seq'::regclass);


--
-- Name: quiz_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.quiz_attempts_attempt_id_seq'::regclass);


--
-- Name: room_topics room_topic_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_topics ALTER COLUMN room_topic_id SET DEFAULT nextval('public.room_topics_room_topic_id_seq'::regclass);


--
-- Name: rooms room_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms ALTER COLUMN room_id SET DEFAULT nextval('public.rooms_room_id_seq'::regclass);


--
-- Name: student student_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student ALTER COLUMN student_id SET DEFAULT nextval('public.student_student_id_seq'::regclass);


--
-- Name: student_rooms student_room_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_rooms ALTER COLUMN student_room_id SET DEFAULT nextval('public.student_rooms_student_room_id_seq'::regclass);


--
-- Name: subtopic_coding_assessment scca_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_coding_assessment ALTER COLUMN scca_id SET DEFAULT nextval('public.subtopic_coding_assessment_scca_id_seq'::regclass);


--
-- Name: subtopic_coding_test_cases scca_testcase_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_coding_test_cases ALTER COLUMN scca_testcase_id SET DEFAULT nextval('public.subtopic_coding_test_cases_scca_testcase_id_seq'::regclass);


--
-- Name: subtopic_content content_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_content ALTER COLUMN content_id SET DEFAULT nextval('public.subtopic_content_content_id_seq'::regclass);


--
-- Name: subtopic_progress subtopic_progress_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_progress ALTER COLUMN subtopic_progress_id SET DEFAULT nextval('public.subtopic_progress_subtopic_progress_id_seq'::regclass);


--
-- Name: subtopic_quiz_questions stq_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_quiz_questions ALTER COLUMN stq_id SET DEFAULT nextval('public.subtopic_quiz_questions_stq_id_seq'::regclass);


--
-- Name: subtopics subtopic_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopics ALTER COLUMN subtopic_id SET DEFAULT nextval('public.subtopics_subtopic_id_seq'::regclass);


--
-- Name: tca_questions tca_question_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tca_questions ALTER COLUMN tca_question_id SET DEFAULT nextval('public.tca_questions_tca_question_id_seq'::regclass);


--
-- Name: tca_test_cases tca_testcase_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tca_test_cases ALTER COLUMN tca_testcase_id SET DEFAULT nextval('public.tca_test_cases_tca_testcase_id_seq'::regclass);


--
-- Name: topic_coding_assessment tca_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topic_coding_assessment ALTER COLUMN tca_id SET DEFAULT nextval('public.topic_coding_assessment_tca_id_seq'::regclass);


--
-- Name: topic_feedback feedback_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topic_feedback ALTER COLUMN feedback_id SET DEFAULT nextval('public.topic_feedback_feedback_id_seq'::regclass);


--
-- Name: topic_video_references video_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topic_video_references ALTER COLUMN video_id SET DEFAULT nextval('public.topic_video_references_video_id_seq'::regclass);


--
-- Name: topics topic_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics ALTER COLUMN topic_id SET DEFAULT nextval('public.topics_topic_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: assignment_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignment_questions (asg_question_id, assignment_id, problem_statement, constraints, marks, order_index) FROM stdin;
\.


--
-- Data for Name: assignment_test_cases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignment_test_cases (asg_testcase_id, asg_question_id, input, expected_output, is_hidden, order_index) FROM stdin;
\.


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignments (assignment_id, faculty_id, title, description, deadline, total_marks) FROM stdin;
\.


--
-- Data for Name: coding_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coding_submissions (submission_id, student_id, assessment_type, assessment_ref_id, question_id, source_code, language, status, score, total_marks, questions_solved, total_questions, percentage, submitted_at) FROM stdin;
1	10	topic	1	1	import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int max=-1;\n            for(int i=0;i<n;i++){\n                max=Math.max(max,sc.nextInt());\n            }\n            System.out.println(max);\n        }\n    }\n}\n	java	Completed	10	10	1	1	100.00	2026-08-20 14:59:14.424033
2	10	topic	1	2	import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String S=sc.nextLine();\n        boolean flag=true;\n        for(int i=0;i<S.length()/2;i++){\n            if(S.charAt(i)!=S.charAt(S.length()-i-1)){\n                flag=false;\n                break;\n            }\n        }\n        if(flag) System.out.println("YES");\n        else System.out.println("NO");\n    }\n}\n	java	Completed	10	10	1	1	100.00	2026-08-20 15:03:46.908351
3	10	topic	1	2	import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String S=sc.nextLine();\n        boolean flag=true;\n        for(int i=0;i<S.length()/2;i++){\n            if(S.charAt(i)!=S.charAt(S.length()-i-1)){\n                flag=false;\n                break;\n            }\n        }\n        if(flag) System.out.println("NO");\n        else System.out.println("YES");\n    }\n}\n	java	Attempted	0	10	0	1	0.00	2026-08-20 15:04:59.837839
4	10	subtopic	10	6	import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNextInt()) {\n            int n = scanner.nextInt();\n            System.out.println(n);\n            // System.out.println(n);\n            for(int i=0;i<n;i++){\n                int x=scanner.nextInt();\n            }\n            System.out.println(3);\n        }\n    }\n}\n	java	Attempted	0	10	0	1	0.00	2026-08-21 14:26:40.123515
5	10	subtopic	3	1	#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    // Read input and write solution\n    int n;\n    if (cin >> n) {\n        cout << n << "\\n";\n    }\n    long sum=0;\n    for(int i=0;i<n;i++){\n        int x;\n        cin>>x;\n        sum+=x;\n    }\n    cout<<sum<<endl;\n\n    return 0;\n}\n	cpp	Attempted	0	10	0	1	0.00	2026-10-09 14:17:24.67734
6	10	topic	1	1	import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int N=sc.nextInt();\n        int max=(int)(-1e9);\n        for(int i=0;i<N;i++){\n            max=Math.max(max,sc.nextInt());\n        }\n        System.out.println(max);\n    }\n}\n	java	Completed	10	10	1	1	100.00	2026-10-19 21:08:34.993331
\.


--
-- Data for Name: faculty; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faculty (faculty_id, user_id, designation, department, specialization, phone) FROM stdin;
2	5	Assistant Professor	\N	\N	\N
6	9	Professor	Computer Science & Engineering	\N	\N
7	7	Administrator	Administration	\N	\N
14	27	Assistant Professor	Computer Science and Engineering	\N	\N
15	28	Professor	Computer Science and Engineering	\N	\N
\.


--
-- Data for Name: final_quiz; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.final_quiz (final_quiz_id, topic_id, title, total_marks, time_limit, created_at) FROM stdin;
1	1	Data Structures and Algorithms — Final Quiz	12	15	2026-08-19 17:33:34.130421
\.


--
-- Data for Name: final_quiz_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.final_quiz_questions (fq_question_id, final_quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) FROM stdin;
1	1	What is the worst-case time complexity of Quick Sort with standard Lomuto partition?	O(n log n)	O(n)	O(n^2)	O(log n)	C	1	1
2	1	Which traversal of a Binary Search Tree (BST) visits keys in strictly ascending sorted order?	Pre-order	In-order	Post-order	Level-order	B	1	2
3	1	Which data structure is utilized in Breadth-First Search (BFS) graph traversal?	Stack	Queue	Min-Heap	Disjoint Set	B	1	3
4	1	What is the time complexity of searching in a balanced AVL or Red-Black Tree with N nodes?	O(1)	O(log N)	O(N)	O(N log N)	B	1	4
5	1	In Dijkstra algorithm for single-source shortest paths, which data structure optimizes selecting the minimum distance vertex?	Stack	Priority Queue (Min-Heap)	Circular Queue	Hash Set	B	1	5
6	1	What is the recurrence relation for Merge Sort dividing input arrays in half at each step?	T(n) = T(n-1) + O(1)	T(n) = 2T(n/2) + O(n)	T(n) = T(n/2) + O(1)	T(n) = 2T(n-1) + O(1)	B	1	6
7	1	Which collision resolution technique stores colliding elements in linked lists outside the hash table array?	Linear Probing	Quadratic Probing	Separate Chaining	Double Hashing	C	1	7
8	1	What is the maximum number of nodes in a Binary Tree of height h (where root height = 0)?	2^h	2^(h+1) - 1	2*h	h^2	B	1	8
9	1	Which algorithmic paradigm solves the 0/1 Knapsack problem optimally in pseudo-polynomial time?	Greedy Approach	Divide and Conquer	Dynamic Programming	Brute Force Search	C	2	9
10	1	What is the auxiliary space complexity of standard Merge Sort on an array of size n?	O(1)	O(log n)	O(n)	O(n^2)	C	2	10
\.


--
-- Data for Name: la_assessment_topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.la_assessment_topics (id, lab_id, topic_id) FROM stdin;
8	10	1
9	11	1
11	13	1
12	14	1
29	26	3
30	26	5
31	26	4
32	26	1
33	26	2
34	27	2
35	27	1
36	27	4
37	27	5
38	27	3
39	28	4
40	28	5
41	28	1
46	32	4
47	33	2
48	33	3
49	34	2
53	38	2
54	38	6
55	39	2
56	39	3
57	40	2
58	40	4
59	41	3
60	41	2
61	42	2
62	42	3
63	42	4
65	44	2
66	44	3
67	47	6
\.


--
-- Data for Name: la_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.la_attempts (attempt_id, lab_id, student_id, started_at, effective_deadline, submitted_at, status, total_marks, obtained_marks) FROM stdin;
30	40	12	2026-10-20 15:12:12.60052+05:30	2026-10-20 15:59:00+05:30	\N	timed_out	40	0
36	44	12	2026-10-20 16:19:31.668927+05:30	2026-10-20 16:23:00+05:30	2026-10-20 16:20:27.576995+05:30	submitted	35	2
38	44	10	2026-10-20 16:20:44.231565+05:30	2026-10-20 16:23:00+05:30	\N	timed_out	40	0
8	11	10	2026-10-09 13:14:43.349385+05:30	2026-10-09 13:16:00+05:30	\N	timed_out	50	0
10	13	10	2026-10-09 13:19:16.101364+05:30	2026-10-09 13:20:00+05:30	\N	timed_out	50	0
40	47	21	2026-10-20 17:35:11.411662+05:30	2026-10-20 18:20:11.41+05:30	\N	timed_out	6	0
11	14	10	2026-10-09 13:33:20.88512+05:30	2026-10-09 13:34:00+05:30	\N	timed_out	50	5
17	26	10	2026-10-15 13:50:26.930083+05:30	2026-10-15 13:52:00+05:30	\N	timed_out	50	0
19	27	10	2026-10-15 14:23:34.391824+05:30	2026-10-15 14:25:00+05:30	2026-10-15 14:24:10.299705+05:30	submitted	50	0
22	33	10	2026-10-19 15:52:35.376351+05:30	2026-10-19 17:22:35.375+05:30	2026-10-19 15:52:38.474352+05:30	submitted	35	0
26	34	10	2026-10-20 13:59:57.889615+05:30	2026-10-20 14:59:57.887+05:30	\N	timed_out	15	0
28	40	10	2026-10-20 15:02:06.774289+05:30	2026-10-20 15:59:00+05:30	2026-10-20 15:02:53.026485+05:30	submitted	40	0
32	41	12	2026-10-20 15:12:21.926064+05:30	2026-10-20 15:20:00+05:30	\N	timed_out	20	0
33	41	10	2026-10-20 15:12:36.828174+05:30	2026-10-20 15:20:00+05:30	\N	timed_out	20	0
\.


--
-- Data for Name: la_mcq_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.la_mcq_submissions (submission_id, attempt_id, mcq_id, selected_option, is_correct, marks_obtained, submitted_at) FROM stdin;
2	36	16	A	f	0	2026-10-20 16:20:14.086512+05:30
3	36	13	B	t	2	2026-10-20 16:20:16.340308+05:30
4	36	11	C	f	0	2026-10-20 16:20:19.356744+05:30
5	36	19	A	f	0	2026-10-20 16:20:21.791609+05:30
\.


--
-- Data for Name: la_question_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.la_question_submissions (submission_id, attempt_id, lab_question_id, source_code, language, status, passed_test_cases, total_test_cases, marks_obtained, submitted_at) FROM stdin;
8	10	7	#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    // Read input and implement solution\n    int n;\n    if (cin >> n) {\n        cout << n << "\\n";\n    }\n\n    return 0;\n}\n	cpp	wrong_answer	0	2	0	2026-10-09 13:19:44.19226+05:30
9	11	5	#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    // Read input and implement solution\n    int n;\n    if (cin >> n) {\n        cout << n << "\\n";\n    }\n\n    return 0;\n}\n	cpp	partially_correct	2	4	5	2026-10-09 13:33:44.881726+05:30
10	11	7	#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    // Read input and implement solution\n    int n;\n    if (cin >> n) {\n        cout << n << "\\n";\n    }\n\n    return 0;\n}\n	cpp	wrong_answer	0	2	0	2026-10-09 13:33:53.564232+05:30
16	17	17	#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    // Read input and implement solution\n    int n;\n    if (cin >> n) {\n        cout << n << "\\n";\n    }\n\n    return 0;\n}\n	cpp	wrong_answer	0	4	0	2026-10-15 13:51:51.795686+05:30
18	19	8	#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    // Read input and implement solution\n    int n;\n    if (cin >> n) {\n        cout << n << "\\n";\n    }\n\n    return 0;\n}\n#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    // Read input and implement solution\n    int n;\n    if (cin >> n) {\n        cout << n << "\\n";\n    }\n\n    return 0;\n}\n#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    // Read input and implement solution\n    int n;\n    if (cin >> n) {\n        cout << n << "\\n";\n    }\n\n    return 0;\n}\n	cpp	compilation_error	0	4	0	2026-10-15 14:23:59.301137+05:30
20	22	10	\nimport sys\nlines = sys.stdin.read().split()\nif lines:\n    print(' '.join(reversed(lines[1:int(lines[0])+1])))\n	python	runtime_error	0	4	0	2026-10-19 15:52:38.465138+05:30
\.


--
-- Data for Name: la_selected_mcqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.la_selected_mcqs (id, lab_id, mcq_id, question_order) FROM stdin;
12	47	2	1
13	47	3	2
14	47	4	3
\.


--
-- Data for Name: la_selected_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.la_selected_questions (id, lab_id, lab_question_id, question_order) FROM stdin;
1	34	2	1
2	34	6	2
6	38	26	1
12	39	1	1
13	39	8	2
14	39	6	3
15	39	10	4
16	39	4	5
22	40	2	1
23	40	8	2
24	40	3	3
25	40	6	4
26	40	14	5
39	41	1	1
40	41	2	2
41	41	6	3
42	41	35	4
43	41	4	5
44	41	9	6
45	41	10	7
46	41	11	8
47	41	3	9
48	41	98	10
49	41	8	11
50	41	36	12
\.


--
-- Data for Name: la_student_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.la_student_allocations (allocation_id, lab_id, student_id, lab_question_id, question_order, allocated_at, is_manual) FROM stdin;
91	33	10	10	1	2026-10-19 15:52:35.376351+05:30	f
92	33	10	8	2	2026-10-19 15:52:35.376351+05:30	f
93	33	10	11	3	2026-10-19 15:52:35.376351+05:30	f
94	33	10	2	4	2026-10-19 15:52:35.376351+05:30	f
95	33	10	6	5	2026-10-19 15:52:35.376351+05:30	f
103	34	10	2	1	2026-10-20 13:59:57.889615+05:30	f
104	34	10	6	2	2026-10-20 13:59:57.889615+05:30	f
105	40	10	2	1	2026-10-20 15:02:06.774289+05:30	f
106	40	10	8	2	2026-10-20 15:02:06.774289+05:30	f
107	40	10	3	3	2026-10-20 15:02:06.774289+05:30	f
108	40	10	6	4	2026-10-20 15:02:06.774289+05:30	f
109	40	10	14	5	2026-10-20 15:02:06.774289+05:30	f
110	40	12	2	1	2026-10-20 15:12:12.60052+05:30	f
111	40	12	8	2	2026-10-20 15:12:12.60052+05:30	f
112	40	12	3	3	2026-10-20 15:12:12.60052+05:30	f
113	40	12	6	4	2026-10-20 15:12:12.60052+05:30	f
114	40	12	14	5	2026-10-20 15:12:12.60052+05:30	f
115	41	12	1	1	2026-10-20 15:12:21.926064+05:30	f
116	41	12	2	2	2026-10-20 15:12:21.926064+05:30	f
117	41	12	6	3	2026-10-20 15:12:21.926064+05:30	f
118	41	10	1	1	2026-10-20 15:12:36.828174+05:30	f
119	41	10	2	2	2026-10-20 15:12:36.828174+05:30	f
120	41	10	6	3	2026-10-20 15:12:36.828174+05:30	f
36	11	10	7	1	2026-10-09 13:14:43.349385+05:30	f
37	11	10	2	2	2026-10-09 13:14:43.349385+05:30	f
38	11	10	5	3	2026-10-09 13:14:43.349385+05:30	f
39	11	10	3	4	2026-10-09 13:14:43.349385+05:30	f
40	11	10	6	5	2026-10-09 13:14:43.349385+05:30	f
41	13	10	7	1	2026-10-09 13:19:16.101364+05:30	f
42	13	10	4	2	2026-10-09 13:19:16.101364+05:30	f
43	13	10	5	3	2026-10-09 13:19:16.101364+05:30	f
44	13	10	2	4	2026-10-09 13:19:16.101364+05:30	f
45	13	10	3	5	2026-10-09 13:19:16.101364+05:30	f
46	14	10	5	1	2026-10-09 13:33:20.88512+05:30	f
47	14	10	1	2	2026-10-09 13:33:20.88512+05:30	f
48	14	10	7	3	2026-10-09 13:33:20.88512+05:30	f
49	14	10	4	4	2026-10-09 13:33:20.88512+05:30	f
50	14	10	6	5	2026-10-09 13:33:20.88512+05:30	f
127	44	12	35	1	2026-10-20 16:19:31.668927+05:30	f
128	44	12	11	2	2026-10-20 16:19:31.668927+05:30	f
129	44	12	1	3	2026-10-20 16:19:31.668927+05:30	f
130	44	10	6	1	2026-10-20 16:20:44.231565+05:30	f
131	44	10	3	2	2026-10-20 16:20:44.231565+05:30	f
132	44	10	36	3	2026-10-20 16:20:44.231565+05:30	f
76	26	10	17	1	2026-10-15 13:50:26.930083+05:30	f
77	26	10	6	2	2026-10-15 13:50:26.930083+05:30	f
78	26	10	3	3	2026-10-15 13:50:26.930083+05:30	f
79	26	10	5	4	2026-10-15 13:50:26.930083+05:30	f
80	26	10	14	5	2026-10-15 13:50:26.930083+05:30	f
81	27	10	8	1	2026-10-15 14:23:34.391824+05:30	f
82	27	10	2	2	2026-10-15 14:23:34.391824+05:30	f
83	27	10	5	3	2026-10-15 14:23:34.391824+05:30	f
84	27	10	4	4	2026-10-15 14:23:34.391824+05:30	f
85	27	10	12	5	2026-10-15 14:23:34.391824+05:30	f
\.


--
-- Data for Name: la_student_mcq_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.la_student_mcq_allocations (allocation_id, lab_id, student_id, mcq_id, question_order, is_manual, allocated_at) FROM stdin;
5	44	12	12	1	f	2026-10-20 16:19:31.668927+05:30
6	44	12	13	2	f	2026-10-20 16:19:31.668927+05:30
7	44	12	19	3	f	2026-10-20 16:19:31.668927+05:30
8	44	12	16	4	f	2026-10-20 16:19:31.668927+05:30
9	44	12	11	5	f	2026-10-20 16:19:31.668927+05:30
10	44	10	11	1	f	2026-10-20 16:20:44.231565+05:30
11	44	10	17	2	f	2026-10-20 16:20:44.231565+05:30
12	44	10	19	3	f	2026-10-20 16:20:44.231565+05:30
13	44	10	14	4	f	2026-10-20 16:20:44.231565+05:30
14	44	10	15	5	f	2026-10-20 16:20:44.231565+05:30
15	47	21	5	1	f	2026-10-20 17:35:11.411662+05:30
16	47	21	3	2	f	2026-10-20 17:35:11.411662+05:30
17	47	21	4	3	f	2026-10-20 17:35:11.411662+05:30
\.


--
-- Data for Name: lab_assessment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_assessment (lab_id, faculty_id, title, description, start_time, end_time, duration, total_marks, status, num_questions, marks_per_question, created_at, allocation_mode, room_id, num_coding_questions, num_mcq_questions, marks_per_mcq) FROM stdin;
34	2	Mode A Unit Test Lab	Specific questions mode	2026-10-19 15:54:03.193+05:30	2026-10-20 15:53:03.193+05:30	60	20	completed	2	10	2026-10-19 15:53:03.196391+05:30	specific	2	2	0	2
40	2	sdfsdf	asfsdf	2026-10-20 15:02:00+05:30	2026-10-20 15:59:00+05:30	120	50	completed	5	10	2026-10-20 15:01:32.163215+05:30	specific	2	5	0	2
44	2	asd	asd	2026-10-20 16:15:00+05:30	2026-10-20 16:23:00+05:30	120	40	completed	8	10	2026-10-20 16:15:54.819823+05:30	random	6	3	5	2
47	14	Mode A Verified MCQ Assessment	\N	2026-10-20 17:34:09.741+05:30	2026-10-20 19:35:09.741+05:30	45	6	active	3	10	2026-10-20 17:35:10.483001+05:30	random	12	0	3	2
5	2	DSA LA1	DSA LA1	2026-10-09 05:46:00+05:30	2026-10-09 05:48:00+05:30	5	30	cancelled	3	10	2026-10-09 11:38:28.590363+05:30	random	2	3	0	2
42	2	sdfd	asd	2026-10-20 15:13:00+05:30	2026-10-20 15:48:00+05:30	120	30	draft	3	10	2026-10-20 15:13:50.639069+05:30	hybrid	2	3	0	2
41	2	asda	asdasd	2026-10-20 15:12:00+05:30	2026-10-20 15:20:00+05:30	120	50	completed	3	10	2026-10-20 15:11:20.121179+05:30	specific	2	3	0	2
27	2	DSA LA1	DSA Assignment	2026-10-15 14:23:00+05:30	2026-10-15 14:25:00+05:30	5	50	completed	5	10	2026-10-15 14:22:53.656727+05:30	random	2	5	0	2
13	2	DSA	DSA	2026-10-09 13:19:00+05:30	2026-10-09 13:20:00+05:30	5	50	completed	5	10	2026-10-09 13:18:22.935436+05:30	random	2	5	0	2
4	2	DSA1	DSA LA1	2026-10-09 11:15:00+05:30	2026-10-09 11:18:00+05:30	5	50	cancelled	5	10	2026-10-09 11:38:28.590363+05:30	random	2	5	0	2
28	2	asd	asd	2026-10-16 14:24:00+05:30	2026-10-16 14:25:00+05:30	120	50	draft	2	10	2026-10-16 14:22:58.906618+05:30	random	2	2	0	2
14	2	aukshdiuak	iwkan,	2026-10-09 13:33:00+05:30	2026-10-09 13:34:00+05:30	5	50	completed	5	10	2026-10-09 13:33:01.359397+05:30	random	2	5	0	2
10	2	DSA LAAA	DSA LAAA	2026-10-09 07:35:00+05:30	2026-10-09 07:37:00+05:30	5	50	completed	5	10	2026-10-09 13:04:40.19462+05:30	random	2	5	0	2
32	2	E2E Test LA — Under-pool Test	Test assessment that should fail to publish due to insufficient questions.	2026-10-19 15:47:35.311+05:30	2026-10-19 17:52:35.311+05:30	60	100	draft	10	10	2026-10-19 15:52:35.316114+05:30	random	2	10	0	2
11	2	DSA LA ESE	DSA LA ESE	2026-10-09 13:14:00+05:30	2026-10-09 13:16:00+05:30	5	50	completed	5	10	2026-10-09 13:06:39.230305+05:30	random	2	5	0	2
26	7	yujh	uyyjhb	2026-10-15 13:50:00+05:30	2026-10-15 13:52:00+05:30	120	50	completed	5	10	2026-10-15 13:50:07.346695+05:30	random	7	5	0	2
33	2	E2E Test LA — Practical DSA Challenge	Comprehensive practical assessment for arrays and strings.	2026-10-19 15:47:35.311+05:30	2026-10-19 17:52:35.311+05:30	90	50	completed	5	10	2026-10-19 15:52:35.330524+05:30	random	2	5	0	2
38	2	asd	asd	2026-10-19 21:33:00+05:30	2026-10-19 21:37:00+05:30	5	10	draft	1	10	2026-10-19 21:29:53.95013+05:30	specific	2	1	0	2
39	2	asda	asdas	2026-10-20 14:01:00+05:30	2026-10-20 14:02:00+05:30	120	50	completed	5	10	2026-10-20 15:00:08.682026+05:30	specific	2	5	0	2
\.


--
-- Data for Name: lab_coding_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_coding_questions (lab_question_id, lab_id, problem_statement, constraints, marks, order_index, topic_id, title, input_format, output_format, sample_input, sample_output, explanation, difficulty, created_by_faculty_id, created_at, subtopic_id, supported_languages, is_archived, status, is_published) FROM stdin;
6	\N	Given an array of N integers, find the second largest distinct element in the array. If no distinct second largest element exists, print -1.	2 <= N <= 10^4\n-10^5 <= A[i] <= 10^5	10	\N	2	Find Second Largest Element	First line contains an integer N.\nSecond line contains N space-separated integers.	Print the second largest distinct element, or -1 if it does not exist.	5\n12 35 1 10 34	34	The largest is 35, and the second largest is 34.	medium	2	2026-10-09 11:01:34.017719	\N	["c", "cpp", "java", "python"]	f	published	t
15	\N	Simulate a queue supporting two operations:\n1 x: Push x into the queue.\n2: Pop front element and print it (or print -1 if queue is empty).\nGiven Q queries, output the result of each pop operation on a space-separated line.	1 <= Q <= 1000\n1 <= x <= 10^5	10	2	5	Implement Queue Using Array	First line contains integer Q (number of queries).\nNext Q lines each contain a query (either "1 x" or "2").	Print the popped values separated by space.	5\n1 2\n1 3\n2\n1 4\n2	2 3	First pop gives 2, second pop gives 3.	easy	2	2026-10-15 11:10:59.709054	\N	["c", "cpp", "java", "python"]	f	published	t
1	\N	Given an array of N integers, reverse the order of elements and print the resulting elements separated by spaces.	1 <= N <= 1000\n-10^5 <= A[i] <= 10^5	5	\N	2	Reverse an Array	Line 1: An integer N.\nLine 2: N space-separated integers.	Print the reversed array elements separated by spaces.	5\n1 2 3 4 5	5 4 3 2 1	Reversing [1,2,3,4,5] yields [5,4,3,2,1].	easy	2	2026-10-09 11:01:33.988702	3	["c", "cpp", "java", "python"]	f	published	t
2	\N	Given an array of N integers, find the maximum and minimum elements in the array and print them separated by space.	1 <= N <= 10^4\n-10^6 <= A[i] <= 10^6	5	\N	2	Find Maximum and Minimum Element	Line 1: An integer N.\nLine 2: N space-separated integers.	Print two space-separated integers: maximum element followed by minimum element.	6\n3 2 1 56 10000 167	10000 1	Maximum is 10000 and minimum is 1.	easy	2	2026-10-09 11:01:34.002121	3	["c", "cpp", "java", "python"]	f	published	t
3	\N	Given an array of N integers and a target sum K, determine whether there exist two distinct elements in the array whose sum equals K. Print YES if such a pair exists, otherwise NO.	2 <= N <= 10^4\n-10^5 <= K, A[i] <= 10^5	10	\N	2	Two Sum Target Pair	Line 1: Two integers N and K.\nLine 2: N space-separated integers.	Print YES if a pair exists, otherwise NO.	5 9\n1 4 2 5 8	YES	1 + 8 = 9.	medium	2	2026-10-09 11:01:34.007715	3	["c", "cpp", "java", "python"]	f	published	t
8	\N	Given an array of N integers, move all zeros to the end while maintaining the relative order of non-zero elements.	1 <= N <= 10^4\n-10^5 <= A[i] <= 10^5	5	5	2	Move Zeroes to End	Line 1: An integer N.\nLine 2: N space-separated integers.	Print the modified array with all zeros moved to the end.	5\n0 1 0 3 12	1 3 12 0 0	Non-zero numbers [1, 3, 12] remain in order followed by two zeros.	easy	2	2026-10-15 11:10:59.644518	3	["c", "cpp", "java", "python"]	f	published	t
4	\N	Given a string S of lowercase alphanumeric characters, determine if it is a palindrome (reads the same forwards and backwards). Print YES or NO.	1 <= |S| <= 10^5	5	\N	3	Palindrome String Checker	A single line containing the string S.	Print YES if palindrome, else NO.	racecar	YES	"racecar" reversed is still "racecar".	easy	2	2026-10-09 11:01:34.01105	4	["c", "cpp", "java", "python"]	f	published	t
9	\N	Given a string S and a target character C, count how many times C appears in S.	1 <= |S| <= 10^5	5	2	3	Count Frequency of Target Character	Line 1: The string S.\nLine 2: The single character C.	Print the count of occurrences of C in S.	walchand\na	2	"a" appears twice in "walchand".	easy	2	2026-10-15 11:10:59.659663	4	["c", "cpp", "java", "python"]	f	published	t
10	\N	Given two lowercase strings S1 and S2, check whether S2 is an anagram of S1. Print YES if anagrams, else NO.	1 <= |S1|, |S2| <= 10^5	5	3	3	Valid Anagram Checker	Line 1: String S1.\nLine 2: String S2.	Print YES if anagram, else NO.	listen\nsilent	YES	"listen" and "silent" have the same character frequencies.	easy	2	2026-10-15 11:10:59.670161	4	["c", "cpp", "java", "python"]	f	published	t
11	\N	Given N strings, find the longest common prefix. If no common prefix exists, print -1.	1 <= N <= 1000\n1 <= |each string| <= 200	10	4	3	Longest Common Prefix	Line 1: An integer N.\nLine 2: N space-separated strings.	Print the longest common prefix or -1.	3\nflower flow flight	fl	The common prefix is "fl".	medium	2	2026-10-15 11:10:59.677114	4	["c", "cpp", "java", "python"]	f	published	t
12	\N	Given elements of a singly linked list terminated by -1, count the total number of nodes.	0 <= number of nodes <= 10^4	5	1	4	Count Nodes in Singly Linked List	A sequence of space-separated integers terminated by -1.	Print the count of nodes.	10 20 30 -1	3	The list has 3 nodes: 10 -> 20 -> 30.	easy	2	2026-10-15 11:10:59.683266	5	["c", "cpp", "java", "python"]	f	published	t
13	\N	Given a singly linked list (terminated by -1) and a target K, print YES if K is present, else NO.	0 <= number of nodes <= 10^4\n-10^5 <= K <= 10^5	5	2	4	Search Element in Linked List	Line 1: Space-separated list elements ending with -1.\nLine 2: Integer K.	Print YES or NO.	14 21 31 54 -1\n21	YES	21 is present in the linked list.	easy	2	2026-10-15 11:10:59.692328	5	["c", "cpp", "java", "python"]	f	published	t
14	\N	Given a singly linked list (space-separated, terminated by -1), reverse it and print the new order.	0 <= N <= 10^4	10	3	4	Reverse a Singly Linked List	Space-separated integers ending with -1.	Reversed integers ending with -1.	1 2 3 4 -1	4 3 2 1 -1	1->2->3->4 reversed is 4->3->2->1.	medium	2	2026-10-15 11:10:59.698975	5	["c", "cpp", "java", "python"]	f	published	t
7	\N	Given a string containing only (), {}, [], check if the brackets are valid and properly nested. Print YES or NO.	1 <= |S| <= 10^4	10	\N	8	Valid Parentheses String	A single line containing the bracket string.	Print YES if valid, otherwise NO.	()[]{}	YES	All brackets are properly matched.	medium	2	2026-10-09 11:01:34.021827	6	["c", "cpp", "java", "python"]	f	published	t
16	\N	Given an array A of N elements, find the Next Greater Element for each element. The NGE for element x is the first greater element to the right. If no such element exists, output -1.	1 <= N <= 10^4\n-10^5 <= A[i] <= 10^5	10	3	8	Next Greater Element	Line 1: Integer N.\nLine 2: N space-separated integers.	Print N space-separated integers representing NGE for each element.	4\n1 3 2 4	3 4 4 -1	NGE of 1 is 3, of 3 is 4, of 2 is 4, of 4 is -1.	medium	2	2026-10-15 11:10:59.716065	6	["c", "cpp", "java", "python"]	f	published	t
5	\N	Given an array of N integers and a target number K, count how many times K appears in the array.	1 <= N <= 10^4\n-10^5 <= K, A[i] <= 10^5	10	\N	1	Count Frequency of Target Element	First line contains two integers N and K.\nSecond line contains N space-separated integers.	Print the count of occurrences of K.	6 2\n1 2 2 3 2 4	3	2 appears 3 times in the array.	easy	2	2026-10-09 11:01:34.014416	\N	["c", "cpp", "java", "python"]	f	published	t
18	\N	Given two sorted integer arrays A of size N and B of size M, merge them into a single sorted array and print the elements separated by space.	1 <= N, M <= 10^4\n-10^5 <= A[i], B[j] <= 10^5	10	3	1	Merge Two Sorted Arrays	First line contains two integers N and M.\nSecond line contains N space-separated integers of array A.\nThird line contains M space-separated integers of array B.	Print the merged sorted array elements separated by space.	3 3\n1 3 5\n2 4 6	1 2 3 4 5 6	Merging [1, 3, 5] and [2, 4, 6] produces [1, 2, 3, 4, 5, 6].	medium	2	2026-10-15 11:10:59.735633	\N	["c", "cpp", "java", "python"]	f	published	t
21	\N	jhknjknkuiwhniukjw	jk	10	\N	5	asd	3\n1 2 3	1 2 3	651	45	jn	medium	2	2026-10-16 14:54:02.756075	\N	["c", "cpp", "java", "python"]	f	published	t
25	\N	Given a positive integer N, simulate a simple O(N) traversal by printing the sum of numbers from 1 to N.	1 <= N <= 10^6	5	1	6	Count Operations in a Loop	A single integer N.	A single integer — the sum of 1 to N.	5	15	1 + 2 + 3 + 4 + 5 = 15.	easy	2	2026-10-19 15:28:46.764944	1	["c", "cpp", "java", "python"]	f	published	t
27	\N	Print the first N Fibonacci numbers separated by space. The Fibonacci sequence starts: 0, 1, 1, 2, 3, 5, 8, ...	1 <= N <= 50	5	3	6	Fibonacci Sequence (Iterative)	A single integer N.	N space-separated Fibonacci numbers on a single line.	6	0 1 1 2 3 5	The first 6 Fibonacci numbers are 0, 1, 1, 2, 3, 5.	easy	2	2026-10-19 15:28:46.818663	1	["c", "cpp", "java", "python"]	f	published	t
28	\N	Given a positive integer N, determine if it is a power of 2. Print "YES" if it is, otherwise "NO". Use bit manipulation for an O(1) solution.	1 <= N <= 10^9	10	4	6	Power of Two Check	A single integer N.	Print YES or NO.	16	YES	16 = 2^4. In binary, powers of 2 have exactly one bit set.	medium	2	2026-10-19 15:28:46.823312	1	["c", "cpp", "java", "python"]	f	published	t
29	\N	Given N, compute N! and print the result. If N! exceeds 10^18, print "OVERFLOW" instead.	0 <= N <= 25	10	5	6	Factorial with Overflow Detection	A single integer N.	Print the factorial or "OVERFLOW".	5	120	5! = 120.	medium	2	2026-10-19 15:28:46.829305	1	["c", "cpp", "java", "python"]	f	published	t
30	\N	Given N, compute the exact number of times the inner statement executes in a nested loop where i from 0 to N-1 and j from 0 to i.	1 <= N <= 10^4	5	1	7	Count Operations — Nested Loop	A single integer N.	A single integer — the total operations count.	4	10	For N=4: i=0 (1 iter) + i=1 (2) + i=2 (3) + i=3 (4) = 10 = N*(N+1)/2.	easy	2	2026-10-19 15:28:46.834818	2	["c", "cpp", "java", "python"]	f	published	t
31	\N	Given a description of an algorithm's operation count f(n), output its Big-O class:\n"constant" for O(1)\n"logarithmic" for O(log n)\n"linear" for O(n)\n"linearithmic" for O(n log n)\n"quadratic" for O(n^2)\n"exponential" for O(2^n)\nInput is one of the keywords: 1, logn, n, nlogn, n2, 2n	Input is always one of the listed strings.	5	2	7	Classify Big-O Complexity	A single string from: 1, logn, n, nlogn, n2, 2n	Print the complexity class name.	n2	quadratic	O(n^2) is classified as quadratic.	easy	2	2026-10-19 15:28:46.839476	2	["c", "cpp", "java", "python"]	f	published	t
32	\N	Given a sorted array of N elements and a target T, perform binary search and print how many comparisons it takes to find T (or -1 if not found). A "comparison" counts each time you check the middle element.	1 <= N <= 10^5\n-10^6 <= A[i], T <= 10^6	10	3	7	Binary Search Step Counter	Line 1: Two integers N and T.\nLine 2: N space-separated sorted integers.	Print the number of comparisons, then a space, then the index found (or -1).	7 23\n1 3 7 10 23 50 75	2 4	Mid=3: A[3]=10 (1 comp). Mid=5: A[5]=50 > 23. Mid=4: A[4]=23 found (3 comp). Actually checking: [0,6]->mid=3 (A[3]=10,1st); [4,6]->mid=5 (A[5]=50,2nd); [4,4]->mid=4 (A[4]=23,3rd). Output: 3 4.	medium	2	2026-10-19 15:28:46.845471	2	["c", "cpp", "java", "python"]	f	published	t
33	\N	Simulate a dynamic array. Start with capacity 1. When array is full and you push an element, double the capacity (this costs capacity extra operations). Track total cost. Given N pushes, output total operations performed.	1 <= N <= 10^6	15	4	7	Amortized Counter — Dynamic Array Resizing	A single integer N.	Print the total operations.	8	15	Pushes 1-8: push cost is 1 each. Resize at sizes 1,2,4,8: costs 1,2,4,8. Total = 8 pushes + (1+2+4) resizes = 8+7=15. (No resize at size 8 since N=8 fits exactly after last resize.)	hard	2	2026-10-19 15:28:46.850928	2	["c", "cpp", "java", "python"]	f	published	t
34	\N	Given an array of N integers and a target T, find T using linear search and report:\n- Comparisons made to find T (or -1 if not found)\n- Whether this was best case (1 comparison), worst case (N comparisons), or average case.	1 <= N <= 10^4	10	5	7	Worst vs Best Case Finder	Line 1: Two integers N and T.\nLine 2: N space-separated integers.	Print two items on one line: number of comparisons and the case type (best/worst/average). If not found, print -1 and worst.	5 3\n3 1 4 1 5	1 best	3 is found on the first comparison.	medium	2	2026-10-19 15:28:46.855264	2	["c", "cpp", "java", "python"]	f	published	t
35	\N	Given an array of N integers (possibly negative), find the contiguous subarray with the largest sum and print that sum.	1 <= N <= 10^5\n-10^4 <= A[i] <= 10^4	10	5	2	Maximum Subarray Sum (Kadane's Algorithm)	Line 1: An integer N.\nLine 2: N space-separated integers.	Print the maximum subarray sum.	8\n-2 1 -3 4 -1 2 1 -5	6	Subarray [4,-1,2,1] has sum 6.	medium	2	2026-10-19 15:28:46.872998	3	["c", "cpp", "java", "python"]	f	published	t
36	\N	Given a string S and integer K, count the number of distinct substrings of S of length exactly K.	1 <= |S| <= 10^4\n1 <= K <= |S|	10	5	3	Count Distinct Substrings of Length K	Line 1: String S.\nLine 2: Integer K.	Print the count of distinct substrings of length K.	aababc\n2	4	Substrings of length 2: aa,ab,ba,ab,bc. Distinct: {aa,ab,ba,bc} = 4.	medium	2	2026-10-19 15:28:46.889869	4	["c", "cpp", "java", "python"]	f	published	t
37	\N	Given a singly linked list (terminated by -1), find and print the middle node value. If the list has even nodes, print the second middle element.	1 <= N <= 10^4	5	4	4	Find Middle Node of Linked List	Space-separated integers ending with -1.	Print the middle node value.	1 2 3 4 5 -1	3	Middle of [1,2,3,4,5] is 3.	easy	2	2026-10-19 15:28:46.902478	5	["c", "cpp", "java", "python"]	f	published	t
98	\N	sdfsdfasda	asd	5	\N	2	kjnme	asd	asd	asd	asd	asd	easy	7	2026-10-19 20:25:14.377064	\N	["c", "cpp", "java", "python"]	f	published	t
39	\N	Simulate a stack with push and pop operations.\n"1 x": push x\n"2": pop and print top (print -1 if empty)\nProcess Q queries.	1 <= Q <= 1000\n1 <= x <= 10^5	5	2	8	Stack Push and Pop Simulation	Line 1: Q (number of queries).\nNext Q lines: each "1 x" or "2".	Print popped values separated by newlines.	5\n1 10\n1 20\n2\n1 30\n2	20\n30	Push 10, push 20, pop 20, push 30, pop 30.	easy	2	2026-10-19 15:28:46.918389	6	["c", "cpp", "java", "python"]	f	published	t
40	\N	Given a postfix (Reverse Polish Notation) expression as space-separated tokens, evaluate it and print the result. Operators: +, -, *, /.	Expression is valid. -10^4 <= operand <= 10^4. Result fits in int. No division by zero.	10	4	8	Evaluate Postfix Expression	A single line of space-separated tokens (integers and operators).	Print the integer result.	3 4 + 2 * 7 /	2	(3+4)*2/7 = 14/2... actually: 3 4 + = 7; 7 2 * = 14; 14 7 / = 2.	medium	2	2026-10-19 15:28:46.925717	6	["c", "cpp", "java", "python"]	f	published	t
41	\N	Given N elements to push into a stack (in order), print the elements of the stack after sorting them so the smallest element is at the top, without using any other data structure except one additional temporary stack.	1 <= N <= 100\n-10^4 <= elements <= 10^4	15	5	8	Sort a Stack	Line 1: Integer N.\nLine 2: N space-separated integers (pushed in order, last is top).	Print the sorted stack elements from top to bottom (smallest to largest).	4\n3 1 4 2	1 2 3 4	The sorted stack has 1 at top, 4 at bottom. Output top-to-bottom: 1 2 3 4.	hard	2	2026-10-19 15:28:46.930135	6	["c", "cpp", "java", "python"]	f	published	t
42	\N	Simulate a queue with enqueue and dequeue operations.\n"1 x": enqueue x\n"2": dequeue and print front (print -1 if empty)\nProcess Q queries.	1 <= Q <= 1000\n1 <= x <= 10^5	5	1	9	Queue Push and Pop Simulation	Line 1: Q.\nNext Q lines: "1 x" or "2".	Print dequeued values separated by newlines.	5\n1 2\n1 3\n2\n1 4\n2	2\n3	First dequeue gives 2 (FIFO), second gives 3.	easy	2	2026-10-19 15:28:46.934443	7	["c", "cpp", "java", "python"]	f	published	t
43	\N	Given a string stream of lowercase characters, after each character is processed, print the first non-repeating character in the current stream. If none exists, print #.	1 <= |S| <= 10^4	10	2	9	First Non-Repeating Character in Stream	A single string S.	Print |S| characters (one per character processed), forming the answer string.	aabbc	a#b#c	a→a; aa→#; aab→b; aabb→#; aabbc→c	medium	2	2026-10-19 15:28:46.939467	7	["c", "cpp", "java", "python"]	f	published	t
44	\N	Given an array of N integers and a window size K, find the maximum element in each sliding window of size K.	1 <= K <= N <= 10^5\n-10^4 <= A[i] <= 10^4	15	3	9	Sliding Window Maximum	Line 1: Two integers N and K.\nLine 2: N space-separated integers.	Print (N-K+1) space-separated maximum values.	8 3\n1 3 -1 -3 5 3 6 7	3 3 5 5 6 7	Windows: [1,3,-1]=3, [3,-1,-3]=3, [-1,-3,5]=5, [-3,5,3]=5, [5,3,6]=6, [3,6,7]=7	hard	2	2026-10-19 15:28:46.943337	7	["c", "cpp", "java", "python"]	f	published	t
45	\N	Implement a stack using two queues, supporting push and pop operations.\n"1 x": push x\n"2": pop and print top (or -1 if empty)	1 <= Q <= 1000	10	4	9	Implement Stack using Queue	Line 1: Q.\nNext Q lines: "1 x" or "2".	Print popped values separated by newlines.	5\n1 10\n1 20\n2\n1 30\n2	20\n30	Using two queues to simulate LIFO: last pushed is first popped.	medium	2	2026-10-19 15:28:46.948115	7	["c", "cpp", "java", "python"]	f	published	t
46	\N	Given a binary tree in level-order input (with -1 representing null), perform BFS and print the nodes level by level, each level on a new line.	1 <= N <= 1000 (non-null nodes)	10	5	9	BFS Level Order Traversal	A single line of space-separated integers representing the binary tree in level order (-1 = null).	Print node values level by level, one level per line, values separated by spaces.	1 2 3 4 5 -1 -1	1\n2 3\n4 5	Root=1, level 2: 2,3, level 3: 4,5.	medium	2	2026-10-19 15:28:46.952329	7	["c", "cpp", "java", "python"]	f	published	t
47	\N	Compute the factorial of N using recursion and print the result.	0 <= N <= 12	5	1	10	Recursive Factorial	A single integer N.	Print N!	5	120	5! = 5*4*3*2*1 = 120.	easy	2	2026-10-19 15:28:46.955693	8	["c", "cpp", "java", "python"]	f	published	t
48	\N	Solve the Tower of Hanoi for N disks and print each move as "Move disk D from X to Y". Use recursion.	1 <= N <= 4	10	2	10	Tower of Hanoi Moves	A single integer N.	Print all moves, each on a new line: "Move disk D from X to Y" where D is disk number (1=smallest), X and Y are peg names (A, B, C).	2	Move disk 1 from A to C\nMove disk 2 from A to B\nMove disk 1 from C to B	For 2 disks: move smallest (1) to C, move (2) to B, move (1) from C to B.	medium	2	2026-10-19 15:28:46.959494	8	["c", "cpp", "java", "python"]	f	published	t
49	\N	Given N distinct integers, use recursion to generate and print all 2^N subsets. Print each subset on a new line, elements separated by spaces. Print empty set as "{}". Sort subsets lexicographically.	1 <= N <= 4	10	3	10	Generate All Subsets	Line 1: Integer N.\nLine 2: N space-separated distinct integers (sorted).	Print all subsets, one per line, sorted.	2\n1 2	{}\n1\n1 2\n2	All subsets of {1,2}: {}, {1}, {1,2}, {2}.	medium	2	2026-10-19 15:28:46.962844	8	["c", "cpp", "java", "python"]	f	published	t
50	\N	Given N, count the number of distinct solutions to the N-Queens problem (place N queens on an N×N board such that no two attack each other). Print the count.	1 <= N <= 8	15	4	10	N-Queens Problem Count	A single integer N.	Print the number of solutions.	4	2	There are exactly 2 distinct solutions for the 4-Queens problem.	hard	2	2026-10-19 15:28:46.966254	8	["c", "cpp", "java", "python"]	f	published	t
51	\N	Given a string S of distinct lowercase characters, generate and print all permutations in lexicographic order using recursion.	1 <= |S| <= 6	10	5	10	String Permutations	A single string S.	Print all permutations, one per line, in lexicographic order.	abc	abc\nacb\nbac\nbca\ncab\ncba	All 3! = 6 permutations of "abc" in sorted order.	medium	2	2026-10-19 15:28:46.969963	8	["c", "cpp", "java", "python"]	f	published	t
52	\N	Given an array of N integers and a target K, find the 0-based index of K using linear search. If K appears multiple times, return the first occurrence. If not found, print -1.	1 <= N <= 10^5\n-10^6 <= K, A[i] <= 10^6	5	1	11	Linear Search	Line 1: Two integers N and K.\nLine 2: N space-separated integers.	Print the index or -1.	6 23\n1 3 7 23 23 50	3	23 first appears at index 3.	easy	2	2026-10-19 15:28:46.97415	9	["c", "cpp", "java", "python"]	f	published	t
17	\N	Given a sorted array of N integers and a target K, find its 0-based index using binary search. Print -1 if not found.	1 <= N <= 10^5\n-10^6 <= A[i], K <= 10^6	5	1	11	Binary Search on Sorted Array	Line 1: Two integers N and K.\nLine 2: N sorted space-separated integers.	Print the index or -1.	5 4\n1 2 3 4 5	3	4 is at index 3.	easy	2	2026-10-15 11:10:59.723387	9	["c", "cpp", "java", "python"]	f	published	t
54	\N	Given a sorted array that has been rotated at an unknown pivot, and a target K, find its index using binary search. Print -1 if not found.	1 <= N <= 10^5	15	4	11	Search in Rotated Sorted Array	Line 1: Two integers N and K.\nLine 2: N space-separated integers (rotated sorted).	Print the index or -1.	7 0\n4 5 6 7 0 1 2	4	0 is at index 4 in the rotated array.	hard	2	2026-10-19 15:28:46.986838	9	["c", "cpp", "java", "python"]	f	published	t
55	\N	Given a sorted array of N integers and a target K, count the total number of occurrences of K using binary search.	1 <= N <= 10^5	10	5	11	Count Occurrences in Sorted Array	Line 1: Two integers N and K.\nLine 2: N sorted space-separated integers.	Print the count of occurrences.	7 4\n1 2 4 4 4 5 6	3	4 appears 3 times.	medium	2	2026-10-19 15:28:46.990732	9	["c", "cpp", "java", "python"]	f	published	t
56	\N	Sort an array of N integers using Bubble Sort and print the sorted array and the number of swaps performed.	1 <= N <= 1000\n-10^4 <= A[i] <= 10^4	5	1	12	Bubble Sort	Line 1: Integer N.\nLine 2: N space-separated integers.	Line 1: Sorted array (space-separated).\nLine 2: Number of swaps.	4\n64 34 25 12	12 25 34 64\n6	Bubble sort performs 6 swaps on this array.	easy	2	2026-10-19 15:28:46.996759	10	["c", "cpp", "java", "python"]	f	published	t
58	\N	Sort an array of N integers using Quick Sort (use last element as pivot) and print the sorted result.	1 <= N <= 1000\n-10^4 <= A[i] <= 10^4	10	3	12	Quick Sort	Line 1: Integer N.\nLine 2: N space-separated integers.	Print the sorted array space-separated.	5\n10 7 8 9 1	1 7 8 9 10	Quick sort with last-element pivot.	medium	2	2026-10-19 15:28:47.005394	10	["c", "cpp", "java", "python"]	f	published	t
59	\N	Sort an array using Insertion Sort. Print the array state after each insertion step (including initial). One line per step.	2 <= N <= 10	10	4	12	Insertion Sort	Line 1: Integer N.\nLine 2: N space-separated integers.	Print N lines: the state of the array after each insertion step.	4\n8 4 2 1	8 4 2 1\n4 8 2 1\n2 4 8 1\n1 2 4 8	Each line shows the array after inserting element at position i.	medium	2	2026-10-19 15:28:47.01059	10	["c", "cpp", "java", "python"]	f	published	t
60	\N	Given an array of N integers and integer K, find the Kth smallest element using a QuickSelect algorithm (average O(N)).	1 <= K <= N <= 10^5\n-10^6 <= A[i] <= 10^6	15	5	12	Kth Smallest Element	Line 1: Two integers N and K.\nLine 2: N space-separated integers.	Print the Kth smallest element.	6 2\n7 10 4 3 20 15	4	Sorted: [3,4,7,10,15,20]. 2nd smallest is 4.	hard	2	2026-10-19 15:28:47.014338	10	["c", "cpp", "java", "python"]	f	published	t
61	\N	Given an array of N integers, count the number of distinct elements using a hash set.	1 <= N <= 10^5\n-10^6 <= A[i] <= 10^6	5	1	13	Count Distinct Elements	Line 1: Integer N.\nLine 2: N space-separated integers.	Print the count of distinct elements.	7\n1 2 3 2 1 4 5	5	Distinct elements: {1, 2, 3, 4, 5}.	easy	2	2026-10-19 15:28:47.01958	11	["c", "cpp", "java", "python"]	f	published	t
62	\N	Given an array of N integers, find the element with the highest frequency. If multiple elements have the same maximum frequency, print the smallest one.	1 <= N <= 10^5	5	2	13	Most Frequent Element	Line 1: Integer N.\nLine 2: N space-separated integers.	Print the most frequent element.	7\n1 3 1 3 2 3 3	3	3 appears 4 times (most frequent).	easy	2	2026-10-19 15:28:47.024105	11	["c", "cpp", "java", "python"]	f	published	t
63	\N	Given an unsorted array and target K, find all unique pairs (a, b) where a + b = K and a <= b. Print them sorted by first element.	1 <= N <= 10^4\n-10^5 <= K, A[i] <= 10^5	10	3	13	Pair with Given Sum using Hashing	Line 1: Two integers N and K.\nLine 2: N space-separated integers.	Print each pair on a new line as "a b". If no pairs, print "NONE".	6 9\n1 5 3 6 8 4	1 8\n3 6	1+8=9 and 3+6=9.	medium	2	2026-10-19 15:28:47.028719	11	["c", "cpp", "java", "python"]	f	published	t
64	\N	Given an array of N integers (possibly negative), find the length of the longest subarray with sum equal to 0.	1 <= N <= 10^5\n-10^3 <= A[i] <= 10^3	15	4	13	Longest Subarray with Zero Sum	Line 1: Integer N.\nLine 2: N space-separated integers.	Print the length of the longest zero-sum subarray (0 if none).	8\n15 -2 2 -8 1 7 10 23	5	Subarray [-2,2,-8,1,7] (indices 1-5) sums to 0, length 5.	hard	2	2026-10-19 15:28:47.033691	11	["c", "cpp", "java", "python"]	f	published	t
65	\N	Given N words, group the anagrams together and print each group on a new line (words sorted within group, groups sorted by smallest word).	1 <= N <= 100\n1 <= |word| <= 20	10	5	13	Group Anagrams	Line 1: Integer N.\nLine 2: N space-separated lowercase words.	Print each anagram group on a new line (words sorted within, groups sorted by first word).	6\neat tea tan ate nat bat	ate eat tea\nbat\nnat tan	(eat,tea,ate), (bat), (tan,nat) are the anagram groups.	medium	2	2026-10-19 15:28:47.039484	11	["c", "cpp", "java", "python"]	f	published	t
66	\N	Given a binary tree in level-order (-1 = null), compute and print its height (number of edges on longest root-to-leaf path). An empty tree has height -1.	0 <= N <= 1000 (non-null nodes)	5	1	14	Tree Height	A single line of space-separated integers (level-order, -1 = null).	Print the height.	1 2 3 4 5	2	Longest path: 1→2→4 or 1→2→5 = 2 edges.	easy	2	2026-10-19 15:28:47.048437	12	["c", "cpp", "java", "python"]	f	published	t
67	\N	Given a binary tree in level-order (-1 = null), print its Inorder, Preorder, and Postorder traversals.	1 <= N <= 100	5	2	14	Inorder, Preorder, Postorder Traversals	A single line of space-separated integers (level-order, -1 = null).	Three lines: Inorder, Preorder, Postorder (space-separated each).	1 2 3 4 5	4 2 5 1 3\n1 2 4 5 3\n4 5 2 3 1	Tree: 1(root), 2(left),3(right), 4(left of 2), 5(right of 2).	easy	2	2026-10-19 15:28:47.052385	12	["c", "cpp", "java", "python"]	f	published	t
68	\N	Given a binary tree in level-order (-1 = null), count the number of leaf nodes (nodes with no children).	1 <= N <= 1000	5	3	14	Count Leaf Nodes	A single line of space-separated integers (level-order, -1 = null).	Print the count of leaf nodes.	1 2 3 4 5	3	Leaf nodes are 3, 4, 5.	easy	2	2026-10-19 15:28:47.055053	12	["c", "cpp", "java", "python"]	f	published	t
69	\N	Given a binary tree in level-order (-1 = null), determine if it is height-balanced (for every node, the difference in heights of left and right subtrees is at most 1). Print YES or NO.	1 <= N <= 1000	10	4	14	Check Balanced Binary Tree	A single line of space-separated integers (level-order, -1 = null).	Print YES or NO.	1 2 3 4 5 6 -1	YES	All subtrees have balanced heights.	medium	2	2026-10-19 15:28:47.058842	12	["c", "cpp", "java", "python"]	f	published	t
71	\N	Given N integers, insert them one by one into an initially empty BST and print the inorder traversal (which should be sorted).	1 <= N <= 100\n-10^4 <= A[i] <= 10^4	5	1	15	BST Insert and Inorder	Line 1: Integer N.\nLine 2: N space-separated integers (insertion order).	Print the inorder traversal space-separated.	5\n5 3 7 1 4	1 3 4 5 7	Inorder of BST is always sorted.	easy	2	2026-10-19 15:28:47.066363	13	["c", "cpp", "java", "python"]	f	published	t
72	\N	Build a BST from N insertions, then search for target K. Print YES if found, NO otherwise.	1 <= N <= 1000	5	2	15	BST Search	Line 1: Integer N.\nLine 2: N space-separated integers.\nLine 3: Integer K.	Print YES or NO.	5\n5 3 7 1 4\n4	YES	4 is in the BST.	easy	2	2026-10-19 15:28:47.070644	13	["c", "cpp", "java", "python"]	f	published	t
73	\N	Given a binary tree in level-order (-1 = null), check if it is a valid Binary Search Tree. Print YES or NO.	1 <= N <= 1000	10	3	15	Valid BST Check	A single line of space-separated integers (level-order, -1 = null).	Print YES if valid BST, else NO.	5 3 7 2 4	YES	Inorder: 2 3 4 5 7 — strictly increasing.	medium	2	2026-10-19 15:28:47.074535	13	["c", "cpp", "java", "python"]	f	published	t
74	\N	Build a BST from N insertions and find the Kth smallest element (K=1 is smallest).	1 <= K <= N <= 1000	10	4	15	Kth Smallest in BST	Line 1: Two integers N and K.\nLine 2: N space-separated integers.	Print the Kth smallest element.	5 3\n5 3 7 1 4	4	Inorder: 1 3 4 5 7. 3rd smallest is 4.	medium	2	2026-10-19 15:28:47.077677	13	["c", "cpp", "java", "python"]	f	published	t
75	\N	Build a BST from N insertions, delete a target value D, and print the inorder traversal of the resulting BST.	1 <= N <= 100. D is guaranteed to be in the BST.	15	5	15	BST Delete and Print	Line 1: Integer N.\nLine 2: N space-separated integers.\nLine 3: Integer D to delete.	Print the inorder traversal after deletion (space-separated).	5\n5 3 7 1 4\n3	1 4 5 7	Delete 3 (has children 1 and 4): replace with inorder successor (4). Result: 1 4 5 7.	hard	2	2026-10-19 15:28:47.080874	13	["c", "cpp", "java", "python"]	f	published	t
76	\N	Given N integers, build a Min Heap by inserting them one by one. Then perform M extract-min operations and print the extracted values in order.	1 <= M <= N <= 10^4	5	1	16	Build Min Heap and Extract Min	Line 1: Two integers N and M.\nLine 2: N space-separated integers.	Print M extracted minimums, space-separated.	6 3\n5 3 8 1 2 9	1 2 3	Min heap extracts 1, then 2, then 3.	easy	2	2026-10-19 15:28:47.084332	14	["c", "cpp", "java", "python"]	f	published	t
77	\N	Given an array of N integers and integer K, find the K largest elements and print them in descending order using a Min Heap approach.	1 <= K <= N <= 10^5	10	2	16	K Largest Elements	Line 1: Two integers N and K.\nLine 2: N space-separated integers.	Print the K largest elements in descending order, space-separated.	7 3\n10 4 3 50 23 90 70	90 70 50	Three largest elements in descending order.	medium	2	2026-10-19 15:28:47.087521	14	["c", "cpp", "java", "python"]	f	published	t
78	\N	Sort an array of N integers using Heap Sort and print the sorted array.	1 <= N <= 10^5	10	3	16	Heap Sort	Line 1: Integer N.\nLine 2: N space-separated integers.	Print the sorted array space-separated.	5\n4 10 3 5 1	1 3 4 5 10	Heap sort produces ascending sorted output.	medium	2	2026-10-19 15:28:47.09149	14	["c", "cpp", "java", "python"]	f	published	t
79	\N	Given K sorted arrays each of size N, merge them into one sorted array and print it. Use a Min Heap of size K.	1 <= K <= 10\n1 <= N <= 100	15	4	16	Merge K Sorted Arrays	Line 1: Two integers K and N.\nNext K lines: each has N sorted space-separated integers.	Print the merged sorted array space-separated.	3 3\n1 4 7\n2 5 8\n3 6 9	1 2 3 4 5 6 7 8 9	Merging [1,4,7], [2,5,8], [3,6,9] gives sorted 1..9.	hard	2	2026-10-19 15:28:47.094824	14	["c", "cpp", "java", "python"]	f	published	t
81	\N	Given an undirected graph with V vertices (0 to V-1) and E edges, perform BFS from source vertex 0 and print the traversal order.	1 <= V <= 100\n0 <= E <= V*(V-1)/2	5	1	17	BFS Traversal	Line 1: Two integers V and E.\nNext E lines: each "u v" representing an undirected edge.\nLine after edges: Source vertex S.	Print BFS traversal order space-separated.	4 4\n0 1\n0 2\n1 3\n2 3\n0	0 1 2 3	BFS from 0: visit 0, then neighbors 1,2, then 3.	easy	2	2026-10-19 15:28:47.1016	15	["c", "cpp", "java", "python"]	f	published	t
82	\N	Given an undirected graph with V vertices (0 to V-1) and E edges, perform DFS from source vertex 0 and print the traversal order. Visit neighbors in ascending order.	1 <= V <= 100\n0 <= E <= V*(V-1)/2	5	2	17	DFS Traversal	Line 1: Two integers V and E.\nNext E lines: each "u v" for undirected edge.\nLine after edges: Source vertex S.	Print DFS traversal space-separated.	4 4\n0 1\n0 2\n1 3\n2 3\n0	0 1 3 2	DFS from 0: 0→1→3→(back)→2.	easy	2	2026-10-19 15:28:47.105689	15	["c", "cpp", "java", "python"]	f	published	t
83	\N	Given an undirected graph with V vertices and E edges, detect if it contains a cycle. Print YES if cycle exists, NO otherwise.	1 <= V <= 100	10	3	17	Detect Cycle in Undirected Graph	Line 1: Two integers V and E.\nNext E lines: each "u v".	Print YES or NO.	4 4\n0 1\n1 2\n2 3\n3 0	YES	The graph 0-1-2-3-0 forms a cycle.	medium	2	2026-10-19 15:28:47.109079	15	["c", "cpp", "java", "python"]	f	published	t
84	\N	Given a weighted directed graph with V vertices and E edges, find the shortest path from source 0 to all other vertices using Dijkstra. Print the shortest distance to each vertex (or -1 if unreachable).	1 <= V <= 100\n0 <= w <= 10^4	15	4	17	Shortest Path — Dijkstra	Line 1: Two integers V and E.\nNext E lines: "u v w" (directed edge from u to v with weight w).\nAll weights are non-negative.	Print V space-separated distances (0-indexed).	5 6\n0 1 4\n0 2 2\n1 3 5\n2 1 1\n2 3 8\n3 4 2	0 3 2 8 10	0→0=0, 0→2→1=3, 0→2=2, 0→2→1→3=8, 0→2→1→3→4=10.	hard	2	2026-10-19 15:28:47.112691	15	["c", "cpp", "java", "python"]	f	published	t
85	\N	Given a Directed Acyclic Graph (DAG) with V vertices (0 to V-1) and E directed edges, print one valid topological ordering.	1 <= V <= 100. Graph is guaranteed to be a DAG.	10	5	17	Topological Sort	Line 1: Two integers V and E.\nNext E lines: "u v" (directed edge u→v).	Print the topological order space-separated (any valid topological ordering is acceptable).	6 6\n5 2\n5 0\n4 0\n4 1\n2 3\n3 1	5 4 2 3 1 0	A valid topological sort where 5 and 4 come before their dependents.	medium	2	2026-10-19 15:28:47.116489	15	["c", "cpp", "java", "python"]	f	published	t
26	\N	Given a data structure name, print "Linear" if it is a linear data structure or "Non-Linear" if it is not. Consider: Array, Stack, Queue, LinkedList as Linear; Tree, Graph as Non-Linear.	Input is one of: Array, Stack, Queue, LinkedList, Tree, Graph	5	2	6	Identify Linear vs Non-Linear	A single string — the data structure name.	Print "Linear" or "Non-Linear".	Array	Linear	Array is a linear data structure.	easy	2	2026-10-19 15:28:46.810472	1	["c", "cpp", "java", "python"]	f	published	t
38	\N	Given a sequence of linked list nodes, detect if there is a loop. The input encodes a list with an optional back-pointer: each node has a value; the last line contains "LOOP X" where X is the 0-based index of the node the tail points back to (creating a cycle), or "NO_LOOP".	1 <= N <= 10^4\n0 <= X < N	10	5	4	Detect Loop in Linked List	Line 1: N space-separated node values.\nLine 2: "LOOP X" or "NO_LOOP".	Print YES if there is a loop, otherwise NO.	3 2 0 4\nLOOP 1	YES	The tail node (4) points back to node at index 1 (value 2), creating a cycle.	medium	2	2026-10-19 15:28:46.908703	5	["c", "cpp", "java", "python"]	f	published	t
53	\N	Given a sorted array of N integers and a target K, find the first and last positions (0-based) where K appears. Print "-1 -1" if K is not found.	1 <= N <= 10^5	10	3	11	Find First and Last Position	Line 1: Two integers N and K.\nLine 2: N sorted space-separated integers.	Print two space-separated integers: first position and last position.	8 8\n5 7 7 8 8 8 10 10	3 5	8 appears at indices 3, 4, and 5.	medium	2	2026-10-19 15:28:46.982226	9	["c", "cpp", "java", "python"]	f	published	t
57	\N	Given an array of N integers, sort it using Merge Sort and also count the number of inversions (pairs i < j where A[i] > A[j]).	1 <= N <= 10^5\n-10^6 <= A[i] <= 10^6	15	2	12	Merge Sort and Count Inversions	Line 1: Integer N.\nLine 2: N space-separated integers.	Line 1: Sorted array (space-separated).\nLine 2: Inversion count.	5\n2 4 1 3 5	1 2 3 4 5\n3	Inversions: (2,1), (4,1), (4,3) → 3 inversions.	hard	2	2026-10-19 15:28:47.001019	10	["c", "cpp", "java", "python"]	f	published	t
70	\N	Given a binary tree (level-order, -1 = null) and two node values P and Q, find their Lowest Common Ancestor (LCA). Assume both P and Q exist in the tree.	1 <= N <= 1000	15	5	14	Lowest Common Ancestor	Line 1: Level-order tree (space-separated, -1 = null).\nLine 2: Two integers P and Q.	Print the value of the LCA node.	3 5 1 6 2 0 8 -1 -1 7 4\n5 1	3	LCA of 5 and 1 is the root 3.	hard	2	2026-10-19 15:28:47.062202	12	["c", "cpp", "java", "python"]	f	published	t
87	\N	Given N items each with weight w and value v, and a knapsack capacity W, find the maximum value you can achieve by taking fractions of items (Fractional Knapsack). Print the answer rounded to 2 decimal places.	1 <= N <= 1000\n1 <= W, weight[i], value[i] <= 10^4	10	2	18	Fractional Knapsack	Line 1: Two integers N and W.\nNext N lines: each "value weight".	Print the maximum value rounded to 2 decimal places.	3 50\n60 10\n100 20\n120 30	240.00	Take all of items 1,2 (10+20=30), and 2/3 of item 3 (80). Total = 60+100+80 = 240.	medium	2	2026-10-19 15:28:47.124853	16	["c", "cpp", "java", "python"]	f	published	t
88	\N	Given coin denominations [1,5,10,25,50,100] (cents/standard denominations) and an amount N, find the minimum number of coins to make N using greedy (largest coin first).	1 <= N <= 10^6	5	3	18	Minimum Coins (Greedy)	A single integer N.	Print the minimum number of coins.	41	4	25+10+5+1=41 → 4 coins.	easy	2	2026-10-19 15:28:47.128581	16	["c", "cpp", "java", "python"]	f	published	t
89	\N	Given N jobs each with a deadline and profit, schedule jobs to maximize total profit. Each job takes exactly 1 unit of time. Print the maximum profit and number of jobs done.	1 <= N <= 100\n1 <= deadline, profit <= 1000	15	4	18	Job Sequencing with Deadlines	Line 1: Integer N.\nNext N lines: "profit deadline" for each job.	Print two integers: number of jobs completed and maximum profit.	4\n20 2\n15 2\n10 1\n5 3	3 45	Optimal: take profit-20 (dead=2), 15 (dead=2), 5 (dead=3) → 40? No: 20+15+10=45, 3 jobs.	hard	2	2026-10-19 15:28:47.132052	16	["c", "cpp", "java", "python"]	f	published	t
90	\N	Given an undirected weighted graph with V vertices and E edges, find the total weight of its Minimum Spanning Tree using Kruskal's algorithm.	2 <= V <= 100\n1 <= E <= 10^4\n0 <= w <= 10^4. Graph is connected.	15	5	18	Minimum Spanning Tree — Kruskal	Line 1: Two integers V and E.\nNext E lines: "u v w" (undirected edge with weight w).	Print the total weight of the MST.	4 5\n0 1 10\n0 2 6\n0 3 5\n1 3 15\n2 3 4	19	MST edges: (2,3)=4, (0,3)=5, (0,1)=10 → total 19.	hard	2	2026-10-19 15:28:47.135528	16	["c", "cpp", "java", "python"]	f	published	t
91	\N	Given two strings S1 and S2, find the length of their Longest Common Subsequence (LCS) using Dynamic Programming.	1 <= |S1|, |S2| <= 1000	10	1	19	Longest Common Subsequence	Line 1: String S1.\nLine 2: String S2.	Print the length of the LCS.	ABCBDAB\nBDCABA	4	LCS is "BCBA" or "BDAB" of length 4.	medium	2	2026-10-19 15:28:47.139381	17	["c", "cpp", "java", "python"]	f	published	t
92	\N	Given N items each with weight w[i] and value v[i], and a knapsack capacity W, find the maximum value achievable by selecting items without exceeding the capacity (each item can be taken at most once).	1 <= N <= 100\n1 <= W <= 10^4\n1 <= w[i], v[i] <= 1000	10	2	19	0/1 Knapsack Problem	Line 1: Two integers N and W.\nLine 2: N space-separated values.\nLine 3: N space-separated weights.	Print the maximum value.	4 8\n1 6 10 16\n1 2 3 5	23	Take items with values 6(w=2) + 16(w=5) = 22... or 10+16=26 if w=3+5=8. Max = 22.	medium	2	2026-10-19 15:28:47.142941	17	["c", "cpp", "java", "python"]	f	published	t
93	\N	Compute the Nth Fibonacci number using Dynamic Programming (memoization or tabulation). Since the result can be very large, print it modulo 10^9 + 7.	0 <= N <= 10^6	5	3	19	Fibonacci with Memoization	A single integer N.	Print fib(N) mod (10^9 + 7).	10	55	fib(10) = 55.	easy	2	2026-10-19 15:28:47.147121	17	["c", "cpp", "java", "python"]	f	published	t
94	\N	Given an array of N integers, find the length of the Longest Increasing Subsequence (LIS) using DP with O(N log N).	1 <= N <= 10^5\n-10^6 <= A[i] <= 10^6	15	4	19	Longest Increasing Subsequence	Line 1: Integer N.\nLine 2: N space-separated integers.	Print the length of the LIS.	8\n10 9 2 5 3 7 101 18	4	LIS is [2,3,7,101] or [2,5,7,101] of length 4.	hard	2	2026-10-19 15:28:47.178952	17	["c", "cpp", "java", "python"]	f	published	t
95	\N	Given a list of coin denominations and a target amount N, find the minimum number of coins needed to make up N. If not possible, print -1.	1 <= K <= 12\n1 <= N <= 10^4\n1 <= denomination <= 10^4	10	5	19	Coin Change — Minimum Coins	Line 1: Two integers K and N (K coin types, target N).\nLine 2: K space-separated coin denominations.	Print the minimum number of coins or -1.	3 11\n1 5 6	2	6 + 5 = 11 using 2 coins.	medium	2	2026-10-19 15:28:47.191172	17	["c", "cpp", "java", "python"]	f	published	t
80	\N	Given a stream of N integers, maintain the running median after each insertion. Print the median after each insertion (if two middle elements, print the lower one).	1 <= N <= 10^4\n-10^4 <= A[i] <= 10^4	15	5	16	Running Median	Line 1: Integer N.\nLine 2: N space-separated integers.	Print N medians (one after each insertion), space-separated.	6\n5 15 1 3 2 8	5 5 5 4 3 4	After each: [5]→5, [5,15]→5, [1,5,15]→5, [1,3,5,15]→4, [1,2,3,5,15]→3, [1,2,3,5,8,15]→4	hard	2	2026-10-19 15:28:47.098346	14	["c", "cpp", "java", "python"]	f	published	t
86	\N	Given N activities each with a start and finish time, find the maximum number of non-overlapping activities you can attend using a greedy approach.	1 <= N <= 10^5\n0 <= start < finish <= 10^9	10	1	18	Activity Selection Problem	Line 1: Integer N.\nNext N lines: each "start finish" for an activity.	Print the maximum number of non-overlapping activities.	6\n1 4\n3 5\n0 6\n5 7\n3 9\n5 9	3	Select activities ending at 4, 5 (or 7), 9. Max = 3.	medium	2	2026-10-19 15:28:47.121048	16	["c", "cpp", "java", "python"]	f	published	t
\.


--
-- Data for Name: lab_mcq_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_mcq_questions (mcq_id, topic_id, subtopic_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, marks, status, is_published, created_by_faculty_id, created_at) FROM stdin;
2	6	\N	Which of the following is classified as a non-linear data structure?	Doubly Linked List	Circular Queue	Binary Tree	Dynamic Array	C	Binary Trees and Graphs are non-linear because elements are arranged hierarchically or interconnected rather than sequentially.	easy	2	published	t	2	2026-10-20 15:34:02.465452+05:30
3	6	\N	What is the primary trade-off when choosing a contiguous array over a linked list?	Arrays offer O(1) random access by index but have fixed capacity or costly resizes; linked lists offer dynamic size but O(N) access.	Arrays use pointer overhead per element, whereas linked lists do not.	Arrays allow O(1) insertion at any arbitrary position without shifting elements.	Arrays cannot store primitive data types in standard languages.	A	Arrays store elements in contiguous memory enabling direct index calculation O(1), but insertion/deletion requires element shifting O(N). Linked lists allocate nodes dynamically with pointers.	medium	2	published	t	2	2026-10-20 15:34:02.467157+05:30
4	6	\N	Which asymptotic property is desirable for an algorithm designed to handle massive enterprise data streams in real-time?	O(N!) worst-case factorial time complexity.	Sub-linear O(log N) or linear O(N) time complexity with minimal extra auxiliary space.	Exponential space complexity O(2^N) to precompute all outcomes.	Quadratic O(N^2) memory footprint for index caching.	B	For massive real-time streams, algorithms need to process items in linear or logarithmic time to avoid latency spikes and resource exhaustion.	medium	2	published	t	2	2026-10-20 15:34:02.468881+05:30
5	6	\N	In algorithm analysis, what does the term "Space Complexity" comprise?	Only the memory consumed by the executable machine instructions on disk.	The fixed space required by constant code plus dynamic auxiliary memory allocated during execution for variables and recursive stack frames.	The physical hard drive sector size divided by the RAM page size.	The network bandwidth required to transmit the input payload to a remote database.	B	Total space complexity includes both fixed space (instructions, constants) and variable/auxiliary space (dynamic variables, recursion call stack, heap objects).	hard	2	published	t	2	2026-10-20 15:34:02.470566+05:30
6	7	\N	What is the time complexity of the following code snippet?\nfor (let i = 1; i <= n; i *= 2) { /* O(1) work */ }	O(n)	O(log n)	O(n log n)	O(1)	B	Because the loop variable doubles in each iteration (1, 2, 4, 8, ... 2^k <= n), the loop runs approximately log2(n) times, resulting in O(log n).	easy	2	published	t	2	2026-10-20 15:34:02.471838+05:30
7	7	\N	What does Big-O notation O(f(n)) formally represent in asymptotic analysis?	An asymptotic tight bound on running time from both above and below.	An asymptotic upper bound on the growth rate of running time as n approaches infinity.	An asymptotic lower bound representing the best-case execution time.	The exact number of CPU clock cycles executed by the CPU instruction pipeline.	B	Big-O notation provides an asymptotic upper bound: f(n) = O(g(n)) if there exist positive constants c and n0 such that 0 <= f(n) <= c*g(n) for all n >= n0.	easy	2	published	t	2	2026-10-20 15:34:02.473046+05:30
8	7	\N	Using the Master Theorem, what is the asymptotic time complexity of the recurrence relation T(n) = 2T(n/2) + O(n)?	O(n)	O(n log n)	O(n^2)	O(log n)	B	Here a = 2, b = 2, and f(n) = O(n). Since log_b(a) = log_2(2) = 1, and f(n) = Theta(n^1), Master Theorem Case 2 applies, giving T(n) = Theta(n log n). This is standard Merge Sort recurrence.	medium	2	published	t	2	2026-10-20 15:34:02.474009+05:30
9	7	\N	Which of the following correctly orders the asymptotic growth rates from slowest to fastest?	O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n)	O(1) < O(n) < O(log n) < O(n^2) < O(n log n) < O(2^n)	O(log n) < O(1) < O(n) < O(n log n) < O(2^n) < O(n^2)	O(1) < O(log n) < O(n log n) < O(n) < O(n^2) < O(2^n)	A	Constant O(1) grows slowest, followed by logarithmic O(log n), linear O(n), linearithmic O(n log n), quadratic O(n^2), and exponential O(2^n).	medium	2	published	t	2	2026-10-20 15:34:02.474906+05:30
10	7	\N	What is the amortized time complexity of inserting n elements into an initially empty dynamic array with a doubling resizing strategy?	O(n^2) overall, O(n) amortized per insertion.	O(n) overall, O(1) amortized per insertion.	O(n log n) overall, O(log n) amortized per insertion.	O(1) overall, O(1/n) amortized per insertion.	B	Although individual resizing operations take O(k) copy time when capacity is reached, resizing occurs infrequently (at powers of 2). Total cost for n items is 1 + 2 + 4 + ... + n <= 2n operations, so amortized cost per insertion is O(2n/n) = O(1).	hard	2	published	t	2	2026-10-20 15:34:02.47579+05:30
11	2	\N	Given an array A of size N in C/C++ stored in contiguous memory starting at base address B, what is the address formula for element A[i] (assuming each element takes S bytes)?	B + i	B + (i * S)	B * i + S	(B + i) / S	B	Because array elements are stored contiguously, the memory address of the i-th zero-indexed element is Base Address + (Index * Element Size).	easy	2	published	t	2	2026-10-20 15:34:02.476892+05:30
12	2	\N	What is the optimal time complexity to find the maximum sum of a contiguous subarray (Kadane's Algorithm)?	O(N^3)	O(N^2)	O(N)	O(log N)	C	Kadane's algorithm iterates through the array once keeping track of the current subarray sum and maximum sum so far, running in linear O(N) time and O(1) space.	easy	2	published	t	2	2026-10-20 15:34:02.477932+05:30
13	2	\N	Which algorithmic pattern is most suitable for finding two numbers in a sorted array that sum up to a specific target in O(N) time and O(1) space?	Prefix Sum array	Two-pointer technique (left at start, right at end)	Dynamic Programming table	Divide and conquer recursion	B	With a sorted array, placing two pointers at opposite ends and adjusting inward based on whether the current sum is less than or greater than the target solves the problem in O(N) time and O(1) space.	medium	2	published	t	2	2026-10-20 15:34:02.479178+05:30
14	2	\N	What is the time complexity of rotating an array of size N by K steps to the right using the three-reversal method (reverse whole, reverse first k, reverse remaining)?	O(N * K) time and O(1) space	O(N) time and O(1) space	O(N) time and O(N) space	O(K log N) time and O(K) space	B	The three-reversal algorithm reverses subsets of the array in-place. Each element is reversed twice overall, taking 2N operations = O(N) time with O(1) auxiliary space.	medium	2	published	t	2	2026-10-20 15:34:02.480743+05:30
15	2	\N	In a 2D matrix of dimensions R x C stored in row-major order with base address B and element size S, what is the memory offset of element M[i][j]?	B + (i + j) * S	B + (i * C + j) * S	B + (j * R + i) * S	B + (i * R + j * C) * S	B	In row-major order, entire rows are laid out consecutively. Skipping i complete rows of length C each, plus j elements in the current row gives offset (i * C + j) * S.	hard	2	published	t	2	2026-10-20 15:34:02.481714+05:30
16	3	\N	What is the time complexity to check whether a string of length N is a palindrome using the two-pointer approach?	O(N^2)	O(N)	O(log N)	O(1)	B	Comparing characters from both ends moving inward requires at most N/2 comparisons, which is O(N) time and O(1) space.	easy	2	published	t	2	2026-10-20 15:34:02.482618+05:30
18	3	\N	What is the worst-case time complexity of the Knuth-Morris-Pratt (KMP) pattern searching algorithm for text of length N and pattern of length M?	O(N * M)	O(N + M)	O(N log M)	O(M^2)	B	KMP precomputes the Longest Prefix Suffix (LPS) array in O(M) time and scans the text without backtracking in O(N) time, giving O(N + M) total worst-case time.	medium	2	published	t	2	2026-10-20 15:34:02.485368+05:30
19	3	\N	How can you verify if two strings of length N are anagrams in O(N) time and O(1) auxiliary space (assuming lowercase English alphabets)?	Sort both strings and compare character-by-character.	Count character frequencies using a fixed-size array of length 26 and ensure all net frequencies equal zero.	Compute the Cartesian product of characters from both strings.	Generate all N! permutations of the first string and search for the second string.	B	A fixed array of size 26 consumes constant O(1) extra space. Incrementing for string 1 and decrementing for string 2 takes O(N) time, verifying if all entries end at 0.	medium	2	published	t	2	2026-10-20 15:34:02.486616+05:30
20	3	\N	In the Rabin-Karp algorithm, how is the rolling hash property achieved for a substring of length M when sliding the window by one character to the right?	Re-hashing all M characters from scratch using SHA-256.	Subtracting the outgoing leading character contribution, multiplying by base d, and adding the incoming trailing character modulo prime q in O(1) time.	Sorting the characters within the sliding window.	Using binary search over the string suffix array.	B	Rolling hash computes new_hash = (d * (old_hash - text[i]*h) + text[i+M]) mod q in O(1) time, avoiding recalculating the full substring hash from scratch.	hard	2	published	t	2	2026-10-20 15:34:02.487635+05:30
21	4	\N	What is the time complexity to insert a new node at the beginning of a singly linked list with a given head pointer?	O(1)	O(N)	O(log N)	O(N^2)	A	Inserting at head simply allocates the new node, sets newNode->next = head, and updates head = newNode, which requires constant O(1) operations.	easy	2	published	t	2	2026-10-20 15:34:02.488523+05:30
22	4	\N	Which algorithm detects a cycle in a linked list using O(1) auxiliary memory?	Depth-First Search with visited hash set	Floyd's Cycle-Finding Algorithm (Tortoise and Hare pointer)	Counting the nodes using a counter variable	Sorting the list nodes by their memory addresses	B	Floyd's algorithm uses two pointers moving at speeds 1 and 2. If a cycle exists, the fast pointer catches up with the slow pointer inside the loop without extra memory.	easy	2	published	t	2	2026-10-20 15:34:02.489338+05:30
23	4	\N	What is the primary advantage of a Doubly Linked List over a Singly Linked List?	It requires half the memory space per node.	It allows bidirectional traversal and O(1) deletion of a node when given a direct reference to that node.	It supports O(1) random index access like an array.	It prevents memory fragmentation automatically.	B	Because each node stores pointers to both next and prev nodes, a node can be unlinked in O(1) time without traversing from the head to find its predecessor.	medium	2	published	t	2	2026-10-20 15:34:02.490305+05:30
24	4	\N	In reversing a singly linked list iteratively with three pointers (prev, curr, next), what is the correct pointer update order in each step?	next = curr->next; curr->next = prev; prev = curr; curr = next;	curr->next = prev; next = curr->next; curr = next; prev = curr;	prev = curr; curr = curr->next; next = prev;	curr->next = next; prev = curr; curr = next;	A	You must first save curr->next to avoid losing the rest of the list, reverse curr->next to point to prev, advance prev to curr, and advance curr to next.	medium	2	published	t	2	2026-10-20 15:34:02.491147+05:30
25	4	\N	In an LRU (Least Recently Used) Cache implementation requiring O(1) get and O(1) put operations, which combination of data structures is optimal?	Array and Stack	Hash Map and Doubly Linked List	Binary Search Tree and Queue	Singly Linked List and Heap	B	The Hash Map provides O(1) lookup to nodes, while the Doubly Linked List allows O(1) removal and re-insertion of accessed nodes at the head (most recently used).	hard	2	published	t	2	2026-10-20 15:34:02.49195+05:30
26	8	\N	Which principle governs the order of elements inserted and removed from a Stack?	First-In First-Out (FIFO)	Last-In First-Out (LIFO)	Highest Priority First (HPF)	Random Access Memory (RAM)	B	Stacks operate under LIFO: the last item pushed onto the stack is the first item popped off.	easy	2	published	t	2	2026-10-20 15:34:02.492834+05:30
27	8	\N	What happens when a pop() operation is called on an empty stack?	Stack Overflow	Stack Underflow	Memory Leak	Segmentation Resizing	B	Attempting to pop or peek from an empty stack triggers a Stack Underflow condition.	easy	2	published	t	2	2026-10-20 15:34:02.494507+05:30
28	8	\N	Which data structure is primarily used to evaluate Postfix (Reverse Polish Notation) expressions in linear time?	Queue	Operand Stack	Binary Search Tree	Adjacency Matrix	B	Operands are pushed onto a stack. When an operator is encountered, the two most recent operands are popped, evaluated, and the result is pushed back.	medium	2	published	t	2	2026-10-20 15:34:02.496122+05:30
29	8	\N	What is the optimal time complexity to solve the "Next Greater Element" problem for an array of N elements using a monotonic stack?	O(N^2)	O(N)	O(N log N)	O(2^N)	B	Each element is pushed onto and popped from the monotonic stack at most once during traversal, achieving overall linear O(N) time complexity.	medium	2	published	t	2	2026-10-20 15:34:02.497189+05:30
30	8	\N	How can you implement a MinStack that retrieves the minimum element in O(1) time without extra stack overhead for non-minimums?	Scan the stack elements using a loop inside getMin().	Store values as (2*val - min) when pushing a new minimum, and recover previous min upon pop.	Sort the stack after every push operation.	Use a Fibonacci heap linked to each node.	B	By storing an encoded delta value when a new minimum is pushed, the previous minimum can be mathematically recovered upon popping in O(1) time and O(1) auxiliary space.	hard	2	published	t	2	2026-10-20 15:34:02.498296+05:30
31	9	\N	Which principle governs the order of elements in a standard Queue?	Last-In First-Out (LIFO)	First-In First-Out (FIFO)	Priority-based ordering only	Depth-first search order	B	Standard queues adhere to FIFO: items are enqueued at the rear and dequeued from the front in the order they arrived.	easy	2	published	t	2	2026-10-20 15:34:02.499303+05:30
33	9	\N	Which graph traversal algorithm strictly utilizes a Queue for its layer-by-layer exploration?	Depth-First Search (DFS)	Breadth-First Search (BFS)	Topological Sort using Kahn's recursion	Tarjan's Strongly Connected Components	B	BFS uses a FIFO queue to visit all neighbors at distance d before moving to nodes at distance d + 1.	medium	2	published	t	2	2026-10-20 15:34:02.501661+05:30
35	9	\N	What data structure is optimal for solving the "Sliding Window Maximum" of size K across an array of size N in O(N) total time?	Standard Stack	Monotonic Decreasing Deque (Double-Ended Queue)	Binary Search Tree	Min-Heap	B	A monotonic deque stores array indices with decreasing values. Elements outside the window are removed from the front, smaller elements are removed from the back, yielding O(1) amortized window maximums.	hard	2	published	t	2	2026-10-20 15:34:02.505096+05:30
36	10	\N	What is the mandatory condition required in every recursive function to prevent infinite recursion and stack overflow?	A loop counter variable	A base case that terminates recursive calls without calling itself	A dynamic memory allocation on the heap	A global variable holding the call count	B	Without a reachable base case, recursive calls continue indefinitely until the execution call stack exceeds memory limits, crashing with a stack overflow.	easy	2	published	t	2	2026-10-20 15:34:02.506038+05:30
37	10	\N	What data structure is used internally by the runtime environment to manage recursive function calls, return addresses, and local variables?	Call Stack	Circular Queue	Binary Heap	Lookup Table	A	The system Call Stack stores activation records (stack frames) containing return addresses, parameters, and local variables for each active function invocation.	easy	2	published	t	2	2026-10-20 15:34:02.506905+05:30
38	10	\N	What is "Tail Recursion" and why is it beneficial for compilers that support Tail Call Optimization (TCO)?	Recursion that occurs inside a loop condition.	When the recursive call is the final operation executed by the function, allowing the compiler to reuse the current stack frame instead of creating a new one.	Recursion where two recursive calls are executed in parallel.	When a function calls another function which in turn calls the first function.	B	In tail recursion, nothing needs to be remembered after the recursive call returns. Compliers can replace the call with a jump instruction, reducing auxiliary space from O(N) to O(1).	medium	2	published	t	2	2026-10-20 15:34:02.507778+05:30
39	10	\N	What is the recurrence relation and overall time complexity for solving the classic Tower of Hanoi problem with N disks?	T(N) = T(N-1) + 1 => O(N)	T(N) = 2T(N-1) + 1 => O(2^N)	T(N) = 2T(N/2) + O(N) => O(N log N)	T(N) = T(N-1) + N => O(N^2)	B	Moving N disks requires moving N-1 disks to the auxiliary peg, 1 disk to target, and N-1 disks from auxiliary to target: T(N) = 2T(N-1) + 1 = 2^N - 1 moves, which is O(2^N).	medium	2	published	t	2	2026-10-20 15:34:02.508668+05:30
40	10	\N	In backtracking algorithms such as N-Queens or Sudoku Solver, what is the role of the "backtrack" step?	Restarting the algorithm from the root with a larger memory limit.	Reverting state changes (undoing choices) when a partial solution path violates constraints, before exploring the next branch.	Caching all previously calculated invalid states in a global database.	Converting the recursive solution into an iterative while loop.	B	Backtracking explores candidates depth-first. When a dead-end is reached, it undoes the latest decision (unmarking board positions, resetting variables) to test alternate choices.	hard	2	published	t	2	2026-10-20 15:34:02.509489+05:30
41	11	\N	What is the prerequisite for performing Binary Search on a collection of elements?	The elements must be stored in a linked list.	The elements must be arranged in sorted monotonic order with random access capability.	The number of elements must be an exact power of 2.	All elements must be positive integers.	B	Binary Search requires monotonic sorted order and direct index access so it can check the midpoint in O(1) time and discard half the search space.	easy	2	published	t	2	2026-10-20 15:34:02.511048+05:30
42	11	\N	What is the worst-case time complexity of Linear Search in an unsorted array of size N?	O(1)	O(log N)	O(N)	O(N^2)	C	In the worst case (target not present or at the very end), Linear Search examines every element once, resulting in O(N) time.	easy	2	published	t	2	2026-10-20 15:34:02.512369+05:30
43	11	\N	How should the midpoint index be computed in Binary Search to prevent integer overflow in languages with fixed-width 32-bit integers?	mid = (low + high) / 2	mid = low + (high - low) / 2	mid = (low * high) / 2	mid = (high - low) * 2	B	If low and high are large (e.g., near 2^31 - 1), low + high can overflow to a negative value. low + (high - low) / 2 avoids overflow while producing the exact same midpoint.	medium	2	published	t	2	2026-10-20 15:34:02.513413+05:30
44	11	\N	In a rotated sorted array without duplicates (e.g. [4, 5, 6, 7, 0, 1, 2]), how can you search for a target element in O(log N) time?	Linear search from the left until an inversion is found.	Modified binary search: at least one half (left or right of mid) is always sorted; determine which half is sorted and whether target lies within its bounds.	Sort the array first in O(N log N) time, then perform standard binary search.	Hash all elements into a bloom filter.	B	In any rotated sorted array, dividing at mid leaves at least one half strictly sorted. Checking if the target falls within that sorted half allows discarding the other half in O(log N) time.	medium	2	published	t	2	2026-10-20 15:34:02.514286+05:30
45	11	\N	When applying Binary Search on Answer (search space optimization, such as Book Allocation or Painter's Partition), what condition must the feasibility function satisfy?	It must return a random boolean value.	It must exhibit monotonicity: if a value X is feasible, all values >= X (or <= X) must also be feasible.	It must execute in O(1) time complexity.	It must be continuous and differentiable over real numbers.	B	Binary Search on Answer requires a monotonic predicate P(x) (e.g., FFF...TTT). Finding the transition point between False and True determines the optimal answer.	hard	2	published	t	2	2026-10-20 15:34:02.515069+05:30
46	12	\N	Which of the following sorting algorithms is known for having a worst-case time complexity of O(N^2) but an optimal best-case of O(N) on nearly sorted data?	Merge Sort	Heap Sort	Insertion Sort	Selection Sort	C	Insertion Sort takes O(N) when the array is already sorted because each element requires only 1 comparison to confirm its position.	easy	2	published	t	2	2026-10-20 15:34:02.51586+05:30
48	12	\N	What is the worst-case time complexity of standard QuickSort with first-element pivot selection, and when does it occur?	O(N log N), occurring when array elements are randomly shuffled.	O(N^2), occurring when the array is already sorted or reverse sorted.	O(N), occurring when all elements are distinct.	O(2^N), occurring when the array size is an odd prime.	B	If the pivot is always the smallest or largest element (such as first element in sorted array), partitions are maximally unbalanced (0 and N-1 elements), resulting in O(N^2) comparisons.	medium	2	published	t	2	2026-10-20 15:34:02.517578+05:30
49	12	\N	Why is standard Merge Sort preferred over QuickSort for sorting linked lists?	Merge Sort requires random index access which linked lists provide.	Linked list nodes can be merged by rewiring pointers in O(1) auxiliary space without requiring contiguous buffer arrays.	QuickSort cannot partition linked lists under any circumstances.	Merge Sort has O(N) worst-case time on linked lists.	B	Unlike arrays where Merge Sort requires O(N) extra buffer memory, linked list nodes can be split in half and merged by adjusting next pointers with O(1) extra space.	medium	2	published	t	2	2026-10-20 15:34:02.518377+05:30
50	12	\N	What is the theoretical lower bound on time complexity for any comparison-based sorting algorithm on N items in the worst case?	Omega(N)	Omega(N log N)	Omega(N^2)	Omega(log N)	B	A comparison decision tree for N items has N! possible permutations (leaves). The minimum height of the binary decision tree is log2(N!) = Omega(N log N).	hard	2	published	t	2	2026-10-20 15:34:02.519222+05:30
51	13	\N	What is the ideal average-case time complexity for search, insert, and delete operations in a Hash Table?	O(N)	O(log N)	O(1)	O(N log N)	C	Under uniform hashing and a reasonable load factor, hash table lookups, insertions, and deletions execute in O(1) expected time.	easy	2	published	t	2	2026-10-20 15:34:02.520392+05:30
52	13	\N	What is a "Hash Collision"?	When two identical keys produce different hash values.	When two distinct keys produce the exact same hash index from the hash function.	When the hash table runs out of physical memory.	When a key cannot be converted into an integer representation.	B	A collision happens when hashFunction(key1) == hashFunction(key2) for key1 != key2.	easy	2	published	t	2	2026-10-20 15:34:02.52129+05:30
53	13	\N	In Open Addressing collision resolution, what problem does "Linear Probing" often suffer from?	Primary Clustering (consecutive occupied slots forming long runs and increasing search times)	Infinite recursion inside the hash function	Secondary memory leakage in external linked lists	Pointer invalidation across thread boundaries	A	Linear probing probes index (h + i) % M. When clusters form, any key that hashes into the cluster extends it further, degrading performance.	medium	2	published	t	2	2026-10-20 15:34:02.522146+05:30
55	13	\N	What property must a custom object satisfy when overriding equals() in languages like Java to work correctly as a HashMap key?	It must also override hashCode() such that if a.equals(b) is true, then a.hashCode() === b.hashCode().	It must implement the Comparable interface and return 0.	It must serialize its fields to a JSON string.	Its hashCode() must return a distinct value every time it is called.	A	The contract specifies: if two objects are equal according to equals(), they must produce the identical integer hashCode(), or the map will look in the wrong bucket and fail to retrieve the entry.	hard	2	published	t	2	2026-10-20 15:34:02.523724+05:30
56	14	\N	In a full binary tree where every internal node has exactly 2 children, if there are L leaf nodes, how many internal nodes I exist?	I = L	I = L - 1	I = 2 * L	I = L + 1	B	In any strictly binary tree where every node has 0 or 2 children, the number of leaf nodes L is always equal to internal nodes I plus 1 (L = I + 1, so I = L - 1).	easy	2	published	t	2	2026-10-20 15:34:02.524591+05:30
57	14	\N	Which tree traversal visits the root node first, followed by the left subtree, and then the right subtree?	Inorder Traversal	Preorder Traversal	Postorder Traversal	Level-order Traversal	B	Preorder processes Current Node -> Left Subtree -> Right Subtree.	easy	2	published	t	2	2026-10-20 15:34:02.525526+05:30
58	14	\N	What is the maximum number of nodes in a binary tree of height H (where height of a single root node is 0)?	2^H	2^(H + 1) - 1	2^H - 1	H^2	B	Summing nodes at each level: 2^0 + 2^1 + 2^2 + ... + 2^H = 2^(H+1) - 1.	medium	2	published	t	2	2026-10-20 15:34:02.526466+05:30
59	14	\N	What is the "Diameter" of a binary tree?	The number of leaf nodes in the tree.	The length of the longest path between any two nodes in the tree, which may or may not pass through the root.	The maximum level width of any single level.	The total number of edges divided by 2.	B	Tree diameter is the number of edges (or nodes) on the longest path between any two arbitrary nodes in the tree.	medium	2	published	t	2	2026-10-20 15:34:02.527901+05:30
60	14	\N	How can you reconstruct a unique binary tree given two of its traversals?	Preorder and Postorder traversals are always sufficient for any arbitrary binary tree.	Inorder traversal combined with either Preorder or Postorder traversal is necessary and sufficient.	Level-order traversal alone is sufficient for any tree.	Only a complete binary tree can ever be reconstructed.	B	Inorder identifies which nodes belong to left vs right subtrees relative to the root; Preorder or Postorder identifies the root of each subtree. Together they resolve the unique structure.	hard	2	published	t	2	2026-10-20 15:34:02.529028+05:30
61	15	\N	What property defines a valid Binary Search Tree (BST)?	Every node has exactly two children.	For every node X, all keys in its left subtree are less than X.key, and all keys in its right subtree are greater than X.key.	The tree is completely balanced at all levels.	Leaf nodes contain only positive values.	B	The fundamental BST invariant guarantees that all values in left subtree < node.val < all values in right subtree for every node in the tree.	easy	2	published	t	2	2026-10-20 15:34:02.529929+05:30
62	15	\N	Which tree traversal on a Binary Search Tree produces elements in strictly sorted ascending order?	Preorder Traversal	Inorder Traversal	Postorder Traversal	Level-order Traversal	B	Inorder visits Left -> Root -> Right. By the BST property, this visits keys in non-decreasing sorted order.	easy	2	published	t	2	2026-10-20 15:34:02.530895+05:30
64	15	\N	When deleting a node with two children from a BST, which node can replace it while preserving the BST invariant?	The root of the entire tree.	Either its Inorder Predecessor (maximum value in left subtree) or its Inorder Successor (minimum value in right subtree).	Any leaf node currently in the tree.	The parent of the deleted node.	B	The inorder successor (smallest in right subtree) or predecessor (largest in left subtree) has at most one child and satisfies all BST inequalities relative to both subtrees.	medium	2	published	t	2	2026-10-20 15:34:02.532852+05:30
65	15	\N	In an AVL tree (self-balancing BST), what is the allowable range for the Balance Factor of any node (height(left) - height(right))?	Exactly 0 at all times	-1, 0, or +1	-2 to +2	Any non-negative integer	B	An AVL tree strictly requires Balance Factor in {-1, 0, 1} for every node. When an insertion causes balance factor to become +2 or -2, tree rotations restore balance.	hard	2	published	t	2	2026-10-20 15:34:02.534097+05:30
66	16	\N	In a Min-Heap represented as a zero-indexed array, where is the minimum element always located?	At index N - 1 (the last element)	At index 0 (the root)	At index floor(N / 2)	At any randomly hashed index	B	The min-heap property ensures that parent <= children for all nodes. Consequently, the minimum element of the entire heap is at index 0.	easy	2	published	t	2	2026-10-20 15:34:02.535132+05:30
67	16	\N	For a node at zero-based index i in a binary heap array, what are the indices of its parent, left child, and right child?	Parent: (i-1)/2, Left: 2i+1, Right: 2i+2	Parent: i/2, Left: 2i, Right: 2i+1	Parent: i-1, Left: i+1, Right: i+2	Parent: 2i, Left: i/2, Right: (i/2)+1	A	In 0-indexed binary heaps: parent is floor((i - 1) / 2), left child is 2*i + 1, and right child is 2*i + 2.	easy	2	published	t	2	2026-10-20 15:34:02.536261+05:30
68	16	\N	What is the time complexity to build a binary heap from an arbitrary unsorted array of N elements using the bottom-up heapify algorithm?	O(N log N)	O(N)	O(N^2)	O(log N)	B	Building a heap bottom-up runs in linear O(N) time because most nodes are near the bottom of the tree with small heights (sum of h/2^h converges to a constant).	medium	2	published	t	2	2026-10-20 15:34:02.537251+05:30
69	16	\N	What is the time complexity to find the K-th largest element in a stream of N elements using a Min-Heap of size K?	O(N * K)	O(N log K)	O(N log N)	O(N^2)	B	Keeping a min-heap of size K costs O(log K) per stream element insertion/eviction, giving O(N log K) time and O(K) space.	medium	2	published	t	2	2026-10-20 15:34:02.538133+05:30
71	17	\N	What is the space complexity of representing a graph with V vertices and E edges using an Adjacency Matrix versus an Adjacency List?	Matrix: O(V + E), List: O(V^2)	Matrix: O(V^2), List: O(V + E)	Matrix: O(E), List: O(V)	Matrix: O(V * E), List: O(V + E)	B	Adjacency matrix stores a V x V grid consuming O(V^2) space regardless of edges. Adjacency list stores V heads plus list of edges, consuming O(V + E) space.	easy	2	published	t	2	2026-10-20 15:34:02.54017+05:30
72	17	\N	Which algorithm finds the shortest path between a source vertex and all other vertices in a weighted graph with non-negative edge weights?	Prim's Algorithm	Dijkstra's Algorithm	Kruskal's Algorithm	Floyd-Warshall Algorithm	B	Dijkstra's algorithm greedily extracts the unvisited vertex with smallest provisional distance using a min-priority queue, optimal for non-negative weights.	easy	2	published	t	2	2026-10-20 15:34:02.540946+05:30
73	17	\N	When is Kahn's Algorithm (BFS-based topological sort using in-degrees) able to detect a cycle in a directed graph?	When the queue becomes full.	When the count of visited/processed nodes at termination is strictly less than total vertices V.	When all vertices have an in-degree of 0.	When the graph has an odd number of edges.	B	In Kahn's algorithm, nodes in a cycle never reach an in-degree of 0 and thus never enter the queue. If total processed nodes < V, a cycle exists.	medium	2	published	t	2	2026-10-20 15:34:02.541773+05:30
74	17	\N	What is the primary difference between Dijkstra's algorithm and the Bellman-Ford algorithm?	Bellman-Ford works only on unweighted graphs.	Bellman-Ford handles graphs with negative edge weights and detects negative weight cycles, whereas Dijkstra fails on negative edges.	Dijkstra has a worse time complexity O(V * E) compared to Bellman-Ford.	Bellman-Ford finds all-pairs shortest paths while Dijkstra finds only single-pair.	B	Dijkstra assumes paths never get shorter after visiting a node, failing with negative weights. Bellman-Ford relaxes all E edges V-1 times, safely handling negative weights and detecting negative cycles.	medium	2	published	t	2	2026-10-20 15:34:02.542573+05:30
75	17	\N	In Tarjan's algorithm for finding Strongly Connected Components (SCCs), what does the low-link value low[u] represent?	The out-degree of vertex u.	The smallest discovery time reachable from u through its DFS subtree, including at most one back-edge to a node currently on the DFS stack.	The number of shortest paths leading to u.	The distance of u from the graph sink.	B	low[u] tracks the earliest discovered vertex reachable from u. If discovery[u] == low[u], vertex u is the root of an SCC, and nodes are popped from the stack until u.	hard	2	published	t	2	2026-10-20 15:34:02.543557+05:30
76	18	\N	What two key properties must a problem exhibit for a Greedy Algorithm to produce an optimal global solution?	Overlapping Subproblems and Polynomial Reducibility	Greedy Choice Property (locally optimal choices yield global optimum) and Optimal Substructure	Exponential Branching Factor and Infinite Base Cases	Binary Searchability and Monotonic Arrays	B	A greedy algorithm is optimal if a global optimum can be reached by choosing local optimums at each step (Greedy Choice Property) and optimal solutions contain optimal sub-solutions (Optimal Substructure).	easy	2	published	t	2	2026-10-20 15:34:02.544852+05:30
77	18	\N	In the Activity Selection Problem (Interval Scheduling), which greedy strategy maximizes the total number of non-overlapping activities?	Select activity with shortest duration first.	Select activity with earliest finish time first.	Select activity with earliest start time first.	Select activity with least number of overlaps.	B	Sorting by earliest finish time leaves the maximum possible remaining time for subsequent activities, provably yielding an optimal schedule.	easy	2	published	t	2	2026-10-20 15:34:02.546428+05:30
1	6	\N	Which of the following best describes an Abstract Data Type (ADT)?	A physical memory implementation of a data structure in hardware.	A mathematical specification of a set of data items and the operations performed on them, independent of implementation.	A programming language compiler feature that converts code into binary instructions.	A dynamic array that can change its size during runtime automatically.	B	An ADT specifies what operations can be performed and what each operation does, without dictating how data is organized or implemented in memory.	easy	2	published	t	2	2026-10-20 15:34:02.441718+05:30
17	3	\N	Why are strings immutable in languages like Java and Python?	To prevent using arrays under the hood.	For thread safety, string interning/caching, security, and hash code caching.	Because modern CPUs cannot modify character bytes in memory.	To allow strings to be resized without allocating new memory.	B	Immutability allows safe string sharing across threads, caching of hash codes for HashMap keys, string pool deduplication, and secure parameters for file/network APIs.	easy	2	published	t	2	2026-10-20 15:34:02.484373+05:30
32	9	\N	In a Circular Queue of capacity N implemented with an array, what formula determines the next position of the rear pointer when enqueueing an element?	(rear + 1)	(rear + 1) % N	(rear - 1) % N	(rear * 2) % N	B	The modulo operation wraps the rear index back to 0 when it reaches the end of the array (N - 1), reusing freed space at the front.	easy	2	published	t	2	2026-10-20 15:34:02.500181+05:30
34	9	\N	How can a Queue be implemented using two Stacks (inputStack and outputStack) to achieve amortized O(1) per operation?	Push to inputStack on enqueue; on dequeue, pop from outputStack (transferring all elements from inputStack only when outputStack is empty).	Transfer all elements between both stacks on every single enqueue and dequeue.	Sort inputStack before every dequeue.	Use one stack for positive numbers and one for negative numbers.	A	Each element enters inputStack once and outputStack once. Total operations across N items is 2N, giving amortized O(1) cost per enqueue and dequeue.	medium	2	published	t	2	2026-10-20 15:34:02.503999+05:30
47	12	\N	What does it mean for a sorting algorithm to be "stable"?	It never crashes due to memory overflow.	It preserves the relative input order of elements that have equal keys.	Its best-case, average-case, and worst-case time complexities are identical.	It uses O(1) auxiliary memory.	B	A sort is stable if elements with identical keys appear in the sorted output in the same relative order as in the original input.	easy	2	published	t	2	2026-10-20 15:34:02.516676+05:30
79	18	\N	In Huffman Coding for lossless data compression, what data structure is used to repeatedly combine the two lowest-frequency character nodes into an optimal prefix tree?	Stack	Min-Priority Queue (Min-Heap)	Circular Queue	B-Tree	B	Huffman algorithm uses a Min-Heap to extract the two lowest-frequency trees in O(log N) time, combine them into a parent node, and insert it back, building the tree in O(N log N) time.	medium	2	published	t	2	2026-10-20 15:34:02.548798+05:30
80	18	\N	In Kruskal's algorithm for Minimum Spanning Tree (MST), which auxiliary data structure is crucial to detect cycles in nearly O(1) amortized time per edge?	Disjoint Set Union (DSU / Union-Find) with path compression and union by rank	Breadth-First Search queue	Fibonacci Stack	Depth-First Search recursive visited set	A	DSU with union by rank and path compression checks whether edge endpoints belong to the same component in O(alpha(V)) amortized time, where alpha is the inverse Ackermann function.	hard	2	published	t	2	2026-10-20 15:34:02.54998+05:30
81	19	\N	What are the two core hallmarks of problems that can be solved using Dynamic Programming?	Greedy choice property and contiguous memory access	Overlapping Subproblems and Optimal Substructure	Linear recursion and randomized hashing	Divide-and-conquer without shared sub-problems	B	DP applies when a problem can be decomposed into subproblems that recur multiple times (Overlapping Subproblems) and optimal solutions to subproblems form optimal solutions to the whole (Optimal Substructure).	easy	2	published	t	2	2026-10-20 15:34:02.551009+05:30
82	19	\N	What is the distinction between "Memoization" (Top-Down) and "Tabulation" (Bottom-Up) in DP?	Memoization uses iterative loops; Tabulation uses recursion.	Memoization is recursive and caches results on demand; Tabulation is iterative and fills a table starting from base cases.	Memoization requires O(1) space; Tabulation requires O(2^N) space.	Tabulation cannot solve 2D grid problems.	B	Memoization adds caching to top-down recursion. Tabulation iteratively computes and fills values in a table bottom-up, avoiding recursion call stack overhead.	easy	2	published	t	2	2026-10-20 15:34:02.551912+05:30
83	19	\N	What is the time and space complexity to find the length of the Longest Common Subsequence (LCS) of two strings of lengths M and N using standard 2D DP?	Time: O(M + N), Space: O(1)	Time: O(M * N), Space: O(M * N)	Time: O(2^(M + N)), Space: O(M * N)	Time: O(M log N), Space: O(N)	B	The state dp[i][j] represents LCS of s1[0..i] and s2[0..j]. Filling the (M+1) x (N+1) table takes O(M * N) time and O(M * N) space.	medium	2	published	t	2	2026-10-20 15:34:02.552804+05:30
84	19	\N	In the 0/1 Knapsack problem with capacity W and N items, how can the space complexity of the DP table be optimized from O(N * W) to O(W)?	By using a 1D array of size W+1 and iterating capacities backwards from W down to item_weight.	By sorting items by weight.	By discarding all items heavier than W / 2.	By using a binary search tree of size W.	A	Because dp[i][w] depends only on the previous row dp[i-1][w] and dp[i-1][w - weight], iterating the capacity backwards in a 1D array ensures values from the previous row are not prematurely overwritten.	medium	2	published	t	2	2026-10-20 15:34:02.554045+05:30
85	19	\N	In Matrix Chain Multiplication of N matrices, what is the recurrence relation for the minimum scalar multiplications m[i, j]?	m[i, j] = m[i, j-1] + m[i+1, j]	m[i, j] = min over k (m[i, k] + m[k+1, j] + p_{i-1} * p_k * p_j) for i <= k < j	m[i, j] = max over k (m[i, k] * m[k, j])	m[i, j] = p_{i-1} * p_j	B	Splitting the product at parenthesization position k (where i <= k < j) costs m[i, k] for the left product, m[k+1, j] for right product, plus p_{i-1} * p_k * p_j to multiply the resulting two matrices.	hard	2	published	t	2	2026-10-20 15:34:02.555041+05:30
54	13	\N	What is the "Load Factor" (alpha) of a hash table with N stored elements and M total bucket capacity, and what action is triggered when alpha exceeds a threshold (e.g. 0.75)?	alpha = M / N; triggers table truncation.	alpha = N / M; triggers dynamic rehashing (resizing bucket array, typically doubling, and re-inserting all keys).	alpha = N * M; triggers garbage collection.	alpha = N - M; triggers deletion of old keys.	B	Load factor is alpha = N / M. When it exceeds a threshold, the table resizes (often 2M) and rehashes keys to keep bucket chains short and maintain O(1) performance.	medium	2	published	t	2	2026-10-20 15:34:02.522909+05:30
63	15	\N	What is the worst-case time complexity of searching for a key in an unbalanced BST with N elements, and what causes this degeneration?	O(log N), caused by duplicate keys.	O(N), occurring when elements are inserted in already sorted order, degenerating the tree into a skewed linked list.	O(N log N), caused by deep recursion.	O(1), caused by hash table fallback.	B	Inserting sorted keys (1, 2, 3, 4, 5) creates a right-skewed tree of height N, degrading search time from O(log N) to O(N).	medium	2	published	t	2	2026-10-20 15:34:02.531826+05:30
70	16	\N	Why does Heap Sort require O(1) auxiliary space, whereas standard Merge Sort on arrays requires O(N)?	Heap Sort sorts elements by recursively halving the array into buffers.	Heap Sort reorganizes the array into a max-heap in-place, repeatedly swapping root with the last unsorted index and sifting down.	Heap Sort converts elements into bitwise integers.	Heap Sort uses CPU register caching instead of RAM.	B	Heap Sort works completely in-place inside the original array. By treating the array as a heap and shrinking the active heap boundary after each root-swap, it needs only O(1) auxiliary space.	hard	2	published	t	2	2026-10-20 15:34:02.539111+05:30
78	18	\N	Why can the Fractional Knapsack problem be solved greedily, while the 0/1 Knapsack problem cannot?	Fractional Knapsack allows taking fractions of items based on value-to-weight ratio, whereas 0/1 requires binary choices where taking high-ratio items can leave wasted capacity.	0/1 Knapsack has no optimal substructure.	Fractional Knapsack does not have a capacity limit.	Greedy algorithms only work on floating-point numbers.	A	In Fractional Knapsack, sorting by value/weight ratio guarantees maximum value. In 0/1 knapsack, choosing an item with high ratio might fill the knapsack poorly, requiring Dynamic Programming.	medium	2	published	t	2	2026-10-20 15:34:02.54769+05:30
\.


--
-- Data for Name: lab_test_cases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_test_cases (lab_testcase_id, lab_question_id, input, expected_output, is_hidden, order_index) FROM stdin;
1	1	5\n1 2 3 4 5	5 4 3 2 1	f	1
2	1	3\n10 20 30	30 20 10	f	2
3	1	1\n99	99	t	3
4	1	4\n-1 -5 10 2	2 10 -5 -1	t	4
5	1	6\n1 0 0 1 0 1	1 0 1 0 0 1	t	5
6	2	6\n3 2 1 56 10000 167	10000 1	f	1
7	2	4\n-10 -5 -20 -1	-1 -20	f	2
8	2	1\n42	42 42	t	3
9	2	5\n7 7 7 7 7	7 7	t	4
10	2	5\n100 200 -50 0 500	500 -50	t	5
11	3	5 9\n1 4 2 5 8	YES	f	1
12	3	4 10\n1 2 3 4	NO	f	2
13	4	racecar	YES	f	1
14	4	virtual	NO	f	2
15	5	6 2\n1 2 2 3 2 4	3	f	1
16	5	5 7\n1 2 3 4 5	0	f	2
17	5	4 10\n10 10 10 10	4	t	3
18	5	1 -5\n-5	1	t	4
19	6	5\n12 35 1 10 34	34	f	1
20	6	4\n10 10 10 10	-1	f	2
21	6	3\n5 10 10	5	t	3
22	6	2\n100 200	100	t	4
23	6	5\n-5 -2 -10 -1 -8	-2	t	5
24	7	()[]{}	YES	f	1
25	7	(]	NO	f	2
26	3	3 0\n-5 2 5	YES	t	3
27	3	4 7\n2 4 6 8	NO	t	5
28	8	5\n0 1 0 3 12	1 3 12 0 0	f	1
29	8	3\n0 0 0	0 0 0	f	2
30	8	4\n1 2 3 4	1 2 3 4	t	3
31	8	6\n0 5 0 0 4 2	5 4 2 0 0 0	t	4
32	4	madam	YES	t	3
33	4	abcdea	NO	t	6
34	9	walchand\na	2	f	1
35	9	engineering\ne	3	f	2
36	9	computer\nz	0	t	3
37	9	aaaaa\na	5	t	4
38	9	virtual_lab\nl	2	t	5
39	10	listen\nsilent	YES	f	1
40	10	apple\npale	NO	t	3
41	10	a\na	YES	t	5
42	11	3\nflower flow flight	fl	f	1
43	11	3\ndog racecar car	-1	f	2
44	11	2\nwalchand walchandcollege	walchand	t	3
45	11	1\nsangli	sangli	t	4
46	12	10 20 30 -1	3	f	1
47	12	-1	0	f	2
48	12	5 -1	1	t	3
49	12	1 2 3 4 5 6 7 8 9 10 -1	10	t	4
50	13	14 21 31 54 -1\n21	YES	f	1
51	13	1 2 3 -1\n10	NO	f	2
52	13	-1\n5	NO	t	3
53	13	99 100 101 -1\n99	YES	t	4
54	14	1 2 3 4 -1	4 3 2 1 -1	f	1
55	14	1 -1	1 -1	f	2
56	14	-1	-1	t	3
57	14	10 20 30 -1	30 20 10 -1	t	4
58	7	([{}])	YES	t	3
59	7	((()	NO	t	4
60	15	5\n1 2\n1 3\n2\n1 4\n2	2 3	f	1
61	15	3\n2\n1 10\n2	-1 10	f	2
62	15	4\n1 5\n1 6\n2\n2	5 6	t	3
63	15	2\n2\n2	-1 -1	t	4
64	16	4\n1 3 2 4	3 4 4 -1	f	1
65	16	4\n4 3 2 1	-1 -1 -1 -1	f	2
66	16	1\n10	-1	t	3
67	16	5\n6 8 0 1 3	8 -1 1 3 -1	t	4
68	17	5 4\n1 2 3 4 5	3	f	1
69	17	5 6\n1 2 3 4 5	-1	f	2
70	17	1 10\n10	0	t	3
71	17	6 -2\n-10 -5 -2 0 4 9	2	t	4
72	5	5 0\n0 1 0 2 0	3	t	5
73	18	3 3\n1 3 5\n2 4 6	1 2 3 4 5 6	f	1
74	18	2 1\n10 20\n5	5 10 20	f	2
75	18	1 1\n0\n0	0 0	t	3
76	18	4 2\n-5 -2 0 10\n-3 4	-5 -3 -2 0 4 10	t	4
77	7	3\n1 2 3	1 2 3	t	\N
84	21	3\n1 2 3	1 2 3	f	1
103	25	5	15	f	1
104	25	1	1	f	2
105	25	100	5050	t	3
106	25	1000000	500000500000	t	4
107	26	Array	Linear	f	1
108	26	Tree	Non-Linear	f	2
109	26	Stack	Linear	t	3
110	26	Graph	Non-Linear	t	4
111	26	Queue	Linear	t	5
112	27	6	0 1 1 2 3 5	f	1
113	27	1	0	f	2
114	27	2	0 1	t	3
115	27	10	0 1 1 2 3 5 8 13 21 34	t	4
116	28	16	YES	f	1
117	28	15	NO	f	2
118	28	1	YES	t	3
119	28	1024	YES	t	4
120	28	1000000000	NO	t	5
121	29	5	120	f	1
122	29	0	1	f	2
123	29	20	2432902008176640000	t	3
124	29	21	OVERFLOW	t	4
125	30	4	10	f	1
126	30	1	1	f	2
127	30	100	5050	t	3
128	30	1000	500500	t	4
129	31	n2	quadratic	f	1
130	31	1	constant	f	2
131	31	logn	logarithmic	t	3
132	31	n	linear	t	4
133	31	2n	exponential	t	5
134	31	nlogn	linearithmic	t	6
135	32	7 23\n1 3 7 10 23 50 75	3 4	f	1
136	32	5 6\n1 2 3 4 5	3 -1	f	2
137	32	1 5\n5	1 0	t	3
138	32	8 1\n1 2 3 4 5 6 7 8	3 0	t	4
139	33	8	15	f	1
140	33	1	1	f	2
141	33	4	7	t	3
142	33	16	31	t	4
143	34	5 3\n3 1 4 1 5	1 best	f	1
144	34	5 9\n3 1 4 1 5	-1 worst	f	2
145	34	4 4\n1 2 3 4	4 worst	t	3
146	34	6 3\n1 2 3 4 5 6	3 average	t	4
147	3	2 6\n3 3	YES	t	4
148	35	8\n-2 1 -3 4 -1 2 1 -5	6	f	1
149	35	3\n-1 -2 -3	-1	f	2
150	35	1\n5	5	t	3
151	35	5\n1 2 3 4 5	15	t	4
152	35	6\n-3 2 -1 4 -2 3	6	t	5
153	4	a	YES	t	4
154	4	abccba	YES	t	5
155	10	triangle\nintegral	YES	f	2
156	36	aababc\n2	4	f	1
157	36	abcd\n2	3	f	2
158	36	aaaa\n1	1	t	3
159	36	abcabc\n3	3	t	4
160	37	1 2 3 4 5 -1	3	f	1
161	37	1 2 3 4 -1	3	f	2
162	37	42 -1	42	t	3
163	37	1 2 -1	2	t	4
164	38	3 2 0 4\nLOOP 1	YES	f	1
165	38	1 2 3\nNO_LOOP	NO	f	2
166	38	5\nLOOP 0	YES	t	3
167	38	1 2\nNO_LOOP	NO	t	4
168	7	([)]	NO	t	5
169	39	5\n1 10\n1 20\n2\n1 30\n2	20\n30	f	1
170	39	3\n2\n1 5\n2	-1\n5	f	2
171	39	4\n1 1\n1 2\n2\n2	2\n1	t	3
172	39	2\n2\n2	-1\n-1	t	4
173	40	3 4 + 2 * 7 /	2	f	1
174	40	2 3 4 + *	14	f	2
175	40	5 1 2 + 4 * + 3 -	14	t	3
176	40	10 2 /	5	t	4
177	41	4\n3 1 4 2	1 2 3 4	f	1
178	41	3\n5 3 1	1 3 5	f	2
179	41	1\n7	7	t	3
180	41	5\n-3 0 -1 2 1	-3 -1 0 1 2	t	4
181	42	5\n1 2\n1 3\n2\n1 4\n2	2\n3	f	1
182	42	3\n2\n1 10\n2	-1\n10	f	2
183	42	4\n1 5\n1 6\n2\n2	5\n6	t	3
184	42	2\n2\n2	-1\n-1	t	4
185	43	aabbc	a#b#c	f	1
186	43	abc	aab	f	2
187	43	a	a	t	3
188	43	abac	aabb	t	4
189	44	8 3\n1 3 -1 -3 5 3 6 7	3 3 5 5 6 7	f	1
190	44	5 1\n1 2 3 4 5	1 2 3 4 5	f	2
191	44	4 4\n1 2 3 4	4	t	3
192	44	6 2\n2 1 5 3 6 4	2 5 5 6 6	t	4
193	45	5\n1 10\n1 20\n2\n1 30\n2	20\n30	f	1
194	45	3\n1 1\n1 2\n2	2	f	2
195	45	2\n2\n1 5	-1	t	3
196	45	4\n1 3\n1 4\n2\n2	4\n3	t	4
197	46	1 2 3 4 5 -1 -1	1\n2 3\n4 5	f	1
198	46	1	1	f	2
199	46	1 -1 2 -1 -1 -1 3	1\n2\n3	t	3
200	47	5	120	f	1
201	47	0	1	f	2
202	47	12	479001600	t	3
203	47	1	1	t	4
204	48	2	Move disk 1 from A to C\nMove disk 2 from A to B\nMove disk 1 from C to B	f	1
205	48	1	Move disk 1 from A to B	f	2
206	48	3	Move disk 1 from A to B\nMove disk 2 from A to C\nMove disk 1 from B to C\nMove disk 3 from A to B\nMove disk 1 from C to A\nMove disk 2 from C to B\nMove disk 1 from A to B	t	3
207	49	2\n1 2	{}\n1\n1 2\n2	f	1
208	49	1\n5	{}\n5	f	2
209	49	3\n1 2 3	{}\n1\n1 2\n1 2 3\n1 3\n2\n2 3\n3	t	3
210	50	4	2	f	1
211	50	1	1	f	2
212	50	8	92	t	3
213	50	6	4	t	4
214	51	abc	abc\nacb\nbac\nbca\ncab\ncba	f	1
215	51	ab	ab\nba	f	2
216	51	a	a	t	3
217	51	ba	ab\nba	t	4
218	52	6 23\n1 3 7 23 23 50	3	f	1
219	52	4 99\n1 2 3 4	-1	f	2
220	52	1 5\n5	0	t	3
221	52	5 1\n1 1 1 1 1	0	t	4
222	53	8 8\n5 7 7 8 8 8 10 10	3 5	f	1
223	53	4 6\n1 2 3 4	-1 -1	f	2
224	53	5 5\n5 5 5 5 5	0 4	t	3
225	53	3 2\n1 2 3	1 1	t	4
226	54	7 0\n4 5 6 7 0 1 2	4	f	1
227	54	4 3\n1 3 5 6	1	f	2
228	54	1 5\n5	0	t	3
229	54	5 4\n3 4 5 1 2	1	t	4
230	55	7 4\n1 2 4 4 4 5 6	3	f	1
231	55	5 3\n1 2 5 6 7	0	f	2
232	55	5 5\n5 5 5 5 5	5	t	3
233	55	4 2\n1 2 3 4	1	t	4
234	56	4\n64 34 25 12	12 25 34 64\n6	f	1
235	56	3\n1 2 3	1 2 3\n0	f	2
236	56	4\n4 3 2 1	1 2 3 4\n6	t	3
237	56	1\n5	5\n0	t	4
238	57	5\n2 4 1 3 5	1 2 3 4 5\n3	f	1
239	57	3\n1 2 3	1 2 3\n0	f	2
240	57	3\n3 2 1	1 2 3\n3	t	3
241	57	1\n1	1\n0	t	4
242	58	5\n10 7 8 9 1	1 7 8 9 10	f	1
243	58	4\n4 3 2 1	1 2 3 4	f	2
244	58	1\n100	100	t	3
245	58	6\n-3 0 5 -1 2 1	-3 -1 0 1 2 5	t	4
246	59	4\n8 4 2 1	8 4 2 1\n4 8 2 1\n2 4 8 1\n1 2 4 8	f	1
247	59	3\n1 2 3	1 2 3\n1 2 3\n1 2 3	f	2
248	59	2\n5 3	5 3\n3 5	t	3
249	60	6 2\n7 10 4 3 20 15	4	f	1
250	60	5 1\n5 4 3 2 1	1	f	2
251	60	3 3\n2 1 3	3	t	3
252	60	7 4\n1 2 3 4 5 6 7	4	t	4
253	61	7\n1 2 3 2 1 4 5	5	f	1
254	61	4\n5 5 5 5	1	f	2
255	61	3\n1 2 3	3	t	3
256	61	5\n0 -1 0 1 -1	3	t	4
257	62	7\n1 3 1 3 2 3 3	3	f	1
258	62	4\n2 1 2 1	1	f	2
259	62	1\n7	7	t	3
260	62	5\n-1 -2 -1 -2 -1	-1	t	4
261	63	6 9\n1 5 3 6 8 4	1 8\n3 6	f	1
262	63	4 10\n1 2 3 4	NONE	f	2
263	63	4 8\n4 4 3 5	3 5\n4 4	t	3
264	63	3 0\n-1 0 1	-1 1	t	4
265	64	8\n15 -2 2 -8 1 7 10 23	5	f	1
266	64	3\n1 2 3	0	f	2
267	64	4\n1 -1 1 -1	4	t	3
268	64	2\n0 0	2	t	4
269	65	6\neat tea tan ate nat bat	ate eat tea\nbat\nnat tan	f	1
270	65	2\nab ba	ab ba	f	2
271	65	3\na b c	a\nb\nc	t	3
272	65	4\nlisten silent enlist rat	enlist listen silent\nrat	t	4
273	66	1 2 3 4 5	2	f	1
274	66	1	0	f	2
275	66	1 2 -1 3 -1	2	t	3
276	66	1 -1 2 -1 -1 -1 3	2	t	4
277	67	1 2 3 4 5	4 2 5 1 3\n1 2 4 5 3\n4 5 2 3 1	f	1
278	67	1	1\n1\n1	f	2
279	67	4 2 7 1 3 6 9	1 2 3 4 6 7 9\n4 2 1 3 7 6 9\n1 3 2 6 9 7 4	t	3
280	68	1 2 3 4 5	3	f	1
281	68	1	1	f	2
282	68	1 2 3	2	t	3
283	68	1 2 -1 3 -1	1	t	4
284	69	1 2 3 4 5 6 -1	YES	f	1
285	69	1 2 -1 3 -1	NO	f	2
286	69	1	YES	t	3
287	69	1 2 3 4 -1 -1 -1 5	NO	t	4
288	70	3 5 1 6 2 0 8 -1 -1 7 4\n5 1	3	f	1
289	70	3 5 1 6 2 0 8 -1 -1 7 4\n5 4	5	f	2
290	70	1 2 3\n2 3	1	t	3
291	70	1 2 3\n2 2	2	t	4
292	71	5\n5 3 7 1 4	1 3 4 5 7	f	1
293	71	3\n2 1 3	1 2 3	f	2
294	71	4\n4 3 2 1	1 2 3 4	t	3
295	71	1\n10	10	t	4
296	72	5\n5 3 7 1 4\n4	YES	f	1
297	72	3\n5 3 7\n6	NO	f	2
298	72	1\n10\n10	YES	t	3
299	72	4\n8 4 2 6\n5	NO	t	4
300	73	5 3 7 2 4	YES	f	1
301	73	5 4 7 3 6	NO	f	2
302	73	1	YES	t	3
303	73	10 5 15 -1 -1 6 20	NO	t	4
304	74	5 3\n5 3 7 1 4	4	f	1
305	74	3 1\n5 3 7	3	f	2
306	74	4 4\n1 2 3 4	4	t	3
307	74	1 1\n42	42	t	4
308	75	5\n5 3 7 1 4\n3	1 4 5 7	f	1
309	75	3\n5 3 7\n5	3 7	f	2
310	75	4\n4 2 6 8\n8	2 4 6	t	3
311	75	1\n10\n10		t	4
312	76	6 3\n5 3 8 1 2 9	1 2 3	f	1
313	76	3 3\n10 5 15	5 10 15	f	2
314	76	4 1\n4 3 2 1	1	t	3
315	76	5 5\n5 4 3 2 1	1 2 3 4 5	t	4
316	77	7 3\n10 4 3 50 23 90 70	90 70 50	f	1
317	77	5 1\n1 2 3 4 5	5	f	2
318	77	4 4\n4 1 2 3	4 3 2 1	t	3
319	77	3 2\n-5 -3 -1	-1 -3	t	4
320	78	5\n4 10 3 5 1	1 3 4 5 10	f	1
321	78	3\n3 2 1	1 2 3	f	2
322	78	1\n7	7	t	3
323	78	6\n-3 0 -1 2 1 -2	-3 -2 -1 0 1 2	t	4
324	79	3 3\n1 4 7\n2 5 8\n3 6 9	1 2 3 4 5 6 7 8 9	f	1
325	79	2 2\n1 3\n2 4	1 2 3 4	f	2
326	79	1 4\n2 4 6 8	2 4 6 8	t	3
327	79	3 1\n5\n3\n7	3 5 7	t	4
328	80	6\n5 15 1 3 2 8	5 5 5 4 3 4	f	1
329	80	3\n1 2 3	1 1 2	f	2
330	80	1\n7	7	t	3
331	80	4\n4 3 2 1	4 3 3 2	t	4
332	81	4 4\n0 1\n0 2\n1 3\n2 3\n0	0 1 2 3	f	1
333	81	3 2\n0 1\n1 2\n0	0 1 2	f	2
334	81	1 0\n0	0	t	3
335	81	5 4\n0 1\n0 2\n0 3\n0 4\n0	0 1 2 3 4	t	4
336	82	4 4\n0 1\n0 2\n1 3\n2 3\n0	0 1 3 2	f	1
337	82	3 2\n0 1\n1 2\n0	0 1 2	f	2
338	82	1 0\n0	0	t	3
339	82	4 3\n0 1\n0 2\n0 3\n0	0 1 2 3	t	4
340	83	4 4\n0 1\n1 2\n2 3\n3 0	YES	f	1
341	83	4 3\n0 1\n1 2\n2 3	NO	f	2
342	83	1 0	NO	t	3
343	83	3 3\n0 1\n1 2\n0 2	YES	t	4
344	84	5 6\n0 1 4\n0 2 2\n1 3 5\n2 1 1\n2 3 8\n3 4 2	0 3 2 8 10	f	1
345	84	2 1\n0 1 5	0 5	f	2
346	84	3 2\n0 1 1\n1 2 2	0 1 3	t	3
347	84	3 0	0 -1 -1	t	4
348	85	6 6\n5 2\n5 0\n4 0\n4 1\n2 3\n3 1	5 4 2 3 1 0	f	1
349	85	3 2\n0 1\n1 2	0 1 2	f	2
350	85	2 0	0 1	t	3
351	85	4 3\n0 1\n0 2\n1 3	0 1 2 3	t	4
352	86	6\n1 4\n3 5\n0 6\n5 7\n3 9\n5 9	3	f	1
353	86	3\n0 1\n1 2\n2 3	3	f	2
354	86	1\n0 5	1	t	3
355	86	4\n1 10\n2 3\n4 5\n6 7	3	t	4
356	87	3 50\n60 10\n100 20\n120 30	240.00	f	1
357	87	1 10\n100 5	100.00	f	2
358	87	2 10\n10 10\n40 40	10.00	t	3
359	87	3 10\n500 30\n300 20\n200 10	200.00	t	4
360	88	41	4	f	1
361	88	1	1	f	2
362	88	100	1	t	3
363	88	99	9	t	4
364	89	4\n20 2\n15 2\n10 1\n5 3	3 40	f	1
365	89	3\n50 1\n40 1\n30 1	1 50	f	2
366	89	1\n100 5	1 100	t	3
367	89	5\n100 2\n19 1\n27 2\n25 1\n15 3	3 142	t	4
368	90	4 5\n0 1 10\n0 2 6\n0 3 5\n1 3 15\n2 3 4	19	f	1
369	90	2 1\n0 1 7	7	f	2
370	90	3 3\n0 1 1\n1 2 2\n0 2 3	3	t	3
371	90	4 4\n0 1 4\n1 2 3\n2 3 2\n0 3 1	7	t	4
372	91	ABCBDAB\nBDCABA	4	f	1
373	91	AGGTAB\nGXTXAYB	4	f	2
374	91	abc\nabc	3	t	3
375	91	abc\nxyz	0	t	4
376	92	4 8\n1 6 10 16\n1 2 3 5	22	f	1
377	92	3 4\n3 4 5\n2 3 4	7	f	2
378	92	1 5\n10 3	10	t	3
379	92	2 1\n100 200\n2 3	0	t	4
380	93	10	55	f	1
381	93	0	0	f	2
382	93	1000000	209867067	t	3
383	93	50	12586269025	t	4
384	94	8\n10 9 2 5 3 7 101 18	4	f	1
385	94	3\n0 1 0	2	f	2
386	94	1\n5	1	t	3
387	94	5\n5 4 3 2 1	1	t	4
388	95	3 11\n1 5 6	2	f	1
389	95	3 3\n2 3 4	1	f	2
390	95	2 3\n2 4	-1	t	3
391	95	1 1\n1	1	t	4
392	95	3 7\n1 3 4	2	t	5
405	98	asd	asd	t	1
406	98	asd	asd	t	2
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (token_id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
4	26	b498f23a6053ac45163c50e6c6b4acc6305dae2099e8dc5523abcc426a4bbb80	2026-10-20 12:20:09.728	\N	2026-10-20 17:35:09.728686
\.


--
-- Data for Name: prerequisite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prerequisite (prereq_id, topic_id, description, content, order_index) FROM stdin;
1	1	Prerequisites for Data Structures and Algorithms	Basic concepts required before starting Data Structures and Algorithms.	1
\.


--
-- Data for Name: prerequisite_quiz; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prerequisite_quiz (prereq_quiz_id, prereq_id, title, total_marks, passing_criteria, created_at, time_limit) FROM stdin;
1	1	Data Structures and Algorithms — Prerequisite Quiz	12	50	2026-08-19 17:33:13.486146	15
\.


--
-- Data for Name: prerequisite_quiz_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prerequisite_quiz_questions (pq_question_id, prereq_quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) FROM stdin;
1	1	What is the time complexity to access an element in a contiguous array by its index?	O(1)	O(n)	O(log n)	O(n^2)	A	1	1
2	1	Which of the following data structures operates on the Last-In, First-Out (LIFO) principle?	Queue	Stack	Array	Binary Tree	B	1	2
3	1	Which data structure operates on the First-In, First-Out (FIFO) principle?	Stack	Queue	Priority Queue	Graph	B	1	3
4	1	Which asymptotic notation represents the strict upper bound of algorithm execution time?	Big-Omega (Ω)	Big-Theta (Θ)	Big-O (O)	Little-o (o)	C	1	4
5	1	What happens when a recursive function lacks a valid base case?	It terminates in O(1) time	It causes stack overflow runtime error	It returns 0 automatically	It compiles with a warning	B	1	5
6	1	In C/C++, which operator is used to obtain the physical memory address of a variable?	*	&	->	.	B	1	6
7	1	What is the space complexity of allocating an array of size N in memory?	O(1)	O(log N)	O(N)	O(N^2)	C	1	7
8	1	Which condition is mandatory for applying Binary Search directly on an array?	The array must be dynamically linked	The array must be sorted	The array must contain only positive numbers	The array size must be a power of 2	B	1	8
9	1	What is the primary difference between an Abstract Data Type (ADT) and a concrete Data Structure?	ADT defines operations without implementation, while Data Structure is the concrete implementation	Data Structure defines operations, ADT is hardware-specific	There is no difference	ADT is only used for databases	A	2	9
10	1	Which complexity class indicates the slowest growth rate as input size N increases towards infinity?	O(N!)	O(N^2)	O(N log N)	O(1)	D	2	10
\.


--
-- Data for Name: progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.progress (progress_id, student_id, topic_id, status, time_spent, last_accessed) FROM stdin;
25	10	1	In Progress	145	2026-10-20 17:27:13.310555
149	12	1	In Progress	7	2026-10-20 18:22:21.819577
\.


--
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_attempts (attempt_id, student_id, quiz_type, quiz_ref_id, started_at, submitted_at, score, total_marks, percentage, correct_answers, incorrect_answers, unanswered, passed, answers) FROM stdin;
8	10	subtopic	1	2026-08-20 14:31:02.129723	2026-08-20 14:31:04.14775	0	12	0.00	0	0	10	f	[{"marks": 1, "options": {"A": "Array", "B": "Linked List", "C": "Tree", "D": "Stack"}, "isCorrect": false, "questionId": 1, "questionText": "Which of the following is categorized as a non-linear data structure?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Dynamic data structure", "B": "Static data structure", "C": "Homogeneous data structure", "D": "Non-linear data structure"}, "isCorrect": false, "questionId": 2, "questionText": "A data structure whose size is allocated at compile-time and cannot change is called:", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Definiteness", "B": "Finiteness", "C": "Effectiveness", "D": "Generality"}, "isCorrect": false, "questionId": 3, "questionText": "Which essential property of an algorithm requires it to terminate after a finite number of steps?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Sorting", "B": "Merging", "C": "Traversal", "D": "Insertion"}, "isCorrect": false, "questionId": 4, "questionText": "Accessing every element in a data structure exactly once is known as:", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Integer in RAM", "B": "Stack ADT", "C": "CPU Register", "D": "Hard Disk Sector"}, "isCorrect": false, "questionId": 5, "questionText": "Which of the following is an example of an Abstract Data Type (ADT)?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Searching", "B": "Merging", "C": "Partitioning", "D": "Filtering"}, "isCorrect": false, "questionId": 6, "questionText": "Combining elements of two sorted data structures into a single structure is called:", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Call Stack", "B": "Heap", "C": "CPU Cache", "D": "ROM"}, "isCorrect": false, "questionId": 7, "questionText": "In memory allocation, dynamic data structures are primarily allocated in which memory segment?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Graph", "B": "Array", "C": "Tree", "D": "Hash Map with arbitrary types"}, "isCorrect": false, "questionId": 8, "questionText": "Which of the following represents homogeneous elements arranged sequentially?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "They are always identical", "B": "There is often a trade-off between execution speed and memory usage", "C": "Hardware only supports one or the other", "D": "To avoid compiler syntax errors"}, "isCorrect": false, "questionId": 9, "questionText": "Why are space and time complexity evaluated together when selecting a data structure?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "To measure execution speed in nanoseconds on a specific laptop", "B": "To determine mathematical growth of resource requirements as input size scales", "C": "To format source code indentation", "D": "To convert code to machine language"}, "isCorrect": false, "questionId": 10, "questionText": "What is the primary objective of algorithm asymptotic analysis?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}]
9	10	prerequisite	1	2026-08-20 14:52:01.432353	2026-08-20 14:52:01.444131	6	12	50.00	5	5	0	t	[{"marks": 1, "options": {"A": "O(1)", "B": "O(n)", "C": "O(log n)", "D": "O(n^2)"}, "isCorrect": true, "questionId": 1, "questionText": "What is the time complexity to access an element in a contiguous array by its index?", "correctOption": "A", "marksObtained": 1, "selectedOption": "A"}, {"marks": 1, "options": {"A": "Queue", "B": "Stack", "C": "Array", "D": "Binary Tree"}, "isCorrect": true, "questionId": 2, "questionText": "Which of the following data structures operates on the Last-In, First-Out (LIFO) principle?", "correctOption": "B", "marksObtained": 1, "selectedOption": "B"}, {"marks": 1, "options": {"A": "Stack", "B": "Queue", "C": "Priority Queue", "D": "Graph"}, "isCorrect": false, "questionId": 3, "questionText": "Which data structure operates on the First-In, First-Out (FIFO) principle?", "correctOption": "B", "marksObtained": 0, "selectedOption": "A"}, {"marks": 1, "options": {"A": "Big-Omega (Ω)", "B": "Big-Theta (Θ)", "C": "Big-O (O)", "D": "Little-o (o)"}, "isCorrect": false, "questionId": 4, "questionText": "Which asymptotic notation represents the strict upper bound of algorithm execution time?", "correctOption": "C", "marksObtained": 0, "selectedOption": "B"}, {"marks": 1, "options": {"A": "It terminates in O(1) time", "B": "It causes stack overflow runtime error", "C": "It returns 0 automatically", "D": "It compiles with a warning"}, "isCorrect": false, "questionId": 5, "questionText": "What happens when a recursive function lacks a valid base case?", "correctOption": "B", "marksObtained": 0, "selectedOption": "A"}, {"marks": 1, "options": {"A": "*", "B": "&", "C": "->", "D": "."}, "isCorrect": true, "questionId": 6, "questionText": "In C/C++, which operator is used to obtain the physical memory address of a variable?", "correctOption": "B", "marksObtained": 1, "selectedOption": "B"}, {"marks": 1, "options": {"A": "O(1)", "B": "O(log N)", "C": "O(N)", "D": "O(N^2)"}, "isCorrect": false, "questionId": 7, "questionText": "What is the space complexity of allocating an array of size N in memory?", "correctOption": "C", "marksObtained": 0, "selectedOption": "A"}, {"marks": 1, "options": {"A": "The array must be dynamically linked", "B": "The array must be sorted", "C": "The array must contain only positive numbers", "D": "The array size must be a power of 2"}, "isCorrect": true, "questionId": 8, "questionText": "Which condition is mandatory for applying Binary Search directly on an array?", "correctOption": "B", "marksObtained": 1, "selectedOption": "B"}, {"marks": 2, "options": {"A": "ADT defines operations without implementation, while Data Structure is the concrete implementation", "B": "Data Structure defines operations, ADT is hardware-specific", "C": "There is no difference", "D": "ADT is only used for databases"}, "isCorrect": true, "questionId": 9, "questionText": "What is the primary difference between an Abstract Data Type (ADT) and a concrete Data Structure?", "correctOption": "A", "marksObtained": 2, "selectedOption": "A"}, {"marks": 2, "options": {"A": "O(N!)", "B": "O(N^2)", "C": "O(N log N)", "D": "O(1)"}, "isCorrect": false, "questionId": 10, "questionText": "Which complexity class indicates the slowest growth rate as input size N increases towards infinity?", "correctOption": "D", "marksObtained": 0, "selectedOption": "B"}]
10	10	final	1	2026-08-20 15:06:04.394583	2026-08-20 15:06:06.431689	0	12	0.00	0	0	10	f	[{"marks": 1, "options": {"A": "O(n log n)", "B": "O(n)", "C": "O(n^2)", "D": "O(log n)"}, "isCorrect": false, "questionId": 1, "questionText": "What is the worst-case time complexity of Quick Sort with standard Lomuto partition?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Pre-order", "B": "In-order", "C": "Post-order", "D": "Level-order"}, "isCorrect": false, "questionId": 2, "questionText": "Which traversal of a Binary Search Tree (BST) visits keys in strictly ascending sorted order?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Stack", "B": "Queue", "C": "Min-Heap", "D": "Disjoint Set"}, "isCorrect": false, "questionId": 3, "questionText": "Which data structure is utilized in Breadth-First Search (BFS) graph traversal?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "O(1)", "B": "O(log N)", "C": "O(N)", "D": "O(N log N)"}, "isCorrect": false, "questionId": 4, "questionText": "What is the time complexity of searching in a balanced AVL or Red-Black Tree with N nodes?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Stack", "B": "Priority Queue (Min-Heap)", "C": "Circular Queue", "D": "Hash Set"}, "isCorrect": false, "questionId": 5, "questionText": "In Dijkstra algorithm for single-source shortest paths, which data structure optimizes selecting the minimum distance vertex?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "T(n) = T(n-1) + O(1)", "B": "T(n) = 2T(n/2) + O(n)", "C": "T(n) = T(n/2) + O(1)", "D": "T(n) = 2T(n-1) + O(1)"}, "isCorrect": false, "questionId": 6, "questionText": "What is the recurrence relation for Merge Sort dividing input arrays in half at each step?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Linear Probing", "B": "Quadratic Probing", "C": "Separate Chaining", "D": "Double Hashing"}, "isCorrect": false, "questionId": 7, "questionText": "Which collision resolution technique stores colliding elements in linked lists outside the hash table array?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "2^h", "B": "2^(h+1) - 1", "C": "2*h", "D": "h^2"}, "isCorrect": false, "questionId": 8, "questionText": "What is the maximum number of nodes in a Binary Tree of height h (where root height = 0)?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "Greedy Approach", "B": "Divide and Conquer", "C": "Dynamic Programming", "D": "Brute Force Search"}, "isCorrect": false, "questionId": 9, "questionText": "Which algorithmic paradigm solves the 0/1 Knapsack problem optimally in pseudo-polynomial time?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "O(1)", "B": "O(log n)", "C": "O(n)", "D": "O(n^2)"}, "isCorrect": false, "questionId": 10, "questionText": "What is the auxiliary space complexity of standard Merge Sort on an array of size n?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}]
11	10	final	1	2026-08-20 15:06:15.474582	2026-08-20 15:06:30.425991	1	12	8.33	1	0	9	f	[{"marks": 1, "options": {"A": "O(n log n)", "B": "O(n)", "C": "O(n^2)", "D": "O(log n)"}, "isCorrect": true, "questionId": 1, "questionText": "What is the worst-case time complexity of Quick Sort with standard Lomuto partition?", "correctOption": "C", "marksObtained": 1, "selectedOption": "C"}, {"marks": 1, "options": {"A": "Pre-order", "B": "In-order", "C": "Post-order", "D": "Level-order"}, "isCorrect": false, "questionId": 2, "questionText": "Which traversal of a Binary Search Tree (BST) visits keys in strictly ascending sorted order?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Stack", "B": "Queue", "C": "Min-Heap", "D": "Disjoint Set"}, "isCorrect": false, "questionId": 3, "questionText": "Which data structure is utilized in Breadth-First Search (BFS) graph traversal?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "O(1)", "B": "O(log N)", "C": "O(N)", "D": "O(N log N)"}, "isCorrect": false, "questionId": 4, "questionText": "What is the time complexity of searching in a balanced AVL or Red-Black Tree with N nodes?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Stack", "B": "Priority Queue (Min-Heap)", "C": "Circular Queue", "D": "Hash Set"}, "isCorrect": false, "questionId": 5, "questionText": "In Dijkstra algorithm for single-source shortest paths, which data structure optimizes selecting the minimum distance vertex?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "T(n) = T(n-1) + O(1)", "B": "T(n) = 2T(n/2) + O(n)", "C": "T(n) = T(n/2) + O(1)", "D": "T(n) = 2T(n-1) + O(1)"}, "isCorrect": false, "questionId": 6, "questionText": "What is the recurrence relation for Merge Sort dividing input arrays in half at each step?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Linear Probing", "B": "Quadratic Probing", "C": "Separate Chaining", "D": "Double Hashing"}, "isCorrect": false, "questionId": 7, "questionText": "Which collision resolution technique stores colliding elements in linked lists outside the hash table array?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "2^h", "B": "2^(h+1) - 1", "C": "2*h", "D": "h^2"}, "isCorrect": false, "questionId": 8, "questionText": "What is the maximum number of nodes in a Binary Tree of height h (where root height = 0)?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "Greedy Approach", "B": "Divide and Conquer", "C": "Dynamic Programming", "D": "Brute Force Search"}, "isCorrect": false, "questionId": 9, "questionText": "Which algorithmic paradigm solves the 0/1 Knapsack problem optimally in pseudo-polynomial time?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "O(1)", "B": "O(log n)", "C": "O(n)", "D": "O(n^2)"}, "isCorrect": false, "questionId": 10, "questionText": "What is the auxiliary space complexity of standard Merge Sort on an array of size n?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}]
12	10	final	1	2026-08-20 15:06:38.505663	2026-08-20 15:06:42.297673	0	12	0.00	0	1	9	f	[{"marks": 1, "options": {"A": "O(n log n)", "B": "O(n)", "C": "O(n^2)", "D": "O(log n)"}, "isCorrect": false, "questionId": 1, "questionText": "What is the worst-case time complexity of Quick Sort with standard Lomuto partition?", "correctOption": "C", "marksObtained": 0, "selectedOption": "B"}, {"marks": 1, "options": {"A": "Pre-order", "B": "In-order", "C": "Post-order", "D": "Level-order"}, "isCorrect": false, "questionId": 2, "questionText": "Which traversal of a Binary Search Tree (BST) visits keys in strictly ascending sorted order?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Stack", "B": "Queue", "C": "Min-Heap", "D": "Disjoint Set"}, "isCorrect": false, "questionId": 3, "questionText": "Which data structure is utilized in Breadth-First Search (BFS) graph traversal?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "O(1)", "B": "O(log N)", "C": "O(N)", "D": "O(N log N)"}, "isCorrect": false, "questionId": 4, "questionText": "What is the time complexity of searching in a balanced AVL or Red-Black Tree with N nodes?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Stack", "B": "Priority Queue (Min-Heap)", "C": "Circular Queue", "D": "Hash Set"}, "isCorrect": false, "questionId": 5, "questionText": "In Dijkstra algorithm for single-source shortest paths, which data structure optimizes selecting the minimum distance vertex?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "T(n) = T(n-1) + O(1)", "B": "T(n) = 2T(n/2) + O(n)", "C": "T(n) = T(n/2) + O(1)", "D": "T(n) = 2T(n-1) + O(1)"}, "isCorrect": false, "questionId": 6, "questionText": "What is the recurrence relation for Merge Sort dividing input arrays in half at each step?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Linear Probing", "B": "Quadratic Probing", "C": "Separate Chaining", "D": "Double Hashing"}, "isCorrect": false, "questionId": 7, "questionText": "Which collision resolution technique stores colliding elements in linked lists outside the hash table array?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "2^h", "B": "2^(h+1) - 1", "C": "2*h", "D": "h^2"}, "isCorrect": false, "questionId": 8, "questionText": "What is the maximum number of nodes in a Binary Tree of height h (where root height = 0)?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "Greedy Approach", "B": "Divide and Conquer", "C": "Dynamic Programming", "D": "Brute Force Search"}, "isCorrect": false, "questionId": 9, "questionText": "Which algorithmic paradigm solves the 0/1 Knapsack problem optimally in pseudo-polynomial time?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "O(1)", "B": "O(log n)", "C": "O(n)", "D": "O(n^2)"}, "isCorrect": false, "questionId": 10, "questionText": "What is the auxiliary space complexity of standard Merge Sort on an array of size n?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}]
13	10	final	1	2026-08-21 14:04:16.7568	2026-08-21 14:04:25.958287	0	12	0.00	0	1	9	f	[{"marks": 1, "options": {"A": "O(n log n)", "B": "O(n)", "C": "O(n^2)", "D": "O(log n)"}, "isCorrect": false, "questionId": 1, "questionText": "What is the worst-case time complexity of Quick Sort with standard Lomuto partition?", "correctOption": "C", "marksObtained": 0, "selectedOption": "D"}, {"marks": 1, "options": {"A": "Pre-order", "B": "In-order", "C": "Post-order", "D": "Level-order"}, "isCorrect": false, "questionId": 2, "questionText": "Which traversal of a Binary Search Tree (BST) visits keys in strictly ascending sorted order?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Stack", "B": "Queue", "C": "Min-Heap", "D": "Disjoint Set"}, "isCorrect": false, "questionId": 3, "questionText": "Which data structure is utilized in Breadth-First Search (BFS) graph traversal?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "O(1)", "B": "O(log N)", "C": "O(N)", "D": "O(N log N)"}, "isCorrect": false, "questionId": 4, "questionText": "What is the time complexity of searching in a balanced AVL or Red-Black Tree with N nodes?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Stack", "B": "Priority Queue (Min-Heap)", "C": "Circular Queue", "D": "Hash Set"}, "isCorrect": false, "questionId": 5, "questionText": "In Dijkstra algorithm for single-source shortest paths, which data structure optimizes selecting the minimum distance vertex?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "T(n) = T(n-1) + O(1)", "B": "T(n) = 2T(n/2) + O(n)", "C": "T(n) = T(n/2) + O(1)", "D": "T(n) = 2T(n-1) + O(1)"}, "isCorrect": false, "questionId": 6, "questionText": "What is the recurrence relation for Merge Sort dividing input arrays in half at each step?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Linear Probing", "B": "Quadratic Probing", "C": "Separate Chaining", "D": "Double Hashing"}, "isCorrect": false, "questionId": 7, "questionText": "Which collision resolution technique stores colliding elements in linked lists outside the hash table array?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "2^h", "B": "2^(h+1) - 1", "C": "2*h", "D": "h^2"}, "isCorrect": false, "questionId": 8, "questionText": "What is the maximum number of nodes in a Binary Tree of height h (where root height = 0)?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "Greedy Approach", "B": "Divide and Conquer", "C": "Dynamic Programming", "D": "Brute Force Search"}, "isCorrect": false, "questionId": 9, "questionText": "Which algorithmic paradigm solves the 0/1 Knapsack problem optimally in pseudo-polynomial time?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "O(1)", "B": "O(log n)", "C": "O(n)", "D": "O(n^2)"}, "isCorrect": false, "questionId": 10, "questionText": "What is the auxiliary space complexity of standard Merge Sort on an array of size n?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}]
14	10	prerequisite	1	2026-08-21 14:22:23.392423	2026-08-21 14:22:29.627178	0	12	0.00	0	2	8	f	[{"marks": 1, "options": {"A": "O(1)", "B": "O(n)", "C": "O(log n)", "D": "O(n^2)"}, "isCorrect": false, "questionId": 1, "questionText": "What is the time complexity to access an element in a contiguous array by its index?", "correctOption": "A", "marksObtained": 0, "selectedOption": "B"}, {"marks": 1, "options": {"A": "Queue", "B": "Stack", "C": "Array", "D": "Binary Tree"}, "isCorrect": false, "questionId": 2, "questionText": "Which of the following data structures operates on the Last-In, First-Out (LIFO) principle?", "correctOption": "B", "marksObtained": 0, "selectedOption": "C"}, {"marks": 1, "options": {"A": "Stack", "B": "Queue", "C": "Priority Queue", "D": "Graph"}, "isCorrect": false, "questionId": 3, "questionText": "Which data structure operates on the First-In, First-Out (FIFO) principle?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Big-Omega (Ω)", "B": "Big-Theta (Θ)", "C": "Big-O (O)", "D": "Little-o (o)"}, "isCorrect": false, "questionId": 4, "questionText": "Which asymptotic notation represents the strict upper bound of algorithm execution time?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "It terminates in O(1) time", "B": "It causes stack overflow runtime error", "C": "It returns 0 automatically", "D": "It compiles with a warning"}, "isCorrect": false, "questionId": 5, "questionText": "What happens when a recursive function lacks a valid base case?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "*", "B": "&", "C": "->", "D": "."}, "isCorrect": false, "questionId": 6, "questionText": "In C/C++, which operator is used to obtain the physical memory address of a variable?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "O(1)", "B": "O(log N)", "C": "O(N)", "D": "O(N^2)"}, "isCorrect": false, "questionId": 7, "questionText": "What is the space complexity of allocating an array of size N in memory?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "The array must be dynamically linked", "B": "The array must be sorted", "C": "The array must contain only positive numbers", "D": "The array size must be a power of 2"}, "isCorrect": false, "questionId": 8, "questionText": "Which condition is mandatory for applying Binary Search directly on an array?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "ADT defines operations without implementation, while Data Structure is the concrete implementation", "B": "Data Structure defines operations, ADT is hardware-specific", "C": "There is no difference", "D": "ADT is only used for databases"}, "isCorrect": false, "questionId": 9, "questionText": "What is the primary difference between an Abstract Data Type (ADT) and a concrete Data Structure?", "correctOption": "A", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "O(N!)", "B": "O(N^2)", "C": "O(N log N)", "D": "O(1)"}, "isCorrect": false, "questionId": 10, "questionText": "Which complexity class indicates the slowest growth rate as input size N increases towards infinity?", "correctOption": "D", "marksObtained": 0, "selectedOption": null}]
15	10	subtopic	5	2026-10-09 14:05:10.037466	2026-10-09 14:05:14.577869	0	12	0.00	0	1	9	f	[{"marks": 1, "options": {"A": "Data and two pointers", "B": "Data and a single pointer to the next node", "C": "Two data values and no pointer", "D": "An array index and a pointer"}, "isCorrect": false, "questionId": 41, "questionText": "What does each node in a singly linked list contain?", "correctOption": "B", "marksObtained": 0, "selectedOption": "D"}, {"marks": 1, "options": {"A": "O(n)", "B": "O(1)", "C": "O(log n)", "D": "O(n^2)"}, "isCorrect": false, "questionId": 42, "questionText": "What is the time complexity to insert a new node at the head of a singly linked list?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "O(1)", "B": "O(log n)", "C": "O(k) / O(n)", "D": "O(n^2)"}, "isCorrect": false, "questionId": 43, "questionText": "What is the time complexity to access the k-th element in a singly linked list of size n?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Dijkstra Algorithm", "B": "Floyd Cycle Finding Algorithm (Tortoise and Hare)", "C": "Kadane Algorithm", "D": "Kruskal Algorithm"}, "isCorrect": false, "questionId": 44, "questionText": "Which algorithm detects a cycle in a linked list using slow and fast pointers in O(n) time and O(1) space?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "NULL", "B": "Head node", "C": "Previous node", "D": "A random node"}, "isCorrect": false, "questionId": 45, "questionText": "In a circular singly linked list, what does the next pointer of the last node point to?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Singly linked lists store only one pointer per node instead of two", "B": "Singly linked lists do not store data", "C": "Singly linked lists reside in CPU cache only", "D": "There is no difference in memory"}, "isCorrect": false, "questionId": 46, "questionText": "What is the memory advantage of singly linked lists over doubly linked lists?", "correctOption": "A", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "O(n)", "B": "O(log n)", "C": "O(1)", "D": "O(n^2)"}, "isCorrect": false, "questionId": 47, "questionText": "To delete a node given only a pointer to that node in a doubly linked list, the time complexity is:", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "head->next == nullptr", "B": "head == nullptr", "C": "tail == head", "D": "head->data == 0"}, "isCorrect": false, "questionId": 48, "questionText": "What condition indicates an empty singly linked list?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "Segmentation fault immediately", "B": "Memory leak", "C": "Automatic garbage collection in C++", "D": "Data corruption in hard drive"}, "isCorrect": false, "questionId": 49, "questionText": "What happens if you delete a node in C++ without calling delete/free on its heap memory pointer?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "Singly Linked List", "B": "Doubly Linked List", "C": "Static Array", "D": "Circular Queue"}, "isCorrect": false, "questionId": 50, "questionText": "Which data structure implementation is ideal for supporting Undo/Redo operations with previous and next navigation?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}]
16	10	prerequisite	1	2026-10-15 13:35:27.006941	2026-10-15 13:35:44.18169	0	12	0.00	0	5	5	f	[{"marks": 1, "options": {"A": "O(1)", "B": "O(n)", "C": "O(log n)", "D": "O(n^2)"}, "isCorrect": false, "questionId": 1, "questionText": "What is the time complexity to access an element in a contiguous array by its index?", "correctOption": "A", "marksObtained": 0, "selectedOption": "D"}, {"marks": 1, "options": {"A": "Queue", "B": "Stack", "C": "Array", "D": "Binary Tree"}, "isCorrect": false, "questionId": 2, "questionText": "Which of the following data structures operates on the Last-In, First-Out (LIFO) principle?", "correctOption": "B", "marksObtained": 0, "selectedOption": "D"}, {"marks": 1, "options": {"A": "Stack", "B": "Queue", "C": "Priority Queue", "D": "Graph"}, "isCorrect": false, "questionId": 3, "questionText": "Which data structure operates on the First-In, First-Out (FIFO) principle?", "correctOption": "B", "marksObtained": 0, "selectedOption": "D"}, {"marks": 1, "options": {"A": "Big-Omega (Ω)", "B": "Big-Theta (Θ)", "C": "Big-O (O)", "D": "Little-o (o)"}, "isCorrect": false, "questionId": 4, "questionText": "Which asymptotic notation represents the strict upper bound of algorithm execution time?", "correctOption": "C", "marksObtained": 0, "selectedOption": "B"}, {"marks": 1, "options": {"A": "It terminates in O(1) time", "B": "It causes stack overflow runtime error", "C": "It returns 0 automatically", "D": "It compiles with a warning"}, "isCorrect": false, "questionId": 5, "questionText": "What happens when a recursive function lacks a valid base case?", "correctOption": "B", "marksObtained": 0, "selectedOption": "D"}, {"marks": 1, "options": {"A": "*", "B": "&", "C": "->", "D": "."}, "isCorrect": false, "questionId": 6, "questionText": "In C/C++, which operator is used to obtain the physical memory address of a variable?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "O(1)", "B": "O(log N)", "C": "O(N)", "D": "O(N^2)"}, "isCorrect": false, "questionId": 7, "questionText": "What is the space complexity of allocating an array of size N in memory?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "The array must be dynamically linked", "B": "The array must be sorted", "C": "The array must contain only positive numbers", "D": "The array size must be a power of 2"}, "isCorrect": false, "questionId": 8, "questionText": "Which condition is mandatory for applying Binary Search directly on an array?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "ADT defines operations without implementation, while Data Structure is the concrete implementation", "B": "Data Structure defines operations, ADT is hardware-specific", "C": "There is no difference", "D": "ADT is only used for databases"}, "isCorrect": false, "questionId": 9, "questionText": "What is the primary difference between an Abstract Data Type (ADT) and a concrete Data Structure?", "correctOption": "A", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "O(N!)", "B": "O(N^2)", "C": "O(N log N)", "D": "O(1)"}, "isCorrect": false, "questionId": 10, "questionText": "Which complexity class indicates the slowest growth rate as input size N increases towards infinity?", "correctOption": "D", "marksObtained": 0, "selectedOption": null}]
17	10	prerequisite	1	2026-10-15 14:28:38.395638	2026-10-15 14:28:44.361287	0	12	0.00	0	1	9	f	[{"marks": 1, "options": {"A": "O(1)", "B": "O(n)", "C": "O(log n)", "D": "O(n^2)"}, "isCorrect": false, "questionId": 1, "questionText": "What is the time complexity to access an element in a contiguous array by its index?", "correctOption": "A", "marksObtained": 0, "selectedOption": "C"}, {"marks": 1, "options": {"A": "Queue", "B": "Stack", "C": "Array", "D": "Binary Tree"}, "isCorrect": false, "questionId": 2, "questionText": "Which of the following data structures operates on the Last-In, First-Out (LIFO) principle?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Stack", "B": "Queue", "C": "Priority Queue", "D": "Graph"}, "isCorrect": false, "questionId": 3, "questionText": "Which data structure operates on the First-In, First-Out (FIFO) principle?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "Big-Omega (Ω)", "B": "Big-Theta (Θ)", "C": "Big-O (O)", "D": "Little-o (o)"}, "isCorrect": false, "questionId": 4, "questionText": "Which asymptotic notation represents the strict upper bound of algorithm execution time?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "It terminates in O(1) time", "B": "It causes stack overflow runtime error", "C": "It returns 0 automatically", "D": "It compiles with a warning"}, "isCorrect": false, "questionId": 5, "questionText": "What happens when a recursive function lacks a valid base case?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "*", "B": "&", "C": "->", "D": "."}, "isCorrect": false, "questionId": 6, "questionText": "In C/C++, which operator is used to obtain the physical memory address of a variable?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "O(1)", "B": "O(log N)", "C": "O(N)", "D": "O(N^2)"}, "isCorrect": false, "questionId": 7, "questionText": "What is the space complexity of allocating an array of size N in memory?", "correctOption": "C", "marksObtained": 0, "selectedOption": null}, {"marks": 1, "options": {"A": "The array must be dynamically linked", "B": "The array must be sorted", "C": "The array must contain only positive numbers", "D": "The array size must be a power of 2"}, "isCorrect": false, "questionId": 8, "questionText": "Which condition is mandatory for applying Binary Search directly on an array?", "correctOption": "B", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "ADT defines operations without implementation, while Data Structure is the concrete implementation", "B": "Data Structure defines operations, ADT is hardware-specific", "C": "There is no difference", "D": "ADT is only used for databases"}, "isCorrect": false, "questionId": 9, "questionText": "What is the primary difference between an Abstract Data Type (ADT) and a concrete Data Structure?", "correctOption": "A", "marksObtained": 0, "selectedOption": null}, {"marks": 2, "options": {"A": "O(N!)", "B": "O(N^2)", "C": "O(N log N)", "D": "O(1)"}, "isCorrect": false, "questionId": 10, "questionText": "Which complexity class indicates the slowest growth rate as input size N increases towards infinity?", "correctOption": "D", "marksObtained": 0, "selectedOption": null}]
\.


--
-- Data for Name: room_topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room_topics (room_topic_id, room_id, topic_id, order_index) FROM stdin;
1	2	1	\N
4	6	1	\N
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rooms (room_id, faculty_id, room_name, room_code, description, created_at) FROM stdin;
2	2	DSA	A71E73	asdasdasd	2026-08-13 13:36:35.827258
6	2	DSA	02C966	DSA topics	2026-08-21 14:21:23.110154
7	7	General Lab Room	5D3C4F	Default room for existing lab assessments	2026-10-20 15:32:11.631317
12	14	Room for LA Isolation Test	BF9189	\N	2026-10-20 17:35:09.738665
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
7-Uu3b-2eIhllG_-bk0Qp8I2eJRLeL2H	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:01:15.087Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":15}}	2026-10-21 17:31:16
n1VEHN_iu3oHDM0tIQCxPdxiYIsMbM_m	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:01:15.309Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":16}}	2026-10-21 17:31:16
L4kDeHmlJGiO1_7WvuHD50IZER35h1d1	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:01:14.600Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2026-10-21 17:31:16
qoA4B8AZgr2ThuBKpu7fvvsjkBJXlGcJ	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:04:52.267Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":23}}	2026-10-21 17:34:54
txx4-wwLs1AtCdLnlMEGnCIhSLwKLaPR	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:01:15.886Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":17}}	2026-10-21 17:31:16
iY1t3oLAm3U6b6vPP-NHoSf12VEhASVr	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:03:11.605Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2026-10-21 17:33:14
O5rkisQCbEzhA3JJBgr63CLvxuPInPPT	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:03:13.824Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":21}}	2026-10-21 17:33:14
ONIdeQyoKr5TZ84qRqoASXKmAvl73h9D	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T08:29:34.502Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":4}}	2026-10-21 17:27:14
aHu4h2qixbSFGIjc1mJJm8VeT2kbs6sF	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:03:12.053Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":18}}	2026-10-21 17:33:14
_gxh3xsQUpm6Hh6SYOSzMYyZtqRuwvLF	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:03:12.262Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":19}}	2026-10-21 17:33:14
m8HT2oFo-NcJ36cqyn5_XLtI-GnJaTNA	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:05:11.370Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":29}}	2026-10-21 17:35:12
b-xK9wGClxuP9r2r8fDcbGVDFMFUHGE8	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:04:52.778Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":24}}	2026-10-21 17:34:53
j0k3V9RD0Bzq9j6mnI-OLwZ85UYxG5n-	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:03:12.907Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":20}}	2026-10-21 17:33:13
irVL_0_PFNcKgZJOpgIRjCFC9JGK7uF8	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:05:09.484Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":26}}	2026-10-21 17:35:12
4nCWNO6zta_mVy-8WUYj_4dYYu40W84E	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:04:51.598Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2026-10-21 17:34:54
p9CEDkO7oZ7_UK9lo24QbqdzCvJLcYmG	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:04:53.610Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":25}}	2026-10-21 17:34:54
2g__vfBu2Q35Q5GyyE9vzoDPRPBpfgHz	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:04:52.057Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":22}}	2026-10-21 17:34:54
dXznrQa0KSEq1huWsJmn2QQQBNaMM203	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:05:09.720Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":27}}	2026-10-21 17:35:12
RdSehmUmTSBp6ntmB3XOJfkzT7UW1_P3	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:05:10.453Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":28}}	2026-10-21 17:35:11
4lQPnDgSJybi_1D9C_Lp8gYU0qwe4F6W	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T12:05:08.999Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2026-10-21 17:35:11
7_WIrEzuRvm1Yf7w-Wm8v2VSW8TM_cBY	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-20T15:15:12.012Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":5}}	2026-10-21 18:21:41
57r1Nfc6BSTCCyj1sc1ik3N6JuSFCf6b	{"cookie":{"originalMaxAge":86400000,"expires":"2026-10-21T09:40:47.689Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":11}}	2026-10-21 18:22:22
\.


--
-- Data for Name: student; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student (student_id, user_id, roll_number, course, year, phone) FROM stdin;
1	2	245100151	B.Tech Computer Science and Engineering	3	1234567891
2	3	245100153	abcd	2	9876543219
5	6	2026CS201	admin	4	9876543219
7	7	245100154	Computer Science	3	8850198167
9	10	TEMP_1787214568869	\N	\N	\N
10	4	TEMP_1787214876717	\N	\N	\N
11	9	TEMP_1787302714935	\N	\N	\N
12	11	asdasd	CSE	3	9876542135
13	12	STU2_TEST	\N	\N	\N
14	13	OUTSIDER_TEST	\N	\N	\N
21	26	2023BTECS00199	B.Tech CSE	3	\N
22	29	2023BTECS00999	B.Tech CSE	3	\N
\.


--
-- Data for Name: student_rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_rooms (student_room_id, student_id, room_id, joined_at) FROM stdin;
10	10	6	2026-10-20 16:18:20.354437
11	12	6	2026-10-20 16:19:11.26112
14	21	12	2026-10-20 17:35:11.396413
\.


--
-- Data for Name: subtopic_coding_assessment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subtopic_coding_assessment (scca_id, content_id, problem_statement, constraints, sample_input, sample_output, marks, order_index, title) FROM stdin;
1	3	Given an array of N integers, compute and print the sum of all elements.\n\nInput Format:\n- Line 1: Integer N\n- Line 2: N space-separated integers\n\nOutput Format:\n- Single integer representing the total sum.	1 <= N <= 10^5\n-10^6 <= A[i] <= 10^6	5\n1 2 3 4 5	15	10	1	Sum of Array Elements
2	3	Given an array of N integers, print the elements in reverse order separated by space.\n\nInput Format:\n- Line 1: Integer N\n- Line 2: N space-separated integers\n\nOutput Format:\n- Space-separated reversed integers.	1 <= N <= 10^5	4\n10 20 30 40	40 30 20 10	10	2	Reverse Array
3	4	Given a lowercase English string S, count and print the total number of vowels (a, e, i, o, u).\n\nInput Format:\n- A single word string S.\n\nOutput Format:\n- Number of vowels in S.	1 <= |S| <= 10^5	education	5	10	1	Count Vowels in String
4	6	Given a postfix expression consisting of single-digit integers and operators (+, -, *), evaluate and print the result using a Stack.\n\nInput Format:\n- Space-separated tokens forming the postfix expression on one line.\n\nOutput Format:\n- Single evaluated integer.	Expression is always mathematically valid and does not divide by zero.	2 3 1 * + 9 -	-4	10	1	Postfix Expression Evaluation
5	9	Given an array of N integers and a key K, find the first 0-based index of K using Linear Search. Print -1 if key is not present.\n\nInput Format:\n- Line 1: Integer N\n- Line 2: N space-separated integers\n- Line 3: Integer K\n\nOutput Format:\n- 0-based index or -1.	1 <= N <= 10^5	5\n10 50 30 70 80\n30	2	10	1	Linear Search
6	10	Given an unsorted array of N integers, sort the array in ascending order and print the elements separated by a space.\n\nInput Format:\n- Line 1: Integer N\n- Line 2: N space-separated integers\n\nOutput Format:\n- Sorted elements separated by a space.	1 <= N <= 10^5	5\n64 25 12 22 11	11 12 22 25 64	10	1	Sort Array in Ascending Order
7	17	Given an integer N, compute and print the Nth Fibonacci number (where F(0) = 0, F(1) = 1, F(N) = F(N-1) + F(N-2)).\n\nInput Format:\n- Single integer N.\n\nOutput Format:\n- The Nth Fibonacci number.	0 <= N <= 40	6	8	10	1	Nth Fibonacci Number
\.


--
-- Data for Name: subtopic_coding_test_cases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subtopic_coding_test_cases (scca_testcase_id, scca_id, input, expected_output, is_hidden, order_index) FROM stdin;
1	1	5\n1 2 3 4 5	15	f	1
2	1	3\n-5 10 5	10	f	2
3	1	1\n100	100	t	3
4	1	6\n0 0 0 0 0 0	0	t	4
5	1	4\n1000 -500 2000 -1000	1500	t	5
6	2	4\n10 20 30 40	40 30 20 10	f	1
7	2	1\n99	99	f	2
8	2	5\n1 2 3 4 5	5 4 3 2 1	t	3
9	3	education	5	f	1
10	3	rhythm	0	f	2
11	3	aeiou	5	t	3
12	3	algorithms	3	t	4
13	4	2 3 1 * + 9 -	-4	f	1
14	4	5 4 +	9	f	2
15	4	3 4 + 2 * 7 /	2	t	3
16	5	5\n10 50 30 70 80\n30	2	f	1
17	5	4\n1 2 3 4\n99	-1	f	2
18	5	1\n7\n7	0	t	3
19	6	5\n64 25 12 22 11	11 12 22 25 64	f	1
20	6	3\n3 2 1	1 2 3	f	2
21	6	1\n100	100	t	3
22	6	6\n-5 10 0 -20 50 15	-20 -5 0 10 15 50	t	4
23	7	6	8	f	1
24	7	0	0	f	2
25	7	1	1	t	3
26	7	10	55	t	4
27	7	20	6765	t	5
\.


--
-- Data for Name: subtopic_content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subtopic_content (content_id, subtopic_id, aim, theory, video_explanation_url, time_limit) FROM stdin;
1	1	Understand the fundamental concepts of data structures, algorithm design principles, classification, and their role in computer science problem solving.	## Definition\nA **Data Structure** is a specialized format for organizing, processing, retrieving, and storing data efficiently in computer memory. An **Algorithm** is a finite, step-by-step set of well-defined instructions designed to solve a specific problem or perform a computation.\n\n## Introduction\nIn software engineering, choosing the appropriate data structure and algorithm directly influences system efficiency, execution time, and memory footprint. Data structures provide the blueprint for structuring data, while algorithms define the procedural logic acting upon that data.\n\n## Core Concept\n- **Linear Data Structures**: Data elements are arranged sequentially (e.g., Arrays, Linked Lists, Stacks, Queues).\n- **Non-Linear Data Structures**: Data elements are arranged hierarchically or interconnected randomly (e.g., Trees, Graphs).\n- **Static Data Structures**: Fixed memory allocation determined at compile-time (e.g., Arrays).\n- **Dynamic Data Structures**: Dynamic memory allocation modified at runtime (e.g., Linked Lists, Dynamic Trees).\n\n## Working / Principle\nAn algorithm takes zero or more inputs, processes them through deterministic operations, and yields output within finite execution steps. Data structures store elements in memory addresses structured to optimize operations such as lookup, insertion, deletion, and traversal.\n\n## Important Operations\n1. **Traversal**: Accessing every element in the structure exactly once.\n2. **Insertion**: Adding a new element into the structure.\n3. **Deletion**: Removing an existing element from the structure.\n4. **Searching**: Locating the target element within the structure.\n5. **Sorting**: Arranging elements in a specified order (ascending/descending).\n6. **Merging**: Combining two structures into a unified structure.\n\n## Code Example: Abstract Data Types (ADT) Concept in C++\n```cpp\n#include <iostream>\nusing namespace std;\n\n// Basic Abstract Representation of an Array Container\nstruct StaticArrayContainer {\n    int data[5] = {10, 20, 30, 40, 50};\n    int size = 5;\n\n    void traverse() {\n        cout << "Container Elements: ";\n        for(int i = 0; i < size; i++) {\n            cout << data[i] << " ";\n        }\n        cout << endl;\n    }\n};\n\nint main() {\n    StaticArrayContainer container;\n    container.traverse();\n    return 0;\n}\n```\n\n## Time & Space Complexity Characteristics\n- Access Time: O(1) for indexed static arrays, O(n) for sequential lists.\n- Memory Overhead: Fixed array allocation vs pointer node overhead in linked structures.\n\n## Applications\n- Operating System process schedulers and memory allocation managers.\n- Database indexing algorithms (B-Trees, Hash Tables).\n- Web browser history navigation (Stack ADT) and web crawlers (Queue / Graph algorithms).\n\n## Important Points\n- Algorithm correctness requires finiteness, definiteness, input, output, and effectiveness.\n- Space and time trade-offs frequently dictate the selection of a data structure.\n\n## Common Mistakes\n- Confusing abstract data types (interfaces) with concrete data structures (implementations).\n- Neglecting edge cases such as empty structures or memory overflows.	\N	15
3	3	Explore contiguous linear arrays, memory address calculations, 1D/2D operations, and sliding window / two-pointer algorithms.	## Definition\nAn **Array** is a linear data structure containing a fixed-size collection of homogenous elements stored in contiguous memory locations accessed via zero-based numerical indices.\n\n## Introduction\nArrays are the foundational data structure supported natively by almost all hardware architectures and programming languages. Because elements reside next to each other in memory, random access via indices occurs in constant time.\n\n## Core Concept\n- **Base Address**: The starting physical RAM address of element at index 0 (B).\n- **Element Size**: Memory footprint of a single element type in bytes (w).\n- **Address Calculation Formula (1D Array)**:\n  Address(A[i]) = B + (i * w)\n- **Address Calculation Formula (2D Array Row-Major)**:\n  Address(A[i][j]) = B + ((i * C) + j) * w\n  *(where C is total columns)*\n\n## Important Operations & Complexity\n- **Random Access**: O(1)\n- **Insertion at End**: O(1) (Amortized for dynamic arrays)\n- **Insertion at Start/Middle**: O(n) (Requires element shifting)\n- **Deletion at Start/Middle**: O(n) (Requires element shifting)\n- **Search (Unsorted)**: O(n)\n- **Search (Sorted)**: O(log n) (Binary Search)\n\n## Code Example: Two-Pointer Technique (Reverse Array In-Place)\n```cpp\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nvoid reverseArray(vector<int>& arr) {\n    int left = 0;\n    int right = arr.size() - 1;\n    while (left < right) {\n        swap(arr[left], arr[right]);\n        left++;\n        right--;\n    }\n}\n\nint main() {\n    vector<int> nums = {1, 2, 3, 4, 5};\n    reverseArray(nums);\n    for (int x : nums) cout << x << " "; // Output: 5 4 3 2 1\n    return 0;\n}\n```\n\n## Applications\n- Lookup tables, image pixel buffers, CPU cache optimization (spatial locality).\n- Implementation matrix transformations, linear algebra routines.\n\n## Important Points\n- High cache locality makes array iteration significantly faster than pointer-chasing structures like linked lists.\n- Static arrays cannot resize once allocated.\n\n## Common Mistakes\n- Out-of-bounds array indexing resulting in buffer overflows or segmentation faults.\n- Forgetting that insertion and deletion require O(n) time due to contiguous memory constraints.	\N	15
14	14	Implement Max/Min Binary Heaps, array representation, Heapify procedures, Heap Sort, and Priority Queue ADT.	## Definition\nA **Binary Heap** is a Complete Binary Tree maintaining the **Heap Property**:\n- **Max-Heap**: Key of parent node >= keys of its children. Root holds maximum element.\n- **Min-Heap**: Key of parent node <= keys of its children. Root holds minimum element.\n\n## Array Representation Formula\nBinary heaps are stored sequentially in zero-indexed arrays without explicit node pointers:\n- Left Child of node i: 2i + 1\n- Right Child of node i: 2i + 2\n- Parent of node i: floor((i - 1)/2)\n\n## Core Operations\n1. **Heapify**: Restores heap property downward in O(log n) time.\n2. **Build Heap**: Transforms unsorted array of size n into heap in O(n) time.\n3. **Extract Min/Max**: Removes root node, moves last element to root, calls Heapify in O(log n).\n\n## Code Example: C++ Priority Queue (Max Heap)\n```cpp\n#include <iostream>\n#include <queue>\nusing namespace std;\n\nint main() {\n    priority_queue<int> maxHeap;\n    maxHeap.push(30);\n    maxHeap.push(10);\n    maxHeap.push(50);\n\n    cout << "Highest Priority Element: " << maxHeap.top() << endl; // 50\n    maxHeap.pop();\n    cout << "Next Priority Element: " << maxHeap.top() << endl; // 30\n    return 0;\n}\n```\n\n## Applications\n- Dijkstra’s Shortest Path and Prim’s Minimum Spanning Tree algorithms.\n- Operating system task schedulers (OS process priorities).\n- Huffman Coding compression.	\N	15
2	2	Master asymptotic analysis techniques (Big-O, Big-Omega, Big-Theta) to evaluate program performance in terms of running time and memory consumption.	## Definition\n**Complexity Analysis** is the theoretical framework used to quantify the efficiency of an algorithm as a function of the input size n, measuring growth rates of execution time (Time Complexity) and memory utilization (Space Complexity).\n\n## Introduction\nHardware execution speeds vary across processors, so measuring raw execution time in seconds is inconsistent. Asymptotic notation provides an machine-independent metric to compare algorithm scalability as input size grows toward infinity.\n\n## Asymptotic Notations\n1. **Big-O Notation (O)**: Represents the strict upper bound (worst-case scenario).\n2. **Big-Omega Notation (Ω)**: Represents the strict lower bound (best-case scenario).\n3. **Big-Theta Notation (Θ)**: Represents the tight bound (exact growth rate when upper and lower bounds match).\n\n## Standard Complexity Orders (Fastest to Slowest)\n- O(1) — Constant Time\n- O(log n) — Logarithmic Time\n- O(n) — Linear Time\n- O(n log n) — Linearithmic / Log-Linear Time\n- O(n^2) — Quadratic Time\n- O(2^n) — Exponential Time\n- O(n!) — Factorial Time\n\n## Working / Principle\nCount the total fundamental operations (comparisons, arithmetic operations, assignments) executed by code loops and recursive calls as a mathematical function f(n), then discard constant multipliers and lower-order terms.\n\n## Code Example: Analyzing Nested Loops\n```cpp\n// Time Complexity: O(n^2) Quadratic\nvoid matrixMultiplication(int n) {\n    int count = 0;\n    for (int i = 0; i < n; i++) {           // Runs n times\n        for (int j = 0; j < n; j++) {       // Runs n times per outer iteration\n            count++;                       // Total execution = n * n\n        }\n    }\n}\n\n// Time Complexity: O(log n) Logarithmic\nvoid logarithmicDecrease(int n) {\n    while (n > 1) {\n        n = n / 2;                         // Divides input in half each step\n    }\n}\n```\n\n## Space Complexity Components\n- **Auxiliary Space**: Temporary or extra space used by the algorithm.\n- **Total Space Complexity**: Input size space + Auxiliary space.\n\n## Applications\n- High-frequency trading algorithms requiring guaranteed O(1) sub-millisecond execution bounds.\n- Embedded system software operating under tight RAM limits.\n\n## Important Points\n- Drop constants (O(2n) -> O(n)) and lower-order terms (O(n^2 + 5n) -> O(n^2)).\n- Recursion stack space contributes to Auxiliary Space Complexity.\n\n## Common Mistakes\n- Assuming loop counters always imply O(n) without inspecting variable step increments (j *= 2 is logarithmic).\n- Ignoring auxiliary memory overhead incurred by recursive call stacks.	\N	15
4	4	Study string representation, character encodings, pattern matching techniques, and string manipulation algorithms.	## Definition\nA **String** is a sequence of characters stored sequentially in memory, terminated by a null character '\\0' in traditional C-strings or managed dynamically as objects in modern programming languages.\n\n## Introduction\nText processing is vital in software development, compilers, databases, and bioinformatics. Strings can be mutable (modifiable in-place like C char arrays) or immutable (creating new objects upon modification like Java strings).\n\n## Core Concept\n- **ASCII & Unicode/UTF-8**: Encoding schemes assigning numerical code points to character glyphs.\n- **Pattern Matching Algorithms**:\n  - Naive Matching: O((n-m+1) * m)\n  - Knuth-Morris-Pratt (KMP): O(n + m) using Partial Match Prefix Table (LPS).\n  - Rabin-Karp: O(n + m) using rolling hash functions.\n\n## Important Operations\n- Concatenation, Substring extraction, Character searching.\n- Anagram testing, Palindrome verification, Pattern matching.\n\n## Code Example: Check Palindrome using Two Pointers\n```cpp\n#include <iostream>\n#include <string>\nusing namespace std;\n\nbool isPalindrome(const string& s) {\n    int i = 0, j = s.length() - 1;\n    while (i < j) {\n        if (s[i] != s[j]) return false;\n        i++;\n        j--;\n    }\n    return true;\n}\n\nint main() {\n    string str = "racecar";\n    cout << (isPalindrome(str) ? "Palindrome" : "Not Palindrome") << endl;\n    return 0;\n}\n```\n\n## Time & Space Complexity\n- Length Calculation: O(n) for null-terminated strings, O(1) for string instances storing explicit size.\n- Concatenation: O(n + m).\n\n## Applications\n- Text editors, search engine indexing, computational genomics (DNA sequence alignment).\n- Lexical analysis in compilers and parsers.\n\n## Important Points\n- Repeated string concatenation in loops without specialized builders causes quadratic O(n^2) allocation overhead in immutable languages.\n\n## Common Mistakes\n- Comparing string equality using reference memory equality (==) instead of value equality methods in languages like Java.\n- Buffer overflow errors in C-style string functions like strcpy.	\N	15
5	5	Implement singly, doubly, and circular linked lists, master pointer manipulations, dynamic memory insertion, and cycle detection.	## Definition\nA **Linked List** is a dynamic linear data structure composed of nodes where each node contains a data payload and one or more pointers/references to neighboring nodes.\n\n## Introduction\nUnlike arrays, linked list nodes are allocated dynamically in heap memory and do not require contiguous memory blocks. Nodes are linked together via memory pointers.\n\n## Types of Linked Lists\n1. **Singly Linked List**: Each node points to the next node (head -> node1 -> node2 -> NULL).\n2. **Doubly Linked List**: Each node contains pointers to both next and previous nodes (NULL <- node1 <-> node2 -> NULL).\n3. **Circular Linked List**: The last node points back to the head node.\n\n## Working / Principle\nPointer adjustments enable insertion and deletion operations in O(1) constant time if the reference location is already known, without requiring element shifting.\n\n## Code Example: Singly Linked List Insertion and Traversal in C++\n```cpp\n#include <iostream>\nusing namespace std;\n\nstruct Node {\n    int data;\n    Node* next;\n    Node(int val) : data(val), next(nullptr) {}\n};\n\nvoid insertAtHead(Node*& head, int val) {\n    Node* newNode = new Node(val);\n    newNode->next = head;\n    head = newNode;\n}\n\nvoid printList(Node* head) {\n    Node* temp = head;\n    while (temp != nullptr) {\n        cout << temp->data << " -> ";\n        temp = temp->next;\n    }\n    cout << "NULL" << endl;\n}\n\nint main() {\n    Node* head = nullptr;\n    insertAtHead(head, 30);\n    insertAtHead(head, 20);\n    insertAtHead(head, 10);\n    printList(head); // Output: 10 -> 20 -> 30 -> NULL\n    return 0;\n}\n```\n\n## Complexity Analysis\n- Access / Search: O(n)\n- Insertion at Head / Tail (with tail pointer): O(1)\n- Deletion at Head: O(1)\n- Deletion arbitrary given node pointer in Doubly Linked List: O(1)\n\n## Applications\n- Dynamic memory allocation freelists in OS kernels.\n- Undo-redo functionalities in application software (Doubly Linked List).\n- Navigation systems for playlist tracks.\n\n## Important Points\n- Floyd’s Cycle Detection (Tortoise and Hare) uses fast/slow pointers to detect loops in O(n) time and O(1) space.\n\n## Common Mistakes\n- Dereferencing nullptr pointers resulting in memory segmentation faults.\n- Creating memory leaks by losing the head pointer reference without deallocating heap nodes.	\N	15
6	6	Understand the Last-In-First-Out (LIFO) paradigm, array and linked list stack implementations, infix/postfix conversions, and expression evaluation.	## Definition\nA **Stack** is a linear Abstract Data Type (ADT) operating on the **Last-In, First-Out (LIFO)** policy, where elements are added and removed strictly from a single end called the **Top**.\n\n## Introduction\nThe stack models physical stack behavior (e.g., a stack of books). Operations occur exclusively at the top of the stack, preserving sequential reverse processing order.\n\n## Core Operations & Complexity\n- push(x): Inserts element x at the top — O(1)\n- pop(): Removes and returns the top element — O(1)\n- peek() / top(): Returns the top element without removal — O(1)\n- isEmpty(): Checks whether the stack contains elements — O(1)\n\n## Working / Principle\nUnder an array-based implementation, an index variable top tracks the current top index (initialized to -1). Pushing increments top, while popping decrements top. Underflow occurs when popping an empty stack (top == -1), while Overflow occurs when pushing onto a full static array.\n\n## Code Example: Stack Evaluation of Balanced Parentheses\n```cpp\n#include <iostream>\n#include <stack>\n#include <string>\nusing namespace std;\n\nbool isBalanced(string expr) {\n    stack<char> s;\n    for (char ch : expr) {\n        if (ch == '(' || ch == '{' || ch == '[') {\n            s.push(ch);\n        } else {\n            if (s.empty()) return false;\n            char top = s.top();\n            if ((ch == ')' && top == '(') ||\n                (ch == '}' && top == '{') ||\n                (ch == ']' && top == '[')) {\n                s.pop();\n            } else {\n                return false;\n            }\n        }\n    }\n    return s.empty();\n}\n\nint main() {\n    cout << (isBalanced("{[()]}") ? "Balanced" : "Unbalanced") << endl;\n    return 0;\n}\n```\n\n## Applications\n- Function call execution stack management in CPU runtime.\n- Expression parsing (Infix to Postfix/Prefix conversion using Shunting-Yard algorithm).\n- Backtracking algorithms (DFS traversal, Maze solving).\n\n## Important Points\n- All primary stack operations perform in O(1) time complexity.\n\n## Common Mistakes\n- Calling pop() or top() on an empty stack leading to undefined behavior or crash.	\N	15
7	7	Implement First-In-First-Out (FIFO) queues, Circular Queues, Double-Ended Queues (Deque), and job scheduling queues.	## Definition\nA **Queue** is a linear Abstract Data Type operating on the **First-In, First-Out (FIFO)** policy, where elements are inserted at the **Rear** (Enqueue) and removed from the **Front** (Dequeue).\n\n## Introduction\nQueues model real-world waiting lines where the earliest arrival receives initial service. They decouple processes executing at different speeds.\n\n## Variants of Queue\n1. **Linear Queue**: Array-based queue prone to false-overflow when rear reaches array capacity despite empty front slots.\n2. **Circular Queue**: Connects the end of the array back to the start using modulo arithmetic ((rear + 1) % N).\n3. **Double-Ended Queue (Deque)**: Allows insertion and deletion at both Front and Rear ends in O(1).\n4. **Priority Queue**: Elements are dequeued according to assigned priority values rather than arrival order.\n\n## Code Example: Circular Queue Implementation in C++\n```cpp\n#include <iostream>\nusing namespace std;\n\nclass CircularQueue {\n    int *arr;\n    int front, rear, size, capacity;\npublic:\n    CircularQueue(int cap) {\n        capacity = cap;\n        arr = new int[capacity];\n        front = -1;\n        rear = -1;\n        size = 0;\n    }\n\n    bool enqueue(int value) {\n        if (size == capacity) return false; // Full\n        if (front == -1) front = 0;\n        rear = (rear + 1) % capacity;\n        arr[rear] = value;\n        size++;\n        return true;\n    }\n\n    bool dequeue() {\n        if (size == 0) return false; // Empty\n        front = (front + 1) % capacity;\n        size--;\n        return true;\n    }\n\n    int getFront() { return size == 0 ? -1 : arr[front]; }\n};\n\nint main() {\n    CircularQueue cq(3);\n    cq.enqueue(10);\n    cq.enqueue(20);\n    cq.enqueue(30);\n    cout << "Front: " << cq.getFront() << endl; // 10\n    cq.dequeue();\n    cout << "New Front: " << cq.getFront() << endl; // 20\n    return 0;\n}\n```\n\n## Complexity Analysis\n- Enqueue: O(1)\n- Dequeue: O(1)\n- Front / Peek: O(1)\n\n## Applications\n- Operating System CPU process scheduling (Round-Robin).\n- Asynchronous data buffers (IO communication, Print spoolers).\n- Breadth-First Search (BFS) graph traversal algorithm.\n\n## Common Mistakes\n- Mismanaging index wrap-around modulo math in circular queues.\n- Dequeuing empty queues causing underflow.	\N	15
8	8	Master recursive thinking, base cases, recurrence relations, call stack dynamics, and tail call optimization.	## Definition\n**Recursion** is a programming paradigm where a function calls itself directly or indirectly to solve a smaller instance of the same problem until reaching a defined **Base Case**.\n\n## Introduction\nRecursion decomposes complex algorithmic challenges into simpler sub-problems matching mathematical induction.\n\n## Essential Components\n1. **Base Case**: The non-recursive termination condition returning an immediate result.\n2. **Recursive Step**: Reducing problem size n toward the base case (e.g., n-1 or n/2).\n\n## Call Stack Execution\nEach recursive function call allocates a new activation record on the runtime system call stack containing local variables, parameters, and return addresses. Stack frames are popped upon returning.\n\n## Code Example: Binary Search (Recursive)\n```cpp\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint recursiveBinarySearch(const vector<int>& arr, int low, int high, int target) {\n    // Base Case\n    if (low > high) return -1;\n\n    int mid = low + (high - low) / 2;\n\n    if (arr[mid] == target) return mid;\n    if (arr[mid] > target) \n        return recursiveBinarySearch(arr, low, mid - 1, target);\n    \n    return recursiveBinarySearch(arr, mid + 1, high, target);\n}\n\nint main() {\n    vector<int> data = {2, 5, 8, 12, 16, 23, 38};\n    int idx = recursiveBinarySearch(data, 0, data.size() - 1, 16);\n    cout << "Element found at index: " << idx << endl; // Index 4\n    return 0;\n}\n```\n\n## Recurrence Relations & Solving Methods\n- Factorial: T(n) = T(n-1) + O(1) => O(n)\n- Divide & Conquer (Merge Sort): T(n) = 2T(n/2) + O(n) => O(n log n) (Solved via Master Theorem)\n\n## Applications\n- Tree traversals (In-order, Pre-order, Post-order).\n- Divide and conquer algorithms (Quick Sort, Merge Sort).\n- Backtracking (N-Queens, Sudoku solver).\n\n## Common Mistakes\n- Omitting the base case, leading to infinite recursion and StackOverflowError.\n- Recomputing identical subproblems repeatedly (e.g., naive recursive Fibonacci in O(2^n) time without memoization).	\N	15
9	9	Compare Linear Search and Binary Search algorithms, ternary search, binary search space abstractions, and performance bounds.	## Definition\n**Searching Algorithms** are computational procedures designed to locate a specific target value within a collection of data elements or determine its absence.\n\n## Algorithms Covered\n1. **Linear Search**: Sequentially checks every element from index 0 to n-1.\n2. **Binary Search**: Efficiently searches a **sorted** collection by dividing the search interval in half repeatedly.\n\n## Comparison Table\n| Algorithm | Prerequisite | Worst-Case Time | Best-Case Time | Space Complexity |\n| :--- | :--- | :--- | :--- | :--- |\n| Linear Search | None | O(n) | O(1) | O(1) |\n| Binary Search | Sorted Order | O(log n) | O(1) | O(1) Iterative |\n\n## Code Example: Iterative Binary Search\n```cpp\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint binarySearch(const vector<int>& arr, int target) {\n    int low = 0, high = arr.size() - 1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2; // Prevents integer overflow\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}\n\nint main() {\n    vector<int> nums = {10, 20, 30, 40, 50};\n    cout << "Index of 40: " << binarySearch(nums, 40) << endl; // Output 3\n    return 0;\n}\n```\n\n## Binary Search on Search Space (Advanced Principle)\nBinary Search applies beyond explicit arrays to monotonic functions where decision spaces transition from True to False (TTTTFFFF). Used in optimization problems like finding minimum speed or optimal capacity.\n\n## Applications\n- Database index lookups, dictionary key queries.\n- Square root approximations, numerical root finding.\n\n## Common Mistakes\n- Applying Binary Search on unsorted inputs.\n- Integer overflow bug when computing mid = (low + high) / 2 instead of low + (high - low) / 2.	\N	15
10	10	Analyze comparison-based sorting (Bubble, Insertion, Selection, Merge, Quick, Heap) and non-comparison sorting (Counting, Radix).	## Definition\n**Sorting Algorithms** rearrange a collection of elements into a specified order (numerical or lexicographical).\n\n## Key Classification Criteria\n- **Stability**: A stable sort preserves the relative order of duplicate elements.\n- **In-Place**: An in-place algorithm requires O(1) auxiliary memory (excluding recursive stacks).\n\n## Summary of Core Sorting Algorithms\n| Algorithm | Best Time | Average Time | Worst Time | Space | Stable? |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| **Bubble Sort** | O(n) | O(n^2) | O(n^2) | O(1) | Yes |\n| **Selection Sort**| O(n^2) | O(n^2) | O(n^2) | O(1) | No |\n| **Insertion Sort**| O(n) | O(n^2) | O(n^2) | O(1) | Yes |\n| **Merge Sort** | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |\n| **Quick Sort** | O(n log n) | O(n log n) | O(n^2) | O(log n) | No |\n| **Heap Sort** | O(n log n) | O(n log n) | O(n log n) | O(1) | No |\n\n## Code Example: Quick Sort (Lomuto Partition)\n```cpp\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint partition(vector<int>& arr, int low, int high) {\n    int pivot = arr[high];\n    int i = low - 1;\n    for (int j = low; j < high; j++) {\n        if (arr[j] < pivot) {\n            i++;\n            swap(arr[i], arr[j]);\n        }\n    }\n    swap(arr[i + 1], arr[high]);\n    return i + 1;\n}\n\nvoid quickSort(vector<int>& arr, int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}\n```\n\n## Lower Bound of Comparison-Based Sorting\nAny comparison-based sorting algorithm requires at least Ω(n log n) comparisons in the worst case (proven via Decision Trees).\n\n## Applications\n- Order statistics, graphics rendering Z-buffers, database query execution engines (ORDER BY).	\N	15
11	11	Master hash functions, collision resolution strategies (Chaining, Linear Probing, Quadratic Probing, Double Hashing), and Hash Tables.	## Definition\n**Hashing** is a technique that maps key data of arbitrary size into fixed-size integer values called **Hash Codes** using a mathematical function (Hash Function), enabling constant time O(1) operations on average.\n\n## Core Concepts\n- **Hash Table**: An array storing key-value pairs indexed by hash values.\n- **Hash Function**: h(k) = k mod m (Division method), mapping key k to table index.\n- **Collision**: Occurs when two distinct keys yield identical hash table indices (h(k1) = h(k2)).\n\n## Collision Resolution Techniques\n1. **Separate Chaining (Open Hashing)**: Each table bucket maintains a linked list of colliding records.\n2. **Open Addressing (Closed Hashing)**: All elements reside inside the table array. Collisions trigger probing sequence lookups:\n   - *Linear Probing*: h(k, i) = (h'(k) + i) mod m\n   - *Quadratic Probing*: h(k, i) = (h'(k) + c1*i + c2*i^2) mod m\n   - *Double Hashing*: h(k, i) = (h1(k) + i * h2(k)) mod m\n\n## Code Example: Hash Set Operations in C++ (STL Unordered Set)\n```cpp\n#include <iostream>\n#include <unordered_set>\nusing namespace std;\n\nint main() {\n    unordered_set<int> hashSet;\n    hashSet.insert(10);\n    hashSet.insert(25);\n    hashSet.insert(40);\n\n    if (hashSet.find(25) != hashSet.end()) {\n        cout << "Key 25 found in hash table!" << endl;\n    }\n    return 0;\n}\n```\n\n## Performance & Load Factor\n- **Load Factor (α)**: α = n / m (Number of entries n divided by total buckets m).\n- When α > 0.75, dynamic rehashing expands table size to maintain O(1) search bounds.\n\n## Applications\n- Database indexing, associative arrays/dictionaries in standard libraries.\n- Cryptography (SHA-256), caching mechanisms, set intersection algorithms.\n\n## Common Mistakes\n- Using poor hash functions causing clustering and degrading operations from O(1) to O(n).	\N	15
12	12	Understand non-linear tree structures, terminology, binary tree properties, and Depth-First / Breadth-First traversals.	## Definition\nA **Tree** is a non-linear hierarchical data structure consisting of nodes connected by directed edges, with a designated top node called the **Root** and no cycles.\n\n## Terminologies\n- **Root**: Topmost node without parents.\n- **Parent / Child**: Ancestor and descendant relationship connected by an edge.\n- **Leaf Node**: Node with zero children.\n- **Height of Tree**: Length of longest path from root to leaf.\n- **Depth of Node**: Number of edges from root to that node.\n\n## Binary Trees\nA tree where every node has at most two children (**Left** and **Right**).\n- *Full Binary Tree*: Every node has either 0 or 2 children.\n- *Perfect Binary Tree*: All internal nodes have 2 children and leaf nodes are at identical depth. Total nodes N = 2^(h+1) - 1.\n- *Complete Binary Tree*: All levels are filled except possibly the last level, filled left-to-right.\n\n## Traversals\n1. **Pre-Order (DFS)**: Root -> Left -> Right\n2. **In-Order (DFS)**: Left -> Root -> Right\n3. **Post-Order (DFS)**: Left -> Right -> Root\n4. **Level-Order (BFS)**: Visited level-by-level using Queue ADT.\n\n## Code Example: Recursive In-Order Traversal\n```cpp\n#include <iostream>\nusing namespace std;\n\nstruct TreeNode {\n    int val;\n    TreeNode* left;\n    TreeNode* right;\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n};\n\nvoid inOrder(TreeNode* root) {\n    if (root == nullptr) return;\n    inOrder(root->left);\n    cout << root->val << " ";\n    inOrder(root->right);\n}\n```\n\n## Time Complexity\n- Traversal of all nodes: O(n)\n- Space Complexity: O(h) auxiliary recursion stack where h is tree height.\n\n## Applications\n- Abstract Syntax Trees (AST) in compilers.\n- DOM structure in HTML rendering engines.\n- File system directories.	\N	15
13	13	Study Binary Search Tree (BST) ordering properties, insertion, deletion cases, searching, and self-balancing BST trees (AVL, Red-Black).	## Definition\nA **Binary Search Tree (BST)** is a node-based binary tree structured such that for every node X:\n- All keys in X’s left subtree are strictly smaller than X.key.\n- All keys in X’s right subtree are strictly greater than X.key.\n\n## Property\n**In-Order Traversal of a BST produces elements in strictly sorted ascending order.**\n\n## Operations & Case Analysis\n1. **Search & Insertion**: Compare target key with current node, branching left if smaller or right if larger (O(h) time).\n2. **Deletion**:\n   - *Case 1 (Leaf node)*: Remove directly.\n   - *Case 2 (One child)*: Replace node with its single child.\n   - *Case 3 (Two children)*: Swap node value with its **In-Order Successor** (smallest key in right subtree) or **In-Order Predecessor**, then delete that successor node.\n\n## Code Example: BST Search and Insertion\n```cpp\n#include <iostream>\nusing namespace std;\n\nstruct Node {\n    int key;\n    Node *left, *right;\n    Node(int item) : key(item), left(nullptr), right(nullptr) {}\n};\n\nNode* insert(Node* node, int key) {\n    if (node == nullptr) return new Node(key);\n    if (key < node->key) node->left = insert(node->left, key);\n    else if (key > node->key) node->right = insert(node->right, key);\n    return node;\n}\n```\n\n## Complexity Analysis\n- Balanced BST (e.g. AVL, Red-Black): Search/Insert/Delete in O(log n) time.\n- Skewed BST (Worst Case): Degenerates into a linear list with O(n) time complexity.\n\n## Applications\n- Maintaining dynamically sorted streams of data.\n- Symbol tables in compilers.\n- Self-balancing trees power standard set/map containers (std::map).	\N	15
15	15	Represent graphs using Adjacency Matrix/Lists, implement BFS and DFS traversals, topological sort, and shortest path algorithms.	## Definition\nA **Graph** G = (V, E) is a non-linear data structure consisting of a set of vertices (nodes) V and a set of edges E connecting pairs of vertices.\n\n## Classifications\n- **Directed vs Undirected**: Edges have specified direction or bidirectional traversal.\n- **Weighted vs Unweighted**: Edges carry numerical costs/weights.\n- **Cyclic vs Acyclic**: Graphs containing closed walk paths or none (DAG).\n\n## Representations\n1. **Adjacency Matrix**: V x V 2D array (O(V^2) space, O(1) edge checking).\n2. **Adjacency List**: Array of vectors storing neighboring nodes (O(V + E) space, space-efficient for sparse graphs).\n\n## Traversals\n- **Breadth-First Search (BFS)**: Explores nodes level-by-level using Queue (O(V + E)).\n- **Depth-First Search (DFS)**: Explores paths deeply along branches using Stack / Recursion (O(V + E)).\n\n## Code Example: Graph Representation and BFS Traversal\n```cpp\n#include <iostream>\n#include <vector>\n#include <queue>\nusing namespace std;\n\nvoid BFS(int startNode, int V, const vector<vector<int>>& adj) {\n    vector<bool> visited(V, false);\n    queue<int> q;\n\n    visited[startNode] = true;\n    q.push(startNode);\n\n    while (!q.empty()) {\n        int u = q.front();\n        q.pop();\n        cout << u << " ";\n\n        for (int v : adj[u]) {\n            if (!visited[v]) {\n                visited[v] = true;\n                q.push(v);\n            }\n        }\n    }\n}\n```\n\n## Key Algorithms\n- **Dijkstra’s Algorithm**: Single-source shortest paths on non-negative weighted graphs (O((V + E) log V)).\n- **Topological Sorting**: Linear ordering of vertices in Directed Acyclic Graphs (DAG).\n\n## Applications\n- Social networks (connections graph), Google Maps navigation, Network routing protocols.	\N	15
16	16	Understand greedy choice property, optimal substructure, Fractional Knapsack, Activity Selection, Prim’s and Kruskal’s algorithms.	## Definition\nA **Greedy Algorithm** builds up a solution piece by piece, always selecting the choice that offers the most immediate local advantage (**Greedy Choice Property**) without reconsidering past decisions.\n\n## Core Properties Required\n1. **Greedy Choice Property**: A globally optimal solution can be reached by making locally optimal choices.\n2. **Optimal Substructure**: An optimal solution to the problem contains within it optimal solutions to subproblems.\n\n## Classic Problems & Logic\n- **Activity Selection Problem**: Sort activities by finish times, greedily select next non-overlapping activity.\n- **Fractional Knapsack**: Sort items by value-to-weight ratio (vi/wi), take complete items or fractions greedily (O(n log n)).\n- **Kruskal’s Minimum Spanning Tree (MST)**: Sort all graph edges by weight, add edges greedily using Union-Find to avoid cycles.\n\n## Code Example: Fractional Knapsack Implementation\n```cpp\n#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nstruct Item {\n    int value, weight;\n};\n\nbool cmp(Item a, Item b) {\n    double r1 = (double)a.value / a.weight;\n    double r2 = (double)b.value / b.weight;\n    return r1 > r2;\n}\n\ndouble fractionalKnapsack(int W, vector<Item>& items) {\n    sort(items.begin(), items.end(), cmp);\n    double totalValue = 0.0;\n    for (auto& item : items) {\n        if (W >= item.weight) {\n            W -= item.weight;\n            totalValue += item.value;\n        } else {\n            totalValue += item.value * ((double)W / item.weight);\n            break;\n        }\n    }\n    return totalValue;\n}\n```\n\n## Limitations\nGreedy algorithms fail on problems lacking greedy choice properties (e.g., 0/1 Knapsack problem requires Dynamic Programming).	\N	15
17	17	Master Dynamic Programming principles, Memoization (Top-Down), Tabulation (Bottom-Up), state formulations, and classic DP problems.	## Definition\n**Dynamic Programming (DP)** is an algorithmic optimization technique that solves complex problems by breaking them down into overlapping subproblems, storing computed subproblem solutions to prevent redundant calculations.\n\n## Core Prerequisites\n1. **Overlapping Subproblems**: The recursive space evaluates identical subproblems repeatedly.\n2. **Optimal Substructure**: Optimal solution to problem n depends directly on optimal solutions of subproblems.\n\n## DP Approaches\n- **Top-Down (Memoization)**: Recursive algorithm enhanced by storing subproblem results in a hash table / lookup array.\n- **Bottom-Up (Tabulation)**: Iterative algorithm filling a DP table starting from initial base states up to target state N.\n\n## Classic Problem: 0/1 Knapsack State Recurrence\nGiven n items with weights wi and values vi, and knapsack capacity W:\nDP[i][j] = max(DP[i-1][j], vi + DP[i-1][j - wi])\n\n## Code Example: Longest Common Subsequence (LCS) Tabulation\n```cpp\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint longestCommonSubsequence(string text1, string text2) {\n    int m = text1.size(), n = text2.size();\n    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));\n\n    for (int i = 1; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {\n            if (text1[i - 1] == text2[j - 1]) {\n                dp[i][j] = 1 + dp[i - 1][j - 1];\n            } else {\n                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);\n            }\n        }\n    }\n    return dp[m][n];\n}\n```\n\n## Time vs Space Optimization\n- Reduces exponential time complexity O(2^n) down to polynomial time O(n^2) or O(n * W).\n- State space can often be compressed from O(n^2) down to O(n) by retaining only recent state vectors.	\N	15
\.


--
-- Data for Name: subtopic_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subtopic_progress (subtopic_progress_id, student_id, subtopic_id, aim_viewed, theory_viewed, video_viewed, status, time_spent, last_accessed) FROM stdin;
56	10	4	t	t	f	In Progress	7	2026-10-15 13:36:01.973556
63	10	2	t	f	f	In Progress	3	2026-10-15 13:36:23.855384
51	10	3	t	t	f	In Progress	34	2026-10-20 17:27:13.307866
46	10	5	t	t	f	In Progress	14	2026-10-15 13:36:30.179237
15	10	1	t	t	f	In Progress	24	2026-10-19 21:12:08.504891
126	12	3	t	t	f	In Progress	7	2026-10-20 18:22:21.817443
33	10	6	t	t	f	In Progress	23	2026-10-15 14:12:46.767029
21	10	10	t	t	f	In Progress	17	2026-10-16 14:17:18.135575
100	10	14	t	t	f	In Progress	7	2026-10-16 14:17:33.298756
24	10	17	t	t	f	In Progress	16	2026-10-09 10:50:33.245483
\.


--
-- Data for Name: subtopic_quiz_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subtopic_quiz_questions (stq_id, content_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, order_index) FROM stdin;
1	1	Which of the following is categorized as a non-linear data structure?	Array	Linked List	Tree	Stack	C	1	1
2	1	A data structure whose size is allocated at compile-time and cannot change is called:	Dynamic data structure	Static data structure	Homogeneous data structure	Non-linear data structure	B	1	2
3	1	Which essential property of an algorithm requires it to terminate after a finite number of steps?	Definiteness	Finiteness	Effectiveness	Generality	B	1	3
4	1	Accessing every element in a data structure exactly once is known as:	Sorting	Merging	Traversal	Insertion	C	1	4
5	1	Which of the following is an example of an Abstract Data Type (ADT)?	Integer in RAM	Stack ADT	CPU Register	Hard Disk Sector	B	1	5
6	1	Combining elements of two sorted data structures into a single structure is called:	Searching	Merging	Partitioning	Filtering	B	1	6
7	1	In memory allocation, dynamic data structures are primarily allocated in which memory segment?	Call Stack	Heap	CPU Cache	ROM	B	1	7
8	1	Which of the following represents homogeneous elements arranged sequentially?	Graph	Array	Tree	Hash Map with arbitrary types	B	1	8
9	1	Why are space and time complexity evaluated together when selecting a data structure?	They are always identical	There is often a trade-off between execution speed and memory usage	Hardware only supports one or the other	To avoid compiler syntax errors	B	2	9
10	1	What is the primary objective of algorithm asymptotic analysis?	To measure execution speed in nanoseconds on a specific laptop	To determine mathematical growth of resource requirements as input size scales	To format source code indentation	To convert code to machine language	B	2	10
11	2	Big-Theta notation (Θ) provides:	An upper bound only	A lower bound only	A tight bound (both upper and lower)	An average case heuristic only	C	1	1
12	2	What is the time complexity of a loop executing for (int i = 1; i < n; i *= 2)?	O(n)	O(n^2)	O(log n)	O(1)	C	1	2
13	2	Which complexity class grows fastest as n approaches infinity?	O(n^3)	O(2^n)	O(n log n)	O(n!)	D	1	3
14	2	Auxiliary space complexity refers to:	The space occupied by the input data only	The temporary or extra space used by the algorithm excluding input size	The size of the source code file in kilobytes	The hard drive storage capacity	B	1	4
15	2	If f(n) = 3n^2 + 5n + 100, what is the asymptotic Big-O complexity?	O(100)	O(n)	O(n^2)	O(n^3)	C	1	5
16	2	What is the time complexity of adding two n x n matrices?	O(n)	O(n^2)	O(n^3)	O(log n)	B	1	6
17	2	Master Theorem is applied to solve recurrence relations of which type?	Iterative single loops	Divide and conquer recurrences of form T(n) = aT(n/b) + f(n)	Linear equations with two variables	Non-recursive matrix operations	B	1	7
18	2	Which notation represents the best-case time complexity strictly?	Big-O (O)	Big-Omega (Ω)	Big-Theta (Θ)	Little-omega (ω)	B	1	8
19	2	What is the space complexity of a recursive algorithm with depth n where each call frame takes O(1) space?	O(1)	O(log n)	O(n)	O(n^2)	C	2	9
20	2	An algorithm executes in constant time regardless of input size n. Its complexity is:	O(0)	O(1)	O(n)	O(log 1)	B	2	10
21	3	Given base address B, element size w, what is the address of A[i] in a 0-indexed 1D array?	B + (i - 1) * w	B + i * w	B + i / w	B * i + w	B	1	1
22	3	What is the time complexity of inserting an element at index 0 of an array of size n?	O(1)	O(log n)	O(n)	O(n^2)	C	1	2
23	3	In Row-Major order for a 2D array A[R][C] with base address B, the address of A[i][j] is:	B + (i * C + j) * w	B + (j * R + i) * w	B + (i + j) * w	B + (i * R + j) * w	A	1	3
24	3	Why does array access by index take O(1) constant time?	Elements are stored in random disk locations	Hardware uses mathematical contiguous address calculation directly	The compiler uses a binary search lookup tree	Array indices are hashed at runtime	B	1	4
25	3	What is the disadvantage of static arrays compared to dynamic arrays?	Static arrays take O(n) access time	Static arrays have fixed capacity determined at creation	Static arrays cannot store integer types	Static arrays do not support iteration	B	1	5
26	3	What is the time complexity of the Two-Pointer technique used to reverse an array in-place?	O(n^2)	O(n log n)	O(n)	O(1)	C	1	6
27	3	What error occurs if an application attempts to write to index 10 in an array of size 5?	Stack underflow	Array index out of bounds / Buffer overflow	Type mismatch exception	Memory fragmentation	B	1	7
28	3	What is the amortized time complexity of inserting an element at the end of a dynamic array (std::vector)?	O(1)	O(n)	O(log n)	O(n^2)	A	1	8
29	3	Why do CPU caches perform faster during array iteration compared to linked lists?	Arrays use more CPU threads	High spatial locality due to contiguous memory storage	Linked list nodes are cached automatically in L1 cache	Arrays contain no binary data	B	2	9
30	3	In the Sliding Window technique on an array of size n, what is the typical overall time complexity?	O(n^2)	O(n)	O(2^n)	O(n!)	B	2	10
31	4	In C, what special character terminates a string literal in memory?	\\n	\\0	\\t	EOF	B	1	1
32	4	What is the time complexity of computing the length of a null-terminated string of n characters?	O(1)	O(n)	O(log n)	O(n^2)	B	1	2
33	4	Which string matching algorithm uses the Longest Prefix Suffix (LPS) array?	Rabin-Karp Algorithm	Knuth-Morris-Pratt (KMP) Algorithm	Boyer-Moore Algorithm	Naive String Matching	B	1	3
34	4	What is the best-case time complexity of the KMP algorithm for searching a pattern of length m in text of length n?	O(n + m)	O(n * m)	O(n^2)	O(log n)	A	1	4
35	4	Which algorithm uses a rolling hash to achieve linear time string matching on average?	KMP Algorithm	Rabin-Karp Algorithm	Z-Algorithm	Aho-Corasick	B	1	5
36	4	What is a Palindrome string?	A string with only vowels	A string that reads the same forwards and backwards	A string with alternating upper and lower case	A string containing all unique characters	B	1	6
37	4	Two strings are called Anagrams if they:	Have the same length and exact same characters with identical frequencies	Have the same first and last characters	Contain only uppercase letters	Are substrings of each other	A	1	7
38	4	What is the time complexity to check if a string of length n is a palindrome using two pointers?	O(n)	O(n^2)	O(log n)	O(1)	A	1	8
39	4	Why does repeated string concatenation with += in a loop cause O(n^2) performance in immutable string languages?	Strings are stored in ROM	Every concatenation allocates a new string object and copies previous characters	String indexing is disabled in loops	Immutable strings use tree traversal	B	2	9
40	4	What data structure is optimal for autocomplete and prefix search dictionaries?	Binary Search Tree	Trie (Prefix Tree)	Stack	Circular Queue	B	2	10
41	5	What does each node in a singly linked list contain?	Data and two pointers	Data and a single pointer to the next node	Two data values and no pointer	An array index and a pointer	B	1	1
42	5	What is the time complexity to insert a new node at the head of a singly linked list?	O(n)	O(1)	O(log n)	O(n^2)	B	1	2
43	5	What is the time complexity to access the k-th element in a singly linked list of size n?	O(1)	O(log n)	O(k) / O(n)	O(n^2)	C	1	3
44	5	Which algorithm detects a cycle in a linked list using slow and fast pointers in O(n) time and O(1) space?	Dijkstra Algorithm	Floyd Cycle Finding Algorithm (Tortoise and Hare)	Kadane Algorithm	Kruskal Algorithm	B	1	4
45	5	In a circular singly linked list, what does the next pointer of the last node point to?	NULL	Head node	Previous node	A random node	B	1	5
46	5	What is the memory advantage of singly linked lists over doubly linked lists?	Singly linked lists store only one pointer per node instead of two	Singly linked lists do not store data	Singly linked lists reside in CPU cache only	There is no difference in memory	A	1	6
47	5	To delete a node given only a pointer to that node in a doubly linked list, the time complexity is:	O(n)	O(log n)	O(1)	O(n^2)	C	1	7
48	5	What condition indicates an empty singly linked list?	head->next == nullptr	head == nullptr	tail == head	head->data == 0	B	1	8
49	5	What happens if you delete a node in C++ without calling delete/free on its heap memory pointer?	Segmentation fault immediately	Memory leak	Automatic garbage collection in C++	Data corruption in hard drive	B	2	9
50	5	Which data structure implementation is ideal for supporting Undo/Redo operations with previous and next navigation?	Singly Linked List	Doubly Linked List	Static Array	Circular Queue	B	2	10
51	6	Which principle governs the Stack data structure?	FIFO (First-In First-Out)	LIFO (Last-In First-Out)	Random Order	Priority Order	B	1	1
52	6	What is the time complexity of the push and pop operations on a stack?	O(n)	O(log n)	O(1)	O(n^2)	C	1	2
53	6	Attempting to pop an element from an empty stack results in:	Stack Overflow	Stack Underflow	Deadlock	Memory Leak	B	1	3
54	6	Which algorithm uses a stack to convert infix expressions to postfix format?	Dijkstra Shunting-Yard Algorithm	Prim Algorithm	Bellman-Ford Algorithm	KMP Algorithm	A	1	4
55	6	Evaluating the postfix expression "5 3 + 2 *" yields:	16	13	10	26	A	1	5
56	6	In recursive function execution, what does the CPU runtime use to manage function call frames?	Heap Memory	Call Stack	I/O Queue	Hash Table	B	1	6
57	6	Which problem is naturally solved using a stack for bracket matching?	Balanced Parentheses Verification	Minimum Spanning Tree	Single Source Shortest Path	Linear Search	A	1	7
58	6	In an array-based stack of capacity MAX, what condition indicates stack overflow during push?	top == 0	top == MAX - 1	top == -1	top == MAX / 2	B	1	8
59	6	What does the peek() / top() operation do in a stack?	Deletes the top element	Returns the top element without removing it	Clears all elements	Reverses the stack	B	2	9
60	6	How can a queue be implemented using stacks with amortized O(1) operations?	Using a single stack and an array	Using two stacks (inbox and outbox)	Stacks cannot implement queues	Using stack overflow exception handlers	B	2	10
61	7	In a standard queue, insertions occur at the _____ and deletions occur at the _____.	Front, Rear	Rear, Front	Top, Bottom	Front, Front	B	1	1
62	7	What is the time complexity of enqueue and dequeue operations in an efficient queue?	O(n)	O(1)	O(log n)	O(n^2)	B	1	2
63	7	Why is a Circular Queue preferred over a simple linear array-based queue?	Circular queue uses half the memory	Prevents false overflow by reusing emptied front slots	Circular queue automatically sorts elements	Linear queues cannot store numbers	B	1	3
64	7	In a circular queue of capacity N, what formula advances the rear index on enqueue?	rear = rear + 1	rear = (rear + 1) % N	rear = (rear - 1) % N	rear = rear * 2	B	1	4
65	7	A Double-Ended Queue (Deque) allows insertions and deletions at:	Front end only	Rear end only	Both Front and Rear ends	Middle index only	C	1	5
66	7	Which graph traversal algorithm fundamentally relies on a queue?	Depth-First Search (DFS)	Breadth-First Search (BFS)	Topological Sort using DFS	Binary Search	B	1	6
67	7	What happens when dequeue() is called on an empty queue?	Queue Overflow	Queue Underflow	Memory segmentation	Automatic enqueue of 0	B	1	7
68	7	Which OS process scheduling algorithm uses a circular queue to allocate equal time slices?	First-Come First-Served (FCFS)	Round-Robin Scheduling	Shortest Job First (SJF)	Priority Preemptive	B	1	8
69	7	In a priority queue, elements are dequeued according to:	Order of arrival only	Assigned priority value	Memory address value	Random selection	B	2	9
70	7	If elements A, B, C are enqueued in order into a FIFO queue, what is the output sequence when dequeued?	C, B, A	A, B, C	B, A, C	C, A, B	B	2	10
71	8	What is the base case in a recursive algorithm?	The condition that causes the function to call itself again	The terminating condition that returns a value without making further recursive calls	The initial value passed by the main function	The maximum stack depth allowed by OS	B	1	1
72	8	What runtime error is triggered when a recursive function enters infinite recursion?	Stack Overflow Exception	Heap Out of Memory	Null Pointer Dereference	Divide by Zero	A	1	2
73	8	What is Tail Recursion?	A recursive call where the function calls itself at the very end with no pending operations	A function that calls two subfunctions	A recursion that counts down to zero	A recursion with no base case	A	1	3
74	8	Why is tail call optimization (TCO) beneficial in compilers?	It prevents all compiler warnings	It reuses the current stack frame instead of allocating a new one, avoiding stack overflow	It speeds up disk I/O	It converts code to assembly directly	B	1	4
75	8	What is the time complexity of the naive recursive Fibonacci function Fib(n) = Fib(n-1) + Fib(n-2)?	O(n)	O(n log n)	O(2^n)	O(n^2)	C	1	5
76	8	How can naive recursive Fibonacci be optimized to run in O(n) linear time?	By adding another recursive branch	By using Memoization / Dynamic Programming	By increasing CPU clock rate	By compiling without optimization flags	B	1	6
77	8	In the Tower of Hanoi problem with n disks, how many minimum moves are required?	2n	n^2	2^n - 1	n!	C	1	7
78	8	What is the auxiliary space complexity of calculating n! recursively?	O(1)	O(n) due to recursive call stack frames	O(n^2)	O(log n)	B	1	8
79	8	Which algorithm design technique solves problems by dividing into smaller subproblems, solving recursively, and combining results?	Greedy Approach	Divide and Conquer	Linear Probing	Heuristic Hill Climbing	B	2	9
80	8	What is the solution to the recurrence relation T(n) = 2T(n/2) + O(n) by Master Theorem?	O(n)	O(n log n)	O(n^2)	O(2^n)	B	2	10
81	9	What is the worst-case time complexity of Linear Search in an array of size n?	O(1)	O(log n)	O(n)	O(n^2)	C	1	1
82	9	What is the best-case time complexity of Linear Search?	O(1) when target is at index 0	O(log n)	O(n)	O(0)	A	1	2
83	9	What is the worst-case time complexity of Binary Search in a sorted array of size n?	O(1)	O(log n)	O(n)	O(n log n)	B	1	3
84	9	How many comparisons at most does Binary Search make on a sorted array of 1024 elements?	10	11	512	1024	B	1	4
85	9	Why is mid = low + (high - low) / 2 preferred over mid = (low + high) / 2 in Binary Search?	It avoids potential integer overflow bug when low + high exceeds INT_MAX	It executes twice as fast	It supports floating point arrays	It sorts the array automatically	A	1	5
86	9	What is the space complexity of iterative Binary Search?	O(n)	O(log n)	O(1)	O(n^2)	C	1	6
87	9	What is the space complexity of recursive Binary Search on an array of size n?	O(1)	O(log n) stack space	O(n)	O(n log n)	B	1	7
88	9	Ternary Search divides the search space into how many equal parts at each step?	2	3	4	n	B	1	8
89	9	What condition must hold to apply Binary Search on an answer/search space for optimization problems?	The function must be non-linear	The decision space must be monotonic (e.g. TTTTFFFF)	The input numbers must be prime	The array must contain negative numbers	B	2	9
90	9	In an array sorted in descending order, if target < arr[mid], which half should be searched?	Left half (low to mid - 1)	Right half (mid + 1 to high)	Both halves simultaneously	Stop searching	B	2	10
91	10	What does it mean for a sorting algorithm to be Stable?	It uses O(1) auxiliary space	It preserves the relative order of duplicate elements with equal keys	It never runs in O(n^2) time	It uses multithreading	B	1	1
92	10	What is the worst-case time complexity of Selection Sort?	O(n)	O(n log n)	O(n^2)	O(log n)	C	1	2
93	10	What is the best-case time complexity of Bubble Sort when optimized with a swapped boolean flag?	O(1)	O(n)	O(n log n)	O(n^2)	B	1	3
94	10	Which sorting algorithm inserts elements one by one into an already sorted prefix partition?	Bubble Sort	Insertion Sort	Quick Sort	Heap Sort	B	1	4
95	10	What is the average and worst-case time complexity of Merge Sort?	O(n log n) in both average and worst case	O(n^2) worst case	O(n) best case and O(n^3) worst case	O(log n)	A	1	5
96	10	Why is standard Quick Sort not a stable sorting algorithm?	It uses recursion	Swapping during partition can reorder duplicate elements across the pivot	It requires O(n) extra space	Pivots are selected randomly	B	1	6
97	10	What is the theoretical lower bound on comparisons for any comparison-based sorting algorithm in the worst case?	Ω(n)	Ω(n log n)	Ω(n^2)	Ω(log n)	B	1	7
98	10	Which sorting algorithm achieves O(n + k) linear time complexity for keys in range 0 to k?	Counting Sort	Merge Sort	Quick Sort	Insertion Sort	A	1	8
99	10	What pivot selection technique mitigates Quick Sort worst-case O(n^2) degradation on sorted inputs?	Always picking index 0	Median-of-three or Randomized pivot selection	Picking the largest element	Picking index n - 1	B	2	9
100	10	Which sorting algorithm has worst-case O(n log n) time and O(1) auxiliary space?	Merge Sort	Heap Sort	Quick Sort	Counting Sort	B	2	10
101	11	What is a Hash Function?	A sorting algorithm	A mathematical function that converts key data into a fixed-size integer table index	A compression tool for images	A hardware timer	B	1	1
102	11	What is the average time complexity of insertion, deletion, and lookup in a Hash Table?	O(1)	O(log n)	O(n)	O(n^2)	A	1	2
103	11	A Hash Collision occurs when:	Two identical keys have different values	Two distinct keys produce identical hash indices	The hash table becomes completely empty	The memory runs out of space	B	1	3
104	11	In Separate Chaining, how are colliding entries handled?	Stored in a linked list attached to the bucket	Stored in the next empty array slot	The previous entry is overwritten	The hash table is resized immediately	A	1	4
105	11	What collision resolution technique probes indices linearly using (h(k) + i) mod m?	Quadratic Probing	Linear Probing	Double Hashing	Separate Chaining	B	1	5
106	11	What is the Load Factor (α) of a hash table with n elements and m buckets?	α = m / n	α = n / m	α = n * m	α = n^2 / m	B	1	6
107	11	What problem occurs in Linear Probing when long contiguous blocks of occupied slots form?	Primary Clustering	Secondary Clustering	Stack Overflow	Deadlock	A	1	7
108	11	What is the purpose of dynamic Rehashing when the load factor exceeds a threshold (e.g. 0.75)?	To compress the table size	To allocate a larger table (usually 2x) and recompute hashes to maintain O(1) efficiency	To sort all table keys	To convert keys to strings	B	1	8
109	11	What is the worst-case time complexity of searching in a hash table when all n keys collide into a single bucket?	O(1)	O(log n)	O(n)	O(n^2)	C	2	9
110	11	In Double Hashing, the probing formula uses:	h(k, i) = (h1(k) + i * h2(k)) mod m	h(k, i) = (h1(k) + i^2) mod m	h(k, i) = (h1(k) + 1) mod m	h(k, i) = h1(k) * h2(k)	A	2	10
111	12	What is the maximum number of children a node can have in a Binary Tree?	1	2	3	Unlimited	B	1	1
112	12	A binary tree where every node has either 0 or 2 children is called a:	Full Binary Tree	Perfect Binary Tree	Complete Binary Tree	Degenerate Tree	A	1	2
113	12	In which tree traversal are nodes visited in order: Left subtree -> Root -> Right subtree?	Pre-order	In-order	Post-order	Level-order	B	1	3
114	12	What is the height of a tree with a single root node only?	0 (or 1 depending on convention)	-1	Infinity	Undefined	A	1	4
115	12	In a binary tree, what is the post-order traversal sequence for visiting nodes?	Root -> Left -> Right	Left -> Right -> Root	Left -> Root -> Right	Right -> Root -> Left	B	1	5
116	12	Which traversal visits all nodes at depth d before moving to depth d+1?	Pre-order	Level-order traversal (BFS)	Post-order	In-order	B	1	6
117	12	What is the total number of edges in any valid tree having N vertices?	N	N - 1	N + 1	2N	B	1	7
118	12	A node with zero children in a tree is called a:	Internal node	Root node	Leaf node (or Terminal node)	Ancestor node	C	1	8
119	12	What is the time complexity of visiting all N nodes in a binary tree traversal?	O(log N)	O(N)	O(N^2)	O(1)	B	2	9
120	12	What is the maximum number of nodes in a Perfect Binary Tree of height h (root at h=0)?	2^h	2^(h+1) - 1	2*h	h^2	B	2	10
121	13	In a Binary Search Tree (BST), what is true for every node X?	Left subtree keys < X.key and Right subtree keys > X.key	Left subtree keys > X.key	All keys are equal	Nodes have at least 3 children	A	1	1
122	13	Which traversal of a BST produces elements in strictly ascending sorted order?	Pre-order	In-order	Post-order	Level-order	B	1	2
123	13	What is the worst-case time complexity of searching in an unbalanced / skewed BST with N nodes?	O(1)	O(log N)	O(N)	O(N log N)	C	1	3
124	13	What is the average time complexity of insertion and search in a balanced BST?	O(1)	O(log N)	O(N)	O(N^2)	B	1	4
125	13	When deleting a node with two children from a BST, which node replaces it?	The root node	In-order Successor (or In-order Predecessor)	A random leaf node	Its parent node	B	1	5
126	13	Where is the in-order successor of a node located in a BST if its right subtree is non-empty?	The leftmost node in its right subtree	The rightmost node in its left subtree	Its parent node	The root node	A	1	6
127	13	Which self-balancing binary search tree maintains a balance factor of -1, 0, or +1 for every node?	Red-Black Tree	AVL Tree	B-Tree	Splay Tree	B	1	7
128	13	What is the maximum allowed height difference between left and right subtrees in an AVL tree?	0	1	2	3	B	1	8
129	13	What rotation is performed in an AVL tree to balance a Left-Right (LR) heavy subtree?	Single Left rotation	Left rotation on left child, then Right rotation on root	Right rotation on right child, then Left rotation on root	Single Right rotation	B	2	9
130	13	In a Red-Black tree, what color is the root node guaranteed to be?	Red	Black	Blue	Either Red or Black	B	2	10
131	14	What property defines a Max-Heap?	Parent node key >= children node keys, and root holds maximum element	Parent node key <= children node keys	All leaves have equal values	Left child is always greater than right child	A	1	1
132	14	A Binary Heap is structured as what type of binary tree?	Degenerate Tree	Complete Binary Tree	Full Binary Tree with odd height	BST	B	1	2
133	14	In a 0-indexed array representation of a binary heap, the left child of node i is at:	2i	2i + 1	2i + 2	i / 2	B	1	3
134	14	In a 0-indexed array binary heap, the parent of node i is located at:	floor((i - 1) / 2)	2i	i - 1	i + 1	A	1	4
135	14	What is the time complexity to extract the maximum element (root) from a Max-Heap with N elements?	O(1)	O(log N)	O(N)	O(N log N)	B	1	5
136	14	What is the time complexity of the Build-Heap operation on an unsorted array of size N?	O(1)	O(log N)	O(N)	O(N log N)	C	1	6
137	14	What is the total time complexity of Heap Sort on an array of size N?	O(N)	O(N log N)	O(N^2)	O(log N)	B	1	7
138	14	Which data structure is most efficiently used to implement a Priority Queue ADT?	Unsorted Array	Binary Heap	Singly Linked List	Stack	B	1	8
139	14	What is the time complexity to insert a new element into a binary heap of size N?	O(1)	O(log N)	O(N)	O(N^2)	B	2	9
140	14	In Huffman Coding for data compression, which data structure extracts the two lowest frequency trees iteratively?	Stack	Min-Heap (Priority Queue)	Circular Queue	Hash Table	B	2	10
141	15	What is the space complexity of an Adjacency Matrix representation for a graph with V vertices?	O(V)	O(V + E)	O(V^2)	O(E^2)	C	1	1
142	15	What is the space complexity of an Adjacency List representation for a graph G = (V, E)?	O(V^2)	O(V + E)	O(E^2)	O(V * E)	B	1	2
143	15	Which data structure is used in Breadth-First Search (BFS) graph traversal?	Stack	Queue	Min-Heap	Priority Queue	B	1	3
144	15	Which data structure or paradigm is used in Depth-First Search (DFS) graph traversal?	Queue	Stack / System Recursion	Circular Buffer	Hash Map	B	1	4
145	15	What is the time complexity of BFS or DFS on a graph represented using adjacency lists?	O(V)	O(V + E)	O(V * E)	O(V^2)	B	1	5
146	15	Topological Sorting can only be performed on which type of graph?	Undirected Graph	Directed Acyclic Graph (DAG)	Complete Graph	Cyclic Graph with negative weights	B	1	6
147	15	What is the time complexity of Dijkstra single-source shortest path algorithm using a Min-Heap?	O(V^2)	O((V + E) log V)	O(V * E)	O(E^2)	B	1	7
148	15	Which algorithm detects negative weight cycles in a directed graph?	Dijkstra Algorithm	Bellman-Ford Algorithm	Prim Algorithm	Kruskal Algorithm	B	1	8
149	15	Kruskal algorithm finds the Minimum Spanning Tree (MST) using which auxiliary data structure?	Stack	Disjoint Set Union (Union-Find)	Binary Search Tree	Circular Queue	B	2	9
150	15	What is the maximum number of edges in a simple undirected graph with V vertices?	V	V - 1	V(V - 1) / 2	V^2	C	2	10
151	16	What is the core principle of a Greedy Algorithm?	Backtracking through all possible combinations	Making the locally optimal choice at each step hoping for global optimum	Breaking problem into overlapping subproblems with memoization	Brute force search	B	1	1
152	16	In the Activity Selection problem, how should activities be sorted for the greedy choice?	By start time ascending	By finish time ascending	By duration descending	By activity ID	B	1	2
153	16	What is the time complexity of solving Activity Selection with N activities (including sorting)?	O(N)	O(N log N)	O(N^2)	O(2^N)	B	1	3
154	16	In the Fractional Knapsack problem, items are sorted by which ratio?	Weight / Value	Value / Weight (vi / wi)	Total Value only	Total Weight only	B	1	4
155	16	Why does the Greedy approach solve Fractional Knapsack but fail on 0/1 Knapsack?	0/1 Knapsack requires taking entire items without fractions, creating non-greedy substructure	0/1 Knapsack has no weights	Fractional Knapsack cannot be sorted	Greedy algorithms only work on graphs	A	1	5
156	16	Which Minimum Spanning Tree algorithm grows a tree vertex by vertex starting from an arbitrary root?	Kruskal Algorithm	Prim Algorithm	Dijkstra Algorithm	Floyd-Warshall	B	1	6
157	16	Which Minimum Spanning Tree algorithm sorts all edges by weight and adds edges if they do not create a cycle?	Prim Algorithm	Kruskal Algorithm	Bellman-Ford	KMP Algorithm	B	1	7
158	16	In Huffman Coding, what type of codes are generated to ensure no code is a prefix of another?	Prefix Codes (Prefix-Free)	Suffix Codes	Cyclic Codes	Gray Codes	A	1	8
159	16	What two properties are essential for a problem to be solvable by a Greedy Algorithm?	Greedy Choice Property and Optimal Substructure	Overlapping Subproblems and Exhaustive Search	Recursion and Stack Overflow	Memoization and Tabulation	A	2	9
160	16	In Job Sequencing with Deadlines and Profits, sorting jobs by decreasing profit yields which overall time complexity?	O(N^2) or O(N log N with Disjoint Set)	O(N)	O(2^N)	O(N!)	A	2	10
161	17	What two essential properties must a problem exhibit to be effectively solved by Dynamic Programming?	Overlapping Subproblems and Optimal Substructure	Greedy Choice and Constant Time	Linearity and Symmetry	Non-recursive loops and Array sorting	A	1	1
162	17	What is the Memoization approach in Dynamic Programming?	Top-Down recursive approach storing computed subproblem results in a table / cache	Bottom-Up iterative table filling	Greedy choice selection	Randomized sampling	A	1	2
163	17	What is the Tabulation approach in Dynamic Programming?	Top-Down recursion with caching	Bottom-Up iterative approach building solutions from base cases up to N	Divide and conquer without caching	Depth First Search	B	1	3
164	17	What is the time complexity of solving the 0/1 Knapsack problem with N items and capacity W using DP?	O(2^N)	O(N * W)	O(N + W)	O(N^2 * W)	B	1	4
165	17	What is the time complexity of finding the Longest Common Subsequence (LCS) of two strings of lengths m and n using DP?	O(m + n)	O(m * n)	O(2^(m+n))	O(m^2 * n^2)	B	1	5
166	17	What is the time complexity of the Matrix Chain Multiplication problem with N matrices using DP?	O(N)	O(N^2)	O(N^3)	O(2^N)	C	1	6
167	17	In the Coin Change Problem (minimum coins to make amount A with N coin types), what is the DP time complexity?	O(N * A)	O(2^N)	O(N + A)	O(A^2)	A	1	7
168	17	How can the space complexity of the Tabulation DP Fibonacci algorithm be optimized to O(1)?	By keeping only the two most recent values (prev1, prev2)	By running recursion in parallel	By sorting the numbers	By increasing memory cache	A	1	8
169	17	What is the recurrence relation for the Longest Common Subsequence DP[i][j] when text1[i-1] == text2[j-1]?	DP[i][j] = 1 + DP[i-1][j-1]	DP[i][j] = max(DP[i-1][j], DP[i][j-1])	DP[i][j] = DP[i-1][j-1] * 2	DP[i][j] = 0	A	2	9
170	17	Which shortest path algorithm uses Dynamic Programming to find all-pairs shortest paths in O(V^3) time?	Dijkstra Algorithm	Floyd-Warshall Algorithm	Prim Algorithm	Kruskal Algorithm	B	2	10
\.


--
-- Data for Name: subtopics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subtopics (subtopic_id, topic_id, title, order_index, is_published) FROM stdin;
1	1	Introduction to Data Structures and Algorithms	1	t
3	1	Arrays	3	t
4	1	Strings	4	t
5	1	Linked Lists	5	t
6	1	Stacks	6	t
7	1	Queues	7	t
8	1	Recursion	8	t
9	1	Searching Algorithms	9	t
10	1	Sorting Algorithms	10	t
11	1	Hashing	11	t
12	1	Trees	12	t
13	1	Binary Search Trees	13	t
14	1	Heaps and Priority Queues	14	t
15	1	Graphs	15	t
16	1	Greedy Algorithms	16	t
17	1	Dynamic Programming	17	t
2	1	Complexity Analysis	2	t
\.


--
-- Data for Name: tca_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tca_questions (tca_question_id, tca_id, problem_statement, constraints, sample_input, sample_output, marks, order_index, title) FROM stdin;
1	1	Given an integer array of size N, find and print the maximum element present in the array.\n\nInput Format:\n- The first line contains an integer N, the number of elements.\n- The second line contains N space-separated integers.\n\nOutput Format:\n- Print a single integer representing the maximum value.	1 <= N <= 10^5\n-10^9 <= A[i] <= 10^9	5\n2 7 1 9 4	9	10	1	Maximum Element in Array
2	1	Given a string S containing lowercase alphanumeric characters, determine if it is a palindrome (reads the same backward as forward).\n\nInput Format:\n- A single string S.\n\nOutput Format:\n- Print "YES" if S is a palindrome, otherwise print "NO".	1 <= |S| <= 10^5\nS contains only lowercase letters.	racecar	YES	10	2	Valid Palindrome String
3	1	Given a string containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n\nOutput Format:\n- Print "VALID" if the string is valid, or "INVALID" otherwise.	1 <= |S| <= 10^4	{[()]}	VALID	10	3	Valid Parentheses
4	1	Given a sorted integer array of size N and a target value K, find the 0-based index of K using Binary Search. If K is not present in the array, print -1.\n\nInput Format:\n- First line: Integer N\n- Second line: N space-separated sorted integers\n- Third line: Integer K (target)\n\nOutput Format:\n- 0-based index of target or -1.	1 <= N <= 10^5\n-10^9 <= A[i], K <= 10^9	6\n1 3 5 7 9 11\n7	3	10	4	Search in Sorted Array
5	1	You are climbing a staircase with N steps. Each time you can either climb 1 step or 2 steps. Calculate how many distinct ways you can climb to the top.\n\nInput Format:\n- Single integer N.\n\nOutput Format:\n- Print the total number of distinct ways.	1 <= N <= 45	3	3	10	5	Climbing Stairs DP
\.


--
-- Data for Name: tca_test_cases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tca_test_cases (tca_testcase_id, tca_question_id, input, expected_output, is_hidden, order_index) FROM stdin;
1	1	5\n2 7 1 9 4	9	f	1
2	1	1\n42	42	f	2
3	1	4\n-10 -5 -20 -1	-1	t	3
4	1	6\n100 200 500 50 25 500	500	t	4
5	2	racecar	YES	f	1
6	2	hello	NO	f	2
7	2	a	YES	t	3
8	2	abccba	YES	t	4
9	2	abcbcd	NO	t	5
10	3	{[()]}	VALID	f	1
11	3	([)]	INVALID	f	2
12	3	()	VALID	t	3
13	3	(((((	INVALID	t	4
14	3	()[]{}	VALID	t	5
15	4	6\n1 3 5 7 9 11\n7	3	f	1
16	4	5\n2 4 6 8 10\n5	-1	f	2
17	4	1\n100\n100	0	t	3
18	4	7\n-20 -10 -5 0 5 10 20\n-5	2	t	4
19	5	3	3	f	1
20	5	2	2	f	2
21	5	1	1	t	3
22	5	5	8	t	4
23	5	10	89	t	5
\.


--
-- Data for Name: topic_coding_assessment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topic_coding_assessment (tca_id, topic_id, title, description, total_marks, time_limit) FROM stdin;
1	1	Data Structures & Algorithms — Final Comprehensive Coding Assessment	Demonstrate your comprehensive coding mastery across fundamental data structures, algorithms, search techniques, tree structures, and dynamic programming.	50	60
\.


--
-- Data for Name: topic_feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topic_feedback (feedback_id, student_id, topic_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: topic_video_references; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topic_video_references (video_id, topic_id, title, channel_name, url, description, order_index, created_at) FROM stdin;
1	6	Introduction to Data Structures & Algorithms | Complete Course Overview	take U forward	https://www.youtube.com/watch?v=EAR7De6Gzb4	Comprehensive introduction to DSA, problem solving approach, and roadmap by Striver.	1	2026-10-20 17:07:41.606612
2	6	Introduction to Data Structures and Algorithms in C++ / Java	Apna College	https://www.youtube.com/watch?v=z9bZufPHFLU	What are Data Structures & Algorithms, why they are essential, and course overview.	2	2026-10-20 17:07:41.61101
3	7	Time and Space Complexity Analysis | Big O, Omega, Theta Notations	take U forward	https://www.youtube.com/watch?v=FPu9Uld7W-E	Detailed breakdown of Big-O asymptotic notations, worst-case, best-case, and space complexity calculations.	1	2026-10-20 17:07:41.61202
4	7	Time & Space Complexity Explained with Real Code Examples	Apna College	https://www.youtube.com/watch?v=V42FBiohc6c	Calculating Big O complexity of loops, nested loops, and recursive calls.	2	2026-10-20 17:07:41.612897
5	2	Arrays in Data Structures | Memory Representation & Core Operations	take U forward	https://www.youtube.com/watch?v=37E9ckMDdTk	Array memory layout, contiguous allocation, insertion, deletion, and two-pointer patterns.	1	2026-10-20 17:07:41.615209
6	2	Introduction to Arrays | Linear Search & Dynamic Arrays	Apna College	https://www.youtube.com/watch?v=NvybaDeq560	Basics of 1D and 2D arrays, traversals, and common array algorithmic problems.	2	2026-10-20 17:07:41.616552
7	3	Strings in DSA | Character Arrays, ASCII, & Substrings	take U forward	https://www.youtube.com/watch?v=WcxL33aB20M	String manipulation, palindromes, anagrams, character frequency counting, and string matching.	1	2026-10-20 17:07:41.617456
8	3	Strings & String Functions in C++ / Java	Apna College	https://www.youtube.com/watch?v=W8hPsBquD6Y	String operations, immutability concepts, and essential string algorithms.	2	2026-10-20 17:07:41.61829
9	4	Introduction to Linked List | Singly, Doubly, & Circular	take U forward	https://www.youtube.com/watch?v=Nq7ok-OyEpg	Pointer manipulation, node representation, node insertion, deletion, and reversal of linked lists.	1	2026-10-20 17:07:41.618957
10	4	Linked List in One Video | Complete Implementation & Traversal	Apna College	https://www.youtube.com/watch?v=oAja8-Ulz6o	Head/tail pointer tracking, memory allocation vs arrays, and edge cases in linked lists.	2	2026-10-20 17:07:41.619669
11	8	Introduction to Stack Data Structure | LIFO Principle & Array Implementation	take U forward	https://www.youtube.com/watch?v=GYptUgnIM_I	Push, pop, peek operations, stack overflow/underflow, and balanced parentheses evaluation.	1	2026-10-20 17:07:41.620327
12	8	Stack Data Structure | Applications & Expression Evaluation	Apna College	https://www.youtube.com/watch?v=7m1DMYAbdcY	Infix to postfix conversion, monotonic stacks, and recursive function call stack modeling.	2	2026-10-20 17:07:41.620961
13	9	Introduction to Queue Data Structure | FIFO Principle & Circular Queue	take U forward	https://www.youtube.com/watch?v=M6GnoUVHzCQ	Enqueue, dequeue, front, rear pointers, and circular queue array wrap-around.	1	2026-10-20 17:07:41.62156
14	9	Queue Implementation using Arrays and Linked Lists	Apna College	https://www.youtube.com/watch?v=va_0gYg_yFE	FIFO queuing, double-ended queues (deque), and scheduling queue use cases.	2	2026-10-20 17:07:41.622196
15	10	Recursion Masterclass | Base Cases, Call Stacks, & Tree Visualization	take U forward	https://www.youtube.com/watch?v=yVdKa8dnKiE	Understanding recursive calls, base condition termination, stack frames, and backtracking principles.	1	2026-10-20 17:07:41.62424
16	10	Recursion in One Shot | Concepts, Factorial, Fibonacci, & Subsets	Apna College	https://www.youtube.com/watch?v=5Boqfjissv0	Divide and conquer recursion, recurrence relations, and call stack visualization.	2	2026-10-20 17:07:41.625555
17	11	Binary Search Algorithm | Iterative & Recursive Approaches	take U forward	https://www.youtube.com/watch?v=MHf6a_kq3-A	Binary search on sorted arrays, lower bound, upper bound, and search space reduction.	1	2026-10-20 17:07:41.626057
18	11	Linear Search and Binary Search Explained with Complexity	Apna College	https://www.youtube.com/watch?v=246V51AWwZ8	Comparison of O(N) linear search vs O(log N) binary search and sorted array search invariants.	2	2026-10-20 17:07:41.626503
19	12	Sorting Algorithms Masterclass | Merge Sort, Quick Sort, Bubble Sort	take U forward	https://www.youtube.com/watch?v=HGk_ypEuS24	Comparison of Bubble, Selection, Insertion, Merge Sort (O(N log N)), and Quick Sort partitioning.	1	2026-10-20 17:07:41.626911
20	12	Merge Sort and Quick Sort Algorithms | Detailed Tracing	Apna College	https://www.youtube.com/watch?v=ogjf7ORKfd8	Divide and conquer sorting, stability, in-place sorting tradeoffs, and worst-case scenarios.	2	2026-10-20 17:07:41.627333
21	13	Hashing Masterclass | Hash Functions, Collision Resolution, & HashMaps	take U forward	https://www.youtube.com/watch?v=KEs5UyBJ39g	Direct address tables, hash collisions, chaining, open addressing, and average O(1) lookups.	1	2026-10-20 17:07:41.627863
22	13	Hashing Explained | Hash Sets and Hash Maps in Practice	Apna College	https://www.youtube.com/watch?v=2Tz8iPzXjcw	Frequency maps, two-sum problem using hash maps, and hash set uniqueness.	2	2026-10-20 17:07:41.628442
23	14	Binary Tree Traversal | Inorder, Preorder, Postorder, Level Order	take U forward	https://www.youtube.com/watch?v=jmy0LaGET1I	Binary tree representation, recursive and iterative traversals, height, and depth properties.	1	2026-10-20 17:07:41.628898
24	14	Binary Trees Full Course | Construction, Leaf Nodes, & Subtrees	Apna College	https://www.youtube.com/watch?v=-DzowlcaUmE	Tree data structures, properties of binary trees, and common tree algorithms.	2	2026-10-20 17:07:41.629339
25	15	Binary Search Trees (BST) | Search, Insert, and Delete Operations	take U forward	https://www.youtube.com/watch?v=p7-9UvDQZ3w	BST property, inorder traversal yielding sorted order, predecessor, and successor nodes.	1	2026-10-20 17:07:41.629826
26	15	Binary Search Tree Complete Tutorial | BST Validation & Deletion	Apna College	https://www.youtube.com/watch?v=qAEt78356d8	Searching in BST with O(h) complexity, balance considerations, and deletion edge cases.	2	2026-10-20 17:07:41.630788
27	16	Min Heap & Max Heap Data Structure | Heapify & Priority Queue	take U forward	https://www.youtube.com/watch?v=HqPJF2L5h9U	Complete binary tree array representation, parent/child indices, heapify, and heap sort.	1	2026-10-20 17:07:41.632033
28	16	Priority Queues & Heaps | Implementation & Applications	Apna College	https://www.youtube.com/watch?v=ywx-Onrdx4U	Min-heap vs max-heap, priority scheduling, and top-k frequent elements pattern.	2	2026-10-20 17:07:41.632444
29	17	Graph Data Structure & Representation | Adjacency Matrix vs List	take U forward	https://www.youtube.com/watch?v=M3_pLsDdeuU	Directed/undirected graphs, weighted edges, Breadth-First Search (BFS), and Depth-First Search (DFS).	1	2026-10-20 17:07:41.633097
30	17	Graphs in One Shot | BFS, DFS, Dijkstra, & Cycle Detection	Apna College	https://www.youtube.com/watch?v=59fUtYYz7ZU	Graph traversals, shortest path algorithms, topological sorting, and bipartite graphs.	2	2026-10-20 17:07:41.633695
31	18	Greedy Algorithms Masterclass | Fractional Knapsack, Activity Selection	take U forward	https://www.youtube.com/watch?v=1bCwdq41p8c	Locally optimal choice paradigms, greedy choice property, and proving greedy correctness.	1	2026-10-20 17:07:41.634248
32	18	Greedy Approach | Job Sequencing & Minimum Spanning Trees	Apna College	https://www.youtube.com/watch?v=bC7o8PgySsA	Standard greedy problems, interval scheduling, coin change, and Huffman coding.	2	2026-10-20 17:07:41.634821
33	19	Dynamic Programming Introduction | Memoization vs Tabulation	take U forward	https://www.youtube.com/watch?v=tyB0ztf0DNY	Overlapping subproblems, optimal substructure, top-down recursion with memoization vs bottom-up DP table.	1	2026-10-20 17:07:41.636512
34	19	Dynamic Programming in One Shot | 0/1 Knapsack, LCS, & Subset Sum	Apna College	https://www.youtube.com/watch?v=gva7_m05p40	State transition modeling, base cases, 1D and 2D DP table optimization, and space reduction.	2	2026-10-20 17:07:41.637004
35	1	Introduction to Data Structures & Algorithms | Complete Course Overview	take U forward	https://www.youtube.com/watch?v=EAR7De6Gzb4	Comprehensive introduction to DSA, problem solving approach, and roadmap by Striver.	1	2026-10-20 17:07:46.650577
36	1	Introduction to Data Structures and Algorithms in C++ / Java	Apna College	https://www.youtube.com/watch?v=z9bZufPHFLU	What are Data Structures & Algorithms, why they are essential, and course overview.	2	2026-10-20 17:07:46.650577
37	5	Introduction to Stack Data Structure | LIFO Principle & Array Implementation	take U forward	https://www.youtube.com/watch?v=GYptUgnIM_I	Push, pop, peek operations, stack overflow/underflow, and balanced parentheses evaluation.	1	2026-10-20 17:07:46.677254
38	5	Stack Data Structure | Applications & Expression Evaluation	Apna College	https://www.youtube.com/watch?v=7m1DMYAbdcY	Infix to postfix conversion, monotonic stacks, and recursive function call stack modeling.	2	2026-10-20 17:07:46.677254
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topics (topic_id, title, description, created_at) FROM stdin;
1	Data Structures and Algorithms	Comprehensive study of linear and non-linear data structures, algorithm analysis, searching, sorting, trees, graphs, greedy approaches, and dynamic programming.	2026-08-13 15:03:09.146343
2	Arrays	Contiguous memory linear data structures, indexing, traversal, two-pointer techniques, and element searching.	2026-10-15 11:10:59.613947
3	Strings	Character sequence manipulation, pattern searching, palindromes, anagrams, and ASCII transformations.	2026-10-15 11:10:59.618997
4	Linked Lists	Dynamic node structures, pointer references, singly and doubly linked lists, and node traversals.	2026-10-15 11:10:59.621753
5	Stacks and Queues	LIFO and FIFO abstract data types, expression evaluation, balancing brackets, and monotonic queues.	2026-10-15 11:10:59.623195
6	Introduction to Data Structures and Algorithms	Foundational concepts of data structures, abstract data types, memory representations, and fundamental algorithms.	2026-10-19 15:28:36.60893
7	Complexity Analysis	Asymptotic notations (Big O, Omega, Theta), time complexity, space complexity, and recurrence relation analysis.	2026-10-19 15:28:36.60893
8	Stacks	Last-In First-Out (LIFO) abstract data type, stack implementations, parentheses validation, and monotonic stacks.	2026-10-19 15:28:36.60893
9	Queues	First-In First-Out (FIFO) structures, circular queues, deques, priority queues, and sliding window buffers.	2026-10-19 15:28:36.60893
10	Recursion	Recursive function calls, base cases, call stacks, divide-and-conquer principles, and backtracking.	2026-10-19 15:28:36.60893
11	Searching Algorithms	Linear search, binary search on sorted collections, search space optimization, and ternary search.	2026-10-19 15:28:36.60893
12	Sorting Algorithms	Comparison-based sorting (Bubble, Insertion, Selection, Merge, Quick, Heap sort) and non-comparison sorting.	2026-10-19 15:28:36.60893
13	Hashing	Hash tables, hash functions, collision resolution (chaining, open addressing), and frequency counting.	2026-10-19 15:28:36.60893
14	Trees	Hierarchical data structures, binary trees, tree traversals (inorder, preorder, postorder, level-order), height, and diameter.	2026-10-19 15:28:36.60893
15	Binary Search Trees	Ordered binary trees, BST search, insertion, deletion, range queries, and BST property validation.	2026-10-19 15:28:36.60893
16	Heaps and Priority Queues	Min-heaps, max-heaps, heapify operations, priority queues, and Top-K elements optimization.	2026-10-19 15:28:36.60893
17	Graphs	Vertices and edges representations (adjacency matrix, list), BFS, DFS, cycle detection, connected components, and shortest paths.	2026-10-19 15:28:36.60893
18	Greedy Algorithms	Greedy choice property, interval scheduling, fractional knapsack, activity selection, and Huffman encoding.	2026-10-19 15:28:36.60893
19	Dynamic Programming	Overlapping subproblems, optimal substructure, memoization, tabulation, and standard DP optimizations.	2026-10-19 15:28:36.60893
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, name, email, password_hash, role, created_at, last_login, approval_status, rejection_reason, approval_decision_at, approval_decision_by) FROM stdin;
2	john doe	johdoes@wce.ac.im	$2b$12$j0noLC9zRxeAVRgO37ep/eU8yYzDeSxzfref3X6lQgNG84txvRvce	student	2026-08-09 13:40:03.709501	\N	approved	\N	\N	\N
3	abc	abc@gmail.com	$2b$12$8HiBBKc/zfqsRZFFPFuuLeMfE0mMIEKZIdT265u6yPh57LWN9tiw6	admin	2026-08-09 13:43:51.759763	2026-08-09 14:44:26.340823	approved	\N	\N	\N
9	Prof. Harish Patil	faculty@wcelab.ac.in	$2b$12$LJ3m4ys3Lgv1MBRFqh8cFeEGi9JGUZ5HsBVZN3BQHX.IuW8VKsXm6	faculty	2026-08-19 18:13:49.1639	\N	approved	\N	\N	\N
6	ADMINN	admin1@wcelab.ac.in	$2b$12$RxwjouP5tTOCDBA.uDr7Be.MP5rewroR4B9/jWCLhgN4hwxOpAeJm	admin	2026-08-13 13:32:02.963288	2026-08-13 13:34:35.17441	approved	\N	\N	\N
10	Harish Student	student@wcelab.ac.in	$2b$12$LJ3m4ys3Lgv1MBRFqh8cFeEGi9JGUZ5HsBVZN3BQHX.IuW8VKsXm6	student	2026-08-19 18:13:49.1639	\N	approved	\N	\N	\N
5	Teacher	teacher@wcelab.ac.in	$2b$12$JVsd4s/yRzV8CW4MtpxvyuoMtACo0XAkjrbBYE1zYpe2IDOJHLpdm	faculty	2026-08-09 14:46:52.765433	2026-10-19 20:45:11.970684	approved	\N	\N	\N
1	System Administrator	admin@wcelab.ac.in	$2b$12$KerV91nZB7Lw98urHSeA4eNHNlR814tottiY2tyIA2gdbsS3IVwAO	admin	2026-08-09 13:38:05.831556	2026-10-20 17:35:08.994115	approved	\N	\N	\N
4	Test Student	student1@wcelab.ac.in	$2b$12$Uv/LkT0T/Fm7ekkGfgaw2OCl2HVgxKV8TcZy.SrfP/MRfe.FhaRX2	student	2026-08-09 14:28:54.403639	2026-10-20 13:59:34.48956	approved	\N	\N	\N
7	Harish	harishprabhakaran90@gmail.com	$2b$12$7fUhfPZogOByNvA.Mm8HE.zMYfx8Ca295dj/5igorXDVb8STNzncS	admin	2026-08-19 17:54:04.956819	2026-10-20 14:05:59.950706	approved	\N	\N	\N
11	asd	student2@wcelab.ac.in	$2b$12$3nJyK4dHxchoBiRdDuuIfON7.9RmLZ1XZAPnJUD.9OZEiJC7MTWXG	student	2026-10-20 15:10:40.530589	2026-10-20 15:10:47.638073	approved	\N	\N	\N
12	Student Two Test	student2_test@wcelab.ac.in	dummyhash	student	2026-10-20 15:49:06.08481	\N	approved	\N	\N	\N
13	Outsider Student	outsider_student@wcelab.ac.in	dummyhash	student	2026-10-20 15:49:06.107951	\N	approved	\N	\N	\N
26	Workflow Test Student	student_wf_test@wce.ac.in	$2b$12$p.yDE7F.GzSt50yAkWexsOJmPmUj9cSd00X460lzSOVbBEo0Yd1vm	student	2026-10-20 17:35:08.097352	2026-10-20 17:35:09.481807	approved	\N	2026-10-20 17:35:09.027496	1
27	Prof. Workflow Faculty	faculty_wf_test@wce.ac.in	$2b$12$THbK/dvOQrIj/o9ngEtbw.kmsvHDP.8UvJoVAbUXg7S2RnIhN0KTq	faculty	2026-10-20 17:35:08.54422	2026-10-20 17:35:09.716141	approved	\N	2026-10-20 17:35:09.033598	1
28	Other Faculty	other_faculty_wf@wce.ac.in	$2b$12$Dqnz4kiFIdxFi4wOawsAEezhOE5vFfid6tx1q8phgnefPZjWIp.dO	faculty	2026-10-20 17:35:10.024932	2026-10-20 17:35:10.446977	approved	\N	2026-10-20 17:35:10.0379	1
29	Outside Student	outside_student_wf@wce.ac.in	$2b$12$mptvGsLdF/Err1T7m.7fx.8XsZ5GhBnZrjurpo/YqDDrPHX2QMqWW	student	2026-10-20 17:35:10.930574	2026-10-20 17:35:11.364194	approved	\N	2026-10-20 17:35:10.944375	1
\.


--
-- Name: assignment_questions_asg_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignment_questions_asg_question_id_seq', 1, false);


--
-- Name: assignment_test_cases_asg_testcase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignment_test_cases_asg_testcase_id_seq', 1, false);


--
-- Name: assignments_assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignments_assignment_id_seq', 1, false);


--
-- Name: coding_submissions_submission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coding_submissions_submission_id_seq', 6, true);


--
-- Name: faculty_faculty_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faculty_faculty_id_seq', 15, true);


--
-- Name: final_quiz_final_quiz_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.final_quiz_final_quiz_id_seq', 1, true);


--
-- Name: final_quiz_questions_fq_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.final_quiz_questions_fq_question_id_seq', 10, true);


--
-- Name: la_assessment_topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.la_assessment_topics_id_seq', 68, true);


--
-- Name: la_attempts_attempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.la_attempts_attempt_id_seq', 42, true);


--
-- Name: la_mcq_submissions_submission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.la_mcq_submissions_submission_id_seq', 6, true);


--
-- Name: la_question_submissions_submission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.la_question_submissions_submission_id_seq', 20, true);


--
-- Name: la_selected_mcqs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.la_selected_mcqs_id_seq', 19, true);


--
-- Name: la_selected_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.la_selected_questions_id_seq', 80, true);


--
-- Name: la_student_allocations_allocation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.la_student_allocations_allocation_id_seq', 138, true);


--
-- Name: la_student_mcq_allocations_allocation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.la_student_mcq_allocations_allocation_id_seq', 21, true);


--
-- Name: lab_assessment_lab_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lab_assessment_lab_id_seq', 48, true);


--
-- Name: lab_coding_questions_lab_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lab_coding_questions_lab_question_id_seq', 98, true);


--
-- Name: lab_mcq_questions_mcq_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lab_mcq_questions_mcq_id_seq', 85, true);


--
-- Name: lab_test_cases_lab_testcase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lab_test_cases_lab_testcase_id_seq', 406, true);


--
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_token_id_seq', 4, true);


--
-- Name: prerequisite_prereq_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prerequisite_prereq_id_seq', 1, true);


--
-- Name: prerequisite_quiz_prereq_quiz_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prerequisite_quiz_prereq_quiz_id_seq', 1, true);


--
-- Name: prerequisite_quiz_questions_pq_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prerequisite_quiz_questions_pq_question_id_seq', 10, true);


--
-- Name: progress_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.progress_progress_id_seq', 153, true);


--
-- Name: quiz_attempts_attempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quiz_attempts_attempt_id_seq', 17, true);


--
-- Name: room_topics_room_topic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.room_topics_room_topic_id_seq', 4, true);


--
-- Name: rooms_room_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rooms_room_id_seq', 13, true);


--
-- Name: student_rooms_student_room_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_rooms_student_room_id_seq', 16, true);


--
-- Name: student_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_student_id_seq', 22, true);


--
-- Name: subtopic_coding_assessment_scca_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subtopic_coding_assessment_scca_id_seq', 7, true);


--
-- Name: subtopic_coding_test_cases_scca_testcase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subtopic_coding_test_cases_scca_testcase_id_seq', 27, true);


--
-- Name: subtopic_content_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subtopic_content_content_id_seq', 17, true);


--
-- Name: subtopic_progress_subtopic_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subtopic_progress_subtopic_progress_id_seq', 128, true);


--
-- Name: subtopic_quiz_questions_stq_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subtopic_quiz_questions_stq_id_seq', 170, true);


--
-- Name: subtopics_subtopic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subtopics_subtopic_id_seq', 17, true);


--
-- Name: tca_questions_tca_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tca_questions_tca_question_id_seq', 5, true);


--
-- Name: tca_test_cases_tca_testcase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tca_test_cases_tca_testcase_id_seq', 23, true);


--
-- Name: topic_coding_assessment_tca_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.topic_coding_assessment_tca_id_seq', 1, true);


--
-- Name: topic_feedback_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.topic_feedback_feedback_id_seq', 3, true);


--
-- Name: topic_video_references_video_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.topic_video_references_video_id_seq', 41, true);


--
-- Name: topics_topic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.topics_topic_id_seq', 19, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 29, true);


--
-- Name: assignment_questions assignment_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_questions
    ADD CONSTRAINT assignment_questions_pkey PRIMARY KEY (asg_question_id);


--
-- Name: assignment_test_cases assignment_test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_test_cases
    ADD CONSTRAINT assignment_test_cases_pkey PRIMARY KEY (asg_testcase_id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (assignment_id);


--
-- Name: coding_submissions coding_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coding_submissions
    ADD CONSTRAINT coding_submissions_pkey PRIMARY KEY (submission_id);


--
-- Name: faculty faculty_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_pkey PRIMARY KEY (faculty_id);


--
-- Name: faculty faculty_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_user_id_key UNIQUE (user_id);


--
-- Name: final_quiz final_quiz_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_quiz
    ADD CONSTRAINT final_quiz_pkey PRIMARY KEY (final_quiz_id);


--
-- Name: final_quiz_questions final_quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_quiz_questions
    ADD CONSTRAINT final_quiz_questions_pkey PRIMARY KEY (fq_question_id);


--
-- Name: la_assessment_topics la_assessment_topics_lab_id_topic_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_assessment_topics
    ADD CONSTRAINT la_assessment_topics_lab_id_topic_id_key UNIQUE (lab_id, topic_id);


--
-- Name: la_assessment_topics la_assessment_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_assessment_topics
    ADD CONSTRAINT la_assessment_topics_pkey PRIMARY KEY (id);


--
-- Name: la_attempts la_attempts_lab_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_attempts
    ADD CONSTRAINT la_attempts_lab_id_student_id_key UNIQUE (lab_id, student_id);


--
-- Name: la_attempts la_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_attempts
    ADD CONSTRAINT la_attempts_pkey PRIMARY KEY (attempt_id);


--
-- Name: la_mcq_submissions la_mcq_submissions_attempt_id_mcq_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_mcq_submissions
    ADD CONSTRAINT la_mcq_submissions_attempt_id_mcq_id_key UNIQUE (attempt_id, mcq_id);


--
-- Name: la_mcq_submissions la_mcq_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_mcq_submissions
    ADD CONSTRAINT la_mcq_submissions_pkey PRIMARY KEY (submission_id);


--
-- Name: la_question_submissions la_question_submissions_attempt_id_lab_question_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_question_submissions
    ADD CONSTRAINT la_question_submissions_attempt_id_lab_question_id_key UNIQUE (attempt_id, lab_question_id);


--
-- Name: la_question_submissions la_question_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_question_submissions
    ADD CONSTRAINT la_question_submissions_pkey PRIMARY KEY (submission_id);


--
-- Name: la_selected_mcqs la_selected_mcqs_lab_id_mcq_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_selected_mcqs
    ADD CONSTRAINT la_selected_mcqs_lab_id_mcq_id_key UNIQUE (lab_id, mcq_id);


--
-- Name: la_selected_mcqs la_selected_mcqs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_selected_mcqs
    ADD CONSTRAINT la_selected_mcqs_pkey PRIMARY KEY (id);


--
-- Name: la_selected_questions la_selected_questions_lab_id_lab_question_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_selected_questions
    ADD CONSTRAINT la_selected_questions_lab_id_lab_question_id_key UNIQUE (lab_id, lab_question_id);


--
-- Name: la_selected_questions la_selected_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_selected_questions
    ADD CONSTRAINT la_selected_questions_pkey PRIMARY KEY (id);


--
-- Name: la_student_allocations la_student_allocations_lab_id_student_id_lab_question_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_student_allocations
    ADD CONSTRAINT la_student_allocations_lab_id_student_id_lab_question_id_key UNIQUE (lab_id, student_id, lab_question_id);


--
-- Name: la_student_allocations la_student_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_student_allocations
    ADD CONSTRAINT la_student_allocations_pkey PRIMARY KEY (allocation_id);


--
-- Name: la_student_mcq_allocations la_student_mcq_allocations_lab_id_student_id_mcq_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_student_mcq_allocations
    ADD CONSTRAINT la_student_mcq_allocations_lab_id_student_id_mcq_id_key UNIQUE (lab_id, student_id, mcq_id);


--
-- Name: la_student_mcq_allocations la_student_mcq_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_student_mcq_allocations
    ADD CONSTRAINT la_student_mcq_allocations_pkey PRIMARY KEY (allocation_id);


--
-- Name: lab_assessment lab_assessment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_assessment
    ADD CONSTRAINT lab_assessment_pkey PRIMARY KEY (lab_id);


--
-- Name: lab_coding_questions lab_coding_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_coding_questions
    ADD CONSTRAINT lab_coding_questions_pkey PRIMARY KEY (lab_question_id);


--
-- Name: lab_mcq_questions lab_mcq_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_mcq_questions
    ADD CONSTRAINT lab_mcq_questions_pkey PRIMARY KEY (mcq_id);


--
-- Name: lab_test_cases lab_test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_test_cases
    ADD CONSTRAINT lab_test_cases_pkey PRIMARY KEY (lab_testcase_id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (token_id);


--
-- Name: prerequisite prerequisite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prerequisite
    ADD CONSTRAINT prerequisite_pkey PRIMARY KEY (prereq_id);


--
-- Name: prerequisite_quiz prerequisite_quiz_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prerequisite_quiz
    ADD CONSTRAINT prerequisite_quiz_pkey PRIMARY KEY (prereq_quiz_id);


--
-- Name: prerequisite_quiz_questions prerequisite_quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prerequisite_quiz_questions
    ADD CONSTRAINT prerequisite_quiz_questions_pkey PRIMARY KEY (pq_question_id);


--
-- Name: progress progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_pkey PRIMARY KEY (progress_id);


--
-- Name: progress progress_student_id_topic_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_student_id_topic_id_key UNIQUE (student_id, topic_id);


--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (attempt_id);


--
-- Name: room_topics room_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_topics
    ADD CONSTRAINT room_topics_pkey PRIMARY KEY (room_topic_id);


--
-- Name: room_topics room_topics_room_id_topic_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_topics
    ADD CONSTRAINT room_topics_room_id_topic_id_key UNIQUE (room_id, topic_id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (room_id);


--
-- Name: rooms rooms_room_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_room_code_key UNIQUE (room_code);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: student student_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_pkey PRIMARY KEY (student_id);


--
-- Name: student student_roll_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_roll_number_key UNIQUE (roll_number);


--
-- Name: student_rooms student_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_rooms
    ADD CONSTRAINT student_rooms_pkey PRIMARY KEY (student_room_id);


--
-- Name: student_rooms student_rooms_student_id_room_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_rooms
    ADD CONSTRAINT student_rooms_student_id_room_id_key UNIQUE (student_id, room_id);


--
-- Name: student student_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_user_id_key UNIQUE (user_id);


--
-- Name: subtopic_coding_assessment subtopic_coding_assessment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_coding_assessment
    ADD CONSTRAINT subtopic_coding_assessment_pkey PRIMARY KEY (scca_id);


--
-- Name: subtopic_coding_test_cases subtopic_coding_test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_coding_test_cases
    ADD CONSTRAINT subtopic_coding_test_cases_pkey PRIMARY KEY (scca_testcase_id);


--
-- Name: subtopic_content subtopic_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_content
    ADD CONSTRAINT subtopic_content_pkey PRIMARY KEY (content_id);


--
-- Name: subtopic_progress subtopic_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_progress
    ADD CONSTRAINT subtopic_progress_pkey PRIMARY KEY (subtopic_progress_id);


--
-- Name: subtopic_progress subtopic_progress_student_id_subtopic_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_progress
    ADD CONSTRAINT subtopic_progress_student_id_subtopic_id_key UNIQUE (student_id, subtopic_id);


--
-- Name: subtopic_quiz_questions subtopic_quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_quiz_questions
    ADD CONSTRAINT subtopic_quiz_questions_pkey PRIMARY KEY (stq_id);


--
-- Name: subtopics subtopics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopics
    ADD CONSTRAINT subtopics_pkey PRIMARY KEY (subtopic_id);


--
-- Name: tca_questions tca_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tca_questions
    ADD CONSTRAINT tca_questions_pkey PRIMARY KEY (tca_question_id);


--
-- Name: tca_test_cases tca_test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tca_test_cases
    ADD CONSTRAINT tca_test_cases_pkey PRIMARY KEY (tca_testcase_id);


--
-- Name: topic_coding_assessment topic_coding_assessment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topic_coding_assessment
    ADD CONSTRAINT topic_coding_assessment_pkey PRIMARY KEY (tca_id);


--
-- Name: topic_feedback topic_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topic_feedback
    ADD CONSTRAINT topic_feedback_pkey PRIMARY KEY (feedback_id);


--
-- Name: topic_feedback topic_feedback_student_id_topic_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topic_feedback
    ADD CONSTRAINT topic_feedback_student_id_topic_id_key UNIQUE (student_id, topic_id);


--
-- Name: topic_video_references topic_video_references_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topic_video_references
    ADD CONSTRAINT topic_video_references_pkey PRIMARY KEY (video_id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (topic_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: idx_assignment_faculty; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_faculty ON public.assignments USING btree (faculty_id);


--
-- Name: idx_coding_submissions_ref; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coding_submissions_ref ON public.coding_submissions USING btree (assessment_type, assessment_ref_id);


--
-- Name: idx_coding_submissions_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coding_submissions_student ON public.coding_submissions USING btree (student_id);


--
-- Name: idx_content_subtopic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_content_subtopic ON public.subtopic_content USING btree (subtopic_id);


--
-- Name: idx_final_quiz_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_final_quiz_topic ON public.final_quiz USING btree (topic_id);


--
-- Name: idx_la_alloc_lab_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_la_alloc_lab_student ON public.la_student_allocations USING btree (lab_id, student_id);


--
-- Name: idx_la_attempts_lab_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_la_attempts_lab_student ON public.la_attempts USING btree (lab_id, student_id);


--
-- Name: idx_la_attempts_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_la_attempts_student ON public.la_attempts USING btree (student_id);


--
-- Name: idx_la_mcq_alloc_lab_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_la_mcq_alloc_lab_student ON public.la_student_mcq_allocations USING btree (lab_id, student_id);


--
-- Name: idx_la_mcq_alloc_mcq; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_la_mcq_alloc_mcq ON public.la_student_mcq_allocations USING btree (mcq_id);


--
-- Name: idx_la_mcq_sub_attempt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_la_mcq_sub_attempt ON public.la_mcq_submissions USING btree (attempt_id);


--
-- Name: idx_la_mcq_sub_mcq; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_la_mcq_sub_mcq ON public.la_mcq_submissions USING btree (mcq_id);


--
-- Name: idx_la_qsub_attempt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_la_qsub_attempt ON public.la_question_submissions USING btree (attempt_id);


--
-- Name: idx_la_sel_mcq_lab; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_la_sel_mcq_lab ON public.la_selected_mcqs USING btree (lab_id);


--
-- Name: idx_la_sel_mcq_mcq; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_la_sel_mcq_mcq ON public.la_selected_mcqs USING btree (mcq_id);


--
-- Name: idx_la_sel_q_lab; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_la_sel_q_lab ON public.la_selected_questions USING btree (lab_id);


--
-- Name: idx_la_sel_q_question; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_la_sel_q_question ON public.la_selected_questions USING btree (lab_question_id);


--
-- Name: idx_la_topics_lab; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_la_topics_lab ON public.la_assessment_topics USING btree (lab_id);


--
-- Name: idx_la_topics_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_la_topics_topic ON public.la_assessment_topics USING btree (topic_id);


--
-- Name: idx_lab_assessment_room; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lab_assessment_room ON public.lab_assessment USING btree (room_id);


--
-- Name: idx_lab_faculty; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lab_faculty ON public.lab_assessment USING btree (faculty_id);


--
-- Name: idx_lab_mcq_faculty; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lab_mcq_faculty ON public.lab_mcq_questions USING btree (created_by_faculty_id);


--
-- Name: idx_lab_mcq_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lab_mcq_published ON public.lab_mcq_questions USING btree (is_published);


--
-- Name: idx_lab_mcq_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lab_mcq_status ON public.lab_mcq_questions USING btree (status);


--
-- Name: idx_lab_mcq_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lab_mcq_topic ON public.lab_mcq_questions USING btree (topic_id);


--
-- Name: idx_lab_questions_archived; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lab_questions_archived ON public.lab_coding_questions USING btree (is_archived);


--
-- Name: idx_lab_questions_faculty; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lab_questions_faculty ON public.lab_coding_questions USING btree (created_by_faculty_id);


--
-- Name: idx_lab_questions_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lab_questions_published ON public.lab_coding_questions USING btree (is_published);


--
-- Name: idx_lab_questions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lab_questions_status ON public.lab_coding_questions USING btree (status);


--
-- Name: idx_lab_questions_subtopic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lab_questions_subtopic ON public.lab_coding_questions USING btree (subtopic_id);


--
-- Name: idx_lab_questions_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lab_questions_topic ON public.lab_coding_questions USING btree (topic_id);


--
-- Name: idx_prerequisite_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prerequisite_topic ON public.prerequisite USING btree (topic_id);


--
-- Name: idx_progress_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progress_student ON public.progress USING btree (student_id);


--
-- Name: idx_progress_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progress_topic ON public.progress USING btree (topic_id);


--
-- Name: idx_pwd_reset_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pwd_reset_hash ON public.password_reset_tokens USING btree (token_hash);


--
-- Name: idx_pwd_reset_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pwd_reset_user ON public.password_reset_tokens USING btree (user_id);


--
-- Name: idx_room_topics_room; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_room_topics_room ON public.room_topics USING btree (room_id);


--
-- Name: idx_room_topics_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_room_topics_topic ON public.room_topics USING btree (topic_id);


--
-- Name: idx_rooms_faculty; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rooms_faculty ON public.rooms USING btree (faculty_id);


--
-- Name: idx_scca_testcases_q; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_scca_testcases_q ON public.subtopic_coding_test_cases USING btree (scca_id);


--
-- Name: idx_student_rooms_room; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_student_rooms_room ON public.student_rooms USING btree (room_id);


--
-- Name: idx_student_rooms_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_student_rooms_student ON public.student_rooms USING btree (student_id);


--
-- Name: idx_subtopic_progress_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subtopic_progress_student ON public.subtopic_progress USING btree (student_id);


--
-- Name: idx_subtopic_progress_subtopic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subtopic_progress_subtopic ON public.subtopic_progress USING btree (subtopic_id);


--
-- Name: idx_subtopics_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subtopics_topic ON public.subtopics USING btree (topic_id);


--
-- Name: idx_tca_testcases_q; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tca_testcases_q ON public.tca_test_cases USING btree (tca_question_id);


--
-- Name: idx_tca_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tca_topic ON public.topic_coding_assessment USING btree (topic_id);


--
-- Name: idx_topic_feedback_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_topic_feedback_student ON public.topic_feedback USING btree (student_id);


--
-- Name: idx_topic_feedback_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_topic_feedback_topic ON public.topic_feedback USING btree (topic_id);


--
-- Name: idx_topic_videos_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_topic_videos_topic ON public.topic_video_references USING btree (topic_id);


--
-- Name: idx_users_approval_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_approval_status ON public.users USING btree (approval_status);


--
-- Name: idx_users_role_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role_status ON public.users USING btree (role, approval_status);


--
-- Name: assignment_questions assignment_questions_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_questions
    ADD CONSTRAINT assignment_questions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(assignment_id) ON DELETE CASCADE;


--
-- Name: assignment_test_cases assignment_test_cases_asg_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_test_cases
    ADD CONSTRAINT assignment_test_cases_asg_question_id_fkey FOREIGN KEY (asg_question_id) REFERENCES public.assignment_questions(asg_question_id) ON DELETE CASCADE;


--
-- Name: assignments assignments_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculty(faculty_id) ON DELETE CASCADE;


--
-- Name: coding_submissions coding_submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coding_submissions
    ADD CONSTRAINT coding_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: faculty faculty_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: final_quiz_questions final_quiz_questions_final_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_quiz_questions
    ADD CONSTRAINT final_quiz_questions_final_quiz_id_fkey FOREIGN KEY (final_quiz_id) REFERENCES public.final_quiz(final_quiz_id) ON DELETE CASCADE;


--
-- Name: final_quiz final_quiz_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_quiz
    ADD CONSTRAINT final_quiz_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: la_assessment_topics la_assessment_topics_lab_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_assessment_topics
    ADD CONSTRAINT la_assessment_topics_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.lab_assessment(lab_id) ON DELETE CASCADE;


--
-- Name: la_assessment_topics la_assessment_topics_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_assessment_topics
    ADD CONSTRAINT la_assessment_topics_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: la_attempts la_attempts_lab_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_attempts
    ADD CONSTRAINT la_attempts_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.lab_assessment(lab_id) ON DELETE CASCADE;


--
-- Name: la_attempts la_attempts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_attempts
    ADD CONSTRAINT la_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: la_mcq_submissions la_mcq_submissions_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_mcq_submissions
    ADD CONSTRAINT la_mcq_submissions_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.la_attempts(attempt_id) ON DELETE CASCADE;


--
-- Name: la_mcq_submissions la_mcq_submissions_mcq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_mcq_submissions
    ADD CONSTRAINT la_mcq_submissions_mcq_id_fkey FOREIGN KEY (mcq_id) REFERENCES public.lab_mcq_questions(mcq_id) ON DELETE CASCADE;


--
-- Name: la_question_submissions la_question_submissions_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_question_submissions
    ADD CONSTRAINT la_question_submissions_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.la_attempts(attempt_id) ON DELETE CASCADE;


--
-- Name: la_question_submissions la_question_submissions_lab_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_question_submissions
    ADD CONSTRAINT la_question_submissions_lab_question_id_fkey FOREIGN KEY (lab_question_id) REFERENCES public.lab_coding_questions(lab_question_id) ON DELETE CASCADE;


--
-- Name: la_selected_mcqs la_selected_mcqs_lab_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_selected_mcqs
    ADD CONSTRAINT la_selected_mcqs_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.lab_assessment(lab_id) ON DELETE CASCADE;


--
-- Name: la_selected_mcqs la_selected_mcqs_mcq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_selected_mcqs
    ADD CONSTRAINT la_selected_mcqs_mcq_id_fkey FOREIGN KEY (mcq_id) REFERENCES public.lab_mcq_questions(mcq_id) ON DELETE CASCADE;


--
-- Name: la_selected_questions la_selected_questions_lab_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_selected_questions
    ADD CONSTRAINT la_selected_questions_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.lab_assessment(lab_id) ON DELETE CASCADE;


--
-- Name: la_selected_questions la_selected_questions_lab_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_selected_questions
    ADD CONSTRAINT la_selected_questions_lab_question_id_fkey FOREIGN KEY (lab_question_id) REFERENCES public.lab_coding_questions(lab_question_id) ON DELETE CASCADE;


--
-- Name: la_student_allocations la_student_allocations_lab_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_student_allocations
    ADD CONSTRAINT la_student_allocations_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.lab_assessment(lab_id) ON DELETE CASCADE;


--
-- Name: la_student_allocations la_student_allocations_lab_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_student_allocations
    ADD CONSTRAINT la_student_allocations_lab_question_id_fkey FOREIGN KEY (lab_question_id) REFERENCES public.lab_coding_questions(lab_question_id) ON DELETE CASCADE;


--
-- Name: la_student_allocations la_student_allocations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_student_allocations
    ADD CONSTRAINT la_student_allocations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: la_student_mcq_allocations la_student_mcq_allocations_lab_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_student_mcq_allocations
    ADD CONSTRAINT la_student_mcq_allocations_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.lab_assessment(lab_id) ON DELETE CASCADE;


--
-- Name: la_student_mcq_allocations la_student_mcq_allocations_mcq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_student_mcq_allocations
    ADD CONSTRAINT la_student_mcq_allocations_mcq_id_fkey FOREIGN KEY (mcq_id) REFERENCES public.lab_mcq_questions(mcq_id) ON DELETE CASCADE;


--
-- Name: la_student_mcq_allocations la_student_mcq_allocations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_student_mcq_allocations
    ADD CONSTRAINT la_student_mcq_allocations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: lab_assessment lab_assessment_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_assessment
    ADD CONSTRAINT lab_assessment_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculty(faculty_id) ON DELETE CASCADE;


--
-- Name: lab_assessment lab_assessment_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_assessment
    ADD CONSTRAINT lab_assessment_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE;


--
-- Name: lab_coding_questions lab_coding_questions_created_by_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_coding_questions
    ADD CONSTRAINT lab_coding_questions_created_by_faculty_id_fkey FOREIGN KEY (created_by_faculty_id) REFERENCES public.faculty(faculty_id) ON DELETE SET NULL;


--
-- Name: lab_coding_questions lab_coding_questions_lab_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_coding_questions
    ADD CONSTRAINT lab_coding_questions_lab_id_fkey FOREIGN KEY (lab_id) REFERENCES public.lab_assessment(lab_id) ON DELETE CASCADE;


--
-- Name: lab_coding_questions lab_coding_questions_subtopic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_coding_questions
    ADD CONSTRAINT lab_coding_questions_subtopic_id_fkey FOREIGN KEY (subtopic_id) REFERENCES public.subtopics(subtopic_id) ON DELETE SET NULL;


--
-- Name: lab_coding_questions lab_coding_questions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_coding_questions
    ADD CONSTRAINT lab_coding_questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE SET NULL;


--
-- Name: lab_mcq_questions lab_mcq_questions_created_by_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_mcq_questions
    ADD CONSTRAINT lab_mcq_questions_created_by_faculty_id_fkey FOREIGN KEY (created_by_faculty_id) REFERENCES public.faculty(faculty_id) ON DELETE SET NULL;


--
-- Name: lab_mcq_questions lab_mcq_questions_subtopic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_mcq_questions
    ADD CONSTRAINT lab_mcq_questions_subtopic_id_fkey FOREIGN KEY (subtopic_id) REFERENCES public.subtopics(subtopic_id) ON DELETE SET NULL;


--
-- Name: lab_mcq_questions lab_mcq_questions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_mcq_questions
    ADD CONSTRAINT lab_mcq_questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: lab_test_cases lab_test_cases_lab_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_test_cases
    ADD CONSTRAINT lab_test_cases_lab_question_id_fkey FOREIGN KEY (lab_question_id) REFERENCES public.lab_coding_questions(lab_question_id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: prerequisite_quiz prerequisite_quiz_prereq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prerequisite_quiz
    ADD CONSTRAINT prerequisite_quiz_prereq_id_fkey FOREIGN KEY (prereq_id) REFERENCES public.prerequisite(prereq_id) ON DELETE CASCADE;


--
-- Name: prerequisite_quiz_questions prerequisite_quiz_questions_prereq_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prerequisite_quiz_questions
    ADD CONSTRAINT prerequisite_quiz_questions_prereq_quiz_id_fkey FOREIGN KEY (prereq_quiz_id) REFERENCES public.prerequisite_quiz(prereq_quiz_id) ON DELETE CASCADE;


--
-- Name: prerequisite prerequisite_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prerequisite
    ADD CONSTRAINT prerequisite_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: progress progress_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: progress progress_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: room_topics room_topics_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_topics
    ADD CONSTRAINT room_topics_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE;


--
-- Name: room_topics room_topics_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_topics
    ADD CONSTRAINT room_topics_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: rooms rooms_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculty(faculty_id) ON DELETE CASCADE;


--
-- Name: student_rooms student_rooms_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_rooms
    ADD CONSTRAINT student_rooms_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(room_id) ON DELETE CASCADE;


--
-- Name: student_rooms student_rooms_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_rooms
    ADD CONSTRAINT student_rooms_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: student student_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: subtopic_coding_assessment subtopic_coding_assessment_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_coding_assessment
    ADD CONSTRAINT subtopic_coding_assessment_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.subtopic_content(content_id) ON DELETE CASCADE;


--
-- Name: subtopic_coding_test_cases subtopic_coding_test_cases_scca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_coding_test_cases
    ADD CONSTRAINT subtopic_coding_test_cases_scca_id_fkey FOREIGN KEY (scca_id) REFERENCES public.subtopic_coding_assessment(scca_id) ON DELETE CASCADE;


--
-- Name: subtopic_content subtopic_content_subtopic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_content
    ADD CONSTRAINT subtopic_content_subtopic_id_fkey FOREIGN KEY (subtopic_id) REFERENCES public.subtopics(subtopic_id) ON DELETE CASCADE;


--
-- Name: subtopic_progress subtopic_progress_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_progress
    ADD CONSTRAINT subtopic_progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: subtopic_progress subtopic_progress_subtopic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_progress
    ADD CONSTRAINT subtopic_progress_subtopic_id_fkey FOREIGN KEY (subtopic_id) REFERENCES public.subtopics(subtopic_id) ON DELETE CASCADE;


--
-- Name: subtopic_quiz_questions subtopic_quiz_questions_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopic_quiz_questions
    ADD CONSTRAINT subtopic_quiz_questions_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.subtopic_content(content_id) ON DELETE CASCADE;


--
-- Name: subtopics subtopics_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtopics
    ADD CONSTRAINT subtopics_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: tca_questions tca_questions_tca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tca_questions
    ADD CONSTRAINT tca_questions_tca_id_fkey FOREIGN KEY (tca_id) REFERENCES public.topic_coding_assessment(tca_id) ON DELETE CASCADE;


--
-- Name: tca_test_cases tca_test_cases_tca_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tca_test_cases
    ADD CONSTRAINT tca_test_cases_tca_question_id_fkey FOREIGN KEY (tca_question_id) REFERENCES public.tca_questions(tca_question_id) ON DELETE CASCADE;


--
-- Name: topic_coding_assessment topic_coding_assessment_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topic_coding_assessment
    ADD CONSTRAINT topic_coding_assessment_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: topic_feedback topic_feedback_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topic_feedback
    ADD CONSTRAINT topic_feedback_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.student(student_id) ON DELETE CASCADE;


--
-- Name: topic_feedback topic_feedback_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topic_feedback
    ADD CONSTRAINT topic_feedback_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: topic_video_references topic_video_references_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topic_video_references
    ADD CONSTRAINT topic_video_references_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id) ON DELETE CASCADE;


--
-- Name: users users_approval_decision_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_approval_decision_by_fkey FOREIGN KEY (approval_decision_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict g7ojtcq3IVOXRPnx151se6bRULrzkXDxDIrhyvhcZ282lKHaKb38dPA1hA554Ll

