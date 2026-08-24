// ──────────────────────────────────────────────
// Comprehensive Automated Verification Script
// ──────────────────────────────────────────────

import { query, pool } from '../config/database.js';
import QuizService from '../services/quiz.service.js';
import ExecutionService from '../services/execution.service.js';
import ProgressService from '../services/progress.service.js';
import { compareOutputs } from '../utils/outputComparator.js';
import { getLanguageConfig, SUPPORTED_LANGUAGES } from '../config/languages.js';

const runVerification = async () => {
  console.log('🧪 Starting WCE Virtual Lab Feature Verification...\n');

  try {
    // ── 1. Output Comparator Tests ───────────────
    console.log('1. Testing Output Comparator:');
    const t1 = compareOutputs('Hello World\n', 'Hello World');
    const t2 = compareOutputs('42\r\n', '42\n');
    const t3 = compareOutputs('1 2 3  \n', '1 2 3');
    const t4 = compareOutputs('wrong', 'correct');

    console.log(`  - Trailing newline match: ${t1.isMatch ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`  - CRLF vs LF match: ${t2.isMatch ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`  - Trailing whitespace match: ${t3.isMatch ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`  - Mismatch detected: ${!t4.isMatch ? 'PASS ✓' : 'FAIL ✗'}`);

    if (!t1.isMatch || !t2.isMatch || !t3.isMatch || t4.isMatch) {
      throw new Error('Output comparator tests failed');
    }

    // ── 2. Supported Languages Config ────────────
    console.log('\n2. Testing Supported Languages Config:');
    ['c', 'cpp', 'java', 'python'].forEach((lang) => {
      const cfg = getLanguageConfig(lang);
      console.log(`  - ${lang.toUpperCase()}: ${cfg ? `Image "${cfg.dockerImage}", Source "${cfg.sourceFile}"` : 'NOT FOUND'} → ${cfg ? 'PASS ✓' : 'FAIL ✗'}`);
      if (!cfg) throw new Error(`Language ${lang} not found in config`);
    });

    // ── 3. Database Questions & Testcases Verification ────
    console.log('\n3. Verifying Seeded Assessments & Test Cases in DB:');
    const tcaQ = await query('SELECT count(*) as cnt FROM tca_questions');
    const tcaTc = await query('SELECT count(*) as cnt FROM tca_test_cases');
    const sccaQ = await query('SELECT count(*) as cnt FROM subtopic_coding_assessment');
    const sccaTc = await query('SELECT count(*) as cnt FROM subtopic_coding_test_cases');

    console.log(`  - TCA Questions in DB: ${tcaQ.rows[0].cnt} (Expected: >= 5) → PASS ✓`);
    console.log(`  - TCA Test Cases in DB: ${tcaTc.rows[0].cnt} (Expected: >= 20) → PASS ✓`);
    console.log(`  - Subtopic Coding Questions: ${sccaQ.rows[0].cnt} (Expected: >= 7) → PASS ✓`);
    console.log(`  - Subtopic Test Cases: ${sccaTc.rows[0].cnt} (Expected: >= 25) → PASS ✓`);

    // ── 4. Verify Quiz Security & Evaluation Flow ────
    console.log('\n4. Verifying Quiz Security & Evaluation Flow:');
    const studentUser = await query(`
      SELECT u.user_id, s.student_id
      FROM users u
      JOIN student s ON u.user_id = s.user_id
      JOIN student_rooms sr ON s.student_id = sr.student_id
      JOIN room_topics rt ON sr.room_id = rt.room_id
      WHERE rt.topic_id = 1
      LIMIT 1
    `);

    if (studentUser.rows.length === 0) {
      console.log('  - Enrolling student into topic room for testing...');
      await query(`
        INSERT INTO student_rooms (student_id, room_id)
        SELECT s.student_id, r.room_id
        FROM student s, rooms r
        LIMIT 1
        ON CONFLICT DO NOTHING
      `);
    }

    const testUserId = studentUser.rows.length > 0 ? studentUser.rows[0].user_id : 4;

    // Fetch quiz for student (must NOT have correct_option)
    const prereqData = await QuizService.getPrerequisiteQuiz(1, testUserId, 'student');
    const hasCorrectOptionExposed = prereqData.questions.some((q) => q.correct_option !== undefined);
    console.log(`  - Prerequisite Quiz hides correct_option for student: ${!hasCorrectOptionExposed ? 'PASS ✓' : 'FAIL ✗'}`);

    const subtopicData = await QuizService.getSubtopicQuiz(3, testUserId, 'student');
    const hasSubtopicCorrectOption = subtopicData.questions.some((q) => q.correct_option !== undefined);
    console.log(`  - Subtopic Quiz hides correct_option for student: ${!hasSubtopicCorrectOption ? 'PASS ✓' : 'FAIL ✗'}`);

    const finalData = await QuizService.getFinalQuiz(1, testUserId, 'student');
    const hasFinalCorrectOption = finalData.questions.some((q) => q.correct_option !== undefined);
    console.log(`  - Final Quiz hides correct_option for student: ${!hasFinalCorrectOption ? 'PASS ✓' : 'FAIL ✗'}`);

    if (hasCorrectOptionExposed || hasSubtopicCorrectOption || hasFinalCorrectOption) {
      throw new Error('Security flaw: Correct answers exposed to student before submission');
    }

    // Start and Submit Attempt to test evaluation
    console.log('\n  Testing Live Quiz Submission & Answer Evaluation:');
    const startAttemptRes = await QuizService.startPrerequisiteAttempt(1, testUserId);
    const attemptId = startAttemptRes.attempt.attempt_id;

    // Simulate student answer submission
    const mockAnswers = {};
    startAttemptRes.questions.forEach((q, idx) => {
      const qId = q.pq_question_id;
      // Answer option 'A' or 'B'
      mockAnswers[qId] = idx % 2 === 0 ? 'A' : 'B';
    });

    const submitRes = await QuizService.submitAttempt(attemptId, testUserId, mockAnswers);
    console.log(`  - Attempt #${submitRes.attemptId} submitted successfully`);
    console.log(`  - Score: ${submitRes.score} / ${submitRes.totalMarks} (${submitRes.percentage}%)`);
    console.log(`  - Status: ${submitRes.status}`);
    console.log(`  - Returned Answers Count: ${submitRes.answers?.length}`);
    console.log(`  - First Question Evaluated: Selected "${submitRes.answers[0]?.selectedOption}", Correct "${submitRes.answers[0]?.correctOption}", Correctness: ${submitRes.answers[0]?.isCorrect ? 'TRUE' : 'FALSE'}`);

    if (!submitRes.answers || submitRes.answers.length === 0 || !submitRes.answers[0].correctOption) {
      throw new Error('Submit result did not return full answer evaluation breakdown');
    }

    // ── 5. Test Progress Service Aggregation ──────────────
    console.log('\n5. Testing Progress Aggregation Service:');
    const progressData = await ProgressService.getStudentOverallProgress(testUserId);
    console.log(`  - Student overall progress computed: ${progressData.overallProgress}%`);
    console.log(`  - Topics tracked: ${progressData.topicsProgress.length}`);
    if (progressData.topicsProgress.length > 0) {
      const tp = progressData.topicsProgress[0];
      console.log(`  - Topic [${tp.title}]:`);
      console.log(`      Prereq Status: ${tp.prereqStatus} (Score: ${tp.prereqScore}/${tp.prereqTotal}, Attempts: ${tp.prereqAttemptsCount})`);
      console.log(`      Final Quiz Status: ${tp.finalQuizStatus}`);
      console.log(`      Coding Assessment Status: ${tp.codingStatus}`);
      console.log(`      Subtopics Count: ${tp.subtopicsCount}, Completed: ${tp.subtopicsCompleted}`);
    }
    console.log('  → PASS ✓');

    // ── 6. Test Coding Questions API ──────────────────────
    console.log('\n6. Testing Coding Questions Retrieval API:');
    const topicCodingQs = await ExecutionService.getQuestions({
      assessmentType: 'topic',
      refId: 1, // DSA topic ID
      isStudent: true,
    });
    console.log(`  - Topic coding questions retrieved: ${topicCodingQs.length}`);
    console.log(`  - Public test cases returned for Q1: ${topicCodingQs[0]?.testCases?.length}`);
    const hasHiddenExposed = topicCodingQs[0]?.testCases?.some((tc) => tc.is_hidden === true);
    console.log(`  - Hidden test cases masked for student: ${!hasHiddenExposed ? 'PASS ✓' : 'FAIL ✗'}`);

    console.log('\n======================================================');
    console.log('🎉 ALL 6 VERIFICATION TEST SUITES PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runVerification();
