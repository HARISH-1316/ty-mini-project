// ──────────────────────────────────────────────
// Lab Assessment Service — Business Logic Layer
// ──────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getClient } from '../config/database.js';
import { getLanguageConfig } from '../config/languages.js';
import DockerService from './docker.service.js';
import { compareOutputs } from '../utils/outputComparator.js';

import LabAssessmentModel from '../models/labAssessment.model.js';
import LabCodingQuestionModel from '../models/labCodingQuestion.model.js';
import LabTestCaseModel from '../models/labTestCase.model.js';
import LaAssessmentTopicModel from '../models/laAssessmentTopic.model.js';
import LaAllocationModel from '../models/laAllocation.model.js';
import LaAttemptModel from '../models/laAttempt.model.js';
import LaQuestionSubmissionModel from '../models/laQuestionSubmission.model.js';
import FacultyModel from '../models/faculty.model.js';
import StudentModel from '../models/student.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TMP_DIR = path.resolve(__dirname, '..', 'tmp');

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// ── Helpers ─────────────────────────────────────────────────

const createWorkspace = () => {
  const id = `la-${crypto.randomUUID().slice(0, 12)}`;
  const p = path.join(TMP_DIR, id);
  fs.mkdirSync(p, { recursive: true });
  return p;
};

const cleanupWorkspace = (p) => {
  if (p && fs.existsSync(p)) {
    try { fs.rmSync(p, { recursive: true, force: true }); } catch (_) {}
  }
};

/**
 * Fisher-Yates shuffle (in-place).
 */
const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const ensureFaculty = async (userId, role) => {
  let faculty = await FacultyModel.findByUserId(userId);
  if (!faculty && role === 'admin') {
    faculty = await FacultyModel.create({
      user_id: userId,
      designation: 'Administrator',
      department: 'Administration',
    });
  }
  return faculty;
};

const ensureStudent = async (userId) => {
  let student = await StudentModel.findByUserId(userId);
  if (!student) {
    student = await StudentModel.create({
      user_id: userId,
      roll_number: `TEMP_${Date.now()}`,
    });
  }
  return student;
};

// ── Faculty Operations ────────────────────────────────────────

