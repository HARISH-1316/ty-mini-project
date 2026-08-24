// ──────────────────────────────────────────────
// Execution Controller — Request Handlers for Coding IDE & Assessments
// ──────────────────────────────────────────────

import ExecutionService from '../services/execution.service.js';
import RoomService from '../services/room.service.js';
import TcaQuestionModel from '../models/tcaQuestion.model.js';
import TcaTestCaseModel from '../models/tcaTestCase.model.js';
import SubtopicCodingAssessmentModel from '../models/subtopicCodingAssessment.model.js';
import SccaTestCaseModel from '../models/sccaTestCase.model.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// =========================================================
// 1. STUDENT CODE EXECUTION & SUBMISSION
// =========================================================

/**
 * Execute code with optional stdin input (Run Code button)
 */
export const executeCode = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { language, code, input } = req.body;

  // If roomId is provided, verify room access
  if (roomId && roomId !== 'global') {
    const isEnrolled = await RoomService.isStudentEnrolled(req.user.user_id, roomId);
    if (!isEnrolled && req.user.role === 'student') {
      const error = new Error('Access denied. You are not enrolled in this room.');
      error.statusCode = 403;
      throw error;
    }
  }

  const result = await ExecutionService.runCode({
    language,
    code,
    input,
  });

  return successResponse(res, 200, 'Code executed successfully.', result);
});

/**
 * Submit code against all test cases for grading
 */
export const submitCode = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { language, code, questionId, assessmentType } = req.body;

  if (roomId && roomId !== 'global') {
    const isEnrolled = await RoomService.isStudentEnrolled(req.user.user_id, roomId);
    if (!isEnrolled && req.user.role === 'student') {
      const error = new Error('Access denied. You are not enrolled in this room.');
      error.statusCode = 403;
      throw error;
    }
  }

  const result = await ExecutionService.submitCode({
    language,
    code,
    questionId,
    assessmentType: assessmentType || 'topic',
    userId: req.user.user_id,
  });

  return successResponse(res, 200, 'Solution evaluated successfully.', result);
});

/**
 * Get Coding Questions for a topic / subtopic assessment
 */
export const getQuestions = asyncHandler(async (req, res) => {
  const { assessmentType, refId } = req.params;
  const isStudent = req.user.role === 'student';

  const questions = await ExecutionService.getQuestions({
    assessmentType,
    refId: parseInt(refId, 10),
    isStudent,
  });

  return successResponse(res, 200, 'Coding questions retrieved successfully.', { questions });
});

// =========================================================
// 2. FACULTY & ADMIN CODING QUESTIONS MANAGEMENT
// =========================================================

// ── TCA Questions (Topic Coding Assessment) ──────
export const addTcaQuestion = asyncHandler(async (req, res) => {
  const { tcaId } = req.params;
  const question = await TcaQuestionModel.create({
    tca_id: parseInt(tcaId, 10),
    ...req.body,
  });
  return successResponse(res, 201, 'Topic coding question added successfully.', { question });
});

export const updateTcaQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const question = await TcaQuestionModel.update(parseInt(questionId, 10), req.body);
  return successResponse(res, 200, 'Topic coding question updated successfully.', { question });
});

export const deleteTcaQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  await TcaQuestionModel.deleteById(parseInt(questionId, 10));
  return successResponse(res, 200, 'Topic coding question deleted successfully.');
});

export const addTcaTestCase = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const testCase = await TcaTestCaseModel.create({
    tca_question_id: parseInt(questionId, 10),
    ...req.body,
  });
  return successResponse(res, 201, 'Test case added successfully.', { testCase });
});

export const updateTcaTestCase = asyncHandler(async (req, res) => {
  const { testCaseId } = req.params;
  const testCase = await TcaTestCaseModel.update(parseInt(testCaseId, 10), req.body);
  return successResponse(res, 200, 'Test case updated successfully.', { testCase });
});

export const deleteTcaTestCase = asyncHandler(async (req, res) => {
  const { testCaseId } = req.params;
  await TcaTestCaseModel.deleteById(parseInt(testCaseId, 10));
  return successResponse(res, 200, 'Test case deleted successfully.');
});

// ── Subtopic Coding Questions ───────────────────
export const addSubtopicCodingQuestion = asyncHandler(async (req, res) => {
  const { contentId } = req.params;
  const question = await SubtopicCodingAssessmentModel.create({
    content_id: parseInt(contentId, 10),
    ...req.body,
  });
  return successResponse(res, 201, 'Subtopic coding question added successfully.', { question });
});

export const updateSubtopicCodingQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const question = await SubtopicCodingAssessmentModel.update(parseInt(questionId, 10), req.body);
  return successResponse(res, 200, 'Subtopic coding question updated successfully.', { question });
});

export const deleteSubtopicCodingQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  await SubtopicCodingAssessmentModel.deleteById(parseInt(questionId, 10));
  return successResponse(res, 200, 'Subtopic coding question deleted successfully.');
});

export const addSubtopicTestCase = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const testCase = await SccaTestCaseModel.create({
    scca_id: parseInt(questionId, 10),
    ...req.body,
  });
  return successResponse(res, 201, 'Subtopic test case added successfully.', { testCase });
});

export const updateSubtopicTestCase = asyncHandler(async (req, res) => {
  const { testCaseId } = req.params;
  const testCase = await SccaTestCaseModel.update(parseInt(testCaseId, 10), req.body);
  return successResponse(res, 200, 'Subtopic test case updated successfully.', { testCase });
});

export const deleteSubtopicTestCase = asyncHandler(async (req, res) => {
  const { testCaseId } = req.params;
  await SccaTestCaseModel.deleteById(parseInt(testCaseId, 10));
  return successResponse(res, 200, 'Subtopic test case deleted successfully.');
});
