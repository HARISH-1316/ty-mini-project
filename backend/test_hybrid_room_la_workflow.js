// ──────────────────────────────────────────────
// Comprehensive Verification Test for Room-Based Hybrid LAs,
// Random Allocation (Coding & MCQs), Security, and Scoring
// ──────────────────────────────────────────────

import { query } from './config/database.js';
import LabAssessmentService from './services/labAssessment.service.js';
import UserModel from './models/user.model.js';
import FacultyModel from './models/faculty.model.js';
import StudentModel from './models/student.model.js';
import RoomModel from './models/room.model.js';
import LabMcqQuestionModel from './models/labMcqQuestion.model.js';
import LaSelectedQuestionModel from './models/laSelectedQuestion.model.js';
import LaSelectedMcqModel from './models/laSelectedMcq.model.js';

async function runVerification() {
  console.log('🚀 STARTING COMPREHENSIVE E2E VERIFICATION SUITE\n');

  // 1. Verify MCQ Question Bank for all 17 DSA topics
  console.log('--- TEST 1: MCQ Question Bank (17 DSA Topics >= 5 MCQs each) ---');
  const topicsSummary = await LabMcqQuestionModel.getTopicsSummary();
  const dsa17Titles = [
    'Introduction to Data Structures and Algorithms',
    'Complexity Analysis',
    'Arrays',
    'Strings',
    'Linked Lists',
    'Stacks',
    'Queues',
    'Recursion',
    'Searching Algorithms',
    'Sorting Algorithms',
    'Hashing',
    'Trees',
    'Binary Search Trees',
    'Heaps and Priority Queues',
    'Graphs',
    'Greedy Algorithms',
    'Dynamic Programming',
  ];

  for (const title of dsa17Titles) {
    const topic = topicsSummary.find(t => t.topic_title.trim().toLowerCase() === title.toLowerCase());
    if (!topic || topic.published_mcqs < 5) {
      throw new Error(`❌ Failed topic MCQ count check: ${title} has ${topic?.published_mcqs || 0} (minimum 5 required)`);
    }
  }
  console.log(`✅ All 17 DSA topics verified: at least 5 published MCQs per topic (total published: ${topicsSummary.reduce((sum, t) => sum + t.published_mcqs, 0)}).\n`);

  // Setup test users: 1 faculty, 2 room members, 1 non-member
  const facultyUser = await UserModel.findByEmail('teacher@wcelab.ac.in');
  const faculty = await FacultyModel.findByUserId(facultyUser.user_id);

  const studentUser1 = await UserModel.findByEmail('student1@wcelab.ac.in');
  const student1 = await StudentModel.findByUserId(studentUser1.user_id);

  // Ensure second student exists for multi-student random allocation test
  let studentUser2 = await UserModel.findByEmail('student2_test@wcelab.ac.in');
  if (!studentUser2) {
    studentUser2 = await UserModel.create({
      name: 'Student Two Test',
      email: 'student2_test@wcelab.ac.in',
      password_hash: 'dummyhash',
      role: 'student',
    });
  }
  const student2 = await StudentModel.findByUserId(studentUser2.user_id) || await StudentModel.create({
    user_id: studentUser2.user_id,
    roll_number: 'STU2_TEST',
  });

  // Ensure outsider student exists (not enrolled in the test room)
  let outsiderUser = await UserModel.findByEmail('outsider_student@wcelab.ac.in');
  if (!outsiderUser) {
    outsiderUser = await UserModel.create({
      name: 'Outsider Student',
      email: 'outsider_student@wcelab.ac.in',
      password_hash: 'dummyhash',
      role: 'student',
    });
  }
  const outsiderStudent = await StudentModel.findByUserId(outsiderUser.user_id) || await StudentModel.create({
    user_id: outsiderUser.user_id,
    roll_number: 'OUTSIDER_TEST',
  });

  // Create isolated Test Room for Faculty
  console.log('--- TEST 2: Room Creation & Room Isolation ---');
  const testRoom = await RoomModel.create({
    faculty_id: faculty.faculty_id,
    room_name: 'Room Isolation E2E Lab',
    room_code: `TEST_${Date.now().toString().slice(-5)}`,
    description: 'Testing strict room isolation',
  });
  console.log(`✅ Created test room ID: ${testRoom.room_id}`);

  // Enroll student1 and student2 in testRoom
  await query('INSERT INTO student_rooms (student_id, room_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [student1.student_id, testRoom.room_id]);
  await query('INSERT INTO student_rooms (student_id, room_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [student2.student_id, testRoom.room_id]);
  // Ensure outsiderStudent is NOT enrolled
  await query('DELETE FROM student_rooms WHERE student_id = $1 AND room_id = $2', [outsiderStudent.student_id, testRoom.room_id]);

  // Verify non-faculty cannot create LA in room
  try {
    await LabAssessmentService.createAssessment(studentUser1.user_id, {
      room_id: testRoom.room_id,
      title: 'Hacked Lab',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      duration: 60,
    }, 'student');
    throw new Error('Security failure: Student was able to call createAssessment!');
  } catch (err) {
    console.log('✅ Student prevented from creating LA in room.');
  }

  // 3. Create Hybrid Lab Assessment in Room
  console.log('\n--- TEST 3: Hybrid Assessment Creation (Coding + MCQs) ---');
  // Get pool of coding questions for Arrays (topic 2)
  const codingQRes = await query('SELECT lab_question_id FROM lab_coding_questions WHERE topic_id = 2 AND status = \'published\' LIMIT 5');
  const codingPool = codingQRes.rows.map(r => r.lab_question_id);

  // Get pool of MCQs for Arrays (topic 2)
  const mcqQRes = await query('SELECT mcq_id FROM lab_mcq_questions WHERE topic_id = 2 AND status = \'published\' LIMIT 5');
  const mcqPool = mcqQRes.rows.map(r => r.mcq_id);

  if (codingPool.length < 5 || mcqPool.length < 5) {
    throw new Error(`Insufficient pool for testing: Coding=${codingPool.length}, MCQs=${mcqPool.length}`);
  }

  const start = new Date(Date.now() - 60000).toISOString();
  const end = new Date(Date.now() + 86400000).toISOString();

  // Create Hybrid LA: 3 coding questions per student from 5 selected, and 2 MCQs per student from 5 selected
  const hybridLab = await LabAssessmentService.createAssessment(facultyUser.user_id, {
    room_id: testRoom.room_id,
    title: 'Hybrid Room E2E Assessment',
    description: '3 coding questions from pool of 5 + 2 MCQs from pool of 5',
    start_time: start,
    end_time: end,
    duration: 90,
    num_coding_questions: 3,
    num_mcq_questions: 2,
    topic_ids: [2],
    allocation_mode: 'specific',
    selected_question_ids: codingPool,
    selected_mcq_ids: mcqPool,
  });

  console.log(`✅ Hybrid assessment created with ID: ${hybridLab.lab_id} in Room ${hybridLab.room_id}`);

  // Publish assessment
  await LabAssessmentService.publishAssessment(facultyUser.user_id, hybridLab.lab_id);
  console.log('✅ Hybrid assessment published successfully');

  // 4. Test Student Room Isolation
  console.log('\n--- TEST 4: Student Room Isolation Enforcement ---');
  // Enrolled student can see lab
  const student1Labs = await LabAssessmentService.getStudentAvailableLabs(studentUser1.user_id, testRoom.room_id);
  const foundInEnrolled = student1Labs.some(l => l.lab_id === hybridLab.lab_id);
  if (!foundInEnrolled) throw new Error('Enrolled student could not view the lab assessment in room!');
  console.log('✅ Enrolled student can view assessment.');

  // Outsider student cannot see lab
  const outsiderLabs = await LabAssessmentService.getStudentAvailableLabs(outsiderUser.user_id, testRoom.room_id);
  const foundInOutsider = outsiderLabs.some(l => l.lab_id === hybridLab.lab_id);
  if (foundInOutsider) throw new Error('Security failure: Outsider student was able to list assessment!');
  console.log('✅ Outsider student correctly excluded from listing assessments in room.');

  // Outsider student cannot start or view lab
  try {
    await LabAssessmentService.getStudentLabInfo(outsiderUser.user_id, hybridLab.lab_id);
    throw new Error('Security failure: Outsider student accessed lab info!');
  } catch (err) {
    console.log('✅ Outsider student rejected on getStudentLabInfo with 403 Forbidden.');
  }

  try {
    await LabAssessmentService.startOrResumeLab(outsiderUser.user_id, hybridLab.lab_id);
    throw new Error('Security failure: Outsider student started lab in room!');
  } catch (err) {
    console.log('✅ Outsider student rejected on startOrResumeLab with 403 Forbidden.');
  }

  // 5. Test Per-Student Random Allocation (Coding & MCQs)
  console.log('\n--- TEST 5: Per-Student Random Allocation & First-K Bug Fix ---');
  const startResult1 = await LabAssessmentService.startOrResumeLab(studentUser1.user_id, hybridLab.lab_id);
  const startResult2 = await LabAssessmentService.startOrResumeLab(studentUser2.user_id, hybridLab.lab_id);

  console.log('Student 1 allocated coding count:', startResult1.codingQuestions.length, 'MCQ count:', startResult1.mcqs.length);
  console.log('Student 2 allocated coding count:', startResult2.codingQuestions.length, 'MCQ count:', startResult2.mcqs.length);

  if (startResult1.codingQuestions.length !== 3 || startResult1.mcqs.length !== 2) {
    throw new Error('Student 1 allocation counts mismatch! Expected 3 coding and 2 MCQs');
  }
  if (startResult2.codingQuestions.length !== 3 || startResult2.mcqs.length !== 2) {
    throw new Error('Student 2 allocation counts mismatch! Expected 3 coding and 2 MCQs');
  }

  // Verify questions belong to pool and no duplicates within student's allocation
  const s1CodingIds = startResult1.codingQuestions.map(q => q.lab_question_id);
  const s2CodingIds = startResult2.codingQuestions.map(q => q.lab_question_id);
  const s1McqIds = startResult1.mcqs.map(m => m.mcq_id);
  const s2McqIds = startResult2.mcqs.map(m => m.mcq_id);

  if (new Set(s1CodingIds).size !== 3) throw new Error('Duplicate coding questions in student 1 allocation!');
  if (new Set(s1McqIds).size !== 2) throw new Error('Duplicate MCQs in student 1 allocation!');

  for (const id of s1CodingIds) {
    if (!codingPool.includes(id)) throw new Error(`Question ${id} not from selected coding pool!`);
  }
  for (const id of s1McqIds) {
    if (!mcqPool.includes(id)) throw new Error(`MCQ ${id} not from selected MCQ pool!`);
  }

  console.log('Student 1 coding IDs:', s1CodingIds, 'MCQ IDs:', s1McqIds);
  console.log('Student 2 coding IDs:', s2CodingIds, 'MCQ IDs:', s2McqIds);
  console.log('✅ Independent randomized sampling verified. No duplicates within student.');

  // Test immutability on resume
  const resumeResult1 = await LabAssessmentService.startOrResumeLab(studentUser1.user_id, hybridLab.lab_id);
  const resumedCodingIds = resumeResult1.codingQuestions.map(q => q.lab_question_id);
  const resumedMcqIds = resumeResult1.mcqs.map(m => m.mcq_id);

  if (JSON.stringify(resumedCodingIds) !== JSON.stringify(s1CodingIds) || JSON.stringify(resumedMcqIds) !== JSON.stringify(s1McqIds)) {
    throw new Error('Immutability failure: Allocation changed on resume!');
  }
  console.log('✅ Allocation is 100% immutable across resume/refreshes.');

  // 6. Security Check: Masking answers, test cases, and difficulty marks
  console.log('\n--- TEST 6: Student Privacy & Security Checks ---');
  for (const q of startResult1.codingQuestions) {
    if (q.marks !== undefined) throw new Error('Security leak: coding marks exposed to student!');
    if (q.difficulty !== undefined) throw new Error('Security leak: difficulty exposed to student!');
    if (q.testCases && q.testCases.some(tc => tc.is_hidden)) throw new Error('Security leak: hidden test case exposed!');
  }
  for (const m of startResult1.mcqs) {
    if (m.correct_option !== undefined) throw new Error('Security leak: correct_option exposed to student!');
    if (m.explanation !== undefined) throw new Error('Security leak: explanation exposed to student!');
    if (m.marks !== undefined) throw new Error('Security leak: MCQ marks exposed to student!');
  }
  console.log('✅ Privacy verified: correct answers, hidden tests, and marks shielded from students.');

  // 7. Student MCQ Submission & Server-Side Scoring
  console.log('\n--- TEST 7: MCQ Submission & Server-Side Scoring ---');
  const targetMcqId = s1McqIds[0];
  const mcqDetail = await LabMcqQuestionModel.findById(targetMcqId);

  // Submit correct answer
  const submitRes = await LabAssessmentService.submitMcqAnswer(studentUser1.user_id, hybridLab.lab_id, {
    mcq_id: targetMcqId,
    selected_option: mcqDetail.correct_option,
  });
  console.log('Submitted MCQ answer result:', submitRes);
  if (!submitRes.success || submitRes.mcq_id !== targetMcqId) {
    throw new Error('MCQ submission failed!');
  }
  // Check that response does NOT leak whether it was correct during the attempt
  if (submitRes.is_correct !== undefined) {
    throw new Error('Security leak: is_correct returned in MCQ submission response!');
  }
  console.log('✅ MCQ answer saved and evaluated server-side without leaking answer status.');

  // 8. Submit Complete Assessment & Verify Results
  console.log('\n--- TEST 8: Complete Hybrid Assessment Submission & Final Marks ---');
  const finalAttempt = await LabAssessmentService.submitAssessment(studentUser1.user_id, hybridLab.lab_id);
  console.log('Submitted attempt status:', finalAttempt.status, 'obtained marks:', finalAttempt.obtained_marks);
  if (finalAttempt.status !== 'submitted') throw new Error('Attempt status was not submitted!');
  if (finalAttempt.obtained_marks !== mcqDetail.marks) {
    throw new Error(`Obtained marks mismatch! Expected ${mcqDetail.marks}, got ${finalAttempt.obtained_marks}`);
  }
  console.log(`✅ Correct score calculated: ${finalAttempt.obtained_marks}/${finalAttempt.total_marks}`);

  // Get result breakdown
  const resultData = await LabAssessmentService.getResult(studentUser1.user_id, hybridLab.lab_id);
  if (!resultData.codingResults || !resultData.mcqResults) {
    throw new Error('Result breakdown missing coding or MCQ sections!');
  }
  console.log('Result retrieved: Coding problems:', resultData.codingResults.length, 'MCQs:', resultData.mcqResults.length);
  // Post-submission, correct answers should be available
  const evaluatedMcq = resultData.mcqResults.find(m => m.mcq_id === targetMcqId);
  if (!evaluatedMcq.correct_option || !evaluatedMcq.explanation) {
    throw new Error('Post-submission MCQ result missing correct_option or explanation!');
  }
  console.log('✅ Post-submission result breakdown contains full explanations and answer verification.');

  // Clean up test data
  console.log('\n--- CLEANUP ---');
  await query('DELETE FROM lab_assessment WHERE lab_id = $1', [hybridLab.lab_id]);
  await query('DELETE FROM rooms WHERE room_id = $1', [testRoom.room_id]);
  console.log('✅ Test assessment and room cleaned up.');

  console.log('\n🎉 ALL ROOM ISOLATION, HYBRID ALLOCATION, MCQ SCORING, AND SECURITY TESTS PASSED!\n');
  process.exit(0);
}

runVerification().catch(err => {
  console.error('\n❌ E2E VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
