// ──────────────────────────────────────────────
// Lab Assessment Service — Business Logic Layer
// ──────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { query, getClient } from '../config/database.js';
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
import LaSelectedQuestionModel from '../models/laSelectedQuestion.model.js';
import LabMcqQuestionModel from '../models/labMcqQuestion.model.js';
import LaSelectedMcqModel from '../models/laSelectedMcq.model.js';
import LaMcqAllocationModel from '../models/laMcqAllocation.model.js';
import LaMcqSubmissionModel from '../models/laMcqSubmission.model.js';
import RoomModel from '../models/room.model.js';
import LaProctoringViolationModel from '../models/laProctoringViolation.model.js';

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

const sanitizeForStudent = (rawCoding = [], rawMcqs = []) => {
  const safeCoding = rawCoding.map(({ marks, ...rest }) => rest);
  const safeMcqs = rawMcqs.map(({ marks, ...rest }) => rest);
  const safeUnified = [
    ...safeCoding.map((q, idx) => ({
      ...q,
      question_type: 'coding',
      display_number: idx + 1,
    })),
    ...safeMcqs.map((m, idx) => ({
      ...m,
      question_type: 'mcq',
      display_number: safeCoding.length + idx + 1,
    })),
  ];
  return { safeCoding, safeMcqs, safeUnified };
};

