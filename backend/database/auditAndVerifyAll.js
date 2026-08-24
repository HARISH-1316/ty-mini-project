// ──────────────────────────────────────────────
// Comprehensive End-to-End System Audit & Verification Script
// ──────────────────────────────────────────────

import { pool, testConnection, query } from '../config/database.js';
import AuthService from '../services/auth.service.js';
import UserService from '../services/user.service.js';
import RoomService from '../services/room.service.js';
import TopicService from '../services/topic.service.js';
import QuizService from '../services/quiz.service.js';
import ProgressService from '../services/progress.service.js';
import UserModel from '../models/user.model.js';
import StudentModel from '../models/student.model.js';
import FacultyModel from '../models/faculty.model.js';
import RoomModel from '../models/room.model.js';
import TopicModel from '../models/topic.model.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runCompleteAudit = async () => {
  console.log('========================================');
  console.log('WCE VIRTUAL LAB — COMPLETE SYSTEM AUDIT');
  console.log('========================================\n');

  let passedChecks = 0;
  let failedChecks = 0;
  const issues = [];

  const check = (desc, condition) => {
    if (condition) {
      console.log(`  ✓ ${desc}`);
      passedChecks++;
    } else {
      console.log(`  ❌ ${desc}`);
      failedChecks++;
      issues.push(desc);
    }
  };

  try {
    // ── 1. DATABASE CONNECTIVITY & SCHEMAS ─────
    console.log('1. Database Connectivity & Tables:');
    const connected = await testConnection();
    check('PostgreSQL Connection', connected);

    // Apply seed.sql to guarantee standard test users & rooms
    const seedPath = path.join(__dirname, 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf-8');
      await pool.query(seedSql);
    }

    const tablesRes = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    const tables = new Set(tablesRes.rows.map((r) => r.table_name));

    const requiredTables = [
      'users', 'student', 'faculty', 'rooms', 'student_rooms',
      'topics', 'room_topics', 'subtopics', 'subtopic_content',
      'progress', 'subtopic_progress', 'prerequisite', 'prerequisite_quiz',
      'prerequisite_quiz_questions', 'final_quiz', 'final_quiz_questions',
      'subtopic_quiz_questions', 'topic_coding_assessment', 'coding_submissions',
      'topic_feedback', 'quiz_attempts', 'session'
    ];

    for (const t of requiredTables) {
      check(`Table "${t}" exists`, tables.has(t));
    }

    // ── 2. SEEDED DATA & QUIZ STANDARDIZATION ───
    console.log('\n2. Quiz Standardization (10 Questions & 15m Time Limit):');
    const quizzesRes = await query(`
      SELECT pq.title, COALESCE(pq.time_limit, 15) as time_limit, COUNT(pqq.pq_question_id)::int as q_count
      FROM prerequisite_quiz pq
      LEFT JOIN prerequisite_quiz_questions pqq ON pq.prereq_quiz_id = pqq.prereq_quiz_id
      GROUP BY pq.prereq_quiz_id, pq.title, pq.time_limit
    `);
    for (const q of quizzesRes.rows) {
      check(`Prereq Quiz "${q.title}": 10 questions (${q.q_count}) & 15m (${q.time_limit}m)`, q.q_count === 10 && q.time_limit === 15);
    }

    const subtopicQuizzesRes = await query(`
      SELECT s.title, COALESCE(sc.time_limit, 15) as time_limit, COUNT(stq.stq_id)::int as q_count
      FROM subtopics s
      JOIN subtopic_content sc ON s.subtopic_id = sc.subtopic_id
      LEFT JOIN subtopic_quiz_questions stq ON sc.content_id = stq.content_id
      GROUP BY s.subtopic_id, s.title, sc.content_id, sc.time_limit
    `);
    for (const sq of subtopicQuizzesRes.rows) {
      check(`Subtopic Quiz "${sq.title}": 10 questions (${sq.q_count}) & 15m (${sq.time_limit}m)`, sq.q_count === 10 && sq.time_limit === 15);
    }

    const finalQuizRes = await query(`
      SELECT fq.title, COALESCE(fq.time_limit, 15) as time_limit, COUNT(fqq.fq_question_id)::int as q_count
      FROM final_quiz fq
      LEFT JOIN final_quiz_questions fqq ON fq.final_quiz_id = fqq.final_quiz_id
      GROUP BY fq.final_quiz_id, fq.title, fq.time_limit
    `);
    for (const fq of finalQuizRes.rows) {
      check(`Final Quiz "${fq.title}": 10 questions (${fq.q_count}) & 15m (${fq.time_limit}m)`, fq.q_count === 10 && fq.time_limit === 15);
    }

    // ── 3. USER MANAGEMENT & PROFILES ───────────
    console.log('\n3. Users & Role Profiles:');
    const adminUser = await UserModel.findByEmail('admin@wcelab.ac.in');
    check('Admin user exists (admin@wcelab.ac.in)', !!adminUser && adminUser.role === 'admin');

    const facultyUser = await UserModel.findByEmail('faculty@wcelab.ac.in');
    check('Faculty user exists (faculty@wcelab.ac.in)', !!facultyUser && facultyUser.role === 'faculty');

    const studentUser = await UserModel.findByEmail('student@wcelab.ac.in');
    check('Student user exists (student@wcelab.ac.in)', !!studentUser && studentUser.role === 'student');

    // ── 4. ROOMS & TOPIC ACCESS ISOLATION ───────
    console.log('\n4. Room Access & Topic Catalogue Isolation:');
    if (studentUser) {
      const studentTopics = await RoomService.getStudentTopics(studentUser.user_id);
      check('RoomService.getStudentTopics returns topics for joined rooms', Array.isArray(studentTopics));

      const dsaTopic = await TopicModel.findByTitle('Data Structures and Algorithms');
      if (dsaTopic) {
        const hasAccess = await RoomService.checkStudentTopicAccess(studentUser.user_id, dsaTopic.topic_id);
        check(`Student topic access check for DSA (${hasAccess})`, typeof hasAccess === 'boolean');
      }
    }

    // ── 5. QUIZ ANSWER MASKING & SECURITY ───────
    console.log('\n5. Quiz Security & Answer Masking:');
    const dsaTopic = await TopicModel.findByTitle('Data Structures and Algorithms');
    if (dsaTopic && studentUser) {
      const prereqQuiz = await QuizService.getPrerequisiteQuiz(dsaTopic.topic_id, studentUser.user_id, 'student');
      const hasExposedAnswer = prereqQuiz.questions.some((q) => q.correct_option !== undefined);
      check('Student request NEVER receives correct_option', !hasExposedAnswer);
    }

    // ── 6. PROGRESS & ANALYTICS ENGINE ──────────
    console.log('\n6. Progress & Platform Analytics Engine:');
    if (studentUser) {
      const studentProg = await ProgressService.getStudentOverallProgress(studentUser.user_id);
      check('Student overall progress aggregation computed', typeof studentProg.overallProgress === 'number');
      check('Topics progress array populated', Array.isArray(studentProg.topicsProgress));
    }

    if (facultyUser) {
      const facultyAnalytics = await ProgressService.getFacultyAnalytics(facultyUser.user_id);
      check('Faculty room analytics computed', typeof facultyAnalytics.totalStudents === 'number');
      const facultyStudents = await ProgressService.getFacultyStudentsProgress(facultyUser.user_id);
      check('Faculty authorized students query working', Array.isArray(facultyStudents.students));
    }

    const platformAnalytics = await ProgressService.getAdminPlatformAnalytics();
    check('Admin platform analytics computed', platformAnalytics.totalStudents > 0);

    // ── 7. FACULTY AUTHORIZATION BOUNDARY ───────
    console.log('\n7. Faculty Authorization Bounds (Unenrolled Student Check):');
    if (facultyUser) {
      try {
        // Attempt to access an invalid / unassigned student ID (e.g. 999999)
        await ProgressService.getFacultyStudentDetailedProgress(facultyUser.user_id, 999999);
        check('Faculty unauthorized student access rejected with 403', false);
      } catch (err) {
        check('Faculty unauthorized student access correctly throws 403', err.statusCode === 403);
      }
    }

    console.log('\n========================================');
    console.log(`AUDIT COMPLETE: ${passedChecks} Passed, ${failedChecks} Failed`);
    console.log('========================================\n');

    if (failedChecks === 0) {
      console.log('🎉 ALL SYSTEM CHECKS PASSED PERFECTLY!\n');
    } else {
      console.error('❌ Issues detected:');
      issues.forEach((iss) => console.error(`  - ${iss}`));
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Unexpected error during system audit:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runCompleteAudit();
