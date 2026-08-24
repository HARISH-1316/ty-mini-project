-- =========================================================
-- WCE VIRTUAL LAB — COMPREHENSIVE CODING ASSESSMENTS & TEST CASES SEED
-- =========================================================

BEGIN;

DO $coding_seed$
DECLARE
    v_topic_id INT;
    v_tca_id INT;
    v_q_id INT;
    v_scca_id INT;
    v_content_id INT;
BEGIN
    SELECT topic_id INTO v_topic_id FROM topics WHERE title = 'Data Structures and Algorithms' LIMIT 1;
    IF v_topic_id IS NULL THEN
        RAISE NOTICE 'DSA topic not found. Skipping coding seed.';
        RETURN;
    END IF;

    -- =========================================================
    -- 1. TOPIC CODING ASSESSMENT (Comprehensive Final Coding Exam)
    -- =========================================================
    IF NOT EXISTS (SELECT 1 FROM topic_coding_assessment WHERE topic_id = v_topic_id) THEN
        INSERT INTO topic_coding_assessment (topic_id, title, description, total_marks, time_limit)
        VALUES (
            v_topic_id,
            'Data Structures & Algorithms — Final Comprehensive Coding Assessment',
            'Demonstrate your comprehensive coding mastery across fundamental data structures, algorithms, search techniques, tree structures, and dynamic programming.',
            50,
            60
        )
        RETURNING tca_id INTO v_tca_id;
    ELSE
        SELECT tca_id INTO v_tca_id FROM topic_coding_assessment WHERE topic_id = v_topic_id LIMIT 1;
    END IF;

    -- Question 1: Find Maximum Element in Array (Easy - 10 marks)
    IF NOT EXISTS (SELECT 1 FROM tca_questions WHERE tca_id = v_tca_id AND title = 'Maximum Element in Array') THEN
        INSERT INTO tca_questions (tca_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index)
        VALUES (
            v_tca_id,
            'Maximum Element in Array',
            'Given an integer array of size N, find and print the maximum element present in the array.' || E'\n\n' ||
            'Input Format:' || E'\n' ||
            '- The first line contains an integer N, the number of elements.' || E'\n' ||
            '- The second line contains N space-separated integers.' || E'\n\n' ||
            'Output Format:' || E'\n' ||
            '- Print a single integer representing the maximum value.',
            '1 <= N <= 10^5' || E'\n' || '-10^9 <= A[i] <= 10^9',
            E'5\n2 7 1 9 4',
            E'9',
            10,
            1
        )
        RETURNING tca_question_id INTO v_q_id;

        -- Test Cases
        INSERT INTO tca_test_cases (tca_question_id, input, expected_output, is_hidden, order_index) VALUES
        (v_q_id, E'5\n2 7 1 9 4', E'9', FALSE, 1),
        (v_q_id, E'1\n42', E'42', FALSE, 2),
        (v_q_id, E'4\n-10 -5 -20 -1', E'-1', TRUE, 3),
        (v_q_id, E'6\n100 200 500 50 25 500', E'500', TRUE, 4);
    END IF;

    -- Question 2: Valid Palindrome String (Easy-Medium - 10 marks)
    IF NOT EXISTS (SELECT 1 FROM tca_questions WHERE tca_id = v_tca_id AND title = 'Valid Palindrome String') THEN
        INSERT INTO tca_questions (tca_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index)
        VALUES (
            v_tca_id,
            'Valid Palindrome String',
            'Given a string S containing lowercase alphanumeric characters, determine if it is a palindrome (reads the same backward as forward).' || E'\n\n' ||
            'Input Format:' || E'\n' ||
            '- A single string S.' || E'\n\n' ||
            'Output Format:' || E'\n' ||
            '- Print "YES" if S is a palindrome, otherwise print "NO".',
            '1 <= |S| <= 10^5' || E'\n' || 'S contains only lowercase letters.',
            E'racecar',
            E'YES',
            10,
            2
        )
        RETURNING tca_question_id INTO v_q_id;

        -- Test Cases
        INSERT INTO tca_test_cases (tca_question_id, input, expected_output, is_hidden, order_index) VALUES
        (v_q_id, E'racecar', E'YES', FALSE, 1),
        (v_q_id, E'hello', E'NO', FALSE, 2),
        (v_q_id, E'a', E'YES', TRUE, 3),
        (v_q_id, E'abccba', E'YES', TRUE, 4),
        (v_q_id, E'abcbcd', E'NO', TRUE, 5);
    END IF;

    -- Question 3: Valid Parentheses (Medium - 10 marks)
    IF NOT EXISTS (SELECT 1 FROM tca_questions WHERE tca_id = v_tca_id AND title = 'Valid Parentheses') THEN
        INSERT INTO tca_questions (tca_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index)
        VALUES (
            v_tca_id,
            'Valid Parentheses',
            'Given a string containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.' || E'\n\n' ||
            'An input string is valid if:' || E'\n' ||
            '1. Open brackets must be closed by the same type of brackets.' || E'\n' ||
            '2. Open brackets must be closed in the correct order.' || E'\n\n' ||
            'Output Format:' || E'\n' ||
            '- Print "VALID" if the string is valid, or "INVALID" otherwise.',
            '1 <= |S| <= 10^4',
            E'{[()]}',
            E'VALID',
            10,
            3
        )
        RETURNING tca_question_id INTO v_q_id;

        -- Test Cases
        INSERT INTO tca_test_cases (tca_question_id, input, expected_output, is_hidden, order_index) VALUES
        (v_q_id, E'{[()]}', E'VALID', FALSE, 1),
        (v_q_id, E'([)]', E'INVALID', FALSE, 2),
        (v_q_id, E'()', E'VALID', TRUE, 3),
        (v_q_id, E'(((((', E'INVALID', TRUE, 4),
        (v_q_id, E'()[]{}', E'VALID', TRUE, 5);
    END IF;

    -- Question 4: Binary Search Implementation (Medium - 10 marks)
    IF NOT EXISTS (SELECT 1 FROM tca_questions WHERE tca_id = v_tca_id AND title = 'Search in Sorted Array') THEN
        INSERT INTO tca_questions (tca_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index)
        VALUES (
            v_tca_id,
            'Search in Sorted Array',
            'Given a sorted integer array of size N and a target value K, find the 0-based index of K using Binary Search. If K is not present in the array, print -1.' || E'\n\n' ||
            'Input Format:' || E'\n' ||
            '- First line: Integer N' || E'\n' ||
            '- Second line: N space-separated sorted integers' || E'\n' ||
            '- Third line: Integer K (target)' || E'\n\n' ||
            'Output Format:' || E'\n' ||
            '- 0-based index of target or -1.',
            '1 <= N <= 10^5' || E'\n' || '-10^9 <= A[i], K <= 10^9',
            E'6\n1 3 5 7 9 11\n7',
            E'3',
            10,
            4
        )
        RETURNING tca_question_id INTO v_q_id;

        -- Test Cases
        INSERT INTO tca_test_cases (tca_question_id, input, expected_output, is_hidden, order_index) VALUES
        (v_q_id, E'6\n1 3 5 7 9 11\n7', E'3', FALSE, 1),
        (v_q_id, E'5\n2 4 6 8 10\n5', E'-1', FALSE, 2),
        (v_q_id, E'1\n100\n100', E'0', TRUE, 3),
        (v_q_id, E'7\n-20 -10 -5 0 5 10 20\n-5', E'2', TRUE, 4);
    END IF;

    -- Question 5: Climbing Stairs (Dynamic Programming - 10 marks)
    IF NOT EXISTS (SELECT 1 FROM tca_questions WHERE tca_id = v_tca_id AND title = 'Climbing Stairs DP') THEN
        INSERT INTO tca_questions (tca_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index)
        VALUES (
            v_tca_id,
            'Climbing Stairs DP',
            'You are climbing a staircase with N steps. Each time you can either climb 1 step or 2 steps. Calculate how many distinct ways you can climb to the top.' || E'\n\n' ||
            'Input Format:' || E'\n' ||
            '- Single integer N.' || E'\n\n' ||
            'Output Format:' || E'\n' ||
            '- Print the total number of distinct ways.',
            '1 <= N <= 45',
            E'3',
            E'3',
            10,
            5
        )
        RETURNING tca_question_id INTO v_q_id;

        -- Test Cases
        INSERT INTO tca_test_cases (tca_question_id, input, expected_output, is_hidden, order_index) VALUES
        (v_q_id, E'3', E'3', FALSE, 1),
        (v_q_id, E'2', E'2', FALSE, 2),
        (v_q_id, E'1', E'1', TRUE, 3),
        (v_q_id, E'5', E'8', TRUE, 4),
        (v_q_id, E'10', E'89', TRUE, 5);
    END IF;


    -- =========================================================
    -- 2. SUBTOPIC CODING ASSESSMENTS
    -- =========================================================

    -- ── Subtopic 3: Arrays (Content ID 3) ───────────────────
    SELECT sc.content_id INTO v_content_id
    FROM subtopics s
    JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
    WHERE s.topic_id = v_topic_id AND s.title = 'Arrays'
    LIMIT 1;

    IF v_content_id IS NOT NULL THEN
        -- Question: Sum of Array Elements
        IF NOT EXISTS (SELECT 1 FROM subtopic_coding_assessment WHERE content_id = v_content_id AND title = 'Sum of Array Elements') THEN
            INSERT INTO subtopic_coding_assessment (content_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index)
            VALUES (
                v_content_id,
                'Sum of Array Elements',
                'Given an array of N integers, compute and print the sum of all elements.' || E'\n\n' ||
                'Input Format:' || E'\n' ||
                '- Line 1: Integer N' || E'\n' ||
                '- Line 2: N space-separated integers' || E'\n\n' ||
                'Output Format:' || E'\n' ||
                '- Single integer representing the total sum.',
                '1 <= N <= 10^5' || E'\n' || '-10^6 <= A[i] <= 10^6',
                E'5\n1 2 3 4 5',
                E'15',
                10,
                1
            )
            RETURNING scca_id INTO v_scca_id;

            INSERT INTO subtopic_coding_test_cases (scca_id, input, expected_output, is_hidden, order_index) VALUES
            (v_scca_id, E'5\n1 2 3 4 5', E'15', FALSE, 1),
            (v_scca_id, E'3\n-5 10 5', E'10', FALSE, 2),
            (v_scca_id, E'1\n100', E'100', TRUE, 3),
            (v_scca_id, E'6\n0 0 0 0 0 0', E'0', TRUE, 4),
            (v_scca_id, E'4\n1000 -500 2000 -1000', E'1500', TRUE, 5);
        END IF;

        -- Question: Reverse Array In-Place
        IF NOT EXISTS (SELECT 1 FROM subtopic_coding_assessment WHERE content_id = v_content_id AND title = 'Reverse Array') THEN
            INSERT INTO subtopic_coding_assessment (content_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index)
            VALUES (
                v_content_id,
                'Reverse Array',
                'Given an array of N integers, print the elements in reverse order separated by space.' || E'\n\n' ||
                'Input Format:' || E'\n' ||
                '- Line 1: Integer N' || E'\n' ||
                '- Line 2: N space-separated integers' || E'\n\n' ||
                'Output Format:' || E'\n' ||
                '- Space-separated reversed integers.',
                '1 <= N <= 10^5',
                E'4\n10 20 30 40',
                E'40 30 20 10',
                10,
                2
            )
            RETURNING scca_id INTO v_scca_id;

            INSERT INTO subtopic_coding_test_cases (scca_id, input, expected_output, is_hidden, order_index) VALUES
            (v_scca_id, E'4\n10 20 30 40', E'40 30 20 10', FALSE, 1),
            (v_scca_id, E'1\n99', E'99', FALSE, 2),
            (v_scca_id, E'5\n1 2 3 4 5', E'5 4 3 2 1', TRUE, 3);
        END IF;
    END IF;


    -- ── Subtopic 4: Strings (Content ID 4) ───────────────────
    SELECT sc.content_id INTO v_content_id
    FROM subtopics s
    JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
    WHERE s.topic_id = v_topic_id AND s.title = 'Strings'
    LIMIT 1;

    IF v_content_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM subtopic_coding_assessment WHERE content_id = v_content_id AND title = 'Count Vowels in String') THEN
            INSERT INTO subtopic_coding_assessment (content_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index)
            VALUES (
                v_content_id,
                'Count Vowels in String',
                'Given a lowercase English string S, count and print the total number of vowels (a, e, i, o, u).' || E'\n\n' ||
                'Input Format:' || E'\n' ||
                '- A single word string S.' || E'\n\n' ||
                'Output Format:' || E'\n' ||
                '- Number of vowels in S.',
                '1 <= |S| <= 10^5',
                E'education',
                E'5',
                10,
                1
            )
            RETURNING scca_id INTO v_scca_id;

            INSERT INTO subtopic_coding_test_cases (scca_id, input, expected_output, is_hidden, order_index) VALUES
            (v_scca_id, E'education', E'5', FALSE, 1),
            (v_scca_id, E'rhythm', E'0', FALSE, 2),
            (v_scca_id, E'aeiou', E'5', TRUE, 3),
            (v_scca_id, E'algorithms', E'3', TRUE, 4);
        END IF;
    END IF;


    -- ── Subtopic 6: Stacks (Content ID 6) ───────────────────
    SELECT sc.content_id INTO v_content_id
    FROM subtopics s
    JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
    WHERE s.topic_id = v_topic_id AND s.title = 'Stacks'
    LIMIT 1;

    IF v_content_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM subtopic_coding_assessment WHERE content_id = v_content_id AND title = 'Postfix Expression Evaluation') THEN
            INSERT INTO subtopic_coding_assessment (content_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index)
            VALUES (
                v_content_id,
                'Postfix Expression Evaluation',
                'Given a postfix expression consisting of single-digit integers and operators (+, -, *), evaluate and print the result using a Stack.' || E'\n\n' ||
                'Input Format:' || E'\n' ||
                '- Space-separated tokens forming the postfix expression on one line.' || E'\n\n' ||
                'Output Format:' || E'\n' ||
                '- Single evaluated integer.',
                'Expression is always mathematically valid and does not divide by zero.',
                E'2 3 1 * + 9 -',
                E'-4',
                10,
                1
            )
            RETURNING scca_id INTO v_scca_id;

            INSERT INTO subtopic_coding_test_cases (scca_id, input, expected_output, is_hidden, order_index) VALUES
            (v_scca_id, E'2 3 1 * + 9 -', E'-4', FALSE, 1),
            (v_scca_id, E'5 4 +', E'9', FALSE, 2),
            (v_scca_id, E'3 4 + 2 * 7 /', E'2', TRUE, 3);
        END IF;
    END IF;


    -- ── Subtopic 9: Searching Algorithms (Content ID 9) ──────
    SELECT sc.content_id INTO v_content_id
    FROM subtopics s
    JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
    WHERE s.topic_id = v_topic_id AND s.title = 'Searching Algorithms'
    LIMIT 1;

    IF v_content_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM subtopic_coding_assessment WHERE content_id = v_content_id AND title = 'Linear Search') THEN
            INSERT INTO subtopic_coding_assessment (content_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index)
            VALUES (
                v_content_id,
                'Linear Search',
                'Given an array of N integers and a key K, find the first 0-based index of K using Linear Search. Print -1 if key is not present.' || E'\n\n' ||
                'Input Format:' || E'\n' ||
                '- Line 1: Integer N' || E'\n' ||
                '- Line 2: N space-separated integers' || E'\n' ||
                '- Line 3: Integer K' || E'\n\n' ||
                'Output Format:' || E'\n' ||
                '- 0-based index or -1.',
                '1 <= N <= 10^5',
                E'5\n10 50 30 70 80\n30',
                E'2',
                10,
                1
            )
            RETURNING scca_id INTO v_scca_id;

            INSERT INTO subtopic_coding_test_cases (scca_id, input, expected_output, is_hidden, order_index) VALUES
            (v_scca_id, E'5\n10 50 30 70 80\n30', E'2', FALSE, 1),
            (v_scca_id, E'4\n1 2 3 4\n99', E'-1', FALSE, 2),
            (v_scca_id, E'1\n7\n7', E'0', TRUE, 3);
        END IF;
    END IF;


    -- ── Subtopic 10: Sorting Algorithms (Content ID 10) ─────
    SELECT sc.content_id INTO v_content_id
    FROM subtopics s
    JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
    WHERE s.topic_id = v_topic_id AND s.title = 'Sorting Algorithms'
    LIMIT 1;

    IF v_content_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM subtopic_coding_assessment WHERE content_id = v_content_id AND title = 'Sort Array in Ascending Order') THEN
            INSERT INTO subtopic_coding_assessment (content_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index)
            VALUES (
                v_content_id,
                'Sort Array in Ascending Order',
                'Given an unsorted array of N integers, sort the array in ascending order and print the elements separated by a space.' || E'\n\n' ||
                'Input Format:' || E'\n' ||
                '- Line 1: Integer N' || E'\n' ||
                '- Line 2: N space-separated integers' || E'\n\n' ||
                'Output Format:' || E'\n' ||
                '- Sorted elements separated by a space.',
                '1 <= N <= 10^5',
                E'5\n64 25 12 22 11',
                E'11 12 22 25 64',
                10,
                1
            )
            RETURNING scca_id INTO v_scca_id;

            INSERT INTO subtopic_coding_test_cases (scca_id, input, expected_output, is_hidden, order_index) VALUES
            (v_scca_id, E'5\n64 25 12 22 11', E'11 12 22 25 64', FALSE, 1),
            (v_scca_id, E'3\n3 2 1', E'1 2 3', FALSE, 2),
            (v_scca_id, E'1\n100', E'100', TRUE, 3),
            (v_scca_id, E'6\n-5 10 0 -20 50 15', E'-20 -5 0 10 15 50', TRUE, 4);
        END IF;
    END IF;


    -- ── Subtopic 17: Dynamic Programming (Content ID 17) ─────
    SELECT sc.content_id INTO v_content_id
    FROM subtopics s
    JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
    WHERE s.topic_id = v_topic_id AND s.title = 'Dynamic Programming'
    LIMIT 1;

    IF v_content_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM subtopic_coding_assessment WHERE content_id = v_content_id AND title = 'Nth Fibonacci Number') THEN
            INSERT INTO subtopic_coding_assessment (content_id, title, problem_statement, constraints, sample_input, sample_output, marks, order_index)
            VALUES (
                v_content_id,
                'Nth Fibonacci Number',
                'Given an integer N, compute and print the Nth Fibonacci number (where F(0) = 0, F(1) = 1, F(N) = F(N-1) + F(N-2)).' || E'\n\n' ||
                'Input Format:' || E'\n' ||
                '- Single integer N.' || E'\n\n' ||
                'Output Format:' || E'\n' ||
                '- The Nth Fibonacci number.',
                '0 <= N <= 40',
                E'6',
                E'8',
                10,
                1
            )
            RETURNING scca_id INTO v_scca_id;

            INSERT INTO subtopic_coding_test_cases (scca_id, input, expected_output, is_hidden, order_index) VALUES
            (v_scca_id, E'6', E'8', FALSE, 1),
            (v_scca_id, E'0', E'0', FALSE, 2),
            (v_scca_id, E'1', E'1', TRUE, 3),
            (v_scca_id, E'10', E'55', TRUE, 4),
            (v_scca_id, E'20', E'6765', TRUE, 5);
        END IF;
    END IF;

    RAISE NOTICE 'Coding assessments & test cases seeded successfully!';
END $coding_seed$;

COMMIT;
