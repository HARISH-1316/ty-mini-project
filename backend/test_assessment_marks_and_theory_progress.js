import http from 'http';
import app from './app.js';
import { pool, query } from './config/database.js';
import LabAssessmentService from './services/labAssessment.service.js';
import ProgressService from './services/progress.service.js';
import TopicService from './services/topic.service.js';
import FacultyModel from './models/faculty.model.js';
import StudentModel from './models/student.model.js';
import UserModel from './models/user.model.js';
import RoomModel from './models/room.model.js';
import LabAssessmentModel from './models/labAssessment.model.js';
import LabCodingQuestionModel from './models/labCodingQuestion.model.js';
import LaAllocationModel from './models/laAllocation.model.js';
import LaQuestionSubmissionModel from './models/laQuestionSubmission.model.js';

let server;
let baseUrl;

async function runTests() {
  console.log('🚀 Running Assessment-Specific Marks, Room-Scoped Progress & Theory Editing Suite...\n');

  // Start local server
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(5992, () => {
      baseUrl = 'http://localhost:5992/api';
      console.log(`📡 Server listening on ${baseUrl}`);
      resolve();
    });
  });

  try {
    // 1. Fetch test faculty and students
    const facultyUser = await UserModel.findByEmail('teacher@wcelab.ac.in') || (await query("SELECT * FROM users WHERE role = 'faculty' LIMIT 1")).rows[0];
    if (!facultyUser) throw new Error('Faculty user not found for testing');
    const faculty = await FacultyModel.findByUserId(facultyUser.user_id);

    const studentUser1 = await UserModel.findByEmail('student1@wcelab.ac.in') || (await query("SELECT * FROM users WHERE role = 'student' ORDER BY user_id LIMIT 1")).rows[0];
    const studentUser2 = await UserModel.findByEmail('student2_test@wcelab.ac.in') || (await query("SELECT * FROM users WHERE role = 'student' ORDER BY user_id DESC LIMIT 1")).rows[0];
    if (!studentUser1 || !studentUser2) throw new Error('Student users not found for testing');

    const student1 = await StudentModel.findByUserId(studentUser1.user_id);
    const student2 = await StudentModel.findByUserId(studentUser2.user_id);

    // ──────────────────────────────────────────────
    // TEST 1: Assessment Marks Override QB Marks
    // ──────────────────────────────────────────────
    console.log('--- TEST 1: Assessment Marks Override Question Bank Marks ---');
    // Find or create a room for faculty
    const testRoom1 = await RoomModel.create({
      faculty_id: faculty.faculty_id,
      room_name: `Marks Test Room ${Date.now()}`,
      room_code: `MTR${Math.floor(1000 + Math.random() * 9000)}`,
      description: 'Test room'
    });

    // Enroll student1 into room1
    await query('INSERT INTO student_rooms (student_id, room_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [student1.student_id, testRoom1.room_id]);

    // Get a coding question from question bank
    const qbQuestions = await LabCodingQuestionModel.findAll();
    const testQuestion = qbQuestions[0];
    const originalQbMarks = testQuestion.marks || 10;
    console.log(`Original QB Question "${testQuestion.title}" (ID: ${testQuestion.lab_question_id}) marks: ${originalQbMarks}`);

    // Faculty creates an assessment with configured marks = 25 (different from original)
    const customMarks = 25;
    const now = new Date();
    const startTime = new Date(now.getTime() - 60000);
    const endTime = new Date(now.getTime() + 7200000);

    const assessment = await LabAssessmentService.createAssessment(facultyUser.user_id, {
      room_id: testRoom1.room_id,
      title: `Authoritative Marks Test Assessment ${Date.now()}`,
      instructions: 'Testing faculty marks snapshot',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration: 60,
      duration_minutes: 60,
      allocation_mode: 'specific',
      num_coding_questions: 1,
      num_mcqs: 0,
      total_marks: customMarks,
      topic_ids: [testQuestion.topic_id || 1],
      selected_questions: [
        { lab_question_id: testQuestion.lab_question_id, marks: customMarks }
      ]
    }, 'faculty');

    console.log(`Created assessment ID ${assessment.lab_id} with custom marks: ${customMarks}`);
    await LabAssessmentService.publishAssessment(facultyUser.user_id, assessment.lab_id, 'faculty');

    // Start assessment for student 1
    const startResult = await LabAssessmentService.startOrResumeLab(studentUser1.user_id, assessment.lab_id);
    
    // Check allocation in DB
    const allocations = await query(
      'SELECT marks FROM la_student_allocations WHERE lab_id = $1 AND student_id = $2 AND lab_question_id = $3',
      [assessment.lab_id, student1.student_id, testQuestion.lab_question_id]
    );
    if (!allocations.rows.length || allocations.rows[0].marks !== customMarks) {
      throw new Error(`Allocation marks mismatch! Expected ${customMarks}, got ${allocations.rows[0]?.marks}`);
    }
    console.log(`✅ Student allocation correctly snapshotted assessment marks: ${allocations.rows[0].marks}`);

    // Check Question Bank was NOT overwritten
    const qbAfter = await LabCodingQuestionModel.findById(testQuestion.lab_question_id);
    if (qbAfter.marks !== originalQbMarks) {
      throw new Error(`Question bank default marks were overwritten! Expected ${originalQbMarks}, got ${qbAfter.marks}`);
    }
    console.log(`✅ Question bank original marks preserved untouched: ${qbAfter.marks}`);

    // Clean up assessment & room
    await query('DELETE FROM la_student_allocations WHERE lab_id = $1', [assessment.lab_id]);
    await query('DELETE FROM la_selected_questions WHERE lab_id = $1', [assessment.lab_id]);
    await query('DELETE FROM la_attempts WHERE lab_id = $1', [assessment.lab_id]);
    await query('DELETE FROM lab_assessment WHERE lab_id = $1', [assessment.lab_id]);
    await query('DELETE FROM student_rooms WHERE room_id = $1', [testRoom1.room_id]);
    await query('DELETE FROM rooms WHERE room_id = $1', [testRoom1.room_id]);

    // ──────────────────────────────────────────────
    // TEST 2: Room-Scoped Student Progress
    // ──────────────────────────────────────────────
    console.log('\n--- TEST 2: Room-Scoped Student Progress ---');
    const roomA = await RoomModel.create({
      faculty_id: faculty.faculty_id,
      room_name: `Room Scope A ${Date.now()}`,
      room_code: `RSA${Math.floor(1000 + Math.random() * 9000)}`,
      description: 'Scope test A'
    });
    const roomB = await RoomModel.create({
      faculty_id: faculty.faculty_id,
      room_name: `Room Scope B ${Date.now()}`,
      room_code: `RSB${Math.floor(1000 + Math.random() * 9000)}`,
      description: 'Scope test B'
    });

    // Enroll student1 in roomA ONLY, student2 in roomB ONLY
    await query('DELETE FROM student_rooms WHERE student_id = $1 AND room_id = $2', [student1.student_id, roomB.room_id]);
    await query('DELETE FROM student_rooms WHERE student_id = $1 AND room_id = $2', [student2.student_id, roomA.room_id]);
    await query('INSERT INTO student_rooms (student_id, room_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [student1.student_id, roomA.room_id]);
    await query('INSERT INTO student_rooms (student_id, room_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [student2.student_id, roomB.room_id]);

    // Query faculty student progress for roomA
    const resA = await ProgressService.getFacultyStudentsProgress(facultyUser.user_id, { roomId: roomA.room_id });
    const studentsA = resA.students || [];
    console.log(`Room A progress found ${studentsA.length} students:`, studentsA.map(s => s.email));
    if (studentsA.some(s => s.student_id === student2.student_id)) {
      throw new Error('Data leak: Student 2 from Room B appeared in Room A progress!');
    }
    if (!studentsA.some(s => s.student_id === student1.student_id)) {
      throw new Error('Missing student: Student 1 did not appear in Room A progress!');
    }
    console.log('✅ Room A progress strictly scoped to Room A members.');

    // Query faculty student progress for roomB
    const resB = await ProgressService.getFacultyStudentsProgress(facultyUser.user_id, { roomId: roomB.room_id });
    const studentsB = resB.students || [];
    console.log(`Room B progress found ${studentsB.length} students:`, studentsB.map(s => s.email));
    if (studentsB.some(s => s.student_id === student1.student_id)) {
      throw new Error('Data leak: Student 1 from Room A appeared in Room B progress!');
    }
    if (!studentsB.some(s => s.student_id === student2.student_id)) {
      throw new Error('Missing student: Student 2 did not appear in Room B progress!');
    }
    console.log('✅ Room B progress strictly scoped to Room B members.');

    // Clean up rooms
    await query('DELETE FROM student_rooms WHERE room_id IN ($1, $2)', [roomA.room_id, roomB.room_id]);
    await query('DELETE FROM rooms WHERE room_id IN ($1, $2)', [roomA.room_id, roomB.room_id]);

    // ──────────────────────────────────────────────
    // TEST 3: Faculty Theory Content Editing
    // ──────────────────────────────────────────────
    console.log('\n--- TEST 3: Faculty Theory Content Editing ---');
    // Fetch a subtopic
    const subtopicsRes = await query('SELECT subtopic_id, title FROM subtopics LIMIT 1');
    if (!subtopicsRes.rows.length) throw new Error('No subtopics found in database');
    const subtopic = subtopicsRes.rows[0];

    const testMarkdown = `### Updated Theory Content ${Date.now()}\n\nThis content was updated by faculty and persisted to PostgreSQL flexible server.`;
    const testVideo = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    const updateRes = await TopicService.upsertContent(
      subtopic.subtopic_id,
      {
        aim: 'Test Aim',
        theory: testMarkdown,
        video_explanation_url: testVideo
      }
    );

    console.log(`Updated subtopic ${subtopic.subtopic_id} ("${subtopic.title}")`);
    
    // Verify fetched subtopic content has the new values
    const fetchedContent = await TopicService.getSubtopicContent(subtopic.subtopic_id);
    if (fetchedContent.theory !== testMarkdown) {
      throw new Error('Theory content markdown did not persist correctly!');
    }
    if (fetchedContent.video_explanation_url !== testVideo) {
      throw new Error('Theory video URL did not persist correctly!');
    }
    console.log('✅ Theory markdown and video URL successfully updated and persisted in PostgreSQL.');

    console.log('\n🎉 ALL CUSTOM REQUIREMENTS VERIFIED: AUTHORITATIVE MARKS, ROOM PROGRESS SCOPING, AND THEORY EDITING!');

  } finally {
    if (server) {
      await new Promise(r => server.close(r));
    }
    await pool.end();
  }
}

runTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
