// ──────────────────────────────────────────────
// Lab Coding Question Bank — Seed Script
// ──────────────────────────────────────────────
// Seeds topic-based practical coding questions with
// visible and hidden test cases into lab_coding_questions
// and lab_test_cases.
// ──────────────────────────────────────────────

import { pool, testConnection } from '../config/database.js';

const questionsData = [
  {
    title: 'Reverse an Array',
    problem_statement: 'Given an array of integers, reverse the order of elements in the array and print the resulting elements separated by spaces.',
    input_format: 'The first line contains an integer N, the number of elements in the array.\nThe second line contains N space-separated integers.',
    output_format: 'Print the reversed array elements separated by spaces on a single line.',
    constraints: '1 <= N <= 1000\n-10^5 <= A[i] <= 10^5',
    sample_input: '5\n1 2 3 4 5',
    sample_output: '5 4 3 2 1',
    explanation: 'Reversing [1, 2, 3, 4, 5] yields [5, 4, 3, 2, 1].',
    difficulty: 'easy',
    marks: 10,
    testCases: [
      { input: '5\n1 2 3 4 5', expected_output: '5 4 3 2 1', is_hidden: false },
      { input: '3\n10 20 30', expected_output: '30 20 10', is_hidden: false },
      { input: '1\n99', expected_output: '99', is_hidden: true },
      { input: '4\n-1 -5 10 2', expected_output: '2 10 -5 -1', is_hidden: true },
      { input: '6\n1 0 0 1 0 1', expected_output: '1 0 1 0 0 1', is_hidden: true },
    ],
  },
  {
    title: 'Find Maximum and Minimum Element',
    problem_statement: 'Given an array of N integers, find the maximum and minimum elements in the array and print them.',
    input_format: 'First line contains an integer N.\nSecond line contains N space-separated integers.',
    output_format: 'Print two space-separated integers: the maximum element followed by the minimum element.',
    constraints: '1 <= N <= 10^4\n-10^6 <= A[i] <= 10^6',
    sample_input: '6\n3 2 1 56 10000 167',
    sample_output: '10000 1',
    explanation: 'Maximum is 10000 and minimum is 1.',
    difficulty: 'easy',
    marks: 10,
    testCases: [
      { input: '6\n3 2 1 56 10000 167', expected_output: '10000 1', is_hidden: false },
      { input: '4\n-10 -5 -20 -1', expected_output: '-1 -20', is_hidden: false },
      { input: '1\n42', expected_output: '42 42', is_hidden: true },
      { input: '5\n7 7 7 7 7', expected_output: '7 7', is_hidden: true },
      { input: '5\n100 200 -50 0 500', expected_output: '500 -50', is_hidden: true },
    ],
  },
  {
    title: 'Two Sum Target Pair',
    problem_statement: 'Given an array of N integers and a target sum K, determine whether there exist two distinct elements in the array whose sum equals K. Print YES if such a pair exists, otherwise print NO.',
    input_format: 'First line contains two integers N and K.\nSecond line contains N space-separated integers.',
    output_format: 'Print YES if a pair exists, otherwise print NO.',
    constraints: '2 <= N <= 10^4\n-10^5 <= K, A[i] <= 10^5',
    sample_input: '5 9\n1 4 2 5 8',
    sample_output: 'YES',
    explanation: 'Elements 1 and 8 (or 4 and 5) sum to 9.',
    difficulty: 'medium',
    marks: 10,
    testCases: [
      { input: '5 9\n1 4 2 5 8', expected_output: 'YES', is_hidden: false },
      { input: '4 10\n1 2 3 4', expected_output: 'NO', is_hidden: false },
      { input: '3 0\n-5 2 5', expected_output: 'YES', is_hidden: true },
      { input: '2 6\n3 3', expected_output: 'YES', is_hidden: true },
      { input: '4 7\n2 4 6 8', expected_output: 'NO', is_hidden: true },
    ],
  },
  {
    title: 'Palindrome String Checker',
    problem_statement: 'Given a non-empty string S consisting of lowercase alphanumeric characters, determine if it is a palindrome. A palindrome reads the same forwards and backwards. Print YES if it is a palindrome, otherwise print NO.',
    input_format: 'A single line containing the string S.',
    output_format: 'Print YES if S is a palindrome, else NO.',
    constraints: '1 <= |S| <= 10^5',
    sample_input: 'racecar',
    sample_output: 'YES',
    explanation: '"racecar" reversed is still "racecar".',
    difficulty: 'easy',
    marks: 10,
    testCases: [
      { input: 'racecar', expected_output: 'YES', is_hidden: false },
      { input: 'virtual', expected_output: 'NO', is_hidden: false },
      { input: 'madam', expected_output: 'YES', is_hidden: true },
      { input: 'a', expected_output: 'YES', is_hidden: true },
      { input: 'abccba', expected_output: 'YES', is_hidden: true },
      { input: 'abcdea', expected_output: 'NO', is_hidden: true },
    ],
  },
  {
    title: 'Count Frequency of Target Element',
    problem_statement: 'Given an array of N integers and a target number K, count how many times K appears in the array.',
    input_format: 'First line contains two integers N and K.\nSecond line contains N space-separated integers.',
    output_format: 'Print the count of occurrences of K.',
    constraints: '1 <= N <= 10^4\n-10^5 <= K, A[i] <= 10^5',
    sample_input: '6 2\n1 2 2 3 2 4',
    sample_output: '3',
    explanation: '2 appears 3 times in the array.',
    difficulty: 'easy',
    marks: 10,
    testCases: [
      { input: '6 2\n1 2 2 3 2 4', expected_output: '3', is_hidden: false },
      { input: '5 7\n1 2 3 4 5', expected_output: '0', is_hidden: false },
      { input: '4 10\n10 10 10 10', expected_output: '4', is_hidden: true },
      { input: '1 -5\n-5', expected_output: '1', is_hidden: true },
      { input: '5 0\n0 1 0 2 0', expected_output: '3', is_hidden: true },
    ],
  },
  {
    title: 'Find Second Largest Element',
    problem_statement: 'Given an array of N integers, find the second largest distinct element in the array. If no distinct second largest element exists, print -1.',
    input_format: 'First line contains an integer N.\nSecond line contains N space-separated integers.',
    output_format: 'Print the second largest distinct element, or -1 if it does not exist.',
    constraints: '2 <= N <= 10^4\n-10^5 <= A[i] <= 10^5',
    sample_input: '5\n12 35 1 10 34',
    sample_output: '34',
    explanation: 'The largest is 35, and the second largest is 34.',
    difficulty: 'medium',
    marks: 10,
    testCases: [
      { input: '5\n12 35 1 10 34', expected_output: '34', is_hidden: false },
      { input: '4\n10 10 10 10', expected_output: '-1', is_hidden: false },
      { input: '3\n5 10 10', expected_output: '5', is_hidden: true },
      { input: '2\n100 200', expected_output: '100', is_hidden: true },
      { input: '5\n-5 -2 -10 -1 -8', expected_output: '-2', is_hidden: true },
    ],
  },
  {
    title: 'Valid Parentheses String',
    problem_statement: 'Given a string S containing only parentheses characters (), {}, and [], determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order. Print YES if valid, otherwise NO.',
    input_format: 'A single line containing the bracket string S.',
    output_format: 'Print YES if valid, otherwise NO.',
    constraints: '1 <= |S| <= 10^4',
    sample_input: '()[]{}',
    sample_output: 'YES',
    explanation: 'All brackets are properly matched and nested.',
    difficulty: 'medium',
    marks: 10,
    testCases: [
      { input: '()[]{}', expected_output: 'YES', is_hidden: false },
      { input: '(]', expected_output: 'NO', is_hidden: false },
      { input: '([{}])', expected_output: 'YES', is_hidden: true },
      { input: '((()', expected_output: 'NO', is_hidden: true },
      { input: '{[]}', expected_output: 'YES', is_hidden: true },
      { input: '([)]', expected_output: 'NO', is_hidden: true },
    ],
  },
];

