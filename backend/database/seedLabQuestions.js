// ──────────────────────────────────────────────
// Lab Coding Question Bank — Topic-Wise Seed Script
// ──────────────────────────────────────────────
// Seeds multiple topics (Arrays, Strings, Linked Lists,
// Stacks & Queues, Data Structures & Algorithms) and maintains
// 3 to 5 scalable practical coding questions per topic with
// sample visible test cases and hidden test cases.
// ──────────────────────────────────────────────

import { pool, testConnection } from '../config/database.js';

const topicsToSeed = [
  {
    title: 'Data Structures and Algorithms',
    description: 'Core concepts in linear and non-linear data structures and fundamental algorithms.',
  },
  {
    title: 'Arrays',
    description: 'Contiguous memory linear data structures, indexing, traversal, two-pointer techniques, and element searching.',
  },
  {
    title: 'Strings',
    description: 'Character sequence manipulation, pattern searching, palindromes, anagrams, and ASCII transformations.',
  },
  {
    title: 'Linked Lists',
    description: 'Dynamic node structures, pointer references, singly and doubly linked lists, and node traversals.',
  },
  {
    title: 'Stacks and Queues',
    description: 'LIFO and FIFO abstract data types, expression evaluation, balancing brackets, and monotonic queues.',
  },
];

