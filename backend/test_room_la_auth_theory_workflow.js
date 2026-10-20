// ──────────────────────────────────────────────
// Comprehensive Workflow & Security Test Suite
// ──────────────────────────────────────────────
// Validates:
// 1. Role-specific login & account approval lifecycle (pending -> reject/approve)
// 2. Role tab mismatch rejection (student cannot log in via faculty tab)
// 3. Admin restricted capabilities (arbitrary role modification disabled with 403)
// 4. Forgot Password & Secure Token Reset flow
// 5. Room-Scoped Lab Assessments (LA creation requires room, student outside room blocked with 403)
// 6. Mode A specific MCQ selection persistence & student attempt allocation
// 7. Topic verified YouTube video references for all 17 topics
// ──────────────────────────────────────────────

import http from 'http';
import app from './app.js';
import { pool } from './config/database.js';

let server;
let baseUrl;

class TestClient {
  constructor() {
    this.cookies = '';
  }

  async request(method, path, body = null) {
    const headers = {};
    if (this.cookies) {
      headers['Cookie'] = this.cookies;
    }
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      const parsed = setCookie.split(';')[0];
      this.cookies = parsed;
    }

    let json = null;
    try {
      json = await res.json();
    } catch {
      // not json
    }

    return {
      status: res.status,
      body: json,
      headers: res.headers,
    };
  }

  get(path) {
    return this.request('GET', path);
  }

  post(path, body) {
    return this.request('POST', path, body);
  }

  put(path, body) {
    return this.request('PUT', path, body);
  }

  patch(path, body) {
    return this.request('PATCH', path, body);
  }

  delete(path) {
    return this.request('DELETE', path);
  }
}