async function seed() {
  console.log('Seeding Lab Coding Question Bank...');
  const ok = await testConnection();
  if (!ok) {
    console.error('Cannot connect to DB.');
    process.exit(1);
  }

  // Find topic_id for DSA
  const tRes = await pool.query("SELECT topic_id FROM topics WHERE title ILIKE '%Data Structures%' LIMIT 1");
  let topicId = 1;
  if (tRes.rows.length > 0) {
    topicId = tRes.rows[0].topic_id;
  }
  console.log(`Using topic_id: ${topicId}`);

  // Fetch faculty_id
  const fRes = await pool.query('SELECT faculty_id FROM faculty LIMIT 1');
  const facultyId = fRes.rows[0]?.faculty_id || null;

  for (const q of questionsData) {
    // Check if question title already exists
    const existing = await pool.query('SELECT lab_question_id FROM lab_coding_questions WHERE title = $1', [q.title]);
    let questionId;

    if (existing.rows.length > 0) {
      questionId = existing.rows[0].lab_question_id;
      console.log(`Question already exists: "${q.title}" (ID: ${questionId})`);
    } else {
      const ins = await pool.query(
        `INSERT INTO lab_coding_questions
          (topic_id, title, problem_statement, input_format, output_format, constraints, sample_input, sample_output, explanation, difficulty, marks, created_by_faculty_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING lab_question_id`,
        [
          topicId,
          q.title,
          q.problem_statement,
          q.input_format,
          q.output_format,
          q.constraints,
          q.sample_input,
          q.sample_output,
          q.explanation,
          q.difficulty,
          q.marks,
          facultyId,
        ]
      );
      questionId = ins.rows[0].lab_question_id;
      console.log(`Created Question: "${q.title}" (ID: ${questionId})`);
    }

    // Insert test cases
    for (let i = 0; i < q.testCases.length; i++) {
      const tc = q.testCases[i];
      const tcExists = await pool.query(
        'SELECT lab_testcase_id FROM lab_test_cases WHERE lab_question_id = $1 AND expected_output = $2',
        [questionId, tc.expected_output]
      );
      if (tcExists.rows.length === 0) {
        await pool.query(
          `INSERT INTO lab_test_cases
            (lab_question_id, input, expected_output, is_hidden, order_index)
           VALUES ($1, $2, $3, $4, $5)`,
          [questionId, tc.input, tc.expected_output, tc.is_hidden, i + 1]
        );
      }
    }
  }

  const count = await pool.query('SELECT COUNT(*) FROM lab_coding_questions');
  const tcCount = await pool.query('SELECT COUNT(*) FROM lab_test_cases');
  console.log(`Total questions in bank: ${count.rows[0].count}`);
  console.log(`Total test cases in bank: ${tcCount.rows[0].count}`);

  await pool.end();
  console.log('Question bank seeding complete!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
