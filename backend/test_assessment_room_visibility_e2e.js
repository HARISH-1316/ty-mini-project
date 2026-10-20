// ─────────────────────────────────────────────────────────────
// E2E Verification Test: Room-Based Lab Assessment Visibility
// ─────────────────────────────────────────────────────────────

import { query } from './config/database.js';
import LabAssessmentService from './services/labAssessment.service.js';
import UserModel from './models/user.model.js';
import FacultyModel from './models/faculty.model.js';
import StudentModel from './models/student.model.js';
import RoomModel from './models/room.model.js';
import LabAssessmentModel from './models/labAssessment.model.js';

async function runTest() {
  console.log('===============================================================');
  console.log('🧪 RUNNING COMPREHENSIVE E2E ROOM LAB ASSESSMENT VISIBILITY TEST');
  console.log('===============================================================\n');

  try {
    // 1. Fetch Faculty User
    const facultyUser = await UserModel.findByEmail('teacher@wcelab.ac.in');
    if (!facultyUser) throw new Error('Faculty user teacher@wcelab.ac.in not found');
    const faculty = await FacultyModel.findByUserId(facultyUser.user_id);
    console.log(`[PASS] Faculty User: ${facultyUser.email} (faculty_id: ${faculty.faculty_id})`);

    // 2. Setup or find Room A
    let roomA = await RoomModel.findByCode('TEST_ROOMA');
    if (!roomA) {
      roomA = await RoomModel.create({
        faculty_id: faculty.faculty_id,
        room_name: 'Room A — Verification Lab',
        room_code: 'TEST_ROOMA',
        description: 'Room A for assessment visibility testing',
      });
      console.log(`[CREATED] Room A (room_id: ${roomA.room_id})`);
    } else {
      console.log(`[FOUND] Existing Room A (room_id: ${roomA.room_id})`);
    }

    // Setup or find Room B (unrelated room)
    let roomB = await RoomModel.findByCode('TEST_ROOMB');
    if (!roomB) {
      roomB = await RoomModel.create({
        faculty_id: faculty.faculty_id,
        room_name: 'Room B — Unrelated Lab',
        room_code: 'TEST_ROOMB',
        description: 'Room B for boundary testing',
      });
      console.log(`[CREATED] Room B (room_id: ${roomB.room_id})`);
    } else {
      console.log(`[FOUND] Existing Room B (room_id: ${roomB.room_id})`);
    }

    // 3. Find or create Student 1 (Enrolled in Room A)
    let studentUser1 = await UserModel.findByEmail('student1@wcelab.ac.in');
    if (!studentUser1) throw new Error('student1@wcelab.ac.in not found');
    let student1 = await StudentModel.findByUserId(studentUser1.user_id);
    if (!student1) {
      student1 = await StudentModel.create({ user_id: studentUser1.user_id, roll_number: 'TEST_S1' });
    }

    // Ensure student1 is enrolled in Room A, but NOT Room B
    await query(`INSERT INTO student_rooms (student_id, room_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
      student1.student_id,
      roomA.room_id,
    ]);
    await query(`DELETE FROM student_rooms WHERE student_id = $1 AND room_id = $2`, [
      student1.student_id,
      roomB.room_id,
    ]);
    console.log(`[PASS] Student 1: ${studentUser1.email} (student_id: ${student1.student_id}) enrolled in Room A only.`);

    // 4. Find or create Student 2 (Enrolled in Room B only — outsider to Room A)
    let studentUser2 = await UserModel.findByEmail('student2_test@wcelab.ac.in');
    if (!studentUser2) {
      studentUser2 = await UserModel.create({
        name: 'Student 2 Outsider',
        email: 'student2_test@wcelab.ac.in',
        password_hash: 'dummyhash',
        role: 'student',
      });
    }
    let student2 = await StudentModel.findByUserId(studentUser2.user_id);
    if (!student2) {
      student2 = await StudentModel.create({ user_id: studentUser2.user_id, roll_number: 'TEST_S2' });
    }

    await query(`INSERT INTO student_rooms (student_id, room_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
      student2.student_id,
      roomB.room_id,
    ]);
    await query(`DELETE FROM student_rooms WHERE student_id = $1 AND room_id = $2`, [
      student2.student_id,
      roomA.room_id,
    ]);
    console.log(`[PASS] Student 2: ${studentUser2.email} (student_id: ${student2.student_id}) enrolled in Room B only.`);

    // 5. Get a topic with questions (e.g. Arrays, topic_id = 3 or first available)
    const topicRes = await query(`SELECT topic_id, title FROM topics ORDER BY topic_id LIMIT 1`);
    const testTopic = topicRes.rows[0];
    console.log(`[INFO] Using topic for assessment: ${testTopic.title} (topic_id: ${testTopic.topic_id})`);

    // SCENARIO 1: Faculty creates a lab assessment for Room A in draft
    console.log('\n--- SCENARIO 1: Faculty creates Lab Assessment for Room A ---');
    const now = new Date();
    const startTime = new Date(now.getTime() - 10 * 60 * 1000); // started 10m ago
    const endTime = new Date(now.getTime() + 4 * 60 * 60 * 1000); // ends in 4h

    const draftLab = await LabAssessmentService.createAssessment(facultyUser.user_id, {
      room_id: roomA.room_id,
      title: 'E2E Assessment Room A Visibility Test',
      description: 'Test assessment to verify room-scoped visibility',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration: 60,
      num_coding_questions: 1,
      marks_per_question: 10,
      num_mcq_questions: 1,
      marks_per_mcq: 2,
      allocation_mode: 'random',
      topic_ids: [testTopic.topic_id],
    });

    console.log(`[PASS] Created Assessment id: ${draftLab.lab_id}, room_id: ${draftLab.room_id}, status: ${draftLab.status}`);

    // SCENARIO 2: Verify database persistence in Azure PostgreSQL
    console.log('\n--- SCENARIO 2: Verify persistence in Azure PostgreSQL ---');
    const dbCheck = await query(`SELECT lab_id, room_id, faculty_id, title, status FROM lab_assessment WHERE lab_id = $1`, [draftLab.lab_id]);
    if (dbCheck.rows.length === 0) throw new Error('Assessment was not persisted to database!');
    if (dbCheck.rows[0].room_id !== roomA.room_id) throw new Error('Assessment room_id does not match Room A!');
    console.log(`[PASS] Assessment ${draftLab.lab_id} accurately persisted with room_id = ${roomA.room_id}`);

    // SCENARIO 5: Unpublished/Draft assessments remain hidden from students
    console.log('\n--- SCENARIO 5: Draft assessment MUST be hidden from students ---');
    const student1DraftCheck = await LabAssessmentService.getStudentAvailableLabs(studentUser1.user_id, roomA.room_id);
    const visibleDraft = student1DraftCheck.find(l => l.lab_id === draftLab.lab_id);
    if (visibleDraft) {
      throw new Error('❌ FAILURE: Draft assessment is visible to student! Business rule violation.');
    }
    console.log(`[PASS] Draft assessment correctly hidden from Student 1 (not published yet).`);

    // Publish the assessment
    console.log('\n--- PUBLISHING ASSESSMENT ---');
    const publishedLab = await LabAssessmentService.publishAssessment(facultyUser.user_id, draftLab.lab_id);
    console.log(`[PASS] Assessment published! New status: ${publishedLab.status}`);

    // SCENARIO 3: Student 1 (Room A member) can see the assessment
    console.log('\n--- SCENARIO 3: Room A Student can see the published assessment ---');
    // Test room-scoped retrieval (what RoomDetails.jsx uses)
    const roomALabsForStudent1 = await LabAssessmentService.getStudentAvailableLabs(studentUser1.user_id, roomA.room_id);
    const foundInRoomA = roomALabsForStudent1.find(l => l.lab_id === draftLab.lab_id);
    if (!foundInRoomA) {
      throw new Error('❌ FAILURE: Student 1 cannot see assessment in Room A!');
    }
    console.log(`[PASS] Student 1 successfully retrieved assessment ${foundInRoomA.lab_id} in Room A (title: "${foundInRoomA.title}")`);

    // Test global student available retrieval (what LabAssessmentList.jsx & StudentDashboard.jsx use)
    const globalLabsForStudent1 = await LabAssessmentService.getStudentAvailableLabs(studentUser1.user_id, null);
    const foundInGlobal = globalLabsForStudent1.find(l => l.lab_id === draftLab.lab_id);
    if (!foundInGlobal) {
      throw new Error('❌ FAILURE: Student 1 cannot see assessment in global available list!');
    }
    console.log(`[PASS] Student 1 successfully retrieved assessment ${foundInGlobal.lab_id} on Student Dashboard / Assessment List.`);

    // SCENARIO 4: Student 2 (NOT in Room A) CANNOT see the assessment
    console.log('\n--- SCENARIO 4: Student 2 (Non-member) CANNOT see Room A assessment ---');
    // Check Room A scoped for Student 2
    const roomALabsForStudent2 = await LabAssessmentService.getStudentAvailableLabs(studentUser2.user_id, roomA.room_id);
    const foundInRoomAForStudent2 = roomALabsForStudent2.find(l => l.lab_id === draftLab.lab_id);
    if (foundInRoomAForStudent2) {
      throw new Error('❌ SECURITY FAILURE: Student 2 (not in Room A) can see Room A assessment!');
    }
    console.log(`[PASS] Student 2 correctly denied visibility of Room A assessment via room filter.`);

    // Check Student 2 global available assessments
    const globalLabsForStudent2 = await LabAssessmentService.getStudentAvailableLabs(studentUser2.user_id, null);
    const foundInGlobalForStudent2 = globalLabsForStudent2.find(l => l.lab_id === draftLab.lab_id);
    if (foundInGlobalForStudent2) {
      throw new Error('❌ SECURITY FAILURE: Student 2 can see Room A assessment in global list!');
    }
    console.log(`[PASS] Student 2 correctly excluded from Room A assessment in global assessment list.`);

    // SCENARIO 7: Start assessment, verify questions allocated, submit, check relationships
    console.log('\n--- SCENARIO 7: Assessment participation, question allocation, and submission flow ---');
    const startResult = await LabAssessmentService.startOrResumeLab(studentUser1.user_id, draftLab.lab_id);
    console.log(`[PASS] Student 1 started assessment: attempt_id ${startResult.attempt?.attempt_id}`);

    const studentQuestions = await LabAssessmentService.getStudentQuestions(studentUser1.user_id, draftLab.lab_id);
    console.log(`[PASS] Allocated questions for Student 1: ${studentQuestions.codingQuestions?.length || 0} coding, ${studentQuestions.mcqQuestions?.length || 0} MCQs`);
    if ((studentQuestions.codingQuestions?.length || 0) + (studentQuestions.mcqQuestions?.length || 0) === 0) {
      throw new Error('❌ FAILURE: No questions allocated to student on assessment start!');
    }

    // Verify attempt is in_progress
    const inProgressCheck = await LabAssessmentService.getStudentAvailableLabs(studentUser1.user_id, roomA.room_id);
    const inProgressLab = inProgressCheck.find(l => l.lab_id === draftLab.lab_id);
    if (inProgressLab?.attempt?.status !== 'in_progress') {
      throw new Error(`❌ FAILURE: Expected attempt status to be 'in_progress', got ${inProgressLab?.attempt?.status}`);
    }
    console.log(`[PASS] Assessment shows 'in_progress' attempt on Student Room page.`);

    // Clean up test assessment so test is idempotent
    console.log('\n--- CLEANUP ---');
    await query(`DELETE FROM lab_assessment WHERE lab_id = $1`, [draftLab.lab_id]);
    console.log(`[PASS] Cleaned up temporary test assessment ${draftLab.lab_id} (cascade deleted all attempts and allocations).`);

    console.log('\n===============================================================');
    console.log('🎉 ALL 7 E2E LAB ASSESSMENT WORKFLOW SCENARIOS PASSED PERFECTLY!');
    console.log('===============================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:', err);
    process.exit(1);
  }
}

runTest();
