// ──────────────────────────────────────────────
// Lab Assessment Controller — Request Handlers
// ──────────────────────────────────────────────

import LabAssessmentService from '../services/labAssessment.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// =========================================================
// FACULTY — ASSESSMENT MANAGEMENT
// =========================================================

export const createLabAssessment = asyncHandler(async (req, res) => {
  const lab = await LabAssessmentService.createAssessment(req.user.user_id, req.body, req.user.role);
  return successResponse(res, 201, 'Lab assessment created successfully.', { lab });
});

export const getFacultyLabAssessments = asyncHandler(async (req, res) => {
  const labs = await LabAssessmentService.getFacultyAssessments(req.user.user_id, req.user.role);
  return successResponse(res, 200, 'Lab assessments retrieved.', { labs });
});

export const getTopicsSummary = asyncHandler(async (req, res) => {
  const topics = await LabAssessmentService.getTopicsSummary();
  return successResponse(res, 200, 'Topics question summary retrieved.', { topics });
});

export const getLabAssessmentDetail = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const lab = await LabAssessmentService.getAssessmentDetail(req.user.user_id, parseInt(labId, 10), req.user.role);
  return successResponse(res, 200, 'Lab assessment detail retrieved.', { lab });
});

export const updateLabAssessment = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const lab = await LabAssessmentService.updateAssessment(req.user.user_id, parseInt(labId, 10), req.body, req.user.role);
  return successResponse(res, 200, 'Lab assessment updated.', { lab });
});

export const publishLabAssessment = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const lab = await LabAssessmentService.publishAssessment(req.user.user_id, parseInt(labId, 10), req.user.role);
  return successResponse(res, 200, 'Lab assessment published successfully.', { lab });
});

export const cancelLabAssessment = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const lab = await LabAssessmentService.cancelAssessment(req.user.user_id, parseInt(labId, 10), req.user.role);
  return successResponse(res, 200, 'Lab assessment cancelled.', { lab });
});

export const addTopicToAssessment = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const { topic_id } = req.body;
  const result = await LabAssessmentService.addTopic(req.user.user_id, parseInt(labId, 10), topic_id, req.user.role);
  return successResponse(res, 201, 'Topic added to assessment.', { result });
});

export const removeTopicFromAssessment = asyncHandler(async (req, res) => {
  const { labId, topicId } = req.params;
  await LabAssessmentService.removeTopic(req.user.user_id, parseInt(labId, 10), parseInt(topicId, 10), req.user.role);
  return successResponse(res, 200, 'Topic removed from assessment.');
});

export const getQuestionPool = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const lab = await LabAssessmentService.getAssessmentDetail(req.user.user_id, parseInt(labId, 10), req.user.role);
  return successResponse(res, 200, 'Question pool statistics retrieved.', {
    questionPoolStats: lab.questionPoolStats,
    totalEligibleQuestions: lab.totalEligibleQuestions,
    numQuestionsRequired: lab.num_questions,
  });
});

export const getLabResults = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const results = await LabAssessmentService.getLabResults(req.user.user_id, parseInt(labId, 10), req.user.role);
  return successResponse(res, 200, 'Lab results retrieved.', results);
});

// =========================================================
// STUDENT — ASSESSMENT PARTICIPATION
// =========================================================

export const getStudentAvailableLabs = asyncHandler(async (req, res) => {
  const labs = await LabAssessmentService.getStudentAvailableLabs(req.user.user_id);
  return successResponse(res, 200, 'Available lab assessments retrieved.', { labs });
});

export const getStudentLabInfo = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const lab = await LabAssessmentService.getStudentLabInfo(req.user.user_id, parseInt(labId, 10));
  return successResponse(res, 200, 'Lab assessment info retrieved.', { lab });
});

export const startOrResumeLab = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const result = await LabAssessmentService.startOrResumeLab(req.user.user_id, parseInt(labId, 10));
  const message = result.isNew ? 'Lab assessment started. Questions allocated.' : 'Lab assessment resumed.';
  return successResponse(res, 200, message, result);
});

export const getStudentQuestions = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const result = await LabAssessmentService.getStudentQuestions(req.user.user_id, parseInt(labId, 10));
  return successResponse(res, 200, 'Questions retrieved.', result);
});

export const studentRunCode = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const result = await LabAssessmentService.runCode(req.user.user_id, parseInt(labId, 10), req.body);
  return successResponse(res, 200, 'Code executed.', result);
});

export const studentSubmitQuestion = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const result = await LabAssessmentService.submitQuestion(req.user.user_id, parseInt(labId, 10), req.body);
  return successResponse(res, 200, 'Question submitted and evaluated.', result);
});

export const getSubmissionStatus = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const result = await LabAssessmentService.getSubmissionStatus(req.user.user_id, parseInt(labId, 10));
  return successResponse(res, 200, 'Submission statuses retrieved.', result);
});

export const submitLabAssessment = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const attempt = await LabAssessmentService.submitAssessment(req.user.user_id, parseInt(labId, 10));
  return successResponse(res, 200, 'Lab assessment submitted successfully.', { attempt });
});

export const getLabResult = asyncHandler(async (req, res) => {
  const { labId } = req.params;
  const result = await LabAssessmentService.getResult(req.user.user_id, parseInt(labId, 10));
  return successResponse(res, 200, 'Result retrieved.', result);
});