const topicQuestionsData = {
  'Arrays': [
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
      problem_statement: 'Given an array of N integers, find the maximum and minimum elements in the array and print them separated by space.',
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
      title: 'Move Zeroes to End',
      problem_statement: 'Given an array of N integers, push all the zeros of a given array to the end of the array while maintaining the relative order of the non-zero elements.',
      input_format: 'First line contains an integer N.\nSecond line contains N space-separated integers.',
      output_format: 'Print the modified array with all zeros moved to the end.',
      constraints: '1 <= N <= 10^4\n-10^5 <= A[i] <= 10^5',
      sample_input: '5\n0 1 0 3 12',
      sample_output: '1 3 12 0 0',
      explanation: 'Non-zero numbers [1, 3, 12] remain in order followed by two zeros.',
      difficulty: 'easy',
      marks: 10,
      testCases: [
        { input: '5\n0 1 0 3 12', expected_output: '1 3 12 0 0', is_hidden: false },
        { input: '3\n0 0 0', expected_output: '0 0 0', is_hidden: false },
        { input: '4\n1 2 3 4', expected_output: '1 2 3 4', is_hidden: true },
        { input: '6\n0 5 0 0 4 2', expected_output: '5 4 2 0 0 0', is_hidden: true },
      ],
    },
  ],

  'Strings': [
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
      title: 'Count Frequency of Target Character',
      problem_statement: 'Given a string S and a target character C, count how many times C appears in the string S.',
      input_format: 'The first line contains the string S.\nThe second line contains the single character C.',
      output_format: 'Print the count of occurrences of C in S.',
      constraints: '1 <= |S| <= 10^5',
      sample_input: 'walchand\na',
      sample_output: '2',
      explanation: 'Character "a" appears twice in "walchand".',
      difficulty: 'easy',
      marks: 10,
      testCases: [
        { input: 'walchand\na', expected_output: '2', is_hidden: false },
        { input: 'engineering\ne', expected_output: '3', is_hidden: false },
        { input: 'computer\nz', expected_output: '0', is_hidden: true },
        { input: 'aaaaa\na', expected_output: '5', is_hidden: true },
        { input: 'virtual_lab\nl', expected_output: '2', is_hidden: true },
      ],
    },
    {
      title: 'Valid Anagram Checker',
      problem_statement: 'Given two lowercase strings S1 and S2, check whether S2 is an anagram of S1. Two strings are anagrams if they contain the same characters with the same frequencies. Print YES if anagrams, otherwise NO.',
      input_format: 'First line contains string S1.\nSecond line contains string S2.',
      output_format: 'Print YES if anagram, else NO.',
      constraints: '1 <= |S1|, |S2| <= 10^5',
      sample_input: 'listen\nsilent',
      sample_output: 'YES',
      explanation: '"listen" and "silent" contain identical letters.',
      difficulty: 'easy',
      marks: 10,
      testCases: [
        { input: 'listen\nsilent', expected_output: 'YES', is_hidden: false },
        { input: 'triangle\nintegral', expected_output: 'YES', is_hidden: false },
        { input: 'apple\npale', expected_output: 'NO', is_hidden: true },
        { input: 'rat\ncar', expected_output: 'NO', is_hidden: true },
        { input: 'a\na', expected_output: 'YES', is_hidden: true },
      ],
    },
    {
      title: 'Longest Common Prefix',
      problem_statement: 'Given N strings, write a program to find the longest common prefix string amongst an array of strings. If there is no common prefix, print -1.',
      input_format: 'First line contains integer N.\nNext line contains N space-separated strings.',
      output_format: 'Print the longest common prefix or -1.',
      constraints: '1 <= N <= 1000\n1 <= length of each string <= 200',
      sample_input: '3\nflower flow flight',
      sample_output: 'fl',
      explanation: 'The common prefix is "fl".',
      difficulty: 'medium',
      marks: 10,
      testCases: [
        { input: '3\nflower flow flight', expected_output: 'fl', is_hidden: false },
        { input: '3\ndog racecar car', expected_output: '-1', is_hidden: false },
        { input: '2\nwalchand walchandcollege', expected_output: 'walchand', is_hidden: true },
        { input: '1\nsangli', expected_output: 'sangli', is_hidden: true },
      ],
    },
  ],

  'Linked Lists': [
    {
      title: 'Count Nodes in Singly Linked List',
      problem_statement: 'Given the elements of a singly linked list terminated by -1, count the total number of nodes in the list.',
      input_format: 'A sequence of space-separated integers terminated by -1 (e.g. "10 20 30 -1").',
      output_format: 'Print the count of nodes.',
      constraints: '0 <= number of nodes <= 10^4',
      sample_input: '10 20 30 -1',
      sample_output: '3',
      explanation: 'The linked list contains 3 nodes: 10 -> 20 -> 30.',
      difficulty: 'easy',
      marks: 10,
      testCases: [
        { input: '10 20 30 -1', expected_output: '3', is_hidden: false },
        { input: '-1', expected_output: '0', is_hidden: false },
        { input: '5 -1', expected_output: '1', is_hidden: true },
        { input: '1 2 3 4 5 6 7 8 9 10 -1', expected_output: '10', is_hidden: true },
      ],
    },
    {
      title: 'Search Element in Linked List',
      problem_statement: 'Given a singly linked list terminated by -1 and a target key K, determine if K is present in the linked list. Print YES if found, otherwise NO.',
      input_format: 'First line contains the space-separated list elements ending with -1.\nSecond line contains integer K.',
      output_format: 'Print YES or NO.',
      constraints: '0 <= number of nodes <= 10^4\n-10^5 <= node.data, K <= 10^5',
      sample_input: '14 21 31 54 -1\n21',
      sample_output: 'YES',
      explanation: '21 is the second node.',
      difficulty: 'easy',
      marks: 10,
      testCases: [
        { input: '14 21 31 54 -1\n21', expected_output: 'YES', is_hidden: false },
        { input: '1 2 3 -1\n10', expected_output: 'NO', is_hidden: false },
        { input: '-1\n5', expected_output: 'NO', is_hidden: true },
        { input: '99 100 101 -1\n99', expected_output: 'YES', is_hidden: true },
      ],
    },
    {
      title: 'Reverse a Singly Linked List',
      problem_statement: 'Given the head of a singly linked list represented as space-separated integers ending with -1, reverse the list and print the new order of elements ending with -1.',
      input_format: 'Space-separated integers ending with -1.',
      output_format: 'Space-separated reversed integers ending with -1.',
      constraints: '0 <= N <= 10^4',
      sample_input: '1 2 3 4 -1',
      sample_output: '4 3 2 1 -1',
      explanation: '1->2->3->4 reversed is 4->3->2->1.',
      difficulty: 'medium',
      marks: 10,
      testCases: [
        { input: '1 2 3 4 -1', expected_output: '4 3 2 1 -1', is_hidden: false },
        { input: '1 -1', expected_output: '1 -1', is_hidden: false },
        { input: '-1', expected_output: '-1', is_hidden: true },
        { input: '10 20 30 -1', expected_output: '30 20 10 -1', is_hidden: true },
      ],
    },
  ],

  'Stacks and Queues': [
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
    {
      title: 'Implement Queue Using Array',
      problem_statement: 'Simulate a queue supporting two operations:\n1 x: Push x into the queue.\n2: Pop front element and print it (or print -1 if queue is empty).\nGiven Q queries, output the result of each pop operation on a space-separated line.',
      input_format: 'First line contains integer Q (number of queries).\nNext Q lines each contain a query (either "1 x" or "2").',
      output_format: 'Print the popped values separated by space.',
      constraints: '1 <= Q <= 1000\n1 <= x <= 10^5',
      sample_input: '5\n1 2\n1 3\n2\n1 4\n2',
      sample_output: '2 3',
      explanation: 'First pop gives 2, second pop gives 3.',
      difficulty: 'easy',
      marks: 10,
      testCases: [
        { input: '5\n1 2\n1 3\n2\n1 4\n2', expected_output: '2 3', is_hidden: false },
        { input: '3\n2\n1 10\n2', expected_output: '-1 10', is_hidden: false },
        { input: '4\n1 5\n1 6\n2\n2', expected_output: '5 6', is_hidden: true },
        { input: '2\n2\n2', expected_output: '-1 -1', is_hidden: true },
      ],
    },
    {
      title: 'Next Greater Element',
      problem_statement: 'Given an array A of size N, print the Next Greater Element (NGE) for every element. The Next Greater Element for an element x is the first greater element on the right side of x in the array. If no such element exists, output -1.',
      input_format: 'First line contains integer N.\nSecond line contains N space-separated integers.',
      output_format: 'Print N space-separated integers representing the NGE for each element.',
      constraints: '1 <= N <= 10^4\n-10^5 <= A[i] <= 10^5',
      sample_input: '4\n1 3 2 4',
      sample_output: '3 4 4 -1',
      explanation: 'Next greater for 1 is 3, for 3 is 4, for 2 is 4, and for 4 is -1.',
      difficulty: 'medium',
      marks: 10,
      testCases: [
        { input: '4\n1 3 2 4', expected_output: '3 4 4 -1', is_hidden: false },
        { input: '4\n4 3 2 1', expected_output: '-1 -1 -1 -1', is_hidden: false },
        { input: '1\n10', expected_output: '-1', is_hidden: true },
        { input: '5\n6 8 0 1 3', expected_output: '8 -1 1 3 -1', is_hidden: true },
      ],
    },
  ],

  'Data Structures and Algorithms': [
    {
      title: 'Binary Search on Sorted Array',
      problem_statement: 'Given a sorted array of N integers and a key K, find the 0-based index of K in the array using binary search. If K does not exist, print -1.',
      input_format: 'First line contains two integers N and K.\nSecond line contains N space-separated sorted integers.',
      output_format: 'Print the 0-based index of K or -1.',
      constraints: '1 <= N <= 10^5\n-10^6 <= A[i], K <= 10^6',
      sample_input: '5 4\n1 2 3 4 5',
      sample_output: '3',
      explanation: '4 is located at index 3.',
      difficulty: 'easy',
      marks: 10,
      testCases: [
        { input: '5 4\n1 2 3 4 5', expected_output: '3', is_hidden: false },
        { input: '5 6\n1 2 3 4 5', expected_output: '-1', is_hidden: false },
        { input: '1 10\n10', expected_output: '0', is_hidden: true },
        { input: '6 -2\n-10 -5 -2 0 4 9', expected_output: '2', is_hidden: true },
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
      title: 'Merge Two Sorted Arrays',
      problem_statement: 'Given two sorted integer arrays A of size N and B of size M, merge them into a single sorted array and print the elements separated by space.',
      input_format: 'First line contains two integers N and M.\nSecond line contains N space-separated integers of array A.\nThird line contains M space-separated integers of array B.',
      output_format: 'Print the merged sorted array elements separated by space.',
      constraints: '1 <= N, M <= 10^4\n-10^5 <= A[i], B[j] <= 10^5',
      sample_input: '3 3\n1 3 5\n2 4 6',
      sample_output: '1 2 3 4 5 6',
      explanation: 'Merging [1, 3, 5] and [2, 4, 6] produces [1, 2, 3, 4, 5, 6].',
      difficulty: 'medium',
      marks: 10,
      testCases: [
        { input: '3 3\n1 3 5\n2 4 6', expected_output: '1 2 3 4 5 6', is_hidden: false },
        { input: '2 1\n10 20\n5', expected_output: '5 10 20', is_hidden: false },
        { input: '1 1\n0\n0', expected_output: '0 0', is_hidden: true },
        { input: '4 2\n-5 -2 0 10\n-3 4', expected_output: '-5 -3 -2 0 4 10', is_hidden: true },
      ],
    },
  ],
};

