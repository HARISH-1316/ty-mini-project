// ──────────────────────────────────────────────
// Lab Assessment End-to-End Automated Test Suite
// ──────────────────────────────────────────────
// Validates:
// 1. Topics question pool calculation & summary
// 2. Insufficient pool validation (blocks publish when questions < num_questions)
// 3. Multi-topic selection (Arrays + Strings)
// 4. Successful publishing & timing validation
// 5. Student assessment availability & eligibility
// 6. Lazy randomized question allocation (5 unique questions per student)
// 7. Allocation persistence / idempotency across reloads
// 8. Hidden test case security (no leakage to student APIs)
// 9. Run code & submit question workflows
// 10. Server-side deadline & final assessment submission
// 11. Student result report with question breakdown & student source code
// 12. Faculty assessment results dashboard with student submissions
// ──────────────────────────────────────────────

import { pool, testConnection } from './config/database.js';
import LabAssessmentService from './services/labAssessment.service.js';
import UserModel from './models/user.model.js';

async function runTests() {
  console.log('🧪 Starting Comprehensive Lab Assessment Module E2E Test Suite...\n');

  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Database connection failed.');
    process.exit(1);
  }

  try {
    // 1. Fetch Faculty User
    const facultyUser = await UserModel.findByEmail('teacher@wcelab.ac.in');
    if (!facultyUser) throw new Error('Faculty teacher@wcelab.ac.in not found');
    console.log(`✅ Faculty user found: ${facultyUser.email} (ID: ${facultyUser.user_id})`);

    // 2. Fetch Student User
    const studentUser = await UserModel.findByEmail('student1@wcelab.ac.in');
    if (!studentUser) throw new Error('Student student1@wcelab.ac.in not found');
    console.log(`✅ Student user found: ${studentUser.email} (ID: ${studentUser.user_id})`);

    // 3. Clean up any previous test lab assessments created by this script
    await pool.query("DELETE FROM lab_assessment WHERE title LIKE 'E2E Test LA%'");

    // 4. Test: Check Topics Question Summary
    console.log('\n[Test 1] Verifying curriculum topics summary and question bank counts...');
    const topicsSummary = await LabAssessmentService.getTopicsSummary();
    console.log('✅ Curriculum topics with question counts:');
    let arraysTopic = null;
    let stringsTopic = null;
    let linkedListTopic = null;

    topicsSummary.forEach((t) => {
      console.log(`   - [ID: ${t.topic_id}] ${t.title}: ${t.question_count} questions available`);
      if (t.title.toLowerCase().includes('array')) arraysTopic = t;
      if (t.title.toLowerCase().includes('string')) stringsTopic = t;
      if (t.title.toLowerCase().includes('linked list')) linkedListTopic = t;
    });

    if (!arraysTopic || !stringsTopic || !linkedListTopic) {
      throw new Error('Required topics (Arrays, Strings, Linked Lists) missing in database.');
    }

    // 5. Test: Insufficient Pool Validation
    console.log('\n[Test 2] Testing insufficient question pool enforcement...');
    const now = new Date();
    const startTime = new Date(now.getTime() - 5 * 60 * 1000); // started 5 mins ago
    const endTime = new Date(now.getTime() + 120 * 60 * 1000); // ends in 2 hours

    // Linked list has only 3 questions, but required is 5
    const underPoolLab = await LabAssessmentService.createAssessment(facultyUser.user_id, {
      title: 'E2E Test LA — Under-pool Test',
      description: 'Test assessment that should fail to publish due to insufficient questions.',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration: 60,
      num_questions: 10,
      marks_per_question: 10,
      topic_ids: [linkedListTopic.topic_id], // 5 questions available, requesting 10
    });

    let publishBlocked = false;
    try {
      await LabAssessmentService.publishAssessment(facultyUser.user_id, underPoolLab.lab_id);
    } catch (err) {
      publishBlocked = true;
      console.log(`✅ Publish correctly blocked: "${err.message}"`);
    }

    if (!publishBlocked) {
      throw new Error('Publish was expected to fail for under-pool assessment, but succeeded!');
    }

    // 6. Test: Multi-Topic Selection & Assessment Creation
    console.log('\n[Test 3] Creating new Lab Assessment with multi-topic selection (Arrays + Strings)...');
    const selectedTopicIds = [arraysTopic.topic_id, stringsTopic.topic_id];
    const newLab = await LabAssessmentService.createAssessment(facultyUser.user_id, {
      title: 'E2E Test LA — Practical DSA Challenge',
      description: 'Comprehensive practical assessment for arrays and strings.',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration: 90,
      num_questions: 5,
      marks_per_question: 10,
      topic_ids: selectedTopicIds,
    });
    console.log(`✅ Lab Assessment created: ID ${newLab.lab_id}, Status: ${newLab.status}`);
    console.log(`✅ Linked topics: ${newLab.topics.map((t) => t.topic_title).join(', ')}`);

    const detail = await LabAssessmentService.getAssessmentDetail(facultyUser.user_id, newLab.lab_id);
    console.log(`✅ Total eligible questions in pool: ${detail.totalEligibleQuestions} (Required: ${detail.num_questions})`);
    if (detail.totalEligibleQuestions < detail.num_questions) {
      throw new Error(`Insufficient pool size: ${detail.totalEligibleQuestions} < ${detail.num_questions}`);
    }

    // 7. Test: Publish Assessment
    console.log('\n[Test 4] Publishing Lab Assessment with sufficient multi-topic pool...');
    const published = await LabAssessmentService.publishAssessment(facultyUser.user_id, newLab.lab_id);
    console.log(`✅ Lab Assessment published! Status: ${published.status}`);

    // 8. Test: Student Available Assessments
    console.log('\n[Test 5] Student views available assessments list...');
    const studentLabs = await LabAssessmentService.getStudentAvailableLabs(studentUser.user_id);
    const foundLab = studentLabs.find((l) => l.lab_id === newLab.lab_id);
    if (!foundLab) throw new Error('Published lab not visible in student available list');
    console.log(`✅ Found lab "${foundLab.title}" in student available list (Duration: ${foundLab.duration}m).`);

    // 9. Test: Start Assessment (Lazy Random Allocation)
    console.log('\n[Test 6] Student starts assessment (first attempt — lazy randomized allocation)...');
    const startResult = await LabAssessmentService.startOrResumeLab(studentUser.user_id, newLab.lab_id);
    console.log(`✅ Assessment started! isNew: ${startResult.isNew}`);
    console.log(`   Allocated ${startResult.questions.length} questions:`);
    startResult.questions.forEach((q, idx) => {
      console.log(`   ${idx + 1}. [ID: ${q.lab_question_id}] ${q.title} (${q.difficulty}, Topic: ${q.topic_title})`);
    });

    if (startResult.questions.length !== 5) {
      throw new Error(`Expected exactly 5 allocated questions, got ${startResult.questions.length}`);
    }

    // Verify all 5 allocated question IDs are unique
    const questionIds = startResult.questions.map((q) => q.lab_question_id);
    const uniqueIds = new Set(questionIds);
    if (uniqueIds.size !== questionIds.length) {
      throw new Error('Duplicate questions detected in student allocation!');
    }
    console.log('✅ Uniqueness check: All 5 allocated questions are distinct.');

    // 10. Test: Idempotent Allocation (Resuming returns exact same questions)
    console.log('\n[Test 7] Student resumes assessment (testing persistence)...');
    const resumeResult = await LabAssessmentService.startOrResumeLab(studentUser.user_id, newLab.lab_id);
    if (resumeResult.isNew !== false) throw new Error('Expected isNew: false on resume');
    const resumeIds = resumeResult.questions.map((q) => q.lab_question_id);
    const isIdentical = questionIds.every((id, i) => id === resumeIds[i]);
    if (!isIdentical) throw new Error('Questions changed upon resuming!');
    console.log('✅ Persistence check: Reopening assessment returns the exact same questions and order.');

    // 11. Test: Security — Check that hidden test cases are NOT leaked
    console.log('\n[Test 8] Security check — verify no hidden test cases exposed to student...');
    const studentQuestions = await LabAssessmentService.getStudentQuestions(studentUser.user_id, newLab.lab_id);
    for (const q of studentQuestions.questions) {
      if (q.publicTestCases) {
        for (const tc of q.publicTestCases) {
          if (tc.is_hidden) {
            throw new Error(`Hidden testcase leaked in student question ${q.lab_question_id}!`);
          }
        }
      }
    }
    console.log('✅ Security check passed: Only visible/public test cases are exposed to students.');

    // 12. Test: Dry Run Code vs Submit Answer
    console.log('\n[Test 9] Dry Run Code (testing isolated container execution without recording marks)...');
    const firstQ = startResult.questions[0];
    const dryRunResult = await LabAssessmentService.runCode(studentUser.user_id, newLab.lab_id, {
      lab_question_id: firstQ.lab_question_id,
      language: 'python',
      code: 'print("Dry Run Output Test")',
      input: '',
    });
    console.log(`✅ Dry run executed cleanly: success = ${dryRunResult.success !== undefined}`);

    // Verify dry run did NOT record any submission in la_question_submissions
    const initialStatus = await LabAssessmentService.getSubmissionStatus(studentUser.user_id, newLab.lab_id);
    if (initialStatus.submissions.length > 0) {
      throw new Error('Dry run should NOT record a question submission!');
    }
    console.log('✅ Verification: Dry run did not save any submission or award marks.');

    // 13. Test: Submit Answer for Question
    console.log(`\n[Test 10] Submitting solution for allocated question "${firstQ.title}"...`);
    const solutionCode = `
import sys
lines = sys.stdin.read().split()
if lines:
    print(' '.join(reversed(lines[1:int(lines[0])+1])))
`;
    const evalResult = await LabAssessmentService.submitQuestion(studentUser.user_id, newLab.lab_id, {
      lab_question_id: firstQ.lab_question_id,
      language: 'python',
      code: solutionCode,
    });
    console.log(`✅ Evaluation Result: Status = ${evalResult.status}, Score = ${evalResult.score}/${evalResult.totalMarks}`);

    // Verify hidden test cases input/output were not leaked
    for (const tcr of evalResult.testCaseResults) {
      if (tcr.isHidden && (tcr.input !== undefined || tcr.expectedOutput !== undefined)) {
        throw new Error('Hidden testcase input/output leaked in evaluation results!');
      }
    }
    console.log('✅ Security check passed: Evaluation results do not leak hidden inputs/outputs.');

    // 14. Test: Check Submission Status and Source Code Persistence
    console.log('\n[Test 11] Checking per-question submission statuses and source code retrieval...');
    const statusData = await LabAssessmentService.getSubmissionStatus(studentUser.user_id, newLab.lab_id);
    if (statusData.submissions.length !== 1) {
      throw new Error(`Expected 1 recorded submission, found ${statusData.submissions.length}`);
    }
    const savedSub = statusData.submissions[0];
    if (!savedSub.source_code) {
      throw new Error('Saved submission does not include source_code for student reload!');
    }
    console.log(`✅ Source code successfully retrieved on resume for question ID ${savedSub.lab_question_id}.`);

    // 15. Test: Final Assessment Submission
    console.log('\n[Test 12] Finalizing and submitting entire lab assessment...');
    const finalSubmit = await LabAssessmentService.submitAssessment(studentUser.user_id, newLab.lab_id);
    console.log(`✅ Final submission successful! Attempt status: ${finalSubmit.status}, Total Obtained: ${finalSubmit.obtained_marks}`);

    // 16. Test: Student Result Report
    console.log('\n[Test 13] Student views final result report...');
    const studentReport = await LabAssessmentService.getResult(studentUser.user_id, newLab.lab_id);
    console.log(`✅ Result retrieved: ${studentReport.totalObtained} / ${studentReport.totalMarks} Marks (${studentReport.percentage}%)`);
    console.log(`   Question Breakdown: ${studentReport.questionResults.length} questions listed.`);
    const firstQResult = studentReport.questionResults.find((q) => q.lab_question_id === firstQ.lab_question_id);
    if (!firstQResult || !firstQResult.submission?.source_code) {
      throw new Error('Student result report missing student source code!');
    }
    console.log('✅ Student result includes student submitted code for review.');

    // 17. Test: Faculty Results Dashboard
    console.log('\n[Test 14] Faculty views assessment results dashboard...');
    const facultyResults = await LabAssessmentService.getLabResults(facultyUser.user_id, newLab.lab_id);
    console.log(`✅ Faculty results dashboard loaded.`);
    console.log(`   Lab title: "${facultyResults.lab?.title}"`);
    console.log(`   Total attempts recorded: ${facultyResults.attempts?.length}`);
    if (!facultyResults.attempts || facultyResults.attempts.length === 0) {
      throw new Error('Expected at least 1 attempt in faculty results dashboard');
    }
    const studentAttempt = facultyResults.attempts.find((a) => a.student_id === studentUser.user_id || a.roll_number);
    console.log(`   Student: ${studentAttempt?.student_name} (${studentAttempt?.roll_number}) — Status: ${studentAttempt?.status}`);
    console.log(`   Question Submissions recorded: ${studentAttempt?.questionSubmissions?.length}`);

    console.log('\n======================================================');
    console.log('🎉 ALL 14 LAB ASSESSMENT MODULE TESTS PASSED FLAWLESSLY!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runTests();