const ensureFaculty = async (userId, role) => {
  let faculty = await FacultyModel.findByUserId(userId);
  if (!faculty) {
    if (role === 'admin') {
      faculty = await FacultyModel.create({
        user_id: userId,
        designation: 'Administrator',
        department: 'Administration',
      });
    } else if (role === 'faculty') {
      faculty = await FacultyModel.create({
        user_id: userId,
        designation: 'Faculty Member',
        department: 'Computer Science & Engineering',
      });
    }
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

// ── Difficulty → Marks Mapping (enforced server-side) ────────
// Students must never see these values during assessments.
// Backend always overrides any marks submitted by the frontend.
const DIFFICULTY_MARKS = { easy: 5, medium: 10, hard: 15 };

const getMarksForDifficulty = (difficulty) => {
  const d = (difficulty || 'medium').toLowerCase();
  return DIFFICULTY_MARKS[d] ?? 10;
};

// ── Faculty Operations ────────────────────────────────────────

const LabAssessmentService = {
  /**
   * Create a new lab assessment (draft).
   * Strictly requires room_id and validates room ownership.
   */
  createAssessment: async (userId, data, role = 'faculty') => {
    const faculty = await ensureFaculty(userId, role);
    if (!faculty) {
      const e = new Error('Faculty profile not found.'); e.statusCode = 404; throw e;
    }
    const {
      room_id,
      topic_ids,
      selected_question_ids,
      selected_questions,
      selected_mcq_ids,
      selected_mcqs,
      manual_allocations,
      ...labData
    } = data;

    if (!room_id) {
      const e = new Error('Every Lab Assessment must be created inside a valid room.');
      e.statusCode = 400; throw e;
    }

    const room = await RoomModel.findById(room_id);
    if (!room) {
      const e = new Error('Room not found.');
      e.statusCode = 404; throw e;
    }

    if (role !== 'admin' && room.faculty_id !== faculty.faculty_id) {
      const e = new Error('Access denied: You do not manage this room.');
      e.statusCode = 403; throw e;
    }

    const lab = await LabAssessmentModel.create({
      faculty_id: faculty.faculty_id,
      room_id,
      ...labData,
    });

    // Link topics if provided
    if (Array.isArray(topic_ids) && topic_ids.length > 0) {
      for (const tId of topic_ids) {
        await LaAssessmentTopicModel.create({ lab_id: lab.lab_id, topic_id: tId });
      }
    }

    // Link selected coding questions (authoritative assessment-configured marks)
    const codingToSet = selected_questions || selected_question_ids;
    if (Array.isArray(codingToSet) && codingToSet.length > 0) {
      await LaSelectedQuestionModel.bulkSet(lab.lab_id, codingToSet, null, labData.marks_per_question || 10);
    }

    // Link selected MCQs (authoritative assessment-configured marks)
    const mcqsToSet = selected_mcqs || selected_mcq_ids;
    if (Array.isArray(mcqsToSet) && mcqsToSet.length > 0) {
      await LaSelectedMcqModel.bulkSet(lab.lab_id, mcqsToSet, null, labData.marks_per_mcq || 2);
    }

    // Recalculate total_marks if Mode A so faculty marks are authoritative
    if (lab.allocation_mode === 'specific') {
      const selQ = await LaSelectedQuestionModel.findByLabId(lab.lab_id);
      const selM = await LaSelectedMcqModel.findByLabId(lab.lab_id);
      const totalQMarks = selQ.reduce((sum, q) => sum + (parseInt(q.marks, 10) || 10), 0);
      const totalMMarks = selM.reduce((sum, m) => sum + (parseInt(m.marks, 10) || 2), 0);
      const authoritativeTotal = totalQMarks + totalMMarks;
      if (authoritativeTotal > 0) {
        await query('UPDATE lab_assessment SET total_marks = $1 WHERE lab_id = $2', [authoritativeTotal, lab.lab_id]);
        lab.total_marks = authoritativeTotal;
      }
    }

    // Set manual allocations for Mode C (hybrid) or Mode B (manual)
    if (Array.isArray(manual_allocations) && manual_allocations.length > 0) {
      const client = await getClient();
      try {
        await client.query('BEGIN');
        for (const ma of manual_allocations) {
          const codingIds = ma.coding_question_ids || ma.question_ids;
          if (Array.isArray(codingIds) && codingIds.length > 0) {
            const qItems = codingIds.map((qid, idx) => ({ lab_question_id: qid, question_order: idx + 1 }));
            await LaAllocationModel.bulkCreate(client, ma.student_id, lab.lab_id, qItems, true);
          }
          if (Array.isArray(ma.mcq_ids) && ma.mcq_ids.length > 0) {
            const mItems = ma.mcq_ids.map((mid, idx) => ({ mcq_id: mid, question_order: idx + 1 }));
            await LaMcqAllocationModel.bulkCreate(client, ma.student_id, lab.lab_id, mItems, true);
          }
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    lab.topics = await LaAssessmentTopicModel.findByLabId(lab.lab_id);
    lab.selectedQuestions = await LaSelectedQuestionModel.findByLabId(lab.lab_id);
    lab.selectedMcqs = await LaSelectedMcqModel.findByLabId(lab.lab_id);

    if (data.publish_immediately) {
      try {
        const publishedLab = await LabAssessmentService.publishAssessment(userId, lab.lab_id, role);
        return publishedLab;
      } catch (pubErr) {
        // If immediate publishing fails validation, return draft lab with warning
        lab.publish_warning = pubErr.message;
      }
    }

    return lab;
  },

  /**
   * Get all assessments for the authenticated faculty (or admin).
   * Supports filtering by roomId.
   */
  getFacultyAssessments: async (userId, role = 'faculty', roomId = null) => {
    let labs = [];
    if (role === 'admin') {
      labs = await LabAssessmentModel.findAll(roomId);
    } else {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty) return [];
      if (roomId) {
        const isOwner = await RoomModel.isFacultyOwner(faculty.faculty_id, roomId);
        if (!isOwner) {
          const e = new Error('Access denied: You do not manage this room.');
          e.statusCode = 403; throw e;
        }
      }
      labs = await LabAssessmentModel.findByFacultyId(faculty.faculty_id, roomId);
    }
    // Attach details to each lab
    for (const lab of labs) {
      lab.topics = await LaAssessmentTopicModel.findByLabId(lab.lab_id);
      lab.selectedQuestions = await LaSelectedQuestionModel.findByLabId(lab.lab_id);
      lab.selectedMcqs = await LaSelectedMcqModel.findByLabId(lab.lab_id);
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
   * Get a specific assessment with topics, question pool stats, selected questions, and MCQs.
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
    lab.selectedQuestions = await LaSelectedQuestionModel.findByLabId(labId);
    lab.selectedMcqs = await LaSelectedMcqModel.findByLabId(labId);
    lab.allocations = await LaAllocationModel.findAllocationsByLab(labId);
    lab.mcqAllocations = await LaMcqAllocationModel.findAllocationsByLab(labId);
    return lab;
  },

  /**
   * Update assessment (only allowed in draft status).
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
    const {
      topic_ids,
      selected_question_ids,
      selected_questions,
      selected_mcq_ids,
      selected_mcqs,
      manual_allocations,
      ...updateData
    } = data;

    const updated = await LabAssessmentModel.update(labId, updateData);
    if (Array.isArray(topic_ids)) {
      await LaAssessmentTopicModel.deleteByLabId(labId);
      for (const tId of topic_ids) {
        await LaAssessmentTopicModel.create({ lab_id: labId, topic_id: tId });
      }
    }
    const codingToSet = selected_questions || selected_question_ids;
    if (Array.isArray(codingToSet)) {
      await LaSelectedQuestionModel.bulkSet(labId, codingToSet, null, updateData.marks_per_question || lab.marks_per_question || 10);
    }
    const mcqsToSet = selected_mcqs || selected_mcq_ids;
    if (Array.isArray(mcqsToSet)) {
      await LaSelectedMcqModel.bulkSet(labId, mcqsToSet, null, updateData.marks_per_mcq || lab.marks_per_mcq || 2);
    }

    // Recalculate total_marks if Mode A so faculty marks are authoritative
    const effectiveAllocMode = updateData.allocation_mode || lab.allocation_mode;
    if (effectiveAllocMode === 'specific') {
      const selQ = await LaSelectedQuestionModel.findByLabId(labId);
      const selM = await LaSelectedMcqModel.findByLabId(labId);
      const totalQMarks = selQ.reduce((sum, q) => sum + (parseInt(q.marks, 10) || 10), 0);
      const totalMMarks = selM.reduce((sum, m) => sum + (parseInt(m.marks, 10) || 2), 0);
      const authoritativeTotal = totalQMarks + totalMMarks;
      if (authoritativeTotal > 0) {
        await query('UPDATE lab_assessment SET total_marks = $1 WHERE lab_id = $2', [authoritativeTotal, labId]);
        if (updated) updated.total_marks = authoritativeTotal;
      }
    }

    if (Array.isArray(manual_allocations)) {
      const client = await getClient();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM la_student_allocations WHERE lab_id = $1 AND is_manual = TRUE', [labId]);
        await client.query('DELETE FROM la_student_mcq_allocations WHERE lab_id = $1 AND is_manual = TRUE', [labId]);
        for (const ma of manual_allocations) {
          const codingIds = ma.coding_question_ids || ma.question_ids;
          if (Array.isArray(codingIds) && codingIds.length > 0) {
            const qItems = codingIds.map((qid, idx) => ({
              lab_question_id: typeof qid === 'object' ? qid.lab_question_id : qid,
              question_order: idx + 1,
              marks: typeof qid === 'object' && qid.marks ? qid.marks : (updateData.marks_per_question || lab.marks_per_question || 10),
            }));
            await LaAllocationModel.bulkCreate(client, ma.student_id, labId, qItems, true);
          }
          if (Array.isArray(ma.mcq_ids) && ma.mcq_ids.length > 0) {
            const mItems = ma.mcq_ids.map((mid, idx) => ({
              mcq_id: typeof mid === 'object' ? mid.mcq_id : mid,
              question_order: idx + 1,
              marks: typeof mid === 'object' && mid.marks ? mid.marks : (updateData.marks_per_mcq || lab.marks_per_mcq || 2),
            }));
            await LaMcqAllocationModel.bulkCreate(client, ma.student_id, labId, mItems, true);
          }
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
    if (updated) {
      updated.topics = await LaAssessmentTopicModel.findByLabId(labId);
      updated.selectedQuestions = await LaSelectedQuestionModel.findByLabId(labId);
      updated.selectedMcqs = await LaSelectedMcqModel.findByLabId(labId);
    }
    return updated;
  },

  /**
   * Publish an assessment.
   * Validates: start/end time set, topic selected, and sufficient published questions/MCQs.
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

    const numCoding = lab.num_coding_questions !== undefined ? lab.num_coding_questions : lab.num_questions;
    const numMcqs = lab.num_mcq_questions || 0;

    if (numCoding + numMcqs === 0) {
      const e = new Error('Assessment must contain at least one coding question or MCQ.'); e.statusCode = 400; throw e;
    }

    // Coding question pool validation
    if (numCoding > 0) {
      if (lab.allocation_mode === 'specific') {
        const selected = await LaSelectedQuestionModel.findByLabId(labId);
        if (selected.length < numCoding) {
          const e = new Error(
            `In 'Specific Questions' mode, you must select at least ${numCoding} coding questions. Currently selected: ${selected.length}.`
          );
          e.statusCode = 400; throw e;
        }
        const unpub = selected.filter(q => !q.is_published || q.status !== 'published');
        if (unpub.length > 0) {
          const e = new Error(`Selected coding question "${unpub[0].title}" is unpublished. All selected questions must be published.`);
          e.statusCode = 400; throw e;
        }
      } else {
        const totalEligible = await LaAssessmentTopicModel.getTotalEligibleQuestions(labId);
        if (totalEligible < numCoding) {
          const e = new Error(
            `Insufficient published coding questions in the pool. Need ${numCoding} but only ${totalEligible} available.`
          );
          e.statusCode = 400; throw e;
        }
      }
    }

    // MCQ pool validation
    if (numMcqs > 0) {
      if (lab.allocation_mode === 'specific') {
        const selectedM = await LaSelectedMcqModel.findByLabId(labId);
        if (selectedM.length < numMcqs) {
          const e = new Error(
            `In 'Specific Questions' mode, you must select at least ${numMcqs} MCQs. Currently selected: ${selectedM.length}.`
          );
          e.statusCode = 400; throw e;
        }
        const unpubM = selectedM.filter(q => !q.is_published || q.status !== 'published');
        if (unpubM.length > 0) {
          const e = new Error(`Selected MCQ is unpublished. All selected MCQs must be published.`);
          e.statusCode = 400; throw e;
        }
      } else {
        const poolMcqs = await LaMcqAllocationModel.getEligiblePool(labId);
        if (poolMcqs.length < numMcqs) {
          const e = new Error(
            `Insufficient published MCQs in the pool. Need ${numMcqs} but only ${poolMcqs.length} available.`
          );
          e.statusCode = 400; throw e;
        }
      }
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
    const allViolations = await LaProctoringViolationModel.findByLabId(labId);

    // Group question submissions by student_id
    const subsByStudent = {};
    for (const sub of questionSubmissions) {
      if (!subsByStudent[sub.student_id]) subsByStudent[sub.student_id] = [];
      subsByStudent[sub.student_id].push(sub);
    }

    // Group violations by student_id
    const violationsByStudent = {};
    for (const v of allViolations) {
      if (!violationsByStudent[v.student_id]) violationsByStudent[v.student_id] = [];
      violationsByStudent[v.student_id].push(v);
    }

    // Attach MCQ submissions and violations for each attempt
    for (const att of attempts) {
      att.questionSubmissions = subsByStudent[att.student_id] || [];
      att.mcqSubmissions = await LaMcqSubmissionModel.findByAttemptId(att.attempt_id);
      att.violations = violationsByStudent[att.student_id] || [];
      att.violationsCount = (violationsByStudent[att.student_id] || []).length;
    }

    return {
      lab,
      attempts,
      allViolations,
    };
  },

  // ── Question Bank Operations ───────────────────────────────

  createQuestion: async (userId, data, role = 'faculty') => {
    const faculty = await ensureFaculty(userId, role);
    if (!faculty && role !== 'admin') {
      const e = new Error('Faculty profile not found or unauthorized.');
      e.statusCode = 403;
      throw e;
    }

    // 1. Verify Topic exists
    const topicRes = await query('SELECT topic_id, title FROM topics WHERE topic_id = $1', [data.topic_id]);
    if (topicRes.rows.length === 0) {
      const e = new Error('The selected curriculum topic does not exist.');
      e.statusCode = 400;
      throw e;
    }

    // 2. Verify Subtopic if provided
    if (data.subtopic_id) {
      const subtopicRes = await query(
        'SELECT subtopic_id, topic_id FROM subtopics WHERE subtopic_id = $1',
        [data.subtopic_id]
      );
      if (subtopicRes.rows.length === 0) {
        const e = new Error('The selected subtopic does not exist.');
        e.statusCode = 400;
        throw e;
      }
      if (subtopicRes.rows[0].topic_id !== parseInt(data.topic_id, 10)) {
        const e = new Error('The selected subtopic does not belong to the selected topic.');
        e.statusCode = 400;
        throw e;
      }
    }

    // 3. Enforce difficulty-based marks server-side (Easy: 5, Medium: 10, Hard: 15)
    const difficulty = (data.difficulty || 'medium').toLowerCase();
    const marks = getMarksForDifficulty(difficulty);

    // 4. Validate test cases
    let rawTestCases = Array.isArray(data.test_cases || data.testCases)
      ? [...(data.test_cases || data.testCases)]
      : [];

    // If no test cases array provided, but sample_output is present, use sample as initial public test case
    if (rawTestCases.length === 0 && data.sample_output && data.sample_output.trim() !== '') {
      rawTestCases.push({
        input: data.sample_input || '',
        expected_output: data.sample_output.trim(),
        is_hidden: false,
        order_index: 1,
      });
    }

    for (let i = 0; i < rawTestCases.length; i++) {
      const tc = rawTestCases[i];
      if (!tc || typeof tc.expected_output !== 'string' || tc.expected_output.trim() === '') {
        const e = new Error(`Test Case #${i + 1} is missing expected output.`);
        e.statusCode = 400;
        throw e;
      }
    }

    const requestedStatus = data.status || (data.is_published === false ? 'draft' : 'published');
    const isPublished = requestedStatus === 'published' && data.is_published !== false;

    // Incomplete questions cannot be published
    if (isPublished && rawTestCases.length === 0) {
      const e = new Error('A published question must contain at least one valid test case.');
      e.statusCode = 400;
      throw e;
    }

    // 5. Transaction: Save question and all its test cases atomically
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const question = await LabCodingQuestionModel.create(
        {
          ...data,
          difficulty,
          marks,
          created_by_faculty_id: faculty ? faculty.faculty_id : null,
          supported_languages: data.supported_languages || ['c', 'cpp', 'java', 'python'],
          status: requestedStatus,
          is_published: isPublished,
        },
        client
      );

      const savedTestCases = [];
      for (let i = 0; i < rawTestCases.length; i++) {
        const tc = rawTestCases[i];
        const savedTc = await LabTestCaseModel.create(
          {
            lab_question_id: question.lab_question_id,
            input: tc.input || '',
            expected_output: tc.expected_output,
            is_hidden: tc.is_hidden !== undefined ? !!tc.is_hidden : false,
            order_index: tc.order_index ?? (i + 1),
          },
          client
        );
        savedTestCases.push(savedTc);
      }

      await client.query('COMMIT');
      question.testCases = savedTestCases;
      question.topic_title = topicRes.rows[0].title;
      return question;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  listQuestions: async (topicId = null, filters = {}, userRole = 'faculty') => {
    const isStudent = userRole === 'student';
    const opts = {
      ...filters,
      topicId: topicId || filters.topicId,
      onlyPublished: isStudent || filters.onlyPublished,
    };
    const questions = await LabCodingQuestionModel.findAll(opts.topicId, opts);
    if (isStudent) {
      // Protect hidden test cases, individual marks and difficulty labels from students
      return questions.map(q => {
        const { marks, difficulty, ...safeQ } = q;
        safeQ.testCases = (q.testCases || []).filter(tc => !tc.is_hidden);
        return safeQ;
      });
    }
    return questions;
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

    // Validate topic if changed
    if (data.topic_id) {
      const topicRes = await query('SELECT topic_id FROM topics WHERE topic_id = $1', [data.topic_id]);
      if (topicRes.rows.length === 0) {
        const e = new Error('Selected curriculum topic does not exist.'); e.statusCode = 400; throw e;
      }
    }

    // Validate subtopic if changed
    const targetTopicId = data.topic_id || q.topic_id;
    if (data.subtopic_id) {
      const subtopicRes = await query(
        'SELECT subtopic_id, topic_id FROM subtopics WHERE subtopic_id = $1',
        [data.subtopic_id]
      );
      if (subtopicRes.rows.length === 0) {
        const e = new Error('Selected subtopic does not exist.'); e.statusCode = 400; throw e;
      }
      if (subtopicRes.rows[0].topic_id !== parseInt(targetTopicId, 10)) {
        const e = new Error('Selected subtopic does not belong to the selected topic.'); e.statusCode = 400; throw e;
      }
    }

    const updateData = { ...data };
    if (updateData.difficulty) {
      updateData.difficulty = updateData.difficulty.toLowerCase();
      updateData.marks = getMarksForDifficulty(updateData.difficulty);
    }
    if (updateData.status) {
      updateData.is_published = updateData.status === 'published';
    } else if (updateData.is_published !== undefined) {
      updateData.status = updateData.is_published ? 'published' : 'draft';
    }

    const rawTestCases = data.test_cases || data.testCases;
    if (rawTestCases !== undefined) {
      if (!Array.isArray(rawTestCases) || rawTestCases.length === 0) {
        const e = new Error('A question must retain at least one valid test case.'); e.statusCode = 400; throw e;
      }
      for (let i = 0; i < rawTestCases.length; i++) {
        const tc = rawTestCases[i];
        if (!tc || typeof tc.expected_output !== 'string' || tc.expected_output.trim() === '') {
          const e = new Error(`Test Case #${i + 1} is missing expected output.`); e.statusCode = 400; throw e;
        }
      }

      const client = await getClient();
      try {
        await client.query('BEGIN');
        const updated = await LabCodingQuestionModel.update(questionId, updateData, client);

        await LabTestCaseModel.deleteByQuestionId(questionId, client);
        const savedTestCases = [];
        for (let i = 0; i < rawTestCases.length; i++) {
          const tc = rawTestCases[i];
          const savedTc = await LabTestCaseModel.create(
            {
              lab_question_id: questionId,
              input: tc.input || '',
              expected_output: tc.expected_output,
              is_hidden: tc.is_hidden !== undefined ? !!tc.is_hidden : false,
              order_index: tc.order_index ?? (i + 1),
            },
            client
          );
          savedTestCases.push(savedTc);
        }

        await client.query('COMMIT');
        updated.testCases = savedTestCases;
        return updated;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    const updated = await LabCodingQuestionModel.update(questionId, updateData);
    updated.testCases = await LabTestCaseModel.findByQuestionId(questionId);
    return updated;
  },

  deleteQuestion: async (userId, questionId, role = 'faculty') => {
    const q = await LabCodingQuestionModel.findById(questionId);
    if (!q) { const e = new Error('Question not found.'); e.statusCode = 404; throw e; }
    if (role !== 'admin') {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty || (q.created_by_faculty_id && q.created_by_faculty_id !== faculty.faculty_id)) {
        const e = new Error('Access denied. You can only delete your own questions.'); e.statusCode = 403; throw e;
      }
    }

    // Check if referenced by existing assessments or student submissions
    const isRef = await LabCodingQuestionModel.isReferenced(questionId);
    if (isRef) {
      await LabCodingQuestionModel.archive(questionId);
      return {
        action: 'archived',
        message: 'Question is referenced by lab assessments or student submissions. It has been safely archived to protect historical academic records.',
      };
    }

    await LabTestCaseModel.deleteByQuestionId(questionId);
    await LabCodingQuestionModel.deleteById(questionId);
    return {
      action: 'deleted',
      message: 'Question and test cases deleted permanently.',
    };
  },

  setQuestionPublishStatus: async (userId, questionId, isPublished, role = 'faculty') => {
    const q = await LabCodingQuestionModel.findById(questionId);
    if (!q) { const e = new Error('Question not found.'); e.statusCode = 404; throw e; }
    if (role !== 'admin') {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty || (q.created_by_faculty_id && q.created_by_faculty_id !== faculty.faculty_id)) {
        const e = new Error('Access denied. You can only modify your own questions.'); e.statusCode = 403; throw e;
      }
    }
    if (isPublished) {
      if (!q.title || q.title.trim().length < 3) {
        const e = new Error('Incomplete question: Question title must be at least 3 characters before publishing.'); e.statusCode = 400; throw e;
      }
      if (!q.problem_statement || q.problem_statement.trim().length < 10) {
        const e = new Error('Incomplete question: Problem statement must be at least 10 characters before publishing.'); e.statusCode = 400; throw e;
      }
      const tcs = await LabTestCaseModel.findByQuestionId(questionId);
      if (!tcs || tcs.length === 0) {
        const e = new Error('Incomplete question: At least one test case is required before publishing.'); e.statusCode = 400; throw e;
      }
    }
    return LabCodingQuestionModel.setPublishStatus(questionId, isPublished);
  },

  archiveQuestion: async (userId, questionId, role = 'faculty') => {
    const q = await LabCodingQuestionModel.findById(questionId);
    if (!q) { const e = new Error('Question not found.'); e.statusCode = 404; throw e; }
    if (role !== 'admin') {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty || (q.created_by_faculty_id && q.created_by_faculty_id !== faculty.faculty_id)) {
        const e = new Error('Access denied.'); e.statusCode = 403; throw e;
      }
    }
    return LabCodingQuestionModel.archive(questionId);
  },

  unarchiveQuestion: async (userId, questionId, role = 'faculty') => {
    const q = await LabCodingQuestionModel.findById(questionId);
    if (!q) { const e = new Error('Question not found.'); e.statusCode = 404; throw e; }
    if (role !== 'admin') {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty || (q.created_by_faculty_id && q.created_by_faculty_id !== faculty.faculty_id)) {
        const e = new Error('Access denied.'); e.statusCode = 403; throw e;
      }
    }
    return LabCodingQuestionModel.unarchive(questionId);
  },

  getQuestionBankTopicsSummary: async () => {
    return LabCodingQuestionModel.getTopicQuestionStats();
  },

  // ── Student Operations ─────────────────────────────────────

  /**
   * Get available/upcoming lab assessments for a student.
   * Strictly returns assessments in rooms the student has joined.
   */
  getStudentAvailableLabs: async (userId, roomId = null) => {
    await LabAssessmentModel.syncStatuses();
    await LaAttemptModel.expireTimedOut();
    let student = await ensureStudent(userId);
    if (!student) return [];
    const labs = await LabAssessmentModel.findEligibleForStudent(student.student_id, roomId);
    // Attach topic list and student attempt to each lab
    for (const lab of labs) {
      lab.topics = await LaAssessmentTopicModel.findByLabId(lab.lab_id);
      const attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, lab.lab_id);
      lab.attempt = attempt || null;
    }
    return labs;
  },

  /**
   * Get a specific lab's info for a student.
   * Strictly enforces that student is enrolled in the lab's room.
   */
  getStudentLabInfo: async (userId, labId) => {
    await LabAssessmentModel.syncStatuses();
    let student = await ensureStudent(userId);
    const lab = await LabAssessmentModel.findById(labId);
    if (!lab) { const e = new Error('Lab assessment not found.'); e.statusCode = 404; throw e; }

    // Enforce Room Membership
    const isEnrolled = await LabAssessmentModel.isStudentEnrolledInLabRoom(student.student_id, labId);
    if (!isEnrolled) {
      const e = new Error('Access denied: You must be enrolled in the room to view this lab assessment.');
      e.statusCode = 403; throw e;
    }

    if (!['published', 'active', 'completed'].includes(lab.status)) {
      const e = new Error('This assessment is not currently available.'); e.statusCode = 403; throw e;
    }
    lab.topics = await LaAssessmentTopicModel.findByLabId(labId);
    const attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);
    lab.attempt = attempt;
    return lab;
  },

  /**
   * Start or resume a hybrid lab assessment for a student.
   * - Enforces room membership
   * - Independent Fisher-Yates random sampling for coding questions and MCQs
   * - Respects manual allocations (Modes B and C)
   * - Atomically persists allocations in PostgreSQL
   * - Never re-randomizes on refresh or resume
   */
  startOrResumeLab: async (userId, labId) => {
    await LabAssessmentModel.syncStatuses();
    await LaAttemptModel.expireTimedOut();

    const student = await ensureStudent(userId);
    const lab = await LabAssessmentModel.findById(labId);
    if (!lab) { const e = new Error('Lab assessment not found.'); e.statusCode = 404; throw e; }

    // Enforce Room Membership
    const isEnrolled = await LabAssessmentModel.isStudentEnrolledInLabRoom(student.student_id, labId);
    if (!isEnrolled) {
      const e = new Error('Access denied: You must be enrolled in the lab room to start this assessment.');
      e.statusCode = 403; throw e;
    }

    const now = new Date();
    const startTime = new Date(lab.start_time);
    const endTime = new Date(lab.end_time);

    // Check for an existing attempt first
    let attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);

    if (attempt) {
      const codingQuestions = await LaAllocationModel.findByStudentAndLab(student.student_id, labId);
      for (const q of codingQuestions) {
        q.publicTestCases = await LabTestCaseModel.findPublicByQuestionId(q.lab_question_id);
      }
      const mcqs = await LaMcqAllocationModel.findByStudentAndLab(student.student_id, labId);

      const { safeCoding, safeMcqs, safeUnified } = sanitizeForStudent(codingQuestions, mcqs);

      if (attempt.status === 'submitted') {
        return { attempt, questions: safeUnified, codingQuestions: safeCoding, mcqs: safeMcqs, isNew: false, alreadySubmitted: true };
      }
      if (attempt.status === 'timed_out' || attempt.status === 'expired') {
        return { attempt, questions: safeUnified, codingQuestions: safeCoding, mcqs: safeMcqs, isNew: false, alreadySubmitted: true, isExpired: true };
      }
      if (new Date(attempt.effective_deadline) <= now) {
        await LaAttemptModel.expireTimedOut();
        return { attempt, questions: safeUnified, codingQuestions: safeCoding, mcqs: safeMcqs, isNew: false, alreadySubmitted: true, isExpired: true };
      }
      return { attempt, questions: safeUnified, codingQuestions: safeCoding, mcqs: safeMcqs, isNew: false };
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

      const checkResult = await client.query(
        'SELECT attempt_id FROM la_attempts WHERE lab_id = $1 AND student_id = $2',
        [labId, student.student_id]
      );
      if (checkResult.rows.length > 0) {
        await client.query('ROLLBACK');
        attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);
        const codingQuestions = await LaAllocationModel.findByStudentAndLab(student.student_id, labId);
        const mcqs = await LaMcqAllocationModel.findByStudentAndLab(student.student_id, labId);
        const { safeCoding, safeMcqs, safeUnified } = sanitizeForStudent(codingQuestions, mcqs);
        return { attempt, questions: safeUnified, codingQuestions: safeCoding, mcqs: safeMcqs, isNew: false };
      }

      // ── 1. Coding Question Allocation ──
      let selectedCoding = [];
      const numCoding = lab.num_coding_questions !== undefined ? lab.num_coding_questions : (lab.num_questions || 0);

      const manualCoding = await client.query(
        `SELECT lcq.lab_question_id, COALESCE(a.marks, 10) AS marks, lcq.difficulty, lcq.title, a.question_order
         FROM la_student_allocations a
         JOIN lab_coding_questions lcq ON a.lab_question_id = lcq.lab_question_id
         WHERE a.lab_id = $1 AND a.student_id = $2 AND a.is_manual = TRUE
         ORDER BY a.question_order`,
        [labId, student.student_id]
      );

      if (manualCoding.rows.length > 0) {
        selectedCoding = manualCoding.rows;
      } else if (numCoding > 0) {
        if (lab.allocation_mode === 'specific') {
          const specificSelected = await LaSelectedQuestionModel.findByLabId(labId, client);
          if (specificSelected.length < numCoding) {
            await client.query('ROLLBACK');
            const e = new Error(
              `Incomplete configuration: Needed ${numCoding} coding questions, but only ${specificSelected.length} specific questions configured.`
            );
            e.statusCode = 400; throw e;
          }
          // PER-STUDENT RANDOM SAMPLING WITHOUT REPLACEMENT (FISHER-YATES)
          const poolCopy = [...specificSelected];
          shuffleArray(poolCopy);
          selectedCoding = poolCopy.slice(0, numCoding).map((q) => ({
            ...q,
            marks: parseInt(q.marks, 10) || lab.marks_per_question || 10,
          }));
        } else {
          const pool = await LaAllocationModel.getEligiblePool(labId, client);
          if (pool.length < numCoding) {
            await client.query('ROLLBACK');
            const e = new Error(
              `Insufficient coding questions in pool. Required: ${numCoding}, Available: ${pool.length}.`
            );
            e.statusCode = 400; throw e;
          }
          const poolCopy = [...pool];
          shuffleArray(poolCopy);
          selectedCoding = poolCopy.slice(0, numCoding).map((q) => ({
            ...q,
            marks: lab.marks_per_question || 10,
          }));
        }
      }

      // ── 2. MCQ Allocation ──
      let selectedMcqs = [];
      const numMcqs = lab.num_mcq_questions || 0;

      const manualMcqs = await client.query(
        `SELECT q.mcq_id, q.marks, q.difficulty, q.question_text, a.question_order
         FROM la_student_mcq_allocations a
         JOIN lab_mcq_questions q ON a.mcq_id = q.mcq_id
         WHERE a.lab_id = $1 AND a.student_id = $2 AND a.is_manual = TRUE
         ORDER BY a.question_order`,
        [labId, student.student_id]
      );

      if (manualMcqs.rows.length > 0) {
        selectedMcqs = manualMcqs.rows.map(m => ({
          ...m,
          marks: parseInt(m.marks, 10) || lab.marks_per_mcq || 2,
        }));
      } else if (numMcqs > 0) {
        if (lab.allocation_mode === 'specific') {
          const specificMcqs = await LaSelectedMcqModel.findByLabId(labId, client);
          if (specificMcqs.length < numMcqs) {
            await client.query('ROLLBACK');
            const e = new Error(
              `Incomplete configuration: Needed ${numMcqs} MCQs, but only ${specificMcqs.length} specific MCQs configured.`
            );
            e.statusCode = 400; throw e;
          }
          // PER-STUDENT RANDOM SAMPLING WITHOUT REPLACEMENT (FISHER-YATES)
          const poolCopy = [...specificMcqs];
          shuffleArray(poolCopy);
          selectedMcqs = poolCopy.slice(0, numMcqs).map((m) => ({
            ...m,
            marks: parseInt(m.marks, 10) || lab.marks_per_mcq || 2,
          }));
        } else {
          const pool = await LaMcqAllocationModel.getEligiblePool(labId, client);
          if (pool.length < numMcqs) {
            await client.query('ROLLBACK');
            const e = new Error(
              `Insufficient MCQs in pool. Required: ${numMcqs}, Available: ${pool.length}.`
            );
            e.statusCode = 400; throw e;
          }
          const poolCopy = [...pool];
          shuffleArray(poolCopy);
          selectedMcqs = poolCopy.slice(0, numMcqs).map((m) => ({
            ...m,
            marks: lab.marks_per_mcq || 2,
          }));
        }
      }

      // Calculate total marks based on assigned coding questions + assigned MCQs
      const codingMarksTotal = selectedCoding.reduce((sum, q) => sum + (parseInt(q.marks, 10) || lab.marks_per_question || 10), 0);
      const mcqMarksTotal = selectedMcqs.reduce((sum, m) => sum + (parseInt(m.marks, 10) || lab.marks_per_mcq || 2), 0);
      const calculatedTotalMarks = codingMarksTotal + mcqMarksTotal;

      const deadlineFromDuration = new Date(now.getTime() + lab.duration * 60 * 1000);
      const effectiveDeadline = deadlineFromDuration < endTime ? deadlineFromDuration : endTime;

      const newAttempt = await client.query(
        `INSERT INTO la_attempts
           (lab_id, student_id, effective_deadline, status, total_marks, obtained_marks)
         VALUES ($1, $2, $3, 'in_progress', $4, 0)
         RETURNING *`,
        [labId, student.student_id, effectiveDeadline.toISOString(), calculatedTotalMarks]
      );
      attempt = newAttempt.rows[0];

      // Bulk-insert coding allocations if not pre-allocated manually
      if (manualCoding.rows.length === 0 && selectedCoding.length > 0) {
        await LaAllocationModel.bulkCreate(
          client,
          student.student_id,
          labId,
          selectedCoding.map((q, i) => ({
            lab_question_id: q.lab_question_id,
            question_order: i + 1,
            marks: q.marks || lab.marks_per_question || 10,
          })),
          false,
          lab.marks_per_question || 10
        );
      }

      // Bulk-insert MCQ allocations if not pre-allocated manually
      if (manualMcqs.rows.length === 0 && selectedMcqs.length > 0) {
        await LaMcqAllocationModel.bulkCreate(
          client,
          student.student_id,
          labId,
          selectedMcqs.map((m, i) => ({
            mcq_id: m.mcq_id,
            question_order: i + 1,
            marks: m.marks || lab.marks_per_mcq || 2,
          })),
          false,
          lab.marks_per_mcq || 2
        );
      }

      await client.query('COMMIT');

      const codingQuestions = await LaAllocationModel.findByStudentAndLab(student.student_id, labId);
      for (const q of codingQuestions) {
        q.publicTestCases = await LabTestCaseModel.findPublicByQuestionId(q.lab_question_id);
      }
      const mcqs = await LaMcqAllocationModel.findByStudentAndLab(student.student_id, labId);

      const { safeCoding, safeMcqs, safeUnified } = sanitizeForStudent(codingQuestions, mcqs);
      return { attempt, questions: safeUnified, codingQuestions: safeCoding, mcqs: safeMcqs, isNew: true };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Get the student's allocated questions (no hidden test case data or correct answers).
   */
  getStudentQuestions: async (userId, labId) => {
    const student = await ensureStudent(userId);

    const isEnrolled = await LabAssessmentModel.isStudentEnrolledInLabRoom(student.student_id, labId);
    if (!isEnrolled) {
      const e = new Error('Access denied: You must be enrolled in the room to view assessment questions.');
      e.statusCode = 403; throw e;
    }

    const attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);
    if (!attempt) { const e = new Error('You have not started this assessment yet.'); e.statusCode = 400; throw e; }

    const codingQuestions = await LaAllocationModel.findByStudentAndLab(student.student_id, labId);
    for (const q of codingQuestions) {
      q.publicTestCases = await LabTestCaseModel.findPublicByQuestionId(q.lab_question_id);
    }
    const mcqs = await LaMcqAllocationModel.findByStudentAndLab(student.student_id, labId);

    const { safeCoding, safeMcqs, safeUnified } = sanitizeForStudent(codingQuestions, mcqs);
    return { attempt, questions: safeUnified, codingQuestions: safeCoding, mcqs: safeMcqs };
  },

  /**
   * Submit an answer to an MCQ during an active attempt.
   */
  submitMcqAnswer: async (userId, labId, { mcq_id, selected_option }) => {
    const student = await ensureStudent(userId);

    const isEnrolled = await LabAssessmentModel.isStudentEnrolledInLabRoom(student.student_id, labId);
    if (!isEnrolled) {
      const e = new Error('Access denied: You are not enrolled in the room for this assessment.');
      e.statusCode = 403; throw e;
    }

    const attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);
    if (!attempt || attempt.status !== 'in_progress') {
      const e = new Error('Assessment session is not currently active.');
      e.statusCode = 400; throw e;
    }
    if (new Date(attempt.effective_deadline) <= new Date()) {
      await LaAttemptModel.expireTimedOut();
      const e = new Error('Assessment deadline has expired.');
      e.statusCode = 400; throw e;
    }

    // Verify MCQ was allocated to this student
    const allocations = await LaMcqAllocationModel.findByStudentAndLab(student.student_id, labId);
    const allocatedMcq = allocations.find((a) => a.mcq_id === parseInt(mcq_id, 10));
    if (!allocatedMcq) {
      const e = new Error('This MCQ is not assigned to your assessment attempt.');
      e.statusCode = 403; throw e;
    }

    // Server-side evaluation against stored correct answer
    const mcq = await LabMcqQuestionModel.findById(parseInt(mcq_id, 10));
    if (!mcq) {
      const e = new Error('MCQ not found.');
      e.statusCode = 404; throw e;
    }

    const cleanOption = (selected_option || '').toUpperCase();
    const isCorrect = cleanOption === mcq.correct_option.toUpperCase();
    const mcqMarks = allocatedMcq.marks !== undefined && allocatedMcq.marks !== null ? allocatedMcq.marks : (mcq.marks || 2);
    const marksObtained = isCorrect ? mcqMarks : 0;

    const submission = await LaMcqSubmissionModel.upsert({
      attempt_id: attempt.attempt_id,
      mcq_id: parseInt(mcq_id, 10),
      selected_option: cleanOption,
      is_correct: isCorrect,
      marks_obtained: marksObtained,
    });

    // Update dynamic attempt total marks obtained
    const codingMarks = await LaQuestionSubmissionModel.getTotalObtainedMarks(attempt.attempt_id);
    const totalMcqMarks = await LaMcqSubmissionModel.getTotalMarksForAttempt(attempt.attempt_id);
    await LaAttemptModel.updateMarks(attempt.attempt_id, codingMarks + totalMcqMarks);

    // Shield evaluation correctness from active attempt response
    return {
      success: true,
      mcq_id: parseInt(mcq_id, 10),
      selected_option: cleanOption,
      saved_at: submission.submitted_at,
    };
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

    // Authoritative assessment-specific question marks
    const lab = await LabAssessmentModel.findById(labId);
    const questionMarks = questionInAllocation.marks !== undefined && questionInAllocation.marks !== null
      ? questionInAllocation.marks
      : (lab?.marks_per_question || question.marks || 10);

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
          await LaQuestionSubmissionModel.upsert({
            attempt_id: attempt.attempt_id,
            lab_question_id: parseInt(lab_question_id, 10),
            source_code: code,
            language,
            status: 'compilation_error',
            passed_test_cases: 0,
            total_test_cases: totalCount,
            marks_obtained: 0,
            max_marks: questionMarks,
          });
          // Recalculate total marks (coding + mcq)
          const totalObtained = await LaQuestionSubmissionModel.getTotalObtainedMarks(attempt.attempt_id);
          const totalMcqMarks = await LaMcqSubmissionModel.getTotalMarksForAttempt(attempt.attempt_id);
          await LaAttemptModel.updateMarks(attempt.attempt_id, totalObtained + totalMcqMarks);
          return {
            status: 'compilation_error',
            score: 0,
            totalMarks: questionMarks,
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
      max_marks: questionMarks,
    });

    // Recalculate total obtained marks (coding + mcq)
    const totalObtained = await LaQuestionSubmissionModel.getTotalObtainedMarks(attempt.attempt_id);
    const totalMcqMarks = await LaMcqSubmissionModel.getTotalMarksForAttempt(attempt.attempt_id);
    await LaAttemptModel.updateMarks(attempt.attempt_id, totalObtained + totalMcqMarks);

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
  /**
   * Get per-question submission statuses for a student's active attempt.
   */
  getSubmissionStatus: async (userId, labId) => {
    const student = await ensureStudent(userId);
    const attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);
    if (!attempt) return { attempt: null, submissions: [], mcqSubmissions: [] };
    const submissions = await LaQuestionSubmissionModel.findByAttemptId(attempt.attempt_id);
    const mcqSubmissions = await LaMcqSubmissionModel.findByAttemptId(attempt.attempt_id);
    return { attempt, submissions, mcqSubmissions };
  },

  /**
   * Final submission of the entire lab assessment.
   * Accurately aggregates both coding and MCQ marks.
   */
  submitAssessment: async (userId, labId) => {
    const student = await ensureStudent(userId);

    const isEnrolled = await LabAssessmentModel.isStudentEnrolledInLabRoom(student.student_id, labId);
    if (!isEnrolled) {
      const e = new Error('Access denied: You are not enrolled in the room for this assessment.');
      e.statusCode = 403; throw e;
    }

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

    const codingMarks = await LaQuestionSubmissionModel.getTotalObtainedMarks(attempt.attempt_id);
    const mcqMarks = await LaMcqSubmissionModel.getTotalMarksForAttempt(attempt.attempt_id);
    const totalObtained = codingMarks + mcqMarks;

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
    const codingQuestions = await LaAllocationModel.findByStudentAndLab(student.student_id, labId);
    const codingSubmissions = await LaQuestionSubmissionModel.findByAttemptId(attempt.attempt_id);
    const mcqs = await LaMcqAllocationModel.findByStudentAndLabDetailed(student.student_id, labId);

    // Map submissions to questions
    const subMap = {};
    for (const s of codingSubmissions) subMap[s.lab_question_id] = s;

    const codingResults = codingQuestions.map((q) => ({
      ...q,
      submission: subMap[q.lab_question_id] || {
        status: 'not_attempted',
        marks_obtained: 0,
        max_marks: q.marks || 10,
        passed_test_cases: 0,
        total_test_cases: 0,
      },
    }));

    return {
      lab,
      attempt,
      codingResults,
      questionResults: codingResults,
      mcqResults: mcqs,
      totalObtained: attempt.obtained_marks,
      totalMarks: attempt.total_marks,
      percentage: attempt.total_marks > 0
        ? parseFloat(((attempt.obtained_marks / attempt.total_marks) * 100).toFixed(2))
        : 0,
    };
  },

  logProctoringViolation: async (userId, labId, { violation_type, details }) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const e = new Error('Student profile not found.');
      e.statusCode = 404;
      throw e;
    }
    const attempt = await LaAttemptModel.findByStudentAndLab(student.student_id, labId);
    const violation = await LaProctoringViolationModel.create({
      lab_id: labId,
      student_id: student.student_id,
      attempt_id: attempt?.attempt_id || null,
      violation_type: violation_type || 'tab_switch',
      details: details || 'Tab switch or fullscreen exit detected during live assessment',
    });
    const count = await LaProctoringViolationModel.countByLabAndStudent(labId, student.student_id);
    return {
      logged: true,
      violation_count: count,
      violation,
    };
  },

  getLabViolations: async (userId, labId, role = 'faculty') => {
    const lab = await LabAssessmentModel.findById(labId);
    if (!lab) {
      const e = new Error('Lab assessment not found.');
      e.statusCode = 404;
      throw e;
    }
    if (role !== 'admin') {
      const faculty = await FacultyModel.findByUserId(userId);
      if (!faculty || lab.faculty_id !== faculty.faculty_id) {
        const e = new Error('Access denied.');
        e.statusCode = 403;
        throw e;
      }
    }
    const violations = await LaProctoringViolationModel.findByLabId(labId);
    return { violations };
  },
};

export default LabAssessmentService;