async function seed() {
  console.log('🌱 Seeding Topic-Wise Lab Coding Question Bank...\n');
  const ok = await testConnection();
  if (!ok) {
    console.error('Cannot connect to DB.');
    process.exit(1);
  }

  // 1. Ensure topics exist
  const topicMap = {};
  for (const t of topicsToSeed) {
    const existing = await pool.query('SELECT topic_id FROM topics WHERE title = $1', [t.title]);
    if (existing.rows.length > 0) {
      topicMap[t.title] = existing.rows[0].topic_id;
      console.log(`Topic exists: "${t.title}" (ID: ${topicMap[t.title]})`);
    } else {
      const ins = await pool.query(
        'INSERT INTO topics (title, description) VALUES ($1, $2) RETURNING topic_id',
        [t.title, t.description]
      );
      topicMap[t.title] = ins.rows[0].topic_id;
      console.log(`Created Topic: "${t.title}" (ID: ${topicMap[t.title]})`);
    }
  }

  // 2. Fetch faculty_id for created_by
  const fRes = await pool.query('SELECT faculty_id FROM faculty LIMIT 1');
  const facultyId = fRes.rows[0]?.faculty_id || null;

  // 3. Seed questions for each topic
  let totalQuestionsInserted = 0;
  let totalTestCasesInserted = 0;

  for (const [topicTitle, questions] of Object.entries(topicQuestionsData)) {
    const topicId = topicMap[topicTitle];
    if (!topicId) {
      console.warn(`Skipping questions for topic "${topicTitle}" (topic not found)`);
      continue;
    }

    console.log(`\n📚 Seeding questions for topic: "${topicTitle}" (ID: ${topicId})...`);

    for (let qIndex = 0; qIndex < questions.length; qIndex++) {
      const q = questions[qIndex];
      let questionId;

      const existingQ = await pool.query(
        'SELECT lab_question_id FROM lab_coding_questions WHERE title = $1',
        [q.title]
      );

      if (existingQ.rows.length > 0) {
        questionId = existingQ.rows[0].lab_question_id;
        // Ensure topic_id is correctly mapped
        await pool.query(
          `UPDATE lab_coding_questions
           SET topic_id = $1, problem_statement = $2, input_format = $3,
               output_format = $4, constraints = $5, sample_input = $6,
               sample_output = $7, explanation = $8, difficulty = $9, marks = $10
           WHERE lab_question_id = $11`,
          [
            topicId,
            q.problem_statement,
            q.input_format,
            q.output_format,
            q.constraints,
            q.sample_input,
            q.sample_output,
            q.explanation,
            q.difficulty,
            q.marks,
            questionId,
          ]
        );
        console.log(`  Updated question: "${q.title}" (ID: ${questionId})`);
      } else {
        const insQ = await pool.query(
          `INSERT INTO lab_coding_questions
            (topic_id, title, problem_statement, input_format, output_format,
             constraints, sample_input, sample_output, explanation,
             difficulty, marks, order_index, created_by_faculty_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
            qIndex + 1,
            facultyId,
          ]
        );
        questionId = insQ.rows[0].lab_question_id;
        totalQuestionsInserted++;
        console.log(`  Created question: "${q.title}" (ID: ${questionId})`);
      }

      // Test cases
      for (let i = 0; i < q.testCases.length; i++) {
        const tc = q.testCases[i];
        const existingTC = await pool.query(
          `SELECT lab_testcase_id FROM lab_test_cases
           WHERE lab_question_id = $1 AND expected_output = $2 AND is_hidden = $3`,
          [questionId, tc.expected_output, tc.is_hidden]
        );

        if (existingTC.rows.length === 0) {
          await pool.query(
            `INSERT INTO lab_test_cases
              (lab_question_id, input, expected_output, is_hidden, order_index)
             VALUES ($1, $2, $3, $4, $5)`,
            [questionId, tc.input, tc.expected_output, tc.is_hidden, i + 1]
          );
          totalTestCasesInserted++;
        }
      }
    }
  }

  // Summary
  console.log('\n======================================================');
  console.log('📊 Question Bank Seeding Summary:');
  const topicStats = await pool.query(
    `SELECT t.topic_id, t.title, COUNT(lcq.lab_question_id)::INT AS q_count
     FROM topics t
     LEFT JOIN lab_coding_questions lcq ON lcq.topic_id = t.topic_id
     GROUP BY t.topic_id, t.title
     ORDER BY t.topic_id`
  );
  topicStats.rows.forEach((r) => {
    console.log(`  - [ID: ${r.topic_id}] ${r.title}: ${r.q_count} coding questions`);
  });

  const totalQ = await pool.query('SELECT COUNT(*) FROM lab_coding_questions');
  const totalTC = await pool.query('SELECT COUNT(*) FROM lab_test_cases');
  console.log(`Total questions in bank: ${totalQ.rows[0].count}`);
  console.log(`Total test cases in bank: ${totalTC.rows[0].count}`);
  console.log('======================================================\n');

  await pool.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
