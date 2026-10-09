// ──────────────────────────────────────────────
// Lab Question (Bank) Controller — Request Handlers
// ──────────────────────────────────────────────

import LabAssessmentService from '../services/labAssessment.service.js';
import LabTestCaseModel from '../models/labTestCase.model.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// ── Question Bank CRUD ─────────────────────────

export const createLabQuestion = asyncHandler(async (req, res) => {
  const question = await LabAssessmentService.createQuestion(req.user.user_id, req.body, req.user.role);
  return successResponse(res, 201, 'Lab question created.', { question });
});

export const listLabQuestions = asyncHandler(async (req, res) => {
  const { topicId } = req.query;
  const questions = await LabAssessmentService.listQuestions(topicId ? parseInt(topicId, 10) : null);
  return successResponse(res, 200, 'Lab questions retrieved.', { questions });
});

export const getLabQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const question = await LabAssessmentService.getQuestion(parseInt(questionId, 10));
  return successResponse(res, 200, 'Lab question retrieved.', { question });
});

export const updateLabQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const question = await LabAssessmentService.updateQuestion(
    req.user.user_id,
    parseInt(questionId, 10),
    req.body,
    req.user.role
  );
  return successResponse(res, 200, 'Lab question updated.', { question });
});

export const deleteLabQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  await LabAssessmentService.deleteQuestion(req.user.user_id, parseInt(questionId, 10), req.user.role);
  return successResponse(res, 200, 'Lab question deleted.');
});

// ── Test Case Management ────────────────────────

export const addLabTestCase = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const testCase = await LabTestCaseModel.create({
    lab_question_id: parseInt(questionId, 10),
    ...req.body,
  });
  return successResponse(res, 201, 'Test case added.', { testCase });
});

export const updateLabTestCase = asyncHandler(async (req, res) => {
  const { testCaseId } = req.params;
  const testCase = await LabTestCaseModel.update(parseInt(testCaseId, 10), req.body);
  return successResponse(res, 200, 'Test case updated.', { testCase });
});

export const deleteLabTestCase = asyncHandler(async (req, res) => {
  const { testCaseId } = req.params;
  await LabTestCaseModel.deleteById(parseInt(testCaseId, 10));
  return successResponse(res, 200, 'Test case deleted.');
});
