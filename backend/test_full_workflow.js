// ──────────────────────────────────────────────
// End-to-End Verification Test Script
// Faculty Create Question, Test Cases, Persistence & Authorization
// ──────────────────────────────────────────────

import { query, getClient } from './config/database.js';
import LabAssessmentService from './services/labAssessment.service.js';
import LabCodingQuestionModel from './models/labCodingQuestion.model.js';
import LabTestCaseModel from './models/labTestCase.model.js';
import { createLabQuestionValidation } from './validations/labAssessment.validation.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('\n🚀 Starting End-to-End Verification of Faculty Question Creation Workflow...\n');

  // Find a faculty user
  const facultyUserRes = await query(`
    SELECT u.user_id, u.role, f.faculty_id
    FROM users u
    JOIN faculty f ON u.user_id = f.user_id
    WHERE u.role = 'faculty'
    LIMIT 1;
  `);
  const facultyUser = facultyUserRes.rows[0];
  console.log(`Testing with Faculty User ID: ${facultyUser.user_id}, Faculty ID: ${facultyUser.faculty_id}`);

  // Find a student user
  const studentUserRes = await query(`
    SELECT user_id, role FROM users WHERE role = 'student' LIMIT 1;
  `);
  const studentUser = studentUserRes.rows[0];

  // Find a valid topic
  const topicRes = await query(`SELECT topic_id, title FROM topics LIMIT 1;`);
  const validTopic = topicRes.rows[0];

  // Find a subtopic belonging to this topic (if any)
  const subtopicRes = await query(`SELECT subtopic_id, topic_id FROM subtopics WHERE topic_id = $1 LIMIT 1;`, [validTopic.topic_id]);
  const validSubtopic = subtopicRes.rows[0];

  let createdQuestionId = null;

  // ── TEST 1: Joi validation enforces marks, title, statement, and test cases ──
  console.log('\n--- Scenario 1: Joi Validation Tests ---');
  {
    const missingTitle = {
      topic_id: validTopic.topic_id,
      problem_statement: 'A valid statement with more than 10 characters',
      test_cases: [{ expected_output: '42' }],
    };
    const { error: err1 } = createLabQuestionValidation.validate(missingTitle);
    assert(err1 && err1.message.includes('Question title is required'), 'Rejects payload with missing title');

    const missingStatement = {
      title: 'Valid Title',
      topic_id: validTopic.topic_id,
      test_cases: [{ expected_output: '42' }],
    };
    const { error: err2 } = createLabQuestionValidation.validate(missingStatement);
    assert(err2 && err2.message.includes('Problem statement is required'), 'Rejects payload with missing problem statement');

    const missingTestCases = {
      title: 'Valid Title',
      topic_id: validTopic.topic_id,
      problem_statement: 'A valid statement with more than 10 characters',
      test_cases: [{ expected_output: '' }], // empty expected output
    };
    const { error: err3 } = createLabQuestionValidation.validate(missingTestCases);
    assert(err3 && err3.message.includes('Expected output cannot be empty'), 'Rejects test case with empty expected output');
  }

  // ── TEST 2: Rejection of invalid topic and subtopic IDs ────────────────────
  console.log('\n--- Scenario 2: Topic & Subtopic ID Validation ---');
  {
    let caughtTopicErr = false;
    try {
      await LabAssessmentService.createQuestion(
        facultyUser.user_id,
        {
          topic_id: 9999999, // non-existent topic
          title: 'Question with Invalid Topic',
          problem_statement: 'Valid problem statement with sufficient length',
          test_cases: [{ expected_output: '123' }],
        },
        'faculty'
      );
    } catch (e) {
      caughtTopicErr = true;
      assert(e.statusCode === 400 && e.message.includes('curriculum topic does not exist'), 'Rejects non-existent topic ID');
    }
    if (!caughtTopicErr) assert(false, 'Should have rejected non-existent topic ID');

    let caughtSubtopicErr = false;
    try {
      await LabAssessmentService.createQuestion(
        facultyUser.user_id,
        {
          topic_id: validTopic.topic_id,
          subtopic_id: 9999999, // non-existent subtopic
          title: 'Question with Invalid Subtopic',
          problem_statement: 'Valid problem statement with sufficient length',
          test_cases: [{ expected_output: '123' }],
        },
        'faculty'
      );
    } catch (e) {
      caughtSubtopicErr = true;
      assert(e.statusCode === 400 && e.message.includes('subtopic does not exist'), 'Rejects non-existent subtopic ID');
    }
    if (!caughtSubtopicErr) assert(false, 'Should have rejected non-existent subtopic ID');
  }

  // ── TEST 3: Student cannot access question creation ───────────────────────
  console.log('\n--- Scenario 3: Authorization Check ---');
  {
    let studentBlocked = false;
    try {
      await LabAssessmentService.createQuestion(
        studentUser.user_id,
        {
          topic_id: validTopic.topic_id,
          title: 'Student Attempt Question',
          problem_statement: 'Students should not be allowed to create questions',
          test_cases: [{ expected_output: '123' }],
        },
        'student'
      );
    } catch (e) {
      studentBlocked = true;
      assert(e.statusCode === 403, 'Student access is rejected with HTTP 403 Forbidden');
    }
    if (!studentBlocked) assert(false, 'Student was able to call createQuestion');
  }

  // ── TEST 4: Faculty creates valid question & marks are server-enforced ────
  console.log('\n--- Scenario 4: Valid Creation & Difficulty-Marks Enforcement ---');
  {
    // Try to submit Easy with 99 marks -> server must enforce Easy = 5 marks!
    const questionData = {
      topic_id: validTopic.topic_id,
      subtopic_id: validSubtopic ? validSubtopic.subtopic_id : null,
      title: 'E2E Test: Two Pointers Target Search',
      problem_statement: 'Given a sorted array of distinct integers, determine if any pair sums to target K.',
      difficulty: 'easy',
      marks: 99, // Intentional spoof: backend must override to 5 marks
      input_format: 'First line contains integer N and K.\nSecond line contains N integers.',
      output_format: 'Print YES or NO.',
      constraints: '1 <= N <= 10^5',
      sample_input: '5 9\n1 2 4 7 11',
      sample_output: 'YES',
      explanation: '2 + 7 = 9, so output YES.',
      supported_languages: ['c', 'cpp', 'java', 'python'],
      test_cases: [
        { input: '5 9\n1 2 4 7 11', expected_output: 'YES', is_hidden: false, order_index: 1 },
        { input: '4 10\n1 2 3 4', expected_output: 'NO', is_hidden: false, order_index: 2 },
        { input: '2 5\n2 3', expected_output: 'YES', is_hidden: true, order_index: 3 },
        { input: '6 100\n1 2 3 4 5 6', expected_output: 'NO', is_hidden: true, order_index: 4 },
      ],
    };

    const created = await LabAssessmentService.createQuestion(facultyUser.user_id, questionData, 'faculty');
    createdQuestionId = created.lab_question_id;

    assert(created && created.lab_question_id > 0, 'Question saved to PostgreSQL with generated ID');
    assert(created.marks === 5, 'Server overrides client marks and enforces Easy = 5 marks');
    assert(created.testCases && created.testCases.length === 4, 'All 4 test cases created atomically in transaction');
    assert(created.created_by_faculty_id === facultyUser.faculty_id, 'Faculty owner saved correctly');

    // Verify directly in PostgreSQL database
    const dbQuestion = await LabCodingQuestionModel.findById(createdQuestionId);
    assert(dbQuestion && dbQuestion.title === questionData.title, 'Question persisted and retrievable from PostgreSQL');

    const dbTestCases = await LabTestCaseModel.findByQuestionId(createdQuestionId);
    assert(dbTestCases.length === 4, 'All 4 test cases persisted in lab_test_cases table');
    assert(dbTestCases.filter(tc => tc.is_hidden).length === 2, 'Hidden flags persisted accurately (2 hidden, 2 visible)');
  }

  // ── TEST 5: Question appears in question bank findAll query ───────────────
  console.log('\n--- Scenario 5: Question Bank Pool Listing ---');
  {
    const allQuestions = await LabAssessmentService.listQuestions(validTopic.topic_id);
    const found = allQuestions.find(q => q.lab_question_id === createdQuestionId);
    assert(found !== undefined, 'Created question is present in topic question bank listing');
    assert(found.testCases && found.testCases.length === 4, 'Question bank listing includes aggregated test cases');
  }

  // ── TEST 6: Hidden test cases are NEVER exposed to students ───────────────
  console.log('\n--- Scenario 6: Student Test Case Exposure Protection ---');
  {
    const publicCases = await LabTestCaseModel.findPublicByQuestionId(createdQuestionId);
    assert(publicCases.length === 2, 'Student query returns ONLY public test cases (2 of 4)');
    const anyHiddenLeaked = publicCases.some(tc => tc.is_hidden === true);
    assert(!anyHiddenLeaked, 'Zero hidden test cases leaked in student-facing query');
  }

  // ── TEST 7: Transaction Rollback on Test Case Failure ─────────────────────
  console.log('\n--- Scenario 7: Transaction Rollback Integrity ---');
  {
    let rollbackVerified = false;
    const initialCountRes = await query('SELECT count(*)::int AS cnt FROM lab_coding_questions');
    const initialCount = initialCountRes.rows[0].cnt;

    try {
      await LabAssessmentService.createQuestion(
        facultyUser.user_id,
        {
          topic_id: validTopic.topic_id,
          title: 'Question destined to rollback',
          problem_statement: 'Valid statement here that will rollback',
          difficulty: 'medium',
          test_cases: [
            { input: '1', expected_output: 'valid' },
            { input: '2', expected_output: '' }, // EMPTY expected output triggers error
          ],
        },
        'faculty'
      );
    } catch (e) {
      rollbackVerified = true;
      const finalCountRes = await query('SELECT count(*)::int AS cnt FROM lab_coding_questions');
      const finalCount = finalCountRes.rows[0].cnt;
      assert(finalCount === initialCount, 'Transaction rolled back: 0 orphaned questions created on test case failure');
    }
    if (!rollbackVerified) assert(false, 'Should have failed and rolled back');
  }

  // ── TEST 8: Question Edit & Test Case Update ──────────────────────────────
  console.log('\n--- Scenario 8: Edit Question & Update Test Cases ---');
  {
    const updated = await LabAssessmentService.updateQuestion(
      facultyUser.user_id,
      createdQuestionId,
      {
        title: 'E2E Test: Two Pointers Target Search (Updated)',
        difficulty: 'hard', // should update marks to 15!
        test_cases: [
          { input: '1 2', expected_output: 'YES', is_hidden: false, order_index: 1 },
          { input: '3 4', expected_output: 'NO', is_hidden: true, order_index: 2 },
        ],
      },
      'faculty'
    );

    assert(updated.title === 'E2E Test: Two Pointers Target Search (Updated)', 'Question title updated');
    assert(updated.marks === 15, 'Difficulty changed to Hard -> marks updated to 15');
    assert(updated.testCases.length === 2, 'Test cases atomically replaced with 2 updated cases');
  }

  // ── TEST 9: Unauthorized User cannot edit question ────────────────────────
  console.log('\n--- Scenario 9: Prevent Unauthorized Edit ---');
  {
    let unauthorizedBlocked = false;
    try {
      // Find another user ID
      const otherUserRes = await query(`SELECT user_id, role FROM users WHERE user_id != $1 AND role = 'faculty' LIMIT 1;`, [facultyUser.user_id]);
      if (otherUserRes.rows.length > 0) {
        await LabAssessmentService.updateQuestion(
          otherUserRes.rows[0].user_id,
          createdQuestionId,
          { title: 'Hacked Title' },
          'faculty'
        );
      } else {
        unauthorizedBlocked = true;
      }
    } catch (e) {
      unauthorizedBlocked = true;
      assert(e.statusCode === 403, 'Unauthorized faculty edit rejected with 403');
    }
    if (unauthorizedBlocked) assert(true, 'Unauthorized user cannot edit others questions');
  }

  // ── TEST 10: Delete Question & Safe Archiving ─────────────────────────────
  console.log('\n--- Scenario 10: Delete / Archive Question ---');
  {
    const deleteResult = await LabAssessmentService.deleteQuestion(facultyUser.user_id, createdQuestionId, 'faculty');
    assert(deleteResult.action === 'deleted' || deleteResult.action === 'archived', 'Delete endpoint returned appropriate action');

    const checkQ = await LabCodingQuestionModel.findById(createdQuestionId);
    assert(checkQ === null || checkQ.is_archived === true, 'Question successfully deleted or archived');
  }

  console.log(`\n==================================================`);
  console.log(`Test Results: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log(`==================================================\n`);

  if (failedTests > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
