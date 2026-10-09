// ──────────────────────────────────────────────
// Lab Assessment End-to-End Automated Test Suite
// ──────────────────────────────────────────────

import { pool, testConnection } from './config/database.js';
import LabAssessmentService from './services/labAssessment.service.js';
import FacultyModel from './models/faculty.model.js';
import StudentModel from './models/student.model.js';
import UserModel from './models/user.model.js';

async function runTests() {
  console.log('🧪 Starting Lab Assessment Module E2E Test Suite...\n');

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

    // 4. Test: Create Assessment with direct Topic Selection
    console.log('\n[Test 1] Creating new Lab Assessment with direct Topic Selection (topic_id 1)...');
    const now = new Date();
    const startTime = new Date(now.getTime() - 5 * 60 * 1000); // started 5 mins ago
    const endTime = new Date(now.getTime() + 120 * 60 * 1000); // ends in 2 hours

    const newLab = await LabAssessmentService.createAssessment(facultyUser.user_id, {
      title: 'E2E Test LA — Practical DSA Challenge',
      description: 'Comprehensive test practical assessment for arrays and algorithms.',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration: 90,
      num_questions: 5,
      marks_per_question: 10,
      topic_ids: [1],
    });
    console.log(`✅ Lab Assessment created: ID ${newLab.lab_id}, Status: ${newLab.status}`);
    console.log(`✅ Pre-selected topics linked: ${newLab.topics.map(t => t.topic_title).join(', ')}`);

    // 5. Test: Check Topics Question Summary & Question Pool
    console.log('\n[Test 2] Verifying topics summary and question pool calculations...');
    const topicsSummary = await LabAssessmentService.getTopicsSummary();
    console.log(`✅ Curriculum topics with question counts:`);
    topicsSummary.forEach(t => {
      console.log(`   - ${t.title}: ${t.question_count} questions available`);
    });

    const detail = await LabAssessmentService.getAssessmentDetail(facultyUser.user_id, newLab.lab_id);
    console.log(`✅ Total eligible questions in pool: ${detail.totalEligibleQuestions} (Required: ${detail.num_questions})`);

    if (detail.totalEligibleQuestions < detail.num_questions) {
      throw new Error(`Insufficient pool size: ${detail.totalEligibleQuestions} < ${detail.num_questions}`);
    }

    // 6. Test: Publish Assessment
    console.log('\n[Test 3] Publishing Lab Assessment...');
    const published = await LabAssessmentService.publishAssessment(facultyUser.user_id, newLab.lab_id);
    console.log(`✅ Lab Assessment published! Status: ${published.status}`);

    // 7. Test: Student Available Assessments
    console.log('\n[Test 4] Student views available assessments...');
    const studentLabs = await LabAssessmentService.getStudentAvailableLabs(studentUser.user_id);
    const foundLab = studentLabs.find(l => l.lab_id === newLab.lab_id);
    if (!foundLab) throw new Error('Published lab not visible in student available list');
    console.log(`✅ Found lab "${foundLab.title}" in student available list.`);

    // 8. Test: Start Assessment (Lazy Random Allocation)
    console.log('\n[Test 5] Student starts assessment (first attempt)...');
    const startResult = await LabAssessmentService.startOrResumeLab(studentUser.user_id, newLab.lab_id);
    console.log(`✅ Assessment started! isNew: ${startResult.isNew}`);
    console.log(`   Allocated ${startResult.questions.length} questions:`);
    startResult.questions.forEach((q, idx) => {
      console.log(`   ${idx + 1}. [ID: ${q.lab_question_id}] ${q.title} (${q.difficulty})`);
    });

    if (startResult.questions.length !== 5) {
      throw new Error(`Expected exactly 5 allocated questions, got ${startResult.questions.length}`);
    }

    // Check no duplicate questions
    const questionIds = startResult.questions.map(q => q.lab_question_id);
    const uniqueIds = new Set(questionIds);
    if (uniqueIds.size !== questionIds.length) {
      throw new Error('Duplicate questions detected in student allocation!');
    }
    console.log('✅ Uniqueness check: All 5 allocated questions are distinct.');

    // 9. Test: Idempotent Allocation (Resuming returns exact same questions)
    console.log('\n[Test 6] Student resumes assessment (testing persistence)...');
    const resumeResult = await LabAssessmentService.startOrResumeLab(studentUser.user_id, newLab.lab_id);
    if (resumeResult.isNew !== false) throw new Error('Expected isNew: false on resume');
    const resumeIds = resumeResult.questions.map(q => q.lab_question_id);
    const isIdentical = questionIds.every((id, i) => id === resumeIds[i]);
    if (!isIdentical) throw new Error('Questions changed upon resuming!');
    console.log('✅ Persistence check: Reopening assessment returns the exact same questions and order.');

    // 10. Test: Security — Check that hidden test cases are NOT leaked
    console.log('\n[Test 7] Security check — verify no hidden test cases exposed to student...');
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
    console.log('✅ Security check passed: Only visible test cases are exposed.');

    // 11. Test: Evaluate a Question (Submit answer with solution)
    console.log('\n[Test 8] Submitting solution for allocated question...');
    const firstQ = startResult.questions[0];
    console.log(`   Target Question: "${firstQ.title}" (ID: ${firstQ.lab_question_id})`);

    // Let's test based on the question title
    let pythonSolution = '';
    if (firstQ.title === 'Reverse an Array') {
      pythonSolution = `import sys
lines = sys.stdin.read().split()
if lines:
    n = int(lines[0])
    arr = lines[1:n+1]
    print(' '.join(reversed(arr)))
`;
    } else if (firstQ.title === 'Find Maximum and Minimum Element') {
      pythonSolution = `import sys
lines = sys.stdin.read().split()
if lines:
    n = int(lines[0])
    arr = [int(x) for x in lines[1:n+1]]
    print(f"{max(arr)} {min(arr)}")
`;
    } else if (firstQ.title === 'Palindrome String Checker') {
      pythonSolution = `import sys
s = sys.stdin.read().strip()
if s:
    print('YES' if s == s[::-1] else 'NO')
`;
    } else if (firstQ.title === 'Count Frequency of Target Element') {
      pythonSolution = `import sys
lines = sys.stdin.read().split()
if lines:
    n = int(lines[0])
    k = int(lines[1])
    arr = [int(x) for x in lines[2:n+2]]
    print(arr.count(k))
`;
    } else if (firstQ.title === 'Two Sum Target Pair') {
      pythonSolution = `import sys
lines = sys.stdin.read().split()
if lines:
    n, k = int(lines[0]), int(lines[1])
    arr = [int(x) for x in lines[2:n+2]]
    seen = set()
    found = False
    for x in arr:
        if (k - x) in seen:
            found = True
            break
        seen.add(x)
    print('YES' if found else 'NO')
`;
    } else {
      // Generic python solution
      pythonSolution = `import sys
s = sys.stdin.read().strip()
print(s)
`;
    }

    const evalResult = await LabAssessmentService.submitQuestion(studentUser.user_id, newLab.lab_id, {
      lab_question_id: firstQ.lab_question_id,
      language: 'python',
      code: pythonSolution,
    });

    console.log(`✅ Evaluation Result: Status = ${evalResult.status}`);
    console.log(`   Score: ${evalResult.score}/${evalResult.totalMarks} Marks`);
    console.log(`   Test Cases: ${evalResult.passedTestCases}/${evalResult.totalTestCases} passed`);

    // Verify hidden test cases output was not returned to student
    for (const tcr of evalResult.testCaseResults) {
      if (tcr.isHidden && (tcr.input !== undefined || tcr.expectedOutput !== undefined)) {
        throw new Error('Hidden testcase input/output leaked in evaluation results!');
      }
    }
    console.log('✅ Security check passed: Evaluation results do not leak hidden inputs/outputs.');

    // 12. Test: Submission Status
    console.log('\n[Test 9] Checking per-question submission statuses...');
    const statusData = await LabAssessmentService.getSubmissionStatus(studentUser.user_id, newLab.lab_id);
    console.log(`✅ Recorded submissions: ${statusData.submissions.length}`);

    // 13. Test: Final Assessment Submission
    console.log('\n[Test 10] Student finalizes and submits assessment...');
    const finalSubmit = await LabAssessmentService.submitAssessment(studentUser.user_id, newLab.lab_id);
    console.log(`✅ Final submission successful! Attempt status: ${finalSubmit.status}, Total Obtained: ${finalSubmit.obtained_marks}`);

    // 14. Test: Student Result Report
    console.log('\n[Test 11] Student views result report...');
    const studentReport = await LabAssessmentService.getResult(studentUser.user_id, newLab.lab_id);
    console.log(`✅ Result retrieved: ${studentReport.totalObtained} / ${studentReport.totalMarks} Marks (${studentReport.percentage}%)`);
    console.log(`   Question Breakdown: ${studentReport.questionResults.length} questions listed.`);

    // 15. Test: Faculty Results Dashboard
    console.log('\n[Test 12] Faculty views assessment results dashboard...');
    const facultyResults = await LabAssessmentService.getLabResults(facultyUser.user_id, newLab.lab_id);
    console.log(`✅ Faculty results dashboard loaded.`);
    console.log(`   Lab title: "${facultyResults.lab?.title}"`);
    console.log(`   Total attempts recorded: ${facultyResults.attempts?.length}`);
    if (!facultyResults.attempts || facultyResults.attempts.length === 0) {
      throw new Error('Expected at least 1 attempt in faculty results dashboard');
    }

    console.log('\n======================================================');
    console.log('🎉 ALL 12 LAB ASSESSMENT MODULE TESTS PASSED FLAWLESSLY!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runTests();
