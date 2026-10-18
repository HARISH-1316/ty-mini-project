// ──────────────────────────────────────────────
// DSA Topic-Wise Coding Question Bank — Complete Seed Script
// ──────────────────────────────────────────────
// Seeds 5 coding questions for each of the 17 DSA subtopics:
// 1. Introduction to DSA, 2. Complexity Analysis, 3. Arrays,
// 4. Strings, 5. Linked Lists, 6. Stacks, 7. Queues,
// 8. Recursion, 9. Searching Algorithms, 10. Sorting Algorithms,
// 11. Hashing, 12. Trees, 13. Binary Search Trees,
// 14. Heaps and Priority Queues, 15. Graphs, 16. Greedy Algorithms,
// 17. Dynamic Programming
// Run: node database/seedDsaQuestions.js
// Idempotent: will update existing questions by title, skip duplicates.
// ──────────────────────────────────────────────

import { pool, testConnection } from '../config/database.js';

// Difficulty → Marks (enforced server-side)
const DIFFICULTY_MARKS = { easy: 5, medium: 10, hard: 15 };
const marksFor = (d) => DIFFICULTY_MARKS[d] ?? 10;

// The main topic that contains all these as subtopics
const DSA_TOPIC_TITLE = 'Data Structures and Algorithms';

// Map: subtopic title → array of questions
const subtopicQuestions = {

  // ─────────────────────────────────────────────
  // 1. Introduction to Data Structures and Algorithms
  // ─────────────────────────────────────────────
  'Introduction to Data Structures and Algorithms': [
    {
      title: 'Count Operations in a Loop',
      problem_statement: 'Given a positive integer N, simulate a simple O(N) traversal by printing the sum of numbers from 1 to N.',
      input_format: 'A single integer N.',
      output_format: 'A single integer — the sum of 1 to N.',
      constraints: '1 <= N <= 10^6',
      sample_input: '5',
      sample_output: '15',
      explanation: '1 + 2 + 3 + 4 + 5 = 15.',
      difficulty: 'easy',
      testCases: [
        { input: '5', expected_output: '15', is_hidden: false },
        { input: '1', expected_output: '1', is_hidden: false },
        { input: '100', expected_output: '5050', is_hidden: true },
        { input: '1000000', expected_output: '500000500000', is_hidden: true },
      ],
    },
    {
      title: 'Identify Linear vs Non-Linear',
      problem_statement: 'Given a data structure name, print "Linear" if it is a linear data structure or "Non-Linear" if it is not. Consider: Array, Stack, Queue, LinkedList as Linear; Tree, Graph as Non-Linear.',
      input_format: 'A single string — the data structure name.',
      output_format: 'Print "Linear" or "Non-Linear".',
      constraints: 'Input is one of: Array, Stack, Queue, LinkedList, Tree, Graph',
      sample_input: 'Array',
      sample_output: 'Linear',
      explanation: 'Array is a linear data structure.',
      difficulty: 'easy',
      testCases: [
        { input: 'Array', expected_output: 'Linear', is_hidden: false },
        { input: 'Tree', expected_output: 'Non-Linear', is_hidden: false },
        { input: 'Stack', expected_output: 'Linear', is_hidden: true },
        { input: 'Graph', expected_output: 'Non-Linear', is_hidden: true },
        { input: 'Queue', expected_output: 'Linear', is_hidden: true },
      ],
    },
    {
      title: 'Fibonacci Sequence (Iterative)',
      problem_statement: 'Print the first N Fibonacci numbers separated by space. The Fibonacci sequence starts: 0, 1, 1, 2, 3, 5, 8, ...',
      input_format: 'A single integer N.',
      output_format: 'N space-separated Fibonacci numbers on a single line.',
      constraints: '1 <= N <= 50',
      sample_input: '6',
      sample_output: '0 1 1 2 3 5',
      explanation: 'The first 6 Fibonacci numbers are 0, 1, 1, 2, 3, 5.',
      difficulty: 'easy',
      testCases: [
        { input: '6', expected_output: '0 1 1 2 3 5', is_hidden: false },
        { input: '1', expected_output: '0', is_hidden: false },
        { input: '2', expected_output: '0 1', is_hidden: true },
        { input: '10', expected_output: '0 1 1 2 3 5 8 13 21 34', is_hidden: true },
      ],
    },
    {
      title: 'Power of Two Check',
      problem_statement: 'Given a positive integer N, determine if it is a power of 2. Print "YES" if it is, otherwise "NO". Use bit manipulation for an O(1) solution.',
      input_format: 'A single integer N.',
      output_format: 'Print YES or NO.',
      constraints: '1 <= N <= 10^9',
      sample_input: '16',
      sample_output: 'YES',
      explanation: '16 = 2^4. In binary, powers of 2 have exactly one bit set.',
      difficulty: 'medium',
      testCases: [
        { input: '16', expected_output: 'YES', is_hidden: false },
        { input: '15', expected_output: 'NO', is_hidden: false },
        { input: '1', expected_output: 'YES', is_hidden: true },
        { input: '1024', expected_output: 'YES', is_hidden: true },
        { input: '1000000000', expected_output: 'NO', is_hidden: true },
      ],
    },
    {
      title: 'Factorial with Overflow Detection',
      problem_statement: 'Given N, compute N! and print the result. If N! exceeds 10^18, print "OVERFLOW" instead.',
      input_format: 'A single integer N.',
      output_format: 'Print the factorial or "OVERFLOW".',
      constraints: '0 <= N <= 25',
      sample_input: '5',
      sample_output: '120',
      explanation: '5! = 120.',
      difficulty: 'medium',
      testCases: [
        { input: '5', expected_output: '120', is_hidden: false },
        { input: '0', expected_output: '1', is_hidden: false },
        { input: '20', expected_output: '2432902008176640000', is_hidden: true },
        { input: '21', expected_output: 'OVERFLOW', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 2. Complexity Analysis
  // ─────────────────────────────────────────────
  'Complexity Analysis': [
    {
      title: 'Count Operations — Nested Loop',
      problem_statement: 'Given N, compute the exact number of times the inner statement executes in a nested loop where i from 0 to N-1 and j from 0 to i.',
      input_format: 'A single integer N.',
      output_format: 'A single integer — the total operations count.',
      constraints: '1 <= N <= 10^4',
      sample_input: '4',
      sample_output: '10',
      explanation: 'For N=4: i=0 (1 iter) + i=1 (2) + i=2 (3) + i=3 (4) = 10 = N*(N+1)/2.',
      difficulty: 'easy',
      testCases: [
        { input: '4', expected_output: '10', is_hidden: false },
        { input: '1', expected_output: '1', is_hidden: false },
        { input: '100', expected_output: '5050', is_hidden: true },
        { input: '1000', expected_output: '500500', is_hidden: true },
      ],
    },
    {
      title: 'Classify Big-O Complexity',
      problem_statement: 'Given a description of an algorithm\'s operation count f(n), output its Big-O class:\n"constant" for O(1)\n"logarithmic" for O(log n)\n"linear" for O(n)\n"linearithmic" for O(n log n)\n"quadratic" for O(n^2)\n"exponential" for O(2^n)\nInput is one of the keywords: 1, logn, n, nlogn, n2, 2n',
      input_format: 'A single string from: 1, logn, n, nlogn, n2, 2n',
      output_format: 'Print the complexity class name.',
      constraints: 'Input is always one of the listed strings.',
      sample_input: 'n2',
      sample_output: 'quadratic',
      explanation: 'O(n^2) is classified as quadratic.',
      difficulty: 'easy',
      testCases: [
        { input: 'n2', expected_output: 'quadratic', is_hidden: false },
        { input: '1', expected_output: 'constant', is_hidden: false },
        { input: 'logn', expected_output: 'logarithmic', is_hidden: true },
        { input: 'n', expected_output: 'linear', is_hidden: true },
        { input: '2n', expected_output: 'exponential', is_hidden: true },
        { input: 'nlogn', expected_output: 'linearithmic', is_hidden: true },
      ],
    },
    {
      title: 'Binary Search Step Counter',
      problem_statement: 'Given a sorted array of N elements and a target T, perform binary search and print how many comparisons it takes to find T (or -1 if not found). A "comparison" counts each time you check the middle element.',
      input_format: 'Line 1: Two integers N and T.\nLine 2: N space-separated sorted integers.',
      output_format: 'Print the number of comparisons, then a space, then the index found (or -1).',
      constraints: '1 <= N <= 10^5\n-10^6 <= A[i], T <= 10^6',
      sample_input: '7 23\n1 3 7 10 23 50 75',
      sample_output: '2 4',
      explanation: 'Mid=3: A[3]=10 (1 comp). Mid=5: A[5]=50 > 23. Mid=4: A[4]=23 found (3 comp). Actually checking: [0,6]->mid=3 (A[3]=10,1st); [4,6]->mid=5 (A[5]=50,2nd); [4,4]->mid=4 (A[4]=23,3rd). Output: 3 4.',
      difficulty: 'medium',
      testCases: [
        { input: '7 23\n1 3 7 10 23 50 75', expected_output: '3 4', is_hidden: false },
        { input: '5 6\n1 2 3 4 5', expected_output: '3 -1', is_hidden: false },
        { input: '1 5\n5', expected_output: '1 0', is_hidden: true },
        { input: '8 1\n1 2 3 4 5 6 7 8', expected_output: '3 0', is_hidden: true },
      ],
    },
    {
      title: 'Amortized Counter — Dynamic Array Resizing',
      problem_statement: 'Simulate a dynamic array. Start with capacity 1. When array is full and you push an element, double the capacity (this costs capacity extra operations). Track total cost. Given N pushes, output total operations performed.',
      input_format: 'A single integer N.',
      output_format: 'Print the total operations.',
      constraints: '1 <= N <= 10^6',
      sample_input: '8',
      sample_output: '15',
      explanation: 'Pushes 1-8: push cost is 1 each. Resize at sizes 1,2,4,8: costs 1,2,4,8. Total = 8 pushes + (1+2+4) resizes = 8+7=15. (No resize at size 8 since N=8 fits exactly after last resize.)',
      difficulty: 'hard',
      testCases: [
        { input: '8', expected_output: '15', is_hidden: false },
        { input: '1', expected_output: '1', is_hidden: false },
        { input: '4', expected_output: '7', is_hidden: true },
        { input: '16', expected_output: '31', is_hidden: true },
      ],
    },
    {
      title: 'Worst vs Best Case Finder',
      problem_statement: 'Given an array of N integers and a target T, find T using linear search and report:\n- Comparisons made to find T (or -1 if not found)\n- Whether this was best case (1 comparison), worst case (N comparisons), or average case.',
      input_format: 'Line 1: Two integers N and T.\nLine 2: N space-separated integers.',
      output_format: 'Print two items on one line: number of comparisons and the case type (best/worst/average). If not found, print -1 and worst.',
      constraints: '1 <= N <= 10^4',
      sample_input: '5 3\n3 1 4 1 5',
      sample_output: '1 best',
      explanation: '3 is found on the first comparison.',
      difficulty: 'medium',
      testCases: [
        { input: '5 3\n3 1 4 1 5', expected_output: '1 best', is_hidden: false },
        { input: '5 9\n3 1 4 1 5', expected_output: '-1 worst', is_hidden: false },
        { input: '4 4\n1 2 3 4', expected_output: '4 worst', is_hidden: true },
        { input: '6 3\n1 2 3 4 5 6', expected_output: '3 average', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 3. Arrays
  // ─────────────────────────────────────────────
  'Arrays': [
    {
      title: 'Reverse an Array',
      problem_statement: 'Given an array of N integers, reverse the order of elements and print the resulting elements separated by spaces.',
      input_format: 'Line 1: An integer N.\nLine 2: N space-separated integers.',
      output_format: 'Print the reversed array elements separated by spaces.',
      constraints: '1 <= N <= 1000\n-10^5 <= A[i] <= 10^5',
      sample_input: '5\n1 2 3 4 5',
      sample_output: '5 4 3 2 1',
      explanation: 'Reversing [1,2,3,4,5] yields [5,4,3,2,1].',
      difficulty: 'easy',
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
      input_format: 'Line 1: An integer N.\nLine 2: N space-separated integers.',
      output_format: 'Print two space-separated integers: maximum element followed by minimum element.',
      constraints: '1 <= N <= 10^4\n-10^6 <= A[i] <= 10^6',
      sample_input: '6\n3 2 1 56 10000 167',
      sample_output: '10000 1',
      explanation: 'Maximum is 10000 and minimum is 1.',
      difficulty: 'easy',
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
      problem_statement: 'Given an array of N integers and a target sum K, determine whether there exist two distinct elements in the array whose sum equals K. Print YES if such a pair exists, otherwise NO.',
      input_format: 'Line 1: Two integers N and K.\nLine 2: N space-separated integers.',
      output_format: 'Print YES if a pair exists, otherwise NO.',
      constraints: '2 <= N <= 10^4\n-10^5 <= K, A[i] <= 10^5',
      sample_input: '5 9\n1 4 2 5 8',
      sample_output: 'YES',
      explanation: '1 + 8 = 9.',
      difficulty: 'medium',
      testCases: [
        { input: '5 9\n1 4 2 5 8', expected_output: 'YES', is_hidden: false },
        { input: '4 10\n1 2 3 4', expected_output: 'NO', is_hidden: false },
        { input: '3 0\n-5 2 5', expected_output: 'YES', is_hidden: true },
        { input: '2 6\n3 3', expected_output: 'YES', is_hidden: true },
        { input: '4 7\n2 4 6 8', expected_output: 'NO', is_hidden: true },
      ],
    },
    {
      title: 'Move Zeroes to End',
      problem_statement: 'Given an array of N integers, move all zeros to the end while maintaining the relative order of non-zero elements.',
      input_format: 'Line 1: An integer N.\nLine 2: N space-separated integers.',
      output_format: 'Print the modified array with all zeros moved to the end.',
      constraints: '1 <= N <= 10^4\n-10^5 <= A[i] <= 10^5',
      sample_input: '5\n0 1 0 3 12',
      sample_output: '1 3 12 0 0',
      explanation: 'Non-zero numbers [1, 3, 12] remain in order followed by two zeros.',
      difficulty: 'easy',
      testCases: [
        { input: '5\n0 1 0 3 12', expected_output: '1 3 12 0 0', is_hidden: false },
        { input: '3\n0 0 0', expected_output: '0 0 0', is_hidden: false },
        { input: '4\n1 2 3 4', expected_output: '1 2 3 4', is_hidden: true },
        { input: '6\n0 5 0 0 4 2', expected_output: '5 4 2 0 0 0', is_hidden: true },
      ],
    },
    {
      title: 'Maximum Subarray Sum (Kadane\'s Algorithm)',
      problem_statement: 'Given an array of N integers (possibly negative), find the contiguous subarray with the largest sum and print that sum.',
      input_format: 'Line 1: An integer N.\nLine 2: N space-separated integers.',
      output_format: 'Print the maximum subarray sum.',
      constraints: '1 <= N <= 10^5\n-10^4 <= A[i] <= 10^4',
      sample_input: '8\n-2 1 -3 4 -1 2 1 -5',
      sample_output: '6',
      explanation: 'Subarray [4,-1,2,1] has sum 6.',
      difficulty: 'medium',
      testCases: [
        { input: '8\n-2 1 -3 4 -1 2 1 -5', expected_output: '6', is_hidden: false },
        { input: '3\n-1 -2 -3', expected_output: '-1', is_hidden: false },
        { input: '1\n5', expected_output: '5', is_hidden: true },
        { input: '5\n1 2 3 4 5', expected_output: '15', is_hidden: true },
        { input: '6\n-3 2 -1 4 -2 3', expected_output: '6', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 4. Strings
  // ─────────────────────────────────────────────
  'Strings': [
    {
      title: 'Palindrome String Checker',
      problem_statement: 'Given a string S of lowercase alphanumeric characters, determine if it is a palindrome (reads the same forwards and backwards). Print YES or NO.',
      input_format: 'A single line containing the string S.',
      output_format: 'Print YES if palindrome, else NO.',
      constraints: '1 <= |S| <= 10^5',
      sample_input: 'racecar',
      sample_output: 'YES',
      explanation: '"racecar" reversed is still "racecar".',
      difficulty: 'easy',
      testCases: [
        { input: 'racecar', expected_output: 'YES', is_hidden: false },
        { input: 'virtual', expected_output: 'NO', is_hidden: false },
        { input: 'madam', expected_output: 'YES', is_hidden: true },
        { input: 'a', expected_output: 'YES', is_hidden: true },
        { input: 'abccba', expected_output: 'YES', is_hidden: true },
      ],
    },
    {
      title: 'Count Frequency of Target Character',
      problem_statement: 'Given a string S and a target character C, count how many times C appears in S.',
      input_format: 'Line 1: The string S.\nLine 2: The single character C.',
      output_format: 'Print the count of occurrences of C in S.',
      constraints: '1 <= |S| <= 10^5',
      sample_input: 'walchand\na',
      sample_output: '2',
      explanation: '"a" appears twice in "walchand".',
      difficulty: 'easy',
      testCases: [
        { input: 'walchand\na', expected_output: '2', is_hidden: false },
        { input: 'engineering\ne', expected_output: '3', is_hidden: false },
        { input: 'computer\nz', expected_output: '0', is_hidden: true },
        { input: 'aaaaa\na', expected_output: '5', is_hidden: true },
      ],
    },
    {
      title: 'Valid Anagram Checker',
      problem_statement: 'Given two lowercase strings S1 and S2, check whether S2 is an anagram of S1. Print YES if anagrams, else NO.',
      input_format: 'Line 1: String S1.\nLine 2: String S2.',
      output_format: 'Print YES if anagram, else NO.',
      constraints: '1 <= |S1|, |S2| <= 10^5',
      sample_input: 'listen\nsilent',
      sample_output: 'YES',
      explanation: '"listen" and "silent" have the same character frequencies.',
      difficulty: 'easy',
      testCases: [
        { input: 'listen\nsilent', expected_output: 'YES', is_hidden: false },
        { input: 'triangle\nintegral', expected_output: 'YES', is_hidden: false },
        { input: 'apple\npale', expected_output: 'NO', is_hidden: true },
        { input: 'a\na', expected_output: 'YES', is_hidden: true },
      ],
    },
    {
      title: 'Longest Common Prefix',
      problem_statement: 'Given N strings, find the longest common prefix. If no common prefix exists, print -1.',
      input_format: 'Line 1: An integer N.\nLine 2: N space-separated strings.',
      output_format: 'Print the longest common prefix or -1.',
      constraints: '1 <= N <= 1000\n1 <= |each string| <= 200',
      sample_input: '3\nflower flow flight',
      sample_output: 'fl',
      explanation: 'The common prefix is "fl".',
      difficulty: 'medium',
      testCases: [
        { input: '3\nflower flow flight', expected_output: 'fl', is_hidden: false },
        { input: '3\ndog racecar car', expected_output: '-1', is_hidden: false },
        { input: '2\nwalchand walchandcollege', expected_output: 'walchand', is_hidden: true },
        { input: '1\nsangli', expected_output: 'sangli', is_hidden: true },
      ],
    },
    {
      title: 'Count Distinct Substrings of Length K',
      problem_statement: 'Given a string S and integer K, count the number of distinct substrings of S of length exactly K.',
      input_format: 'Line 1: String S.\nLine 2: Integer K.',
      output_format: 'Print the count of distinct substrings of length K.',
      constraints: '1 <= |S| <= 10^4\n1 <= K <= |S|',
      sample_input: 'aababc\n2',
      sample_output: '4',
      explanation: 'Substrings of length 2: aa,ab,ba,ab,bc. Distinct: {aa,ab,ba,bc} = 4.',
      difficulty: 'medium',
      testCases: [
        { input: 'aababc\n2', expected_output: '4', is_hidden: false },
        { input: 'abcd\n2', expected_output: '3', is_hidden: false },
        { input: 'aaaa\n1', expected_output: '1', is_hidden: true },
        { input: 'abcabc\n3', expected_output: '3', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 5. Linked Lists
  // ─────────────────────────────────────────────
  'Linked Lists': [
    {
      title: 'Count Nodes in Singly Linked List',
      problem_statement: 'Given elements of a singly linked list terminated by -1, count the total number of nodes.',
      input_format: 'A sequence of space-separated integers terminated by -1.',
      output_format: 'Print the count of nodes.',
      constraints: '0 <= number of nodes <= 10^4',
      sample_input: '10 20 30 -1',
      sample_output: '3',
      explanation: 'The list has 3 nodes: 10 -> 20 -> 30.',
      difficulty: 'easy',
      testCases: [
        { input: '10 20 30 -1', expected_output: '3', is_hidden: false },
        { input: '-1', expected_output: '0', is_hidden: false },
        { input: '5 -1', expected_output: '1', is_hidden: true },
        { input: '1 2 3 4 5 6 7 8 9 10 -1', expected_output: '10', is_hidden: true },
      ],
    },
    {
      title: 'Search Element in Linked List',
      problem_statement: 'Given a singly linked list (terminated by -1) and a target K, print YES if K is present, else NO.',
      input_format: 'Line 1: Space-separated list elements ending with -1.\nLine 2: Integer K.',
      output_format: 'Print YES or NO.',
      constraints: '0 <= number of nodes <= 10^4\n-10^5 <= K <= 10^5',
      sample_input: '14 21 31 54 -1\n21',
      sample_output: 'YES',
      explanation: '21 is present in the linked list.',
      difficulty: 'easy',
      testCases: [
        { input: '14 21 31 54 -1\n21', expected_output: 'YES', is_hidden: false },
        { input: '1 2 3 -1\n10', expected_output: 'NO', is_hidden: false },
        { input: '-1\n5', expected_output: 'NO', is_hidden: true },
        { input: '99 100 101 -1\n99', expected_output: 'YES', is_hidden: true },
      ],
    },
    {
      title: 'Reverse a Singly Linked List',
      problem_statement: 'Given a singly linked list (space-separated, terminated by -1), reverse it and print the new order.',
      input_format: 'Space-separated integers ending with -1.',
      output_format: 'Reversed integers ending with -1.',
      constraints: '0 <= N <= 10^4',
      sample_input: '1 2 3 4 -1',
      sample_output: '4 3 2 1 -1',
      explanation: '1->2->3->4 reversed is 4->3->2->1.',
      difficulty: 'medium',
      testCases: [
        { input: '1 2 3 4 -1', expected_output: '4 3 2 1 -1', is_hidden: false },
        { input: '1 -1', expected_output: '1 -1', is_hidden: false },
        { input: '-1', expected_output: '-1', is_hidden: true },
        { input: '10 20 30 -1', expected_output: '30 20 10 -1', is_hidden: true },
      ],
    },
    {
      title: 'Find Middle Node of Linked List',
      problem_statement: 'Given a singly linked list (terminated by -1), find and print the middle node value. If the list has even nodes, print the second middle element.',
      input_format: 'Space-separated integers ending with -1.',
      output_format: 'Print the middle node value.',
      constraints: '1 <= N <= 10^4',
      sample_input: '1 2 3 4 5 -1',
      sample_output: '3',
      explanation: 'Middle of [1,2,3,4,5] is 3.',
      difficulty: 'easy',
      testCases: [
        { input: '1 2 3 4 5 -1', expected_output: '3', is_hidden: false },
        { input: '1 2 3 4 -1', expected_output: '3', is_hidden: false },
        { input: '42 -1', expected_output: '42', is_hidden: true },
        { input: '1 2 -1', expected_output: '2', is_hidden: true },
      ],
    },
    {
      title: 'Detect Loop in Linked List',
      problem_statement: 'Given a sequence of linked list nodes, detect if there is a loop. The input encodes a list with an optional back-pointer: each node has a value; the last line contains "LOOP X" where X is the 0-based index of the node the tail points back to (creating a cycle), or "NO_LOOP".',
      input_format: 'Line 1: N space-separated node values.\nLine 2: "LOOP X" or "NO_LOOP".',
      output_format: 'Print YES if there is a loop, otherwise NO.',
      constraints: '1 <= N <= 10^4\n0 <= X < N',
      sample_input: '3 2 0 4\nLOOP 1',
      sample_output: 'YES',
      explanation: 'The tail node (4) points back to node at index 1 (value 2), creating a cycle.',
      difficulty: 'medium',
      testCases: [
        { input: '3 2 0 4\nLOOP 1', expected_output: 'YES', is_hidden: false },
        { input: '1 2 3\nNO_LOOP', expected_output: 'NO', is_hidden: false },
        { input: '5\nLOOP 0', expected_output: 'YES', is_hidden: true },
        { input: '1 2\nNO_LOOP', expected_output: 'NO', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 6. Stacks
  // ─────────────────────────────────────────────
  'Stacks': [
    {
      title: 'Valid Parentheses String',
      problem_statement: 'Given a string containing only (), {}, [], check if the brackets are valid and properly nested. Print YES or NO.',
      input_format: 'A single line containing the bracket string.',
      output_format: 'Print YES if valid, otherwise NO.',
      constraints: '1 <= |S| <= 10^4',
      sample_input: '()[]{}',
      sample_output: 'YES',
      explanation: 'All brackets are properly matched.',
      difficulty: 'medium',
      testCases: [
        { input: '()[]{}', expected_output: 'YES', is_hidden: false },
        { input: '(]', expected_output: 'NO', is_hidden: false },
        { input: '([{}])', expected_output: 'YES', is_hidden: true },
        { input: '((()', expected_output: 'NO', is_hidden: true },
        { input: '([)]', expected_output: 'NO', is_hidden: true },
      ],
    },
    {
      title: 'Stack Push and Pop Simulation',
      problem_statement: 'Simulate a stack with push and pop operations.\n"1 x": push x\n"2": pop and print top (print -1 if empty)\nProcess Q queries.',
      input_format: 'Line 1: Q (number of queries).\nNext Q lines: each "1 x" or "2".',
      output_format: 'Print popped values separated by newlines.',
      constraints: '1 <= Q <= 1000\n1 <= x <= 10^5',
      sample_input: '5\n1 10\n1 20\n2\n1 30\n2',
      sample_output: '20\n30',
      explanation: 'Push 10, push 20, pop 20, push 30, pop 30.',
      difficulty: 'easy',
      testCases: [
        { input: '5\n1 10\n1 20\n2\n1 30\n2', expected_output: '20\n30', is_hidden: false },
        { input: '3\n2\n1 5\n2', expected_output: '-1\n5', is_hidden: false },
        { input: '4\n1 1\n1 2\n2\n2', expected_output: '2\n1', is_hidden: true },
        { input: '2\n2\n2', expected_output: '-1\n-1', is_hidden: true },
      ],
    },
    {
      title: 'Next Greater Element',
      problem_statement: 'Given an array A of N elements, find the Next Greater Element for each element. The NGE for element x is the first greater element to the right. If no such element exists, output -1.',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated integers.',
      output_format: 'Print N space-separated integers representing NGE for each element.',
      constraints: '1 <= N <= 10^4\n-10^5 <= A[i] <= 10^5',
      sample_input: '4\n1 3 2 4',
      sample_output: '3 4 4 -1',
      explanation: 'NGE of 1 is 3, of 3 is 4, of 2 is 4, of 4 is -1.',
      difficulty: 'medium',
      testCases: [
        { input: '4\n1 3 2 4', expected_output: '3 4 4 -1', is_hidden: false },
        { input: '4\n4 3 2 1', expected_output: '-1 -1 -1 -1', is_hidden: false },
        { input: '1\n10', expected_output: '-1', is_hidden: true },
        { input: '5\n6 8 0 1 3', expected_output: '8 -1 1 3 -1', is_hidden: true },
      ],
    },
    {
      title: 'Evaluate Postfix Expression',
      problem_statement: 'Given a postfix (Reverse Polish Notation) expression as space-separated tokens, evaluate it and print the result. Operators: +, -, *, /.',
      input_format: 'A single line of space-separated tokens (integers and operators).',
      output_format: 'Print the integer result.',
      constraints: 'Expression is valid. -10^4 <= operand <= 10^4. Result fits in int. No division by zero.',
      sample_input: '3 4 + 2 * 7 /',
      sample_output: '2',
      explanation: '(3+4)*2/7 = 14/2... actually: 3 4 + = 7; 7 2 * = 14; 14 7 / = 2.',
      difficulty: 'medium',
      testCases: [
        { input: '3 4 + 2 * 7 /', expected_output: '2', is_hidden: false },
        { input: '2 3 4 + *', expected_output: '14', is_hidden: false },
        { input: '5 1 2 + 4 * + 3 -', expected_output: '14', is_hidden: true },
        { input: '10 2 /', expected_output: '5', is_hidden: true },
      ],
    },
    {
      title: 'Sort a Stack',
      problem_statement: 'Given N elements to push into a stack (in order), print the elements of the stack after sorting them so the smallest element is at the top, without using any other data structure except one additional temporary stack.',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated integers (pushed in order, last is top).',
      output_format: 'Print the sorted stack elements from top to bottom (smallest to largest).',
      constraints: '1 <= N <= 100\n-10^4 <= elements <= 10^4',
      sample_input: '4\n3 1 4 2',
      sample_output: '1 2 3 4',
      explanation: 'The sorted stack has 1 at top, 4 at bottom. Output top-to-bottom: 1 2 3 4.',
      difficulty: 'hard',
      testCases: [
        { input: '4\n3 1 4 2', expected_output: '1 2 3 4', is_hidden: false },
        { input: '3\n5 3 1', expected_output: '1 3 5', is_hidden: false },
        { input: '1\n7', expected_output: '7', is_hidden: true },
        { input: '5\n-3 0 -1 2 1', expected_output: '-3 -1 0 1 2', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 7. Queues
  // ─────────────────────────────────────────────
  'Queues': [
    {
      title: 'Queue Push and Pop Simulation',
      problem_statement: 'Simulate a queue with enqueue and dequeue operations.\n"1 x": enqueue x\n"2": dequeue and print front (print -1 if empty)\nProcess Q queries.',
      input_format: 'Line 1: Q.\nNext Q lines: "1 x" or "2".',
      output_format: 'Print dequeued values separated by newlines.',
      constraints: '1 <= Q <= 1000\n1 <= x <= 10^5',
      sample_input: '5\n1 2\n1 3\n2\n1 4\n2',
      sample_output: '2\n3',
      explanation: 'First dequeue gives 2 (FIFO), second gives 3.',
      difficulty: 'easy',
      testCases: [
        { input: '5\n1 2\n1 3\n2\n1 4\n2', expected_output: '2\n3', is_hidden: false },
        { input: '3\n2\n1 10\n2', expected_output: '-1\n10', is_hidden: false },
        { input: '4\n1 5\n1 6\n2\n2', expected_output: '5\n6', is_hidden: true },
        { input: '2\n2\n2', expected_output: '-1\n-1', is_hidden: true },
      ],
    },
    {
      title: 'First Non-Repeating Character in Stream',
      problem_statement: 'Given a string stream of lowercase characters, after each character is processed, print the first non-repeating character in the current stream. If none exists, print #.',
      input_format: 'A single string S.',
      output_format: 'Print |S| characters (one per character processed), forming the answer string.',
      constraints: '1 <= |S| <= 10^4',
      sample_input: 'aabbc',
      sample_output: 'a#b#c',
      explanation: 'a→a; aa→#; aab→b; aabb→#; aabbc→c',
      difficulty: 'medium',
      testCases: [
        { input: 'aabbc', expected_output: 'a#b#c', is_hidden: false },
        { input: 'abc', expected_output: 'aab', is_hidden: false },
        { input: 'a', expected_output: 'a', is_hidden: true },
        { input: 'abac', expected_output: 'aabb', is_hidden: true },
      ],
    },
    {
      title: 'Sliding Window Maximum',
      problem_statement: 'Given an array of N integers and a window size K, find the maximum element in each sliding window of size K.',
      input_format: 'Line 1: Two integers N and K.\nLine 2: N space-separated integers.',
      output_format: 'Print (N-K+1) space-separated maximum values.',
      constraints: '1 <= K <= N <= 10^5\n-10^4 <= A[i] <= 10^4',
      sample_input: '8 3\n1 3 -1 -3 5 3 6 7',
      sample_output: '3 3 5 5 6 7',
      explanation: 'Windows: [1,3,-1]=3, [3,-1,-3]=3, [-1,-3,5]=5, [-3,5,3]=5, [5,3,6]=6, [3,6,7]=7',
      difficulty: 'hard',
      testCases: [
        { input: '8 3\n1 3 -1 -3 5 3 6 7', expected_output: '3 3 5 5 6 7', is_hidden: false },
        { input: '5 1\n1 2 3 4 5', expected_output: '1 2 3 4 5', is_hidden: false },
        { input: '4 4\n1 2 3 4', expected_output: '4', is_hidden: true },
        { input: '6 2\n2 1 5 3 6 4', expected_output: '2 5 5 6 6', is_hidden: true },
      ],
    },
    {
      title: 'Implement Stack using Queue',
      problem_statement: 'Implement a stack using two queues, supporting push and pop operations.\n"1 x": push x\n"2": pop and print top (or -1 if empty)',
      input_format: 'Line 1: Q.\nNext Q lines: "1 x" or "2".',
      output_format: 'Print popped values separated by newlines.',
      constraints: '1 <= Q <= 1000',
      sample_input: '5\n1 10\n1 20\n2\n1 30\n2',
      sample_output: '20\n30',
      explanation: 'Using two queues to simulate LIFO: last pushed is first popped.',
      difficulty: 'medium',
      testCases: [
        { input: '5\n1 10\n1 20\n2\n1 30\n2', expected_output: '20\n30', is_hidden: false },
        { input: '3\n1 1\n1 2\n2', expected_output: '2', is_hidden: false },
        { input: '2\n2\n1 5', expected_output: '-1', is_hidden: true },
        { input: '4\n1 3\n1 4\n2\n2', expected_output: '4\n3', is_hidden: true },
      ],
    },
    {
      title: 'BFS Level Order Traversal',
      problem_statement: 'Given a binary tree in level-order input (with -1 representing null), perform BFS and print the nodes level by level, each level on a new line.',
      input_format: 'A single line of space-separated integers representing the binary tree in level order (-1 = null).',
      output_format: 'Print node values level by level, one level per line, values separated by spaces.',
      constraints: '1 <= N <= 1000 (non-null nodes)',
      sample_input: '1 2 3 4 5 -1 -1',
      sample_output: '1\n2 3\n4 5',
      explanation: 'Root=1, level 2: 2,3, level 3: 4,5.',
      difficulty: 'medium',
      testCases: [
        { input: '1 2 3 4 5 -1 -1', expected_output: '1\n2 3\n4 5', is_hidden: false },
        { input: '1', expected_output: '1', is_hidden: false },
        { input: '1 -1 2 -1 -1 -1 3', expected_output: '1\n2\n3', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 8. Recursion
  // ─────────────────────────────────────────────
  'Recursion': [
    {
      title: 'Recursive Factorial',
      problem_statement: 'Compute the factorial of N using recursion and print the result.',
      input_format: 'A single integer N.',
      output_format: 'Print N!',
      constraints: '0 <= N <= 12',
      sample_input: '5',
      sample_output: '120',
      explanation: '5! = 5*4*3*2*1 = 120.',
      difficulty: 'easy',
      testCases: [
        { input: '5', expected_output: '120', is_hidden: false },
        { input: '0', expected_output: '1', is_hidden: false },
        { input: '12', expected_output: '479001600', is_hidden: true },
        { input: '1', expected_output: '1', is_hidden: true },
      ],
    },
    {
      title: 'Tower of Hanoi Moves',
      problem_statement: 'Solve the Tower of Hanoi for N disks and print each move as "Move disk D from X to Y". Use recursion.',
      input_format: 'A single integer N.',
      output_format: 'Print all moves, each on a new line: "Move disk D from X to Y" where D is disk number (1=smallest), X and Y are peg names (A, B, C).',
      constraints: '1 <= N <= 4',
      sample_input: '2',
      sample_output: 'Move disk 1 from A to C\nMove disk 2 from A to B\nMove disk 1 from C to B',
      explanation: 'For 2 disks: move smallest (1) to C, move (2) to B, move (1) from C to B.',
      difficulty: 'medium',
      testCases: [
        { input: '2', expected_output: 'Move disk 1 from A to C\nMove disk 2 from A to B\nMove disk 1 from C to B', is_hidden: false },
        { input: '1', expected_output: 'Move disk 1 from A to B', is_hidden: false },
        { input: '3', expected_output: 'Move disk 1 from A to B\nMove disk 2 from A to C\nMove disk 1 from B to C\nMove disk 3 from A to B\nMove disk 1 from C to A\nMove disk 2 from C to B\nMove disk 1 from A to B', is_hidden: true },
      ],
    },
    {
      title: 'Generate All Subsets',
      problem_statement: 'Given N distinct integers, use recursion to generate and print all 2^N subsets. Print each subset on a new line, elements separated by spaces. Print empty set as "{}". Sort subsets lexicographically.',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated distinct integers (sorted).',
      output_format: 'Print all subsets, one per line, sorted.',
      constraints: '1 <= N <= 4',
      sample_input: '2\n1 2',
      sample_output: '{}\n1\n1 2\n2',
      explanation: 'All subsets of {1,2}: {}, {1}, {1,2}, {2}.',
      difficulty: 'medium',
      testCases: [
        { input: '2\n1 2', expected_output: '{}\n1\n1 2\n2', is_hidden: false },
        { input: '1\n5', expected_output: '{}\n5', is_hidden: false },
        { input: '3\n1 2 3', expected_output: '{}\n1\n1 2\n1 2 3\n1 3\n2\n2 3\n3', is_hidden: true },
      ],
    },
    {
      title: 'N-Queens Problem Count',
      problem_statement: 'Given N, count the number of distinct solutions to the N-Queens problem (place N queens on an N×N board such that no two attack each other). Print the count.',
      input_format: 'A single integer N.',
      output_format: 'Print the number of solutions.',
      constraints: '1 <= N <= 8',
      sample_input: '4',
      sample_output: '2',
      explanation: 'There are exactly 2 distinct solutions for the 4-Queens problem.',
      difficulty: 'hard',
      testCases: [
        { input: '4', expected_output: '2', is_hidden: false },
        { input: '1', expected_output: '1', is_hidden: false },
        { input: '8', expected_output: '92', is_hidden: true },
        { input: '6', expected_output: '4', is_hidden: true },
      ],
    },
    {
      title: 'String Permutations',
      problem_statement: 'Given a string S of distinct lowercase characters, generate and print all permutations in lexicographic order using recursion.',
      input_format: 'A single string S.',
      output_format: 'Print all permutations, one per line, in lexicographic order.',
      constraints: '1 <= |S| <= 6',
      sample_input: 'abc',
      sample_output: 'abc\nacb\nbac\nbca\ncab\ncba',
      explanation: 'All 3! = 6 permutations of "abc" in sorted order.',
      difficulty: 'medium',
      testCases: [
        { input: 'abc', expected_output: 'abc\nacb\nbac\nbca\ncab\ncba', is_hidden: false },
        { input: 'ab', expected_output: 'ab\nba', is_hidden: false },
        { input: 'a', expected_output: 'a', is_hidden: true },
        { input: 'ba', expected_output: 'ab\nba', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 9. Searching Algorithms
  // ─────────────────────────────────────────────
  'Searching Algorithms': [
    {
      title: 'Linear Search',
      problem_statement: 'Given an array of N integers and a target K, find the 0-based index of K using linear search. If K appears multiple times, return the first occurrence. If not found, print -1.',
      input_format: 'Line 1: Two integers N and K.\nLine 2: N space-separated integers.',
      output_format: 'Print the index or -1.',
      constraints: '1 <= N <= 10^5\n-10^6 <= K, A[i] <= 10^6',
      sample_input: '6 23\n1 3 7 23 23 50',
      sample_output: '3',
      explanation: '23 first appears at index 3.',
      difficulty: 'easy',
      testCases: [
        { input: '6 23\n1 3 7 23 23 50', expected_output: '3', is_hidden: false },
        { input: '4 99\n1 2 3 4', expected_output: '-1', is_hidden: false },
        { input: '1 5\n5', expected_output: '0', is_hidden: true },
        { input: '5 1\n1 1 1 1 1', expected_output: '0', is_hidden: true },
      ],
    },
    {
      title: 'Binary Search on Sorted Array',
      problem_statement: 'Given a sorted array of N integers and a target K, find its 0-based index using binary search. Print -1 if not found.',
      input_format: 'Line 1: Two integers N and K.\nLine 2: N sorted space-separated integers.',
      output_format: 'Print the index or -1.',
      constraints: '1 <= N <= 10^5\n-10^6 <= A[i], K <= 10^6',
      sample_input: '5 4\n1 2 3 4 5',
      sample_output: '3',
      explanation: '4 is at index 3.',
      difficulty: 'easy',
      testCases: [
        { input: '5 4\n1 2 3 4 5', expected_output: '3', is_hidden: false },
        { input: '5 6\n1 2 3 4 5', expected_output: '-1', is_hidden: false },
        { input: '1 10\n10', expected_output: '0', is_hidden: true },
        { input: '6 -2\n-10 -5 -2 0 4 9', expected_output: '2', is_hidden: true },
      ],
    },
    {
      title: 'Find First and Last Position',
      problem_statement: 'Given a sorted array of N integers and a target K, find the first and last positions (0-based) where K appears. Print "-1 -1" if K is not found.',
      input_format: 'Line 1: Two integers N and K.\nLine 2: N sorted space-separated integers.',
      output_format: 'Print two space-separated integers: first position and last position.',
      constraints: '1 <= N <= 10^5',
      sample_input: '8 8\n5 7 7 8 8 8 10 10',
      sample_output: '3 5',
      explanation: '8 appears at indices 3, 4, and 5.',
      difficulty: 'medium',
      testCases: [
        { input: '8 8\n5 7 7 8 8 8 10 10', expected_output: '3 5', is_hidden: false },
        { input: '4 6\n1 2 3 4', expected_output: '-1 -1', is_hidden: false },
        { input: '5 5\n5 5 5 5 5', expected_output: '0 4', is_hidden: true },
        { input: '3 2\n1 2 3', expected_output: '1 1', is_hidden: true },
      ],
    },
    {
      title: 'Search in Rotated Sorted Array',
      problem_statement: 'Given a sorted array that has been rotated at an unknown pivot, and a target K, find its index using binary search. Print -1 if not found.',
      input_format: 'Line 1: Two integers N and K.\nLine 2: N space-separated integers (rotated sorted).',
      output_format: 'Print the index or -1.',
      constraints: '1 <= N <= 10^5',
      sample_input: '7 0\n4 5 6 7 0 1 2',
      sample_output: '4',
      explanation: '0 is at index 4 in the rotated array.',
      difficulty: 'hard',
      testCases: [
        { input: '7 0\n4 5 6 7 0 1 2', expected_output: '4', is_hidden: false },
        { input: '4 3\n1 3 5 6', expected_output: '1', is_hidden: false },
        { input: '1 5\n5', expected_output: '0', is_hidden: true },
        { input: '5 4\n3 4 5 1 2', expected_output: '1', is_hidden: true },
      ],
    },
    {
      title: 'Count Occurrences in Sorted Array',
      problem_statement: 'Given a sorted array of N integers and a target K, count the total number of occurrences of K using binary search.',
      input_format: 'Line 1: Two integers N and K.\nLine 2: N sorted space-separated integers.',
      output_format: 'Print the count of occurrences.',
      constraints: '1 <= N <= 10^5',
      sample_input: '7 4\n1 2 4 4 4 5 6',
      sample_output: '3',
      explanation: '4 appears 3 times.',
      difficulty: 'medium',
      testCases: [
        { input: '7 4\n1 2 4 4 4 5 6', expected_output: '3', is_hidden: false },
        { input: '5 3\n1 2 5 6 7', expected_output: '0', is_hidden: false },
        { input: '5 5\n5 5 5 5 5', expected_output: '5', is_hidden: true },
        { input: '4 2\n1 2 3 4', expected_output: '1', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 10. Sorting Algorithms
  // ─────────────────────────────────────────────
  'Sorting Algorithms': [
    {
      title: 'Bubble Sort',
      problem_statement: 'Sort an array of N integers using Bubble Sort and print the sorted array and the number of swaps performed.',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated integers.',
      output_format: 'Line 1: Sorted array (space-separated).\nLine 2: Number of swaps.',
      constraints: '1 <= N <= 1000\n-10^4 <= A[i] <= 10^4',
      sample_input: '4\n64 34 25 12',
      sample_output: '12 25 34 64\n6',
      explanation: 'Bubble sort performs 6 swaps on this array.',
      difficulty: 'easy',
      testCases: [
        { input: '4\n64 34 25 12', expected_output: '12 25 34 64\n6', is_hidden: false },
        { input: '3\n1 2 3', expected_output: '1 2 3\n0', is_hidden: false },
        { input: '4\n4 3 2 1', expected_output: '1 2 3 4\n6', is_hidden: true },
        { input: '1\n5', expected_output: '5\n0', is_hidden: true },
      ],
    },
    {
      title: 'Merge Sort and Count Inversions',
      problem_statement: 'Given an array of N integers, sort it using Merge Sort and also count the number of inversions (pairs i < j where A[i] > A[j]).',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated integers.',
      output_format: 'Line 1: Sorted array (space-separated).\nLine 2: Inversion count.',
      constraints: '1 <= N <= 10^5\n-10^6 <= A[i] <= 10^6',
      sample_input: '5\n2 4 1 3 5',
      sample_output: '1 2 3 4 5\n3',
      explanation: 'Inversions: (2,1), (4,1), (4,3) → 3 inversions.',
      difficulty: 'hard',
      testCases: [
        { input: '5\n2 4 1 3 5', expected_output: '1 2 3 4 5\n3', is_hidden: false },
        { input: '3\n1 2 3', expected_output: '1 2 3\n0', is_hidden: false },
        { input: '3\n3 2 1', expected_output: '1 2 3\n3', is_hidden: true },
        { input: '1\n1', expected_output: '1\n0', is_hidden: true },
      ],
    },
    {
      title: 'Quick Sort',
      problem_statement: 'Sort an array of N integers using Quick Sort (use last element as pivot) and print the sorted result.',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated integers.',
      output_format: 'Print the sorted array space-separated.',
      constraints: '1 <= N <= 1000\n-10^4 <= A[i] <= 10^4',
      sample_input: '5\n10 7 8 9 1',
      sample_output: '1 7 8 9 10',
      explanation: 'Quick sort with last-element pivot.',
      difficulty: 'medium',
      testCases: [
        { input: '5\n10 7 8 9 1', expected_output: '1 7 8 9 10', is_hidden: false },
        { input: '4\n4 3 2 1', expected_output: '1 2 3 4', is_hidden: false },
        { input: '1\n100', expected_output: '100', is_hidden: true },
        { input: '6\n-3 0 5 -1 2 1', expected_output: '-3 -1 0 1 2 5', is_hidden: true },
      ],
    },
    {
      title: 'Insertion Sort',
      problem_statement: 'Sort an array using Insertion Sort. Print the array state after each insertion step (including initial). One line per step.',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated integers.',
      output_format: 'Print N lines: the state of the array after each insertion step.',
      constraints: '2 <= N <= 10',
      sample_input: '4\n8 4 2 1',
      sample_output: '8 4 2 1\n4 8 2 1\n2 4 8 1\n1 2 4 8',
      explanation: 'Each line shows the array after inserting element at position i.',
      difficulty: 'medium',
      testCases: [
        { input: '4\n8 4 2 1', expected_output: '8 4 2 1\n4 8 2 1\n2 4 8 1\n1 2 4 8', is_hidden: false },
        { input: '3\n1 2 3', expected_output: '1 2 3\n1 2 3\n1 2 3', is_hidden: false },
        { input: '2\n5 3', expected_output: '5 3\n3 5', is_hidden: true },
      ],
    },
    {
      title: 'Kth Smallest Element',
      problem_statement: 'Given an array of N integers and integer K, find the Kth smallest element using a QuickSelect algorithm (average O(N)).',
      input_format: 'Line 1: Two integers N and K.\nLine 2: N space-separated integers.',
      output_format: 'Print the Kth smallest element.',
      constraints: '1 <= K <= N <= 10^5\n-10^6 <= A[i] <= 10^6',
      sample_input: '6 2\n7 10 4 3 20 15',
      sample_output: '4',
      explanation: 'Sorted: [3,4,7,10,15,20]. 2nd smallest is 4.',
      difficulty: 'hard',
      testCases: [
        { input: '6 2\n7 10 4 3 20 15', expected_output: '4', is_hidden: false },
        { input: '5 1\n5 4 3 2 1', expected_output: '1', is_hidden: false },
        { input: '3 3\n2 1 3', expected_output: '3', is_hidden: true },
        { input: '7 4\n1 2 3 4 5 6 7', expected_output: '4', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 11. Hashing
  // ─────────────────────────────────────────────
  'Hashing': [
    {
      title: 'Count Distinct Elements',
      problem_statement: 'Given an array of N integers, count the number of distinct elements using a hash set.',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated integers.',
      output_format: 'Print the count of distinct elements.',
      constraints: '1 <= N <= 10^5\n-10^6 <= A[i] <= 10^6',
      sample_input: '7\n1 2 3 2 1 4 5',
      sample_output: '5',
      explanation: 'Distinct elements: {1, 2, 3, 4, 5}.',
      difficulty: 'easy',
      testCases: [
        { input: '7\n1 2 3 2 1 4 5', expected_output: '5', is_hidden: false },
        { input: '4\n5 5 5 5', expected_output: '1', is_hidden: false },
        { input: '3\n1 2 3', expected_output: '3', is_hidden: true },
        { input: '5\n0 -1 0 1 -1', expected_output: '3', is_hidden: true },
      ],
    },
    {
      title: 'Most Frequent Element',
      problem_statement: 'Given an array of N integers, find the element with the highest frequency. If multiple elements have the same maximum frequency, print the smallest one.',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated integers.',
      output_format: 'Print the most frequent element.',
      constraints: '1 <= N <= 10^5',
      sample_input: '7\n1 3 1 3 2 3 3',
      sample_output: '3',
      explanation: '3 appears 4 times (most frequent).',
      difficulty: 'easy',
      testCases: [
        { input: '7\n1 3 1 3 2 3 3', expected_output: '3', is_hidden: false },
        { input: '4\n2 1 2 1', expected_output: '1', is_hidden: false },
        { input: '1\n7', expected_output: '7', is_hidden: true },
        { input: '5\n-1 -2 -1 -2 -1', expected_output: '-1', is_hidden: true },
      ],
    },
    {
      title: 'Pair with Given Sum using Hashing',
      problem_statement: 'Given an unsorted array and target K, find all unique pairs (a, b) where a + b = K and a <= b. Print them sorted by first element.',
      input_format: 'Line 1: Two integers N and K.\nLine 2: N space-separated integers.',
      output_format: 'Print each pair on a new line as "a b". If no pairs, print "NONE".',
      constraints: '1 <= N <= 10^4\n-10^5 <= K, A[i] <= 10^5',
      sample_input: '6 9\n1 5 3 6 8 4',
      sample_output: '1 8\n3 6',
      explanation: '1+8=9 and 3+6=9.',
      difficulty: 'medium',
      testCases: [
        { input: '6 9\n1 5 3 6 8 4', expected_output: '1 8\n3 6', is_hidden: false },
        { input: '4 10\n1 2 3 4', expected_output: 'NONE', is_hidden: false },
        { input: '4 8\n4 4 3 5', expected_output: '3 5\n4 4', is_hidden: true },
        { input: '3 0\n-1 0 1', expected_output: '-1 1', is_hidden: true },
      ],
    },
    {
      title: 'Longest Subarray with Zero Sum',
      problem_statement: 'Given an array of N integers (possibly negative), find the length of the longest subarray with sum equal to 0.',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated integers.',
      output_format: 'Print the length of the longest zero-sum subarray (0 if none).',
      constraints: '1 <= N <= 10^5\n-10^3 <= A[i] <= 10^3',
      sample_input: '8\n15 -2 2 -8 1 7 10 23',
      sample_output: '5',
      explanation: 'Subarray [-2,2,-8,1,7] (indices 1-5) sums to 0, length 5.',
      difficulty: 'hard',
      testCases: [
        { input: '8\n15 -2 2 -8 1 7 10 23', expected_output: '5', is_hidden: false },
        { input: '3\n1 2 3', expected_output: '0', is_hidden: false },
        { input: '4\n1 -1 1 -1', expected_output: '4', is_hidden: true },
        { input: '2\n0 0', expected_output: '2', is_hidden: true },
      ],
    },
    {
      title: 'Group Anagrams',
      problem_statement: 'Given N words, group the anagrams together and print each group on a new line (words sorted within group, groups sorted by smallest word).',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated lowercase words.',
      output_format: 'Print each anagram group on a new line (words sorted within, groups sorted by first word).',
      constraints: '1 <= N <= 100\n1 <= |word| <= 20',
      sample_input: '6\neat tea tan ate nat bat',
      sample_output: 'ate eat tea\nbat\nnat tan',
      explanation: '(eat,tea,ate), (bat), (tan,nat) are the anagram groups.',
      difficulty: 'medium',
      testCases: [
        { input: '6\neat tea tan ate nat bat', expected_output: 'ate eat tea\nbat\nnat tan', is_hidden: false },
        { input: '2\nab ba', expected_output: 'ab ba', is_hidden: false },
        { input: '3\na b c', expected_output: 'a\nb\nc', is_hidden: true },
        { input: '4\nlisten silent enlist rat', expected_output: 'enlist listen silent\nrat', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 12. Trees
  // ─────────────────────────────────────────────
  'Trees': [
    {
      title: 'Tree Height',
      problem_statement: 'Given a binary tree in level-order (-1 = null), compute and print its height (number of edges on longest root-to-leaf path). An empty tree has height -1.',
      input_format: 'A single line of space-separated integers (level-order, -1 = null).',
      output_format: 'Print the height.',
      constraints: '0 <= N <= 1000 (non-null nodes)',
      sample_input: '1 2 3 4 5',
      sample_output: '2',
      explanation: 'Longest path: 1→2→4 or 1→2→5 = 2 edges.',
      difficulty: 'easy',
      testCases: [
        { input: '1 2 3 4 5', expected_output: '2', is_hidden: false },
        { input: '1', expected_output: '0', is_hidden: false },
        { input: '1 2 -1 3 -1', expected_output: '2', is_hidden: true },
        { input: '1 -1 2 -1 -1 -1 3', expected_output: '2', is_hidden: true },
      ],
    },
    {
      title: 'Inorder, Preorder, Postorder Traversals',
      problem_statement: 'Given a binary tree in level-order (-1 = null), print its Inorder, Preorder, and Postorder traversals.',
      input_format: 'A single line of space-separated integers (level-order, -1 = null).',
      output_format: 'Three lines: Inorder, Preorder, Postorder (space-separated each).',
      constraints: '1 <= N <= 100',
      sample_input: '1 2 3 4 5',
      sample_output: '4 2 5 1 3\n1 2 4 5 3\n4 5 2 3 1',
      explanation: 'Tree: 1(root), 2(left),3(right), 4(left of 2), 5(right of 2).',
      difficulty: 'easy',
      testCases: [
        { input: '1 2 3 4 5', expected_output: '4 2 5 1 3\n1 2 4 5 3\n4 5 2 3 1', is_hidden: false },
        { input: '1', expected_output: '1\n1\n1', is_hidden: false },
        { input: '4 2 7 1 3 6 9', expected_output: '1 2 3 4 6 7 9\n4 2 1 3 7 6 9\n1 3 2 6 9 7 4', is_hidden: true },
      ],
    },
    {
      title: 'Count Leaf Nodes',
      problem_statement: 'Given a binary tree in level-order (-1 = null), count the number of leaf nodes (nodes with no children).',
      input_format: 'A single line of space-separated integers (level-order, -1 = null).',
      output_format: 'Print the count of leaf nodes.',
      constraints: '1 <= N <= 1000',
      sample_input: '1 2 3 4 5',
      sample_output: '3',
      explanation: 'Leaf nodes are 3, 4, 5.',
      difficulty: 'easy',
      testCases: [
        { input: '1 2 3 4 5', expected_output: '3', is_hidden: false },
        { input: '1', expected_output: '1', is_hidden: false },
        { input: '1 2 3', expected_output: '2', is_hidden: true },
        { input: '1 2 -1 3 -1', expected_output: '1', is_hidden: true },
      ],
    },
    {
      title: 'Check Balanced Binary Tree',
      problem_statement: 'Given a binary tree in level-order (-1 = null), determine if it is height-balanced (for every node, the difference in heights of left and right subtrees is at most 1). Print YES or NO.',
      input_format: 'A single line of space-separated integers (level-order, -1 = null).',
      output_format: 'Print YES or NO.',
      constraints: '1 <= N <= 1000',
      sample_input: '1 2 3 4 5 6 -1',
      sample_output: 'YES',
      explanation: 'All subtrees have balanced heights.',
      difficulty: 'medium',
      testCases: [
        { input: '1 2 3 4 5 6 -1', expected_output: 'YES', is_hidden: false },
        { input: '1 2 -1 3 -1', expected_output: 'NO', is_hidden: false },
        { input: '1', expected_output: 'YES', is_hidden: true },
        { input: '1 2 3 4 -1 -1 -1 5', expected_output: 'NO', is_hidden: true },
      ],
    },
    {
      title: 'Lowest Common Ancestor',
      problem_statement: 'Given a binary tree (level-order, -1 = null) and two node values P and Q, find their Lowest Common Ancestor (LCA). Assume both P and Q exist in the tree.',
      input_format: 'Line 1: Level-order tree (space-separated, -1 = null).\nLine 2: Two integers P and Q.',
      output_format: 'Print the value of the LCA node.',
      constraints: '1 <= N <= 1000',
      sample_input: '3 5 1 6 2 0 8 -1 -1 7 4\n5 1',
      sample_output: '3',
      explanation: 'LCA of 5 and 1 is the root 3.',
      difficulty: 'hard',
      testCases: [
        { input: '3 5 1 6 2 0 8 -1 -1 7 4\n5 1', expected_output: '3', is_hidden: false },
        { input: '3 5 1 6 2 0 8 -1 -1 7 4\n5 4', expected_output: '5', is_hidden: false },
        { input: '1 2 3\n2 3', expected_output: '1', is_hidden: true },
        { input: '1 2 3\n2 2', expected_output: '2', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 13. Binary Search Trees
  // ─────────────────────────────────────────────
  'Binary Search Trees': [
    {
      title: 'BST Insert and Inorder',
      problem_statement: 'Given N integers, insert them one by one into an initially empty BST and print the inorder traversal (which should be sorted).',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated integers (insertion order).',
      output_format: 'Print the inorder traversal space-separated.',
      constraints: '1 <= N <= 100\n-10^4 <= A[i] <= 10^4',
      sample_input: '5\n5 3 7 1 4',
      sample_output: '1 3 4 5 7',
      explanation: 'Inorder of BST is always sorted.',
      difficulty: 'easy',
      testCases: [
        { input: '5\n5 3 7 1 4', expected_output: '1 3 4 5 7', is_hidden: false },
        { input: '3\n2 1 3', expected_output: '1 2 3', is_hidden: false },
        { input: '4\n4 3 2 1', expected_output: '1 2 3 4', is_hidden: true },
        { input: '1\n10', expected_output: '10', is_hidden: true },
      ],
    },
    {
      title: 'BST Search',
      problem_statement: 'Build a BST from N insertions, then search for target K. Print YES if found, NO otherwise.',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated integers.\nLine 3: Integer K.',
      output_format: 'Print YES or NO.',
      constraints: '1 <= N <= 1000',
      sample_input: '5\n5 3 7 1 4\n4',
      sample_output: 'YES',
      explanation: '4 is in the BST.',
      difficulty: 'easy',
      testCases: [
        { input: '5\n5 3 7 1 4\n4', expected_output: 'YES', is_hidden: false },
        { input: '3\n5 3 7\n6', expected_output: 'NO', is_hidden: false },
        { input: '1\n10\n10', expected_output: 'YES', is_hidden: true },
        { input: '4\n8 4 2 6\n5', expected_output: 'NO', is_hidden: true },
      ],
    },
    {
      title: 'Valid BST Check',
      problem_statement: 'Given a binary tree in level-order (-1 = null), check if it is a valid Binary Search Tree. Print YES or NO.',
      input_format: 'A single line of space-separated integers (level-order, -1 = null).',
      output_format: 'Print YES if valid BST, else NO.',
      constraints: '1 <= N <= 1000',
      sample_input: '5 3 7 2 4',
      sample_output: 'YES',
      explanation: 'Inorder: 2 3 4 5 7 — strictly increasing.',
      difficulty: 'medium',
      testCases: [
        { input: '5 3 7 2 4', expected_output: 'YES', is_hidden: false },
        { input: '5 4 7 3 6', expected_output: 'NO', is_hidden: false },
        { input: '1', expected_output: 'YES', is_hidden: true },
        { input: '10 5 15 -1 -1 6 20', expected_output: 'NO', is_hidden: true },
      ],
    },
    {
      title: 'Kth Smallest in BST',
      problem_statement: 'Build a BST from N insertions and find the Kth smallest element (K=1 is smallest).',
      input_format: 'Line 1: Two integers N and K.\nLine 2: N space-separated integers.',
      output_format: 'Print the Kth smallest element.',
      constraints: '1 <= K <= N <= 1000',
      sample_input: '5 3\n5 3 7 1 4',
      sample_output: '4',
      explanation: 'Inorder: 1 3 4 5 7. 3rd smallest is 4.',
      difficulty: 'medium',
      testCases: [
        { input: '5 3\n5 3 7 1 4', expected_output: '4', is_hidden: false },
        { input: '3 1\n5 3 7', expected_output: '3', is_hidden: false },
        { input: '4 4\n1 2 3 4', expected_output: '4', is_hidden: true },
        { input: '1 1\n42', expected_output: '42', is_hidden: true },
      ],
    },
    {
      title: 'BST Delete and Print',
      problem_statement: 'Build a BST from N insertions, delete a target value D, and print the inorder traversal of the resulting BST.',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated integers.\nLine 3: Integer D to delete.',
      output_format: 'Print the inorder traversal after deletion (space-separated).',
      constraints: '1 <= N <= 100. D is guaranteed to be in the BST.',
      sample_input: '5\n5 3 7 1 4\n3',
      sample_output: '1 4 5 7',
      explanation: 'Delete 3 (has children 1 and 4): replace with inorder successor (4). Result: 1 4 5 7.',
      difficulty: 'hard',
      testCases: [
        { input: '5\n5 3 7 1 4\n3', expected_output: '1 4 5 7', is_hidden: false },
        { input: '3\n5 3 7\n5', expected_output: '3 7', is_hidden: false },
        { input: '4\n4 2 6 8\n8', expected_output: '2 4 6', is_hidden: true },
        { input: '1\n10\n10', expected_output: '', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 14. Heaps and Priority Queues
  // ─────────────────────────────────────────────
  'Heaps and Priority Queues': [
    {
      title: 'Build Min Heap and Extract Min',
      problem_statement: 'Given N integers, build a Min Heap by inserting them one by one. Then perform M extract-min operations and print the extracted values in order.',
      input_format: 'Line 1: Two integers N and M.\nLine 2: N space-separated integers.',
      output_format: 'Print M extracted minimums, space-separated.',
      constraints: '1 <= M <= N <= 10^4',
      sample_input: '6 3\n5 3 8 1 2 9',
      sample_output: '1 2 3',
      explanation: 'Min heap extracts 1, then 2, then 3.',
      difficulty: 'easy',
      testCases: [
        { input: '6 3\n5 3 8 1 2 9', expected_output: '1 2 3', is_hidden: false },
        { input: '3 3\n10 5 15', expected_output: '5 10 15', is_hidden: false },
        { input: '4 1\n4 3 2 1', expected_output: '1', is_hidden: true },
        { input: '5 5\n5 4 3 2 1', expected_output: '1 2 3 4 5', is_hidden: true },
      ],
    },
    {
      title: 'K Largest Elements',
      problem_statement: 'Given an array of N integers and integer K, find the K largest elements and print them in descending order using a Min Heap approach.',
      input_format: 'Line 1: Two integers N and K.\nLine 2: N space-separated integers.',
      output_format: 'Print the K largest elements in descending order, space-separated.',
      constraints: '1 <= K <= N <= 10^5',
      sample_input: '7 3\n10 4 3 50 23 90 70',
      sample_output: '90 70 50',
      explanation: 'Three largest elements in descending order.',
      difficulty: 'medium',
      testCases: [
        { input: '7 3\n10 4 3 50 23 90 70', expected_output: '90 70 50', is_hidden: false },
        { input: '5 1\n1 2 3 4 5', expected_output: '5', is_hidden: false },
        { input: '4 4\n4 1 2 3', expected_output: '4 3 2 1', is_hidden: true },
        { input: '3 2\n-5 -3 -1', expected_output: '-1 -3', is_hidden: true },
      ],
    },
    {
      title: 'Heap Sort',
      problem_statement: 'Sort an array of N integers using Heap Sort and print the sorted array.',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated integers.',
      output_format: 'Print the sorted array space-separated.',
      constraints: '1 <= N <= 10^5',
      sample_input: '5\n4 10 3 5 1',
      sample_output: '1 3 4 5 10',
      explanation: 'Heap sort produces ascending sorted output.',
      difficulty: 'medium',
      testCases: [
        { input: '5\n4 10 3 5 1', expected_output: '1 3 4 5 10', is_hidden: false },
        { input: '3\n3 2 1', expected_output: '1 2 3', is_hidden: false },
        { input: '1\n7', expected_output: '7', is_hidden: true },
        { input: '6\n-3 0 -1 2 1 -2', expected_output: '-3 -2 -1 0 1 2', is_hidden: true },
      ],
    },
    {
      title: 'Merge K Sorted Arrays',
      problem_statement: 'Given K sorted arrays each of size N, merge them into one sorted array and print it. Use a Min Heap of size K.',
      input_format: 'Line 1: Two integers K and N.\nNext K lines: each has N sorted space-separated integers.',
      output_format: 'Print the merged sorted array space-separated.',
      constraints: '1 <= K <= 10\n1 <= N <= 100',
      sample_input: '3 3\n1 4 7\n2 5 8\n3 6 9',
      sample_output: '1 2 3 4 5 6 7 8 9',
      explanation: 'Merging [1,4,7], [2,5,8], [3,6,9] gives sorted 1..9.',
      difficulty: 'hard',
      testCases: [
        { input: '3 3\n1 4 7\n2 5 8\n3 6 9', expected_output: '1 2 3 4 5 6 7 8 9', is_hidden: false },
        { input: '2 2\n1 3\n2 4', expected_output: '1 2 3 4', is_hidden: false },
        { input: '1 4\n2 4 6 8', expected_output: '2 4 6 8', is_hidden: true },
        { input: '3 1\n5\n3\n7', expected_output: '3 5 7', is_hidden: true },
      ],
    },
    {
      title: 'Running Median',
      problem_statement: 'Given a stream of N integers, maintain the running median after each insertion. Print the median after each insertion (if two middle elements, print the lower one).',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated integers.',
      output_format: 'Print N medians (one after each insertion), space-separated.',
      constraints: '1 <= N <= 10^4\n-10^4 <= A[i] <= 10^4',
      sample_input: '6\n5 15 1 3 2 8',
      sample_output: '5 5 5 4 3 4',
      explanation: 'After each: [5]→5, [5,15]→5, [1,5,15]→5, [1,3,5,15]→4, [1,2,3,5,15]→3, [1,2,3,5,8,15]→4',
      difficulty: 'hard',
      testCases: [
        { input: '6\n5 15 1 3 2 8', expected_output: '5 5 5 4 3 4', is_hidden: false },
        { input: '3\n1 2 3', expected_output: '1 1 2', is_hidden: false },
        { input: '1\n7', expected_output: '7', is_hidden: true },
        { input: '4\n4 3 2 1', expected_output: '4 3 3 2', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 15. Graphs
  // ─────────────────────────────────────────────
  'Graphs': [
    {
      title: 'BFS Traversal',
      problem_statement: 'Given an undirected graph with V vertices (0 to V-1) and E edges, perform BFS from source vertex 0 and print the traversal order.',
      input_format: 'Line 1: Two integers V and E.\nNext E lines: each "u v" representing an undirected edge.\nLine after edges: Source vertex S.',
      output_format: 'Print BFS traversal order space-separated.',
      constraints: '1 <= V <= 100\n0 <= E <= V*(V-1)/2',
      sample_input: '4 4\n0 1\n0 2\n1 3\n2 3\n0',
      sample_output: '0 1 2 3',
      explanation: 'BFS from 0: visit 0, then neighbors 1,2, then 3.',
      difficulty: 'easy',
      testCases: [
        { input: '4 4\n0 1\n0 2\n1 3\n2 3\n0', expected_output: '0 1 2 3', is_hidden: false },
        { input: '3 2\n0 1\n1 2\n0', expected_output: '0 1 2', is_hidden: false },
        { input: '1 0\n0', expected_output: '0', is_hidden: true },
        { input: '5 4\n0 1\n0 2\n0 3\n0 4\n0', expected_output: '0 1 2 3 4', is_hidden: true },
      ],
    },
    {
      title: 'DFS Traversal',
      problem_statement: 'Given an undirected graph with V vertices (0 to V-1) and E edges, perform DFS from source vertex 0 and print the traversal order. Visit neighbors in ascending order.',
      input_format: 'Line 1: Two integers V and E.\nNext E lines: each "u v" for undirected edge.\nLine after edges: Source vertex S.',
      output_format: 'Print DFS traversal space-separated.',
      constraints: '1 <= V <= 100\n0 <= E <= V*(V-1)/2',
      sample_input: '4 4\n0 1\n0 2\n1 3\n2 3\n0',
      sample_output: '0 1 3 2',
      explanation: 'DFS from 0: 0→1→3→(back)→2.',
      difficulty: 'easy',
      testCases: [
        { input: '4 4\n0 1\n0 2\n1 3\n2 3\n0', expected_output: '0 1 3 2', is_hidden: false },
        { input: '3 2\n0 1\n1 2\n0', expected_output: '0 1 2', is_hidden: false },
        { input: '1 0\n0', expected_output: '0', is_hidden: true },
        { input: '4 3\n0 1\n0 2\n0 3\n0', expected_output: '0 1 2 3', is_hidden: true },
      ],
    },
    {
      title: 'Detect Cycle in Undirected Graph',
      problem_statement: 'Given an undirected graph with V vertices and E edges, detect if it contains a cycle. Print YES if cycle exists, NO otherwise.',
      input_format: 'Line 1: Two integers V and E.\nNext E lines: each "u v".',
      output_format: 'Print YES or NO.',
      constraints: '1 <= V <= 100',
      sample_input: '4 4\n0 1\n1 2\n2 3\n3 0',
      sample_output: 'YES',
      explanation: 'The graph 0-1-2-3-0 forms a cycle.',
      difficulty: 'medium',
      testCases: [
        { input: '4 4\n0 1\n1 2\n2 3\n3 0', expected_output: 'YES', is_hidden: false },
        { input: '4 3\n0 1\n1 2\n2 3', expected_output: 'NO', is_hidden: false },
        { input: '1 0', expected_output: 'NO', is_hidden: true },
        { input: '3 3\n0 1\n1 2\n0 2', expected_output: 'YES', is_hidden: true },
      ],
    },
    {
      title: 'Shortest Path — Dijkstra',
      problem_statement: 'Given a weighted directed graph with V vertices and E edges, find the shortest path from source 0 to all other vertices using Dijkstra. Print the shortest distance to each vertex (or -1 if unreachable).',
      input_format: 'Line 1: Two integers V and E.\nNext E lines: "u v w" (directed edge from u to v with weight w).\nAll weights are non-negative.',
      output_format: 'Print V space-separated distances (0-indexed).',
      constraints: '1 <= V <= 100\n0 <= w <= 10^4',
      sample_input: '5 6\n0 1 4\n0 2 2\n1 3 5\n2 1 1\n2 3 8\n3 4 2',
      sample_output: '0 3 2 8 10',
      explanation: '0→0=0, 0→2→1=3, 0→2=2, 0→2→1→3=8, 0→2→1→3→4=10.',
      difficulty: 'hard',
      testCases: [
        { input: '5 6\n0 1 4\n0 2 2\n1 3 5\n2 1 1\n2 3 8\n3 4 2', expected_output: '0 3 2 8 10', is_hidden: false },
        { input: '2 1\n0 1 5', expected_output: '0 5', is_hidden: false },
        { input: '3 2\n0 1 1\n1 2 2', expected_output: '0 1 3', is_hidden: true },
        { input: '3 0', expected_output: '0 -1 -1', is_hidden: true },
      ],
    },
    {
      title: 'Topological Sort',
      problem_statement: 'Given a Directed Acyclic Graph (DAG) with V vertices (0 to V-1) and E directed edges, print one valid topological ordering.',
      input_format: 'Line 1: Two integers V and E.\nNext E lines: "u v" (directed edge u→v).',
      output_format: 'Print the topological order space-separated (any valid topological ordering is acceptable).',
      constraints: '1 <= V <= 100. Graph is guaranteed to be a DAG.',
      sample_input: '6 6\n5 2\n5 0\n4 0\n4 1\n2 3\n3 1',
      sample_output: '5 4 2 3 1 0',
      explanation: 'A valid topological sort where 5 and 4 come before their dependents.',
      difficulty: 'medium',
      testCases: [
        { input: '6 6\n5 2\n5 0\n4 0\n4 1\n2 3\n3 1', expected_output: '5 4 2 3 1 0', is_hidden: false },
        { input: '3 2\n0 1\n1 2', expected_output: '0 1 2', is_hidden: false },
        { input: '2 0', expected_output: '0 1', is_hidden: true },
        { input: '4 3\n0 1\n0 2\n1 3', expected_output: '0 1 2 3', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 16. Greedy Algorithms
  // ─────────────────────────────────────────────
  'Greedy Algorithms': [
    {
      title: 'Activity Selection Problem',
      problem_statement: 'Given N activities each with a start and finish time, find the maximum number of non-overlapping activities you can attend using a greedy approach.',
      input_format: 'Line 1: Integer N.\nNext N lines: each "start finish" for an activity.',
      output_format: 'Print the maximum number of non-overlapping activities.',
      constraints: '1 <= N <= 10^5\n0 <= start < finish <= 10^9',
      sample_input: '6\n1 4\n3 5\n0 6\n5 7\n3 9\n5 9',
      sample_output: '3',
      explanation: 'Select activities ending at 4, 5 (or 7), 9. Max = 3.',
      difficulty: 'medium',
      testCases: [
        { input: '6\n1 4\n3 5\n0 6\n5 7\n3 9\n5 9', expected_output: '3', is_hidden: false },
        { input: '3\n0 1\n1 2\n2 3', expected_output: '3', is_hidden: false },
        { input: '1\n0 5', expected_output: '1', is_hidden: true },
        { input: '4\n1 10\n2 3\n4 5\n6 7', expected_output: '3', is_hidden: true },
      ],
    },
    {
      title: 'Fractional Knapsack',
      problem_statement: 'Given N items each with weight w and value v, and a knapsack capacity W, find the maximum value you can achieve by taking fractions of items (Fractional Knapsack). Print the answer rounded to 2 decimal places.',
      input_format: 'Line 1: Two integers N and W.\nNext N lines: each "value weight".',
      output_format: 'Print the maximum value rounded to 2 decimal places.',
      constraints: '1 <= N <= 1000\n1 <= W, weight[i], value[i] <= 10^4',
      sample_input: '3 50\n60 10\n100 20\n120 30',
      sample_output: '240.00',
      explanation: 'Take all of items 1,2 (10+20=30), and 2/3 of item 3 (80). Total = 60+100+80 = 240.',
      difficulty: 'medium',
      testCases: [
        { input: '3 50\n60 10\n100 20\n120 30', expected_output: '240.00', is_hidden: false },
        { input: '1 10\n100 5', expected_output: '100.00', is_hidden: false },
        { input: '2 10\n10 10\n40 40', expected_output: '10.00', is_hidden: true },
        { input: '3 10\n500 30\n300 20\n200 10', expected_output: '200.00', is_hidden: true },
      ],
    },
    {
      title: 'Minimum Coins (Greedy)',
      problem_statement: 'Given coin denominations [1,5,10,25,50,100] (cents/standard denominations) and an amount N, find the minimum number of coins to make N using greedy (largest coin first).',
      input_format: 'A single integer N.',
      output_format: 'Print the minimum number of coins.',
      constraints: '1 <= N <= 10^6',
      sample_input: '41',
      sample_output: '4',
      explanation: '25+10+5+1=41 → 4 coins.',
      difficulty: 'easy',
      testCases: [
        { input: '41', expected_output: '4', is_hidden: false },
        { input: '1', expected_output: '1', is_hidden: false },
        { input: '100', expected_output: '1', is_hidden: true },
        { input: '99', expected_output: '9', is_hidden: true },
      ],
    },
    {
      title: 'Job Sequencing with Deadlines',
      problem_statement: 'Given N jobs each with a deadline and profit, schedule jobs to maximize total profit. Each job takes exactly 1 unit of time. Print the maximum profit and number of jobs done.',
      input_format: 'Line 1: Integer N.\nNext N lines: "profit deadline" for each job.',
      output_format: 'Print two integers: number of jobs completed and maximum profit.',
      constraints: '1 <= N <= 100\n1 <= deadline, profit <= 1000',
      sample_input: '4\n20 2\n15 2\n10 1\n5 3',
      sample_output: '3 45',
      explanation: 'Optimal: take profit-20 (dead=2), 15 (dead=2), 5 (dead=3) → 40? No: 20+15+10=45, 3 jobs.',
      difficulty: 'hard',
      testCases: [
        { input: '4\n20 2\n15 2\n10 1\n5 3', expected_output: '3 40', is_hidden: false },
        { input: '3\n50 1\n40 1\n30 1', expected_output: '1 50', is_hidden: false },
        { input: '1\n100 5', expected_output: '1 100', is_hidden: true },
        { input: '5\n100 2\n19 1\n27 2\n25 1\n15 3', expected_output: '3 142', is_hidden: true },
      ],
    },
    {
      title: 'Minimum Spanning Tree — Kruskal',
      problem_statement: 'Given an undirected weighted graph with V vertices and E edges, find the total weight of its Minimum Spanning Tree using Kruskal\'s algorithm.',
      input_format: 'Line 1: Two integers V and E.\nNext E lines: "u v w" (undirected edge with weight w).',
      output_format: 'Print the total weight of the MST.',
      constraints: '2 <= V <= 100\n1 <= E <= 10^4\n0 <= w <= 10^4. Graph is connected.',
      sample_input: '4 5\n0 1 10\n0 2 6\n0 3 5\n1 3 15\n2 3 4',
      sample_output: '19',
      explanation: 'MST edges: (2,3)=4, (0,3)=5, (0,1)=10 → total 19.',
      difficulty: 'hard',
      testCases: [
        { input: '4 5\n0 1 10\n0 2 6\n0 3 5\n1 3 15\n2 3 4', expected_output: '19', is_hidden: false },
        { input: '2 1\n0 1 7', expected_output: '7', is_hidden: false },
        { input: '3 3\n0 1 1\n1 2 2\n0 2 3', expected_output: '3', is_hidden: true },
        { input: '4 4\n0 1 4\n1 2 3\n2 3 2\n0 3 1', expected_output: '7', is_hidden: true },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // 17. Dynamic Programming
  // ─────────────────────────────────────────────
  'Dynamic Programming': [
    {
      title: 'Longest Common Subsequence',
      problem_statement: 'Given two strings S1 and S2, find the length of their Longest Common Subsequence (LCS) using Dynamic Programming.',
      input_format: 'Line 1: String S1.\nLine 2: String S2.',
      output_format: 'Print the length of the LCS.',
      constraints: '1 <= |S1|, |S2| <= 1000',
      sample_input: 'ABCBDAB\nBDCABA',
      sample_output: '4',
      explanation: 'LCS is "BCBA" or "BDAB" of length 4.',
      difficulty: 'medium',
      testCases: [
        { input: 'ABCBDAB\nBDCABA', expected_output: '4', is_hidden: false },
        { input: 'AGGTAB\nGXTXAYB', expected_output: '4', is_hidden: false },
        { input: 'abc\nabc', expected_output: '3', is_hidden: true },
        { input: 'abc\nxyz', expected_output: '0', is_hidden: true },
      ],
    },
    {
      title: '0/1 Knapsack Problem',
      problem_statement: 'Given N items each with weight w[i] and value v[i], and a knapsack capacity W, find the maximum value achievable by selecting items without exceeding the capacity (each item can be taken at most once).',
      input_format: 'Line 1: Two integers N and W.\nLine 2: N space-separated values.\nLine 3: N space-separated weights.',
      output_format: 'Print the maximum value.',
      constraints: '1 <= N <= 100\n1 <= W <= 10^4\n1 <= w[i], v[i] <= 1000',
      sample_input: '4 8\n1 6 10 16\n1 2 3 5',
      sample_output: '23',
      explanation: 'Take items with values 6(w=2) + 16(w=5) = 22... or 10+16=26 if w=3+5=8. Max = 22.',
      difficulty: 'medium',
      testCases: [
        { input: '4 8\n1 6 10 16\n1 2 3 5', expected_output: '22', is_hidden: false },
        { input: '3 4\n3 4 5\n2 3 4', expected_output: '7', is_hidden: false },
        { input: '1 5\n10 3', expected_output: '10', is_hidden: true },
        { input: '2 1\n100 200\n2 3', expected_output: '0', is_hidden: true },
      ],
    },
    {
      title: 'Fibonacci with Memoization',
      problem_statement: 'Compute the Nth Fibonacci number using Dynamic Programming (memoization or tabulation). Since the result can be very large, print it modulo 10^9 + 7.',
      input_format: 'A single integer N.',
      output_format: 'Print fib(N) mod (10^9 + 7).',
      constraints: '0 <= N <= 10^6',
      sample_input: '10',
      sample_output: '55',
      explanation: 'fib(10) = 55.',
      difficulty: 'easy',
      testCases: [
        { input: '10', expected_output: '55', is_hidden: false },
        { input: '0', expected_output: '0', is_hidden: false },
        { input: '1000000', expected_output: '209867067', is_hidden: true },
        { input: '50', expected_output: '12586269025', is_hidden: true },
      ],
    },
    {
      title: 'Longest Increasing Subsequence',
      problem_statement: 'Given an array of N integers, find the length of the Longest Increasing Subsequence (LIS) using DP with O(N log N).',
      input_format: 'Line 1: Integer N.\nLine 2: N space-separated integers.',
      output_format: 'Print the length of the LIS.',
      constraints: '1 <= N <= 10^5\n-10^6 <= A[i] <= 10^6',
      sample_input: '8\n10 9 2 5 3 7 101 18',
      sample_output: '4',
      explanation: 'LIS is [2,3,7,101] or [2,5,7,101] of length 4.',
      difficulty: 'hard',
      testCases: [
        { input: '8\n10 9 2 5 3 7 101 18', expected_output: '4', is_hidden: false },
        { input: '3\n0 1 0', expected_output: '2', is_hidden: false },
        { input: '1\n5', expected_output: '1', is_hidden: true },
        { input: '5\n5 4 3 2 1', expected_output: '1', is_hidden: true },
      ],
    },
    {
      title: 'Coin Change — Minimum Coins',
      problem_statement: 'Given a list of coin denominations and a target amount N, find the minimum number of coins needed to make up N. If not possible, print -1.',
      input_format: 'Line 1: Two integers K and N (K coin types, target N).\nLine 2: K space-separated coin denominations.',
      output_format: 'Print the minimum number of coins or -1.',
      constraints: '1 <= K <= 12\n1 <= N <= 10^4\n1 <= denomination <= 10^4',
      sample_input: '3 11\n1 5 6',
      sample_output: '2',
      explanation: '6 + 5 = 11 using 2 coins.',
      difficulty: 'medium',
      testCases: [
        { input: '3 11\n1 5 6', expected_output: '2', is_hidden: false },
        { input: '3 3\n2 3 4', expected_output: '1', is_hidden: false },
        { input: '2 3\n2 4', expected_output: '-1', is_hidden: true },
        { input: '1 1\n1', expected_output: '1', is_hidden: true },
        { input: '3 7\n1 3 4', expected_output: '2', is_hidden: true },
      ],
    },
  ],
};

// ────────────────────────────────────────────────
// Seeding logic
// ────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding DSA Topic-Wise Coding Question Bank (17 subtopics, 5 questions each)...\n');
  const ok = await testConnection();
  if (!ok) {
    console.error('❌ Cannot connect to database.');
    process.exit(1);
  }

  // Find the DSA topic
  const topicRes = await pool.query('SELECT topic_id FROM topics WHERE title = $1', [DSA_TOPIC_TITLE]);
  if (topicRes.rows.length === 0) {
    console.error(`❌ Topic "${DSA_TOPIC_TITLE}" not found. Run the DSA seed first.`);
    process.exit(1);
  }
  const dsaTopicId = topicRes.rows[0].topic_id;
  console.log(`✅ Found topic "${DSA_TOPIC_TITLE}" (ID: ${dsaTopicId})\n`);

  // Find first faculty for created_by
  const fRes = await pool.query('SELECT faculty_id FROM faculty LIMIT 1');
  const facultyId = fRes.rows[0]?.faculty_id || null;

  let totalQuestionsCreated = 0;
  let totalQuestionsUpdated = 0;
  let totalTestCasesCreated = 0;

  for (const [subtopicTitle, questions] of Object.entries(subtopicQuestions)) {
    // Find the subtopic
    const stRes = await pool.query(
      'SELECT subtopic_id FROM subtopics WHERE topic_id = $1 AND title = $2',
      [dsaTopicId, subtopicTitle]
    );
    if (stRes.rows.length === 0) {
      console.warn(`  ⚠ Subtopic not found: "${subtopicTitle}" — skipping`);
      continue;
    }

    // Also use topic_id for the lab_coding_questions association
    // We associate questions with the DSA TOPIC (not subtopic, since schema uses topic_id)
    console.log(`\n📚 Subtopic: "${subtopicTitle}" (${questions.length} questions)`);

    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      const enforceMarks = marksFor(q.difficulty);

      // Check if question with this title already exists
      const existing = await pool.query(
        'SELECT lab_question_id FROM lab_coding_questions WHERE title = $1',
        [q.title]
      );

      let questionId;
      if (existing.rows.length > 0) {
        questionId = existing.rows[0].lab_question_id;
        await pool.query(
          `UPDATE lab_coding_questions
           SET topic_id = $1, problem_statement = $2, input_format = $3,
               output_format = $4, constraints = $5, sample_input = $6,
               sample_output = $7, explanation = $8, difficulty = $9, marks = $10
           WHERE lab_question_id = $11`,
          [
            dsaTopicId, q.problem_statement, q.input_format, q.output_format,
            q.constraints, q.sample_input, q.sample_output, q.explanation,
            q.difficulty, enforceMarks, questionId,
          ]
        );
        totalQuestionsUpdated++;
        console.log(`  ↻ Updated: "${q.title}" (${q.difficulty}, ${enforceMarks} marks)`);
      } else {
        const ins = await pool.query(
          `INSERT INTO lab_coding_questions
             (topic_id, title, problem_statement, input_format, output_format,
              constraints, sample_input, sample_output, explanation,
              difficulty, marks, order_index, created_by_faculty_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
           RETURNING lab_question_id`,
          [
            dsaTopicId, q.title, q.problem_statement, q.input_format, q.output_format,
            q.constraints, q.sample_input, q.sample_output, q.explanation,
            q.difficulty, enforceMarks, qi + 1, facultyId,
          ]
        );
        questionId = ins.rows[0].lab_question_id;
        totalQuestionsCreated++;
        console.log(`  + Created: "${q.title}" (${q.difficulty}, ${enforceMarks} marks)`);
      }

      // Seed test cases (idempotent by checking input+is_hidden)
      for (let ti = 0; ti < q.testCases.length; ti++) {
        const tc = q.testCases[ti];
        const existingTC = await pool.query(
          `SELECT lab_testcase_id FROM lab_test_cases
           WHERE lab_question_id = $1 AND input = $2 AND is_hidden = $3`,
          [questionId, tc.input, tc.is_hidden]
        );
        if (existingTC.rows.length === 0) {
          await pool.query(
            `INSERT INTO lab_test_cases
               (lab_question_id, input, expected_output, is_hidden, order_index)
             VALUES ($1, $2, $3, $4, $5)`,
            [questionId, tc.input, tc.expected_output, tc.is_hidden, ti + 1]
          );
          totalTestCasesCreated++;
        }
      }
    }
  }

  // Summary
  console.log('\n══════════════════════════════════════════════════════');
  console.log('📊 DSA Question Bank Seeding Summary:');
  const topicStats = await pool.query(`
    SELECT t.title, COUNT(lcq.lab_question_id)::INT AS q_count
    FROM topics t
    LEFT JOIN lab_coding_questions lcq ON lcq.topic_id = t.topic_id
    WHERE t.title = $1
    GROUP BY t.title
  `, [DSA_TOPIC_TITLE]);
  topicStats.rows.forEach(r => {
    console.log(`  - ${r.title}: ${r.q_count} total coding questions`);
  });
  console.log(`  Questions created: ${totalQuestionsCreated}`);
  console.log(`  Questions updated: ${totalQuestionsUpdated}`);
  console.log(`  Test cases created: ${totalTestCasesCreated}`);
  const totalQ = await pool.query('SELECT COUNT(*) FROM lab_coding_questions');
  const totalTC = await pool.query('SELECT COUNT(*) FROM lab_test_cases');
  console.log(`  Total questions in bank: ${totalQ.rows[0].count}`);
  console.log(`  Total test cases in bank: ${totalTC.rows[0].count}`);
  console.log('══════════════════════════════════════════════════════\n');

  await pool.end();
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