const LabAssessmentService = {
  /**
   * Create a new lab assessment (draft).
   * Automatically associates selected topics if provided.
   */
  createAssessment: async (userId, data, role = 'faculty') => {
    const faculty = await ensureFaculty(userId, role);
    if (!faculty) {
      const e = new Error('Faculty profile not found.'); e.statusCode = 404; throw e;
    }
    const { topic_ids, ...labData } = data;
    const lab = await LabAssessmentModel.create({
      faculty_id: faculty.faculty_id,
      ...labData,
    });
    // Link topics if provided
    if (Array.isArray(topic_ids) && topic_ids.length > 0) {
      for (const tId of topic_ids) {
        await LaAssessmentTopicModel.create({ lab_id: lab.lab_id, topic_id: tId });
      }
    }
    lab.topics = await LaAssessmentTopicModel.findByLabId(lab.lab_id);
    return lab;
  },

  /**
   * Get all assessments for the authenticated faculty (or all assessments for admin).
   */
  getFacultyAssessments: async (userId, role = 'faculty') => {
    let labs = [];
    if (role === 'admin') {
      labs = await LabAssessmentModel.findAll();
    } else {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty) return [];
      labs = await LabAssessmentModel.findByFacultyId(faculty.faculty_id);
    }
    // Attach topic list to each lab
    for (const lab of labs) {
      lab.topics = await LaAssessmentTopicModel.findByLabId(lab.lab_id);
    }
    return labs;
  },

  /**
   * Get curriculum topics with their available question pool counts.
   */
  getTopicsSummary: async () => {
    return LaAssessmentTopicModel.getAllTopicsWithQuestionCounts();
  },

  /**
   * Get a specific assessment with topics and question pool stats.
   * Faculty can only access their own assessments, Admin can access all.
   */
  getAssessmentDetail: async (userId, labId, role = 'faculty') => {
    await LabAssessmentModel.syncStatuses();
    const lab = await LabAssessmentModel.findById(labId);
    if (!lab) {
      const e = new Error('Lab assessment not found.'); e.statusCode = 404; throw e;
    }
    if (role !== 'admin') {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty || lab.faculty_id !== faculty.faculty_id) {
        const e = new Error('Access denied.'); e.statusCode = 403; throw e;
      }
    }
    lab.topics = await LaAssessmentTopicModel.findByLabId(labId);
    lab.questionPoolStats = await LaAssessmentTopicModel.getQuestionPoolStats(labId);
    lab.totalEligibleQuestions = await LaAssessmentTopicModel.getTotalEligibleQuestions(labId);
    return lab;
  },

  /**
   * Update assessment (only allowed in draft status).
   * Also synchronizes topics if topic_ids is provided.
   */
  updateAssessment: async (userId, labId, data, role = 'faculty') => {
    const lab = await LabAssessmentModel.findById(labId);
    if (!lab) { const e = new Error('Assessment not found.'); e.statusCode = 404; throw e; }
    if (role !== 'admin') {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty || lab.faculty_id !== faculty.faculty_id) { const e = new Error('Access denied.'); e.statusCode = 403; throw e; }
    }
    if (lab.status !== 'draft') {
      const e = new Error('Only draft assessments can be edited.'); e.statusCode = 400; throw e;
    }
    const { topic_ids, ...updateData } = data;
    const updated = await LabAssessmentModel.update(labId, updateData);
    if (Array.isArray(topic_ids)) {
      await LaAssessmentTopicModel.deleteByLabId(labId);
      for (const tId of topic_ids) {
        await LaAssessmentTopicModel.create({ lab_id: labId, topic_id: tId });
      }
    }
    if (updated) {
      updated.topics = await LaAssessmentTopicModel.findByLabId(labId);
    }
    return updated;
  },

  /**
   * Publish an assessment.
   * Validates: sufficient question pool, start/end time set.
   */
  publishAssessment: async (userId, labId, role = 'faculty') => {
    const lab = await LabAssessmentModel.findById(labId);
    if (!lab) { const e = new Error('Assessment not found.'); e.statusCode = 404; throw e; }
    if (role !== 'admin') {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty || lab.faculty_id !== faculty.faculty_id) { const e = new Error('Access denied.'); e.statusCode = 403; throw e; }
    }
    if (lab.status !== 'draft') {
      const e = new Error('Only draft assessments can be published.'); e.statusCode = 400; throw e;
    }
    if (!lab.start_time || !lab.end_time) {
      const e = new Error('Start time and end time must be set before publishing.'); e.statusCode = 400; throw e;
    }

    const topics = await LaAssessmentTopicModel.findByLabId(labId);
    if (topics.length === 0) {
      const e = new Error('At least one topic must be selected before publishing.'); e.statusCode = 400; throw e;
    }

    const totalEligible = await LaAssessmentTopicModel.getTotalEligibleQuestions(labId);
    if (totalEligible < lab.num_questions) {
      const e = new Error(
        `Insufficient questions in the pool. Need ${lab.num_questions} but only ${totalEligible} available. ` +
        `Please add more questions to the selected topics or reduce the number of questions.`
      );
      e.statusCode = 400;
      throw e;
    }

    const updated = await LabAssessmentModel.updateStatus(labId, 'published');
    return updated;
  },

  /**
   * Cancel an assessment.
   */
  cancelAssessment: async (userId, labId, role = 'faculty') => {
    const lab = await LabAssessmentModel.findById(labId);
    if (!lab) { const e = new Error('Assessment not found.'); e.statusCode = 404; throw e; }
    if (role !== 'admin') {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty || lab.faculty_id !== faculty.faculty_id) { const e = new Error('Access denied.'); e.statusCode = 403; throw e; }
    }
    if (lab.status === 'completed') {
      const e = new Error('Completed assessments cannot be cancelled.'); e.statusCode = 400; throw e;
    }
    return LabAssessmentModel.updateStatus(labId, 'cancelled');
  },

  /**
   * Add a topic to an assessment.
   */
  addTopic: async (userId, labId, topicId, role = 'faculty') => {
    const lab = await LabAssessmentModel.findById(labId);
    if (!lab) { const e = new Error('Assessment not found.'); e.statusCode = 404; throw e; }
    if (role !== 'admin') {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty || lab.faculty_id !== faculty.faculty_id) { const e = new Error('Access denied.'); e.statusCode = 403; throw e; }
    }
    if (lab.status !== 'draft') {
      const e = new Error('Topics can only be changed in draft status.'); e.statusCode = 400; throw e;
    }
    return LaAssessmentTopicModel.create({ lab_id: labId, topic_id: topicId });
  },

  /**
   * Remove a topic from an assessment.
   */
  removeTopic: async (userId, labId, topicId, role = 'faculty') => {
    const lab = await LabAssessmentModel.findById(labId);
    if (!lab) { const e = new Error('Assessment not found.'); e.statusCode = 404; throw e; }
    if (role !== 'admin') {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty || lab.faculty_id !== faculty.faculty_id) { const e = new Error('Access denied.'); e.statusCode = 403; throw e; }
    }
    if (lab.status !== 'draft') {
      const e = new Error('Topics can only be changed in draft status.'); e.statusCode = 400; throw e;
    }
    return LaAssessmentTopicModel.deleteByLabAndTopic(labId, topicId);
  },

  /**
   * Get student results for a lab (faculty only, admin allowed).
   */
  getLabResults: async (userId, labId, role = 'faculty') => {
    const lab = await LabAssessmentModel.findById(labId);
    if (!lab) { const e = new Error('Assessment not found.'); e.statusCode = 404; throw e; }
    if (role !== 'admin') {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty || lab.faculty_id !== faculty.faculty_id) { const e = new Error('Access denied.'); e.statusCode = 403; throw e; }
    }

    const attempts = await LaAttemptModel.findByLabId(labId);
    const questionSubmissions = await LaQuestionSubmissionModel.findByLabId(labId);

    // Group question submissions by student_id
    const subsByStudent = {};
    for (const sub of questionSubmissions) {
      if (!subsByStudent[sub.student_id]) subsByStudent[sub.student_id] = [];
      subsByStudent[sub.student_id].push(sub);
    }

    return {
      lab,
      attempts: attempts.map((a) => ({
        ...a,
        questionSubmissions: subsByStudent[a.student_id] || [],
      })),
    };
  },

  // ── Question Bank Operations ───────────────────────────────

  createQuestion: async (userId, data, role = 'faculty') => {
    const faculty = await ensureFaculty(userId, role);
    return LabCodingQuestionModel.create({
      ...data,
      created_by_faculty_id: faculty ? faculty.faculty_id : null,
    });
  },

  listQuestions: async (topicId = null) => {
    return LabCodingQuestionModel.findAll(topicId);
  },

  getQuestion: async (questionId) => {
    const q = await LabCodingQuestionModel.findById(questionId);
    if (!q) { const e = new Error('Question not found.'); e.statusCode = 404; throw e; }
    q.testCases = await LabTestCaseModel.findByQuestionId(questionId);
    return q;
  },

  updateQuestion: async (userId, questionId, data, role = 'faculty') => {
    const q = await LabCodingQuestionModel.findById(questionId);
    if (!q) { const e = new Error('Question not found.'); e.statusCode = 404; throw e; }
    if (role !== 'admin') {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty || (q.created_by_faculty_id && q.created_by_faculty_id !== faculty.faculty_id)) {
        const e = new Error('Access denied. You can only edit your own questions.'); e.statusCode = 403; throw e;
      }
    }
    return LabCodingQuestionModel.update(questionId, data);
  },

  deleteQuestion: async (userId, questionId, role = 'faculty') => {
    const q = await LabCodingQuestionModel.findById(questionId);
    if (!q) { const e = new Error('Question not found.'); e.statusCode = 404; throw e; }
    if (role !== 'admin') {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty || (q.created_by_faculty_id && q.created_by_faculty_id !== faculty.faculty_id)) {
        const e = new Error('Access denied.'); e.statusCode = 403; throw e;
      }
    }
    return LabCodingQuestionModel.deleteById(questionId);
  },

  // ── Student Operations ─────────────────────────────────────

  /**
   * Get available/upcoming lab assessments for a student.
   */
  getStudentAvailableLabs: async (userId) => {
    await LabAssessmentModel.syncStatuses();
    await LaAttemptModel.expireTimedOut();
    let student = await ensureStudent(userId);
    if (!student) return [];
    const labs = await LabAssessmentModel.findEligibleForStudent(student.student_id);
    // Attach topic list and student attempt to each lab
    for (const lab of labs) {
      lab.topics = await LaAssessmentTopicModel.findByLabId(lab.lab_id);
      const attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, lab.lab_id);
      lab.attempt = attempt || null;
    }
    return labs;
  },

  /**
   * Get a specific lab's info for a student (no question details yet).
   */
  getStudentLabInfo: async (userId, labId) => {
    await LabAssessmentModel.syncStatuses();
    let student = await ensureStudent(userId);
    const lab = await LabAssessmentModel.findById(labId);
    if (!lab) { const e = new Error('Lab assessment not found.'); e.statusCode = 404; throw e; }
    if (!['published', 'active', 'completed'].includes(lab.status)) {
      const e = new Error('This assessment is not currently available.'); e.statusCode = 403; throw e;
    }
    lab.topics = await LaAssessmentTopicModel.findByLabId(labId);
    // Check if student has an existing attempt
    const attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);
    lab.attempt = attempt;
    return lab;
  },

  /**
   * Start or resume a lab assessment for a student.
   * Performs lazy random allocation if this is the first access.
   * Uses a DB transaction to prevent duplicate allocations.
   */
  startOrResumeLab: async (userId, labId) => {
    await LabAssessmentModel.syncStatuses();
    await LaAttemptModel.expireTimedOut();

    const student = await ensureStudent(userId);

    const lab = await LabAssessmentModel.findById(labId);
    if (!lab) { const e = new Error('Lab assessment not found.'); e.statusCode = 404; throw e; }

    const now = new Date();
    const startTime = new Date(lab.start_time);
    const endTime = new Date(lab.end_time);

    // Check for an existing attempt first
    let attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);

    if (attempt) {
      const questions = await LaAllocationModel.findByStudentAndLab(student.student_id, labId);
      // If already submitted, return flag instead of hard error so UI can show result directly
      if (attempt.status === 'submitted') {
        return { attempt, questions, isNew: false, alreadySubmitted: true };
      }
      if (attempt.status === 'timed_out' || attempt.status === 'expired') {
        return { attempt, questions, isNew: false, alreadySubmitted: true, isExpired: true };
      }
      // Check server-side deadline
      if (new Date(attempt.effective_deadline) <= now) {
        await LaAttemptModel.expireTimedOut();
        return { attempt, questions, isNew: false, alreadySubmitted: true, isExpired: true };
      }
      // Return existing in-progress allocation
      return { attempt, questions, isNew: false };
    }

    if (now < startTime) {
      const e = new Error(`Assessment has not started yet. Starts at ${startTime.toISOString()}.`);
      e.statusCode = 400; throw e;
    }
    if (now >= endTime) {
      const e = new Error('This assessment has ended and can no longer be started.');
      e.statusCode = 400; throw e;
    }
    if (!['published', 'active'].includes(lab.status)) {
      const e = new Error('This assessment is not currently active.'); e.statusCode = 403; throw e;
    }

    // New attempt — allocate questions atomically in a transaction
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Re-check inside transaction
      const checkResult = await client.query(
        'SELECT attempt_id FROM la_attempts WHERE lab_id = $1 AND student_id = $2',
        [labId, student.student_id]
      );
      if (checkResult.rows.length > 0) {
        // Race condition — another request already created it
        await client.query('ROLLBACK');
        attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);
        const questions = await LaAllocationModel.findByStudentAndLab(student.student_id, labId);
        return { attempt, questions, isNew: false };
      }

      // Get eligible question pool
      const pool = await LaAllocationModel.getEligiblePool(labId);
      if (pool.length < lab.num_questions) {
        await client.query('ROLLBACK');
        const e = new Error(
          `Insufficient questions in pool. Required: ${lab.num_questions}, Available: ${pool.length}.`
        );
        e.statusCode = 400; throw e;
      }

      // Random selection
      shuffleArray(pool);
      const selected = pool.slice(0, lab.num_questions);

      // Calculate effective_deadline = min(now + duration_minutes, end_time)
      const deadlineFromDuration = new Date(now.getTime() + lab.duration * 60 * 1000);
      const effectiveDeadline = deadlineFromDuration < endTime ? deadlineFromDuration : endTime;

      // Calculate total marks
      const totalMarks = lab.num_questions * lab.marks_per_question;

      // Create attempt
      const newAttempt = await client.query(
        `INSERT INTO la_attempts
           (lab_id, student_id, effective_deadline, status, total_marks, obtained_marks)
         VALUES ($1, $2, $3, 'in_progress', $4, 0)
         RETURNING *`,
        [labId, student.student_id, effectiveDeadline.toISOString(), totalMarks]
      );
      attempt = newAttempt.rows[0];

      // Bulk-insert allocation
      await LaAllocationModel.bulkCreate(
        client,
        student.student_id,
        labId,
        selected.map((q, i) => ({ lab_question_id: q.lab_question_id, question_order: i + 1 }))
      );

      await client.query('COMMIT');

      const questions = await LaAllocationModel.findByStudentAndLab(student.student_id, labId);
      return { attempt, questions, isNew: true };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Get the student's allocated questions (no hidden test case data).
   */
  getStudentQuestions: async (userId, labId) => {
    const student = await ensureStudent(userId);

    const attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);
    if (!attempt) { const e = new Error('You have not started this assessment yet.'); e.statusCode = 400; throw e; }

    const questions = await LaAllocationModel.findByStudentAndLab(student.student_id, labId);
    // Attach public test cases only
    for (const q of questions) {
      q.publicTestCases = await LabTestCaseModel.findPublicByQuestionId(q.lab_question_id);
    }
    return { attempt, questions };
  },

  /**
   * Run code (dry run — no marks, no submissions saved, no hidden TCs revealed).
   */
  runCode: async (userId, labId, { lab_question_id, language, code, input }) => {
    const student = await ensureStudent(userId);

    // Verify the question is in this student's allocation
    const allocated = await LaAllocationModel.findByStudentAndLab(student.student_id, labId);
    const isAllowed = allocated.some(q => q.lab_question_id === parseInt(lab_question_id, 10));
    if (!isAllowed) { const e = new Error('You are not authorized to access this question.'); e.statusCode = 403; throw e; }

    // Check attempt is active
    const attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);
    if (!attempt || attempt.status !== 'in_progress') {
      const e = new Error('Your assessment is not currently active.'); e.statusCode = 400; throw e;
    }
    if (new Date(attempt.effective_deadline) <= new Date()) {
      const e = new Error('Your assessment time has expired.'); e.statusCode = 400; throw e;
    }

    const langConfig = getLanguageConfig(language);
    if (!langConfig) { const e = new Error(`Unsupported language: ${language}`); e.statusCode = 400; throw e; }

    const workspace = createWorkspace();
    try {
      const sourceFile = path.join(workspace, langConfig.sourceFile);
      fs.writeFileSync(sourceFile, code, 'utf-8');

      if (langConfig.compileCommand) {
        const compileResult = await DockerService.runContainer({
          image: langConfig.dockerImage, workspacePath: workspace,
          command: langConfig.compileCommand, timeoutMs: 12000,
        });
        if (compileResult.timedOut || compileResult.exitCode !== 0) {
          return {
            success: false, errorType: 'COMPILATION_ERROR',
            output: '', error: compileResult.timedOut
              ? 'Compilation timed out.'
              : (compileResult.stderr || compileResult.stdout || 'Compilation error.'),
            executionTime: compileResult.executionTime,
          };
        }
      }

      const runResult = await DockerService.runContainer({
        image: langConfig.dockerImage, workspacePath: workspace,
        command: langConfig.runCommand, input: input || '', timeoutMs: 5000,
      });

      if (runResult.timedOut) return { success: false, errorType: 'TIME_LIMIT_EXCEEDED', output: '', error: 'Time limit exceeded (5s).', executionTime: runResult.executionTime };
      if (runResult.exitCode !== 0) return { success: false, errorType: 'RUNTIME_ERROR', output: runResult.stdout, error: runResult.stderr || 'Runtime error.', executionTime: runResult.executionTime };
      return { success: true, errorType: null, output: runResult.stdout, error: null, executionTime: runResult.executionTime };
    } finally {
      cleanupWorkspace(workspace);
    }
  },

  /**
   * Submit an answer for a specific question.
   * Evaluates against ALL test cases (hidden and visible).
   * Never exposes hidden test case inputs/outputs to student.
   */
  submitQuestion: async (userId, labId, { lab_question_id, language, code }) => {
    const student = await ensureStudent(userId);

    // Verify allocation
    const allocated = await LaAllocationModel.findByStudentAndLab(student.student_id, labId);
    const questionInAllocation = allocated.find(q => q.lab_question_id === parseInt(lab_question_id, 10));
    if (!questionInAllocation) { const e = new Error('You are not authorized to access this question.'); e.statusCode = 403; throw e; }

    // Check attempt state and deadline
    const attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);
    if (!attempt) { const e = new Error('Assessment not started.'); e.statusCode = 400; throw e; }
    if (attempt.status === 'submitted') { const e = new Error('Assessment already submitted.'); e.statusCode = 400; throw e; }
    if (attempt.status !== 'in_progress') { const e = new Error('Assessment session is not active.'); e.statusCode = 400; throw e; }
    if (new Date(attempt.effective_deadline) <= new Date()) {
      await LaAttemptModel.expireTimedOut();
      const e = new Error('Your assessment time has expired.'); e.statusCode = 400; throw e;
    }

    const langConfig = getLanguageConfig(language);
    if (!langConfig) { const e = new Error(`Unsupported language: ${language}`); e.statusCode = 400; throw e; }

    // Fetch question and ALL test cases (hidden + visible) — server side only
    const question = await LabCodingQuestionModel.findById(parseInt(lab_question_id, 10));
    if (!question) { const e = new Error('Question not found.'); e.statusCode = 404; throw e; }
    const allTestCases = await LabTestCaseModel.findByQuestionId(parseInt(lab_question_id, 10));

    const workspace = createWorkspace();
    let evalStatus = 'wrong_answer';
    let passedCount = 0;
    let totalCount = allTestCases.length;
    let testCaseResults = [];

    try {
      const sourceFile = path.join(workspace, langConfig.sourceFile);
      fs.writeFileSync(sourceFile, code, 'utf-8');

      // Compile once
      if (langConfig.compileCommand) {
        const compileResult = await DockerService.runContainer({
          image: langConfig.dockerImage, workspacePath: workspace,
          command: langConfig.compileCommand, timeoutMs: 12000,
        });
        if (compileResult.timedOut || compileResult.exitCode !== 0) {
          evalStatus = 'compilation_error';
          const compError = compileResult.timedOut
            ? 'Compilation timed out.'
            : (compileResult.stderr || compileResult.stdout || 'Compilation error.');
          // Save submission
          const marks = question.marks || lab_question_id * 0; // 0 for compilation error
          await LaQuestionSubmissionModel.upsert({
            attempt_id: attempt.attempt_id,
            lab_question_id: parseInt(lab_question_id, 10),
            source_code: code,
            language,
            status: 'compilation_error',
            passed_test_cases: 0,
            total_test_cases: totalCount,
            marks_obtained: 0,
          });
          // Recalculate total marks
          const totalObtained = await LaQuestionSubmissionModel.getTotalObtainedMarks(attempt.attempt_id);
          await LaAttemptModel.updateMarks(attempt.attempt_id, totalObtained);
          return {
            status: 'compilation_error',
            score: 0,
            totalMarks: question.marks || 10,
            passedTestCases: 0,
            totalTestCases: totalCount,
            error: compError,
            testCaseResults: [],
          };
        }
      }

      // Run against each test case
      for (let i = 0; i < allTestCases.length; i++) {
        const tc = allTestCases[i];
        const runResult = await DockerService.runContainer({
          image: langConfig.dockerImage, workspacePath: workspace,
          command: langConfig.runCommand, input: tc.input || '', timeoutMs: 5000,
        });

        if (runResult.timedOut) {
          testCaseResults.push({
            testCaseId: tc.lab_testcase_id,
            orderIndex: tc.order_index || (i + 1),
            passed: false,
            isHidden: tc.is_hidden,
            status: 'TIME_LIMIT_EXCEEDED',
            executionTime: runResult.executionTime,
            // Never expose hidden data
            input: tc.is_hidden ? undefined : tc.input,
            expectedOutput: tc.is_hidden ? undefined : tc.expected_output,
            actualOutput: tc.is_hidden ? undefined : runResult.stdout,
            error: 'Time limit exceeded (5s)',
          });
          if (evalStatus === 'wrong_answer') evalStatus = 'time_limit_exceeded';
          continue;
        }

        if (runResult.exitCode !== 0) {
          testCaseResults.push({
            testCaseId: tc.lab_testcase_id,
            orderIndex: tc.order_index || (i + 1),
            passed: false,
            isHidden: tc.is_hidden,
            status: 'RUNTIME_ERROR',
            executionTime: runResult.executionTime,
            input: tc.is_hidden ? undefined : tc.input,
            expectedOutput: tc.is_hidden ? undefined : tc.expected_output,
            actualOutput: tc.is_hidden ? undefined : runResult.stdout,
            error: runResult.stderr || `Exit code ${runResult.exitCode}`,
          });
          if (evalStatus === 'wrong_answer') evalStatus = 'runtime_error';
          continue;
        }

        const cmp = compareOutputs(runResult.stdout, tc.expected_output);
        if (cmp.isMatch) passedCount++;

        testCaseResults.push({
          testCaseId: tc.lab_testcase_id,
          orderIndex: tc.order_index || (i + 1),
          passed: cmp.isMatch,
          isHidden: tc.is_hidden,
          status: cmp.isMatch ? 'PASSED' : 'WRONG_ANSWER',
          executionTime: runResult.executionTime,
          input: tc.is_hidden ? undefined : tc.input,
          expectedOutput: tc.is_hidden ? undefined : tc.expected_output,
          actualOutput: tc.is_hidden ? undefined : runResult.stdout,
        });
      }
    } finally {
      cleanupWorkspace(workspace);
    }

    // Determine final status
    if (totalCount === 0) {
      evalStatus = 'accepted'; // No test cases — accept trivially
    } else if (passedCount === totalCount) {
      evalStatus = 'accepted';
    } else if (passedCount > 0) {
      evalStatus = 'partially_correct';
    } else if (evalStatus === 'wrong_answer') {
      evalStatus = 'wrong_answer';
    }

    // Calculate marks
    const questionMarks = question.marks || lab_question_id * 0 + 10;
    const marksObtained = totalCount > 0
      ? Math.round((passedCount / totalCount) * questionMarks)
      : 0;

    // Save submission
    await LaQuestionSubmissionModel.upsert({
      attempt_id: attempt.attempt_id,
      lab_question_id: parseInt(lab_question_id, 10),
      source_code: code,
      language,
      status: evalStatus,
      passed_test_cases: passedCount,
      total_test_cases: totalCount,
      marks_obtained: marksObtained,
    });

    // Recalculate total obtained marks
    const totalObtained = await LaQuestionSubmissionModel.getTotalObtainedMarks(attempt.attempt_id);
    await LaAttemptModel.updateMarks(attempt.attempt_id, totalObtained);

    return {
      status: evalStatus,
      score: marksObtained,
      totalMarks: questionMarks,
      passedTestCases: passedCount,
      totalTestCases: totalCount,
      testCaseResults,
    };
  },

  /**
   * Get per-question submission statuses for a student's active attempt.
   */
  getSubmissionStatus: async (userId, labId) => {
    const student = await ensureStudent(userId);
    const attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);
    if (!attempt) return { attempt: null, submissions: [] };
    const submissions = await LaQuestionSubmissionModel.findByAttemptId(attempt.attempt_id);
    return { attempt, submissions };
  },

  /**
   * Final submission of the entire lab assessment.
   */
  submitAssessment: async (userId, labId) => {
    const student = await ensureStudent(userId);

    const attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);
    if (!attempt) { const e = new Error('You have not started this assessment.'); e.statusCode = 400; throw e; }
    if (attempt.status === 'submitted') { const e = new Error('Assessment already submitted.'); e.statusCode = 400; throw e; }
    if (!['in_progress'].includes(attempt.status)) {
      const e = new Error('Assessment session is no longer active.'); e.statusCode = 400; throw e;
    }
    if (new Date(attempt.effective_deadline) <= new Date()) {
      await LaAttemptModel.expireTimedOut();
      const e = new Error('Your assessment time has expired.'); e.statusCode = 400; throw e;
    }

    const totalObtained = await LaQuestionSubmissionModel.getTotalObtainedMarks(attempt.attempt_id);
    const submitted = await LaAttemptModel.submit(attempt.attempt_id, totalObtained);
    if (!submitted) { const e = new Error('Failed to submit assessment. Please try again.'); e.statusCode = 500; throw e; }
    return submitted;
  },

  /**
   * Get result for a submitted assessment.
   */
  getResult: async (userId, labId) => {
    const student = await ensureStudent(userId);

    const attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);
    if (!attempt) { const e = new Error('No attempt found.'); e.statusCode = 404; throw e; }
    if (!['submitted', 'timed_out', 'expired'].includes(attempt.status)) {
      const e = new Error('Assessment has not been submitted yet.'); e.statusCode = 400; throw e;
    }

    const lab = await LabAssessmentModel.findById(labId);
    const questions = await LaAllocationModel.findByStudentAndLab(student.student_id, labId);
    const submissions = await LaQuestionSubmissionModel.findByAttemptId(attempt.attempt_id);

    // Map submissions to questions
    const subMap = {};
    for (const s of submissions) subMap[s.lab_question_id] = s;

    const questionResults = questions.map((q) => ({
      ...q,
      submission: subMap[q.lab_question_id] || {
        status: 'not_attempted',
        marks_obtained: 0,
        passed_test_cases: 0,
        total_test_cases: 0,
      },
    }));

    return {
      lab,
      attempt,
      questionResults,
      totalObtained: attempt.obtained_marks,
      totalMarks: attempt.total_marks,
      percentage: attempt.total_marks > 0
        ? parseFloat(((attempt.obtained_marks / attempt.total_marks) * 100).toFixed(2))
        : 0,
    };
  },
};

export default LabAssessmentService;