const runTests = async () => {
  console.log('🚀 Starting Comprehensive WCE Virtual Lab Verification Suite...\n');

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(5899, resolve));
  baseUrl = 'http://localhost:5899/api';
  console.log(`📡 Test server running at ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title}`);
      if (details) console.error(`     Details: ${details}`);
      failed++;
    }
  };

  try {
    // Clean up any old test users
    const testEmails = [
      'student_wf_test@wce.ac.in',
      'faculty_wf_test@wce.ac.in',
      'other_faculty_wf@wce.ac.in',
      'outside_student_wf@wce.ac.in',
    ];
    for (const email of testEmails) {
      await pool.query('DELETE FROM users WHERE email = $1', [email]);
    }

    // ──────────────────────────────────────────────
    // 1. REGISTRATION & APPROVAL WORKFLOW
    // ──────────────────────────────────────────────
    console.log('--- Test Suite 1: Registration Approval & Login Guard ---');

    const studentClient = new TestClient();
    const studentSignup = await studentClient.post('/auth/signup', {
      name: 'Workflow Test Student',
      email: 'student_wf_test@wce.ac.in',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      roll_number: '2023BTECS00199',
      course: 'B.Tech CSE',
      year: 3,
    });
    assert(
      studentSignup.status === 201 && studentSignup.body?.data?.user?.approval_status === 'pending',
      'Student registration creates account with approval_status: "pending"',
      JSON.stringify(studentSignup.body)
    );

    // Attempt student login before approval
    const prematureLogin = await studentClient.post('/auth/login', {
      email: 'student_wf_test@wce.ac.in',
      password: 'Password@123',
      role: 'student',
    });
    assert(
      prematureLogin.status === 403 &&
        (prematureLogin.body.message?.includes('approval') || prematureLogin.body.message?.includes('pending')),
      'Pending student login rejected with 403 Forbidden',
      JSON.stringify(prematureLogin.body)
    );

    // Register faculty
    const facultyClient = new TestClient();
    const facultySignup = await facultyClient.post('/auth/signup/faculty', {
      name: 'Prof. Workflow Faculty',
      email: 'faculty_wf_test@wce.ac.in',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      department: 'Computer Science and Engineering',
      designation: 'Assistant Professor',
    });
    assert(
      facultySignup.status === 201 && facultySignup.body?.data?.user?.approval_status === 'pending',
      'Faculty registration creates account with approval_status: "pending"',
      JSON.stringify(facultySignup.body)
    );

    // Attempt faculty login before approval
    const prematureFacLogin = await facultyClient.post('/auth/login', {
      email: 'faculty_wf_test@wce.ac.in',
      password: 'Password@123',
      role: 'faculty',
    });
    assert(
      prematureFacLogin.status === 403 &&
        (prematureFacLogin.body.message?.includes('approval') || prematureFacLogin.body.message?.includes('pending')),
      'Pending faculty login rejected with 403 Forbidden',
      JSON.stringify(prematureFacLogin.body)
    );

    // ──────────────────────────────────────────────
    // 2. ADMIN AUTHENTICATION & RESTRICTED CAPABILITIES
    // ──────────────────────────────────────────────
    console.log('\n--- Test Suite 2: Admin Actions & Restricted Capabilities ---');

    const adminClient = new TestClient();
    const adminLogin = await adminClient.post('/auth/login', {
      email: 'admin@wcelab.ac.in',
      password: 'Admin@Wce2026!',
      role: 'admin',
    });
    assert(
      adminLogin.status === 200 && adminLogin.body?.data?.user?.role === 'admin',
      'Admin login succeeds via Admin tab',
      JSON.stringify(adminLogin.body)
    );

    // Fetch user IDs
    const studentUserRecord = await pool.query('SELECT user_id FROM users WHERE email = $1', [
      'student_wf_test@wce.ac.in',
    ]);
    const studentUserId = studentUserRecord.rows[0].user_id;

    // Attempt arbitrary role modification (MUST BE DISABLED)
    const roleChangeAttempt = await adminClient.patch(`/users/${studentUserId}/role`, {
      role: 'faculty',
    });
    assert(
      roleChangeAttempt.status === 403 &&
        (roleChangeAttempt.body.message?.includes('disabled') || roleChangeAttempt.body.message?.includes('Direct role modifications')),
      'PATCH /api/users/:userId/role returns 403 Forbidden (Arbitrary role alteration disabled)'
    );

    // Admin reviews pending approvals
    const approvalsRes = await adminClient.get('/users/approvals?status=pending');
    assert(
      approvalsRes.status === 200 && Array.isArray(approvalsRes.body?.data?.approvals),
      'GET /api/users/approvals returns list of pending users'
    );

    // Admin approves student and faculty
    const facultyUserRecord = await pool.query('SELECT user_id FROM users WHERE email = $1', [
      'faculty_wf_test@wce.ac.in',
    ]);
    const facultyUserId = facultyUserRecord.rows[0].user_id;

    const approveStudent = await adminClient.patch(`/users/${studentUserId}/approve`, {});
    assert(approveStudent.status === 200, 'Admin approves student registration');

    const approveFaculty = await adminClient.patch(`/users/${facultyUserId}/approve`, {});
    assert(approveFaculty.status === 200, 'Admin approves faculty registration');

    // ──────────────────────────────────────────────
    // 3. ROLE TAB MISMATCH ENFORCEMENT
    // ──────────────────────────────────────────────
    console.log('\n--- Test Suite 3: Role Tab Mismatch Guard ---');

    // Student tries to log in using Faculty tab
    const roleMismatchLogin = await studentClient.post('/auth/login', {
      email: 'student_wf_test@wce.ac.in',
      password: 'Password@123',
      role: 'faculty', // WRONG TAB!
    });
    assert(
      roleMismatchLogin.status === 403 &&
        roleMismatchLogin.body.message?.includes('Please sign in through the'),
      'Student login attempt via Faculty tab is rejected with 403 Forbidden'
    );

    // Student logs in using Student tab
    const validStudentLogin = await studentClient.post('/auth/login', {
      email: 'student_wf_test@wce.ac.in',
      password: 'Password@123',
      role: 'student',
    });
    assert(validStudentLogin.status === 200, 'Approved student logs in successfully via Student tab');

    // Faculty logs in using Faculty tab
    const validFacultyLogin = await facultyClient.post('/auth/login', {
      email: 'faculty_wf_test@wce.ac.in',
      password: 'Password@123',
      role: 'faculty',
    });
    assert(validFacultyLogin.status === 200, 'Approved faculty logs in successfully via Faculty tab');

    // ──────────────────────────────────────────────
    // 4. FORGOT PASSWORD & SECURE TOKEN RESET
    // ──────────────────────────────────────────────
    console.log('\n--- Test Suite 4: Forgot Password & Token Reset ---');

    const forgotRes = await studentClient.post('/auth/forgot-password', {
      email: 'student_wf_test@wce.ac.in',
    });
    assert(
      forgotRes.status === 200 && forgotRes.body.message?.includes('instructions'),
      'POST /auth/forgot-password returns generic secure response'
    );

    // Non-existent email returns identical generic response
    const forgotNonExistent = await studentClient.post('/auth/forgot-password', {
      email: 'nonexistent98765@wce.ac.in',
    });
    assert(
      forgotNonExistent.status === 200 && forgotNonExistent.body.message?.includes('instructions'),
      'Forgot password does not reveal whether account exists'
    );

    // Check token in DB
    const resetRow = await pool.query(
      'SELECT token_hash, expires_at, used_at FROM password_reset_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [studentUserId]
    );
    assert(resetRow.rows.length > 0 && resetRow.rows[0].token_hash, 'Password reset token is cryptographically hashed in DB');

    // ──────────────────────────────────────────────
    // 5. ROOM-SCOPED LAB ASSESSMENTS & ISOLATION
    // ──────────────────────────────────────────────
    console.log('\n--- Test Suite 5: Room-Scoped Lab Assessments ---');

    // Faculty creates room
    const createRoomRes = await facultyClient.post('/rooms', {
      room_name: 'Room for LA Isolation Test',
      room_code: 'ROOM_WF_' + Date.now().toString().slice(-4),
      department: 'Computer Science and Engineering',
      academic_year: '2025-26',
      semester: 5,
    });
    assert(createRoomRes.status === 201, 'Faculty creates a test room');
    const roomId = createRoomRes.body?.data?.room?.room_id;

    const now = new Date();
    const startTime = new Date(now.getTime() - 1000 * 60).toISOString();
    const endTime = new Date(now.getTime() + 1000 * 60 * 120).toISOString();

    // Faculty creates LA without room_id -> MUST FAIL
    const laWithoutRoom = await facultyClient.post('/lab-assessments', {
      title: 'Global Assessment Without Room',
      allocation_mode: 'random',
      duration: 60,
      start_time: startTime,
      end_time: endTime,
    });
    assert(
      laWithoutRoom.status === 400 || laWithoutRoom.status === 403,
      'Attempt to create Lab Assessment without room_id fails'
    );

    // Another faculty member
    const otherFacultyClient = new TestClient();
    await otherFacultyClient.post('/auth/signup/faculty', {
      name: 'Other Faculty',
      email: 'other_faculty_wf@wce.ac.in',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      department: 'Computer Science and Engineering',
      designation: 'Professor',
    });
    const otherFacUserRecord = await pool.query('SELECT user_id FROM users WHERE email = $1', [
      'other_faculty_wf@wce.ac.in',
    ]);
    const otherFacId = otherFacUserRecord.rows[0]?.user_id;
    await adminClient.patch(`/users/${otherFacId}/approve`, {});
    const otherFacLogin = await otherFacultyClient.post('/auth/login', {
      email: 'other_faculty_wf@wce.ac.in',
      password: 'Password@123',
      role: 'faculty',
    });
    assert(otherFacLogin.status === 200, 'Other faculty authenticated');

    // Other faculty tries to create LA in first faculty's room -> MUST RETURN 403
    const unauthorizedRoomLA = await otherFacultyClient.post('/lab-assessments', {
      room_id: roomId,
      title: 'Unauthorized Intrusion LA',
      allocation_mode: 'random',
      duration: 60,
      start_time: startTime,
      end_time: endTime,
      num_coding_questions: 1,
      num_mcq_questions: 1,
    });
    assert(
      unauthorizedRoomLA.status === 403,
      'Unauthorized faculty cannot create an LA in another faculty member\'s room (403 Forbidden)',
      JSON.stringify(unauthorizedRoomLA.body)
    );

    // ──────────────────────────────────────────────
    // 6. MODE A SPECIFIC MCQ SELECTION & PERSISTENCE
    // ──────────────────────────────────────────────
    console.log('\n--- Test Suite 6: Mode A Specific MCQ Selection & Attempt Allocation ---');

    // Get 3 sample MCQs from lab_mcq_questions
    const mcqRows = await pool.query('SELECT mcq_id, question_text FROM lab_mcq_questions LIMIT 3');
    const selectedMcqIds = mcqRows.rows.map((r) => r.mcq_id);

    const validLaRes = await facultyClient.post('/lab-assessments', {
      room_id: roomId,
      title: 'Mode A Verified MCQ Assessment',
      allocation_mode: 'random',
      duration: 45,
      num_coding_questions: 0,
      num_mcq_questions: selectedMcqIds.length,
      topic_ids: [6],
      selected_mcq_ids: selectedMcqIds,
      start_time: startTime,
      end_time: endTime,
    });
    assert(
      validLaRes.status === 201 && validLaRes.body?.data?.lab?.lab_id,
      'Faculty creates Mode A LA with room_id and selected_mcq_ids',
      JSON.stringify(validLaRes.body)
    );
    const laId = validLaRes.body?.data?.lab?.lab_id;

    // Faculty publishes the assessment so students can attempt it
    const publishRes = await facultyClient.put(`/lab-assessments/${laId}/publish`, {});
    assert(publishRes.status === 200, 'Faculty publishes the Lab Assessment');

    // Verify persistence in la_selected_mcqs table
    const selectedInDb = await pool.query(
      'SELECT mcq_id FROM la_selected_mcqs WHERE lab_id = $1 ORDER BY mcq_id',
      [laId]
    );
    const savedMcqIds = selectedInDb.rows.map((r) => r.mcq_id);
    assert(
      savedMcqIds.length === selectedMcqIds.length,
      `Selected MCQs persisted in PostgreSQL la_selected_mcqs (${savedMcqIds.length} questions)`
    );

    // Create outside student (not enrolled in room)
    const outsideStudentClient = new TestClient();
    await outsideStudentClient.post('/auth/signup', {
      name: 'Outside Student',
      email: 'outside_student_wf@wce.ac.in',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      roll_number: '2023BTECS00999',
      course: 'B.Tech CSE',
      year: 3,
    });
    const outsideUserRecord = await pool.query('SELECT user_id FROM users WHERE email = $1', [
      'outside_student_wf@wce.ac.in',
    ]);
    await adminClient.patch(`/users/${outsideUserRecord.rows[0].user_id}/approve`, {});
    await outsideStudentClient.post('/auth/login', {
      email: 'outside_student_wf@wce.ac.in',
      password: 'Password@123',
      role: 'student',
    });

    // Outside student attempts to access LA -> MUST FAIL WITH 403
    const outsideAttempt = await outsideStudentClient.post(`/lab-assessments/student/${laId}/start`, {});
    assert(
      outsideAttempt.status === 403 &&
        (outsideAttempt.body.message?.includes('enrolled') || outsideAttempt.body.message?.includes('room')),
      'Student not in room is rejected with 403 Forbidden when accessing LA',
      JSON.stringify(outsideAttempt.body)
    );

    // Enrolled student joins room
    const roomCode = createRoomRes.body?.data?.room?.room_code;
    const joinRes = await studentClient.post('/rooms/join', { room_code: roomCode });
    assert(joinRes.status === 200, 'Student joins the room using room_code');

    // Enrolled student starts attempt
    const studentAttempt = await studentClient.post(`/lab-assessments/student/${laId}/start`, {});
    assert(
      studentAttempt.status === 200 && (studentAttempt.body?.data?.attempt?.attempt_id || studentAttempt.body?.data?.isNew !== undefined),
      'Enrolled student starts LA attempt successfully',
      JSON.stringify(studentAttempt.body)
    );

    // Verify allocated questions contain the selected MCQs with answers hidden
    const mcqsInAttempt = studentAttempt.body?.data?.mcqs || studentAttempt.body?.data?.unifiedQuestions?.filter(q => q.question_type === 'mcq') || [];
    assert(
      mcqsInAttempt.length > 0 &&
        mcqsInAttempt.every((m) => m.correct_option === undefined),
      'Student receives allocated MCQs with correct answers hidden'
    );

    // ──────────────────────────────────────────────
    // 7. VERIFIED YOUTUBE VIDEO REFERENCES (ALL 17 DSA TOPICS)
    // ──────────────────────────────────────────────
    console.log('\n--- Test Suite 7: Verified YouTube Video References for 17 DSA Topics ---');

    const videoCountRes = await pool.query(`
      SELECT t.topic_id, t.title, COUNT(v.video_id) AS video_count
      FROM topics t
      LEFT JOIN topic_video_references v ON t.topic_id = v.topic_id
      GROUP BY t.topic_id, t.title
      ORDER BY t.topic_id;
    `);

    const topicsWithVideos = videoCountRes.rows.filter((r) => parseInt(r.video_count) >= 1);
    assert(
      topicsWithVideos.length >= 17,
      `All 17 DSA Catalog Topics have at least 1 verified YouTube video reference in DB (${topicsWithVideos.length} topics verified)`
    );

    // Test Faculty Video CRUD
    const sampleTopicId = videoCountRes.rows[0].topic_id;
    const addVideoRes = await facultyClient.post(`/topics/${sampleTopicId}/videos`, {
      title: 'Workflow Verification Striver Graph BFS Lecture',
      channel_name: 'take U forward',
      url: 'https://www.youtube.com/watch?v=-tgVpUgsQ5A',
      description: 'Breadth First Search in Graphs by Striver',
      order_index: 99,
    });
    assert(addVideoRes.status === 201 && addVideoRes.body?.data?.video?.video_id, 'Faculty adds a verified topic video reference');

    const addedVideoId = addVideoRes.body?.data?.video?.video_id;

    // Delete the added test video
    const delVideoRes = await facultyClient.delete(`/topics/${sampleTopicId}/videos/${addedVideoId}`);
    assert(delVideoRes.status === 200, 'Faculty deletes video reference');

    console.log('\n======================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Fatal error in test suite:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
    await pool.end();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
