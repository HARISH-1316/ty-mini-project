// ──────────────────────────────────────────────
// Lab MCQ Controller — Question Bank Request Handlers
// ──────────────────────────────────────────────

import LabMcqQuestionModel from '../models/labMcqQuestion.model.js';
import FacultyModel from '../models/faculty.model.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

export const listLabMcqs = asyncHandler(async (req, res) => {
  const { topicId, topic_id, difficulty, status, search, limit, offset } = req.query;
  const mcqs = await LabMcqQuestionModel.findFiltered({
    topic_id: topicId || topic_id ? parseInt(topicId || topic_id, 10) : undefined,
    difficulty,
    status,
    search,
    limit: limit ? parseInt(limit, 10) : 200,
    offset: offset ? parseInt(offset, 10) : 0,
  });
  return successResponse(res, 200, 'MCQs retrieved successfully.', { mcqs });
});

export const getLabMcq = asyncHandler(async (req, res) => {
  const { mcqId } = req.params;
  const mcq = await LabMcqQuestionModel.findById(parseInt(mcqId, 10));
  if (!mcq) {
    const e = new Error('MCQ not found.');
    e.statusCode = 404;
    throw e;
  }
  return successResponse(res, 200, 'MCQ details retrieved.', { mcq });
});

export const createLabMcq = asyncHandler(async (req, res) => {
  let facultyId = null;
  if (req.user.role === 'faculty') {
    const faculty = await FacultyModel.findByUserId(req.user.user_id);
    facultyId = faculty?.faculty_id || null;
  }

  const mcq = await LabMcqQuestionModel.create({
    ...req.body,
    created_by_faculty_id: facultyId,
  });
  return successResponse(res, 201, 'MCQ created successfully.', { mcq });
});

export const updateLabMcq = asyncHandler(async (req, res) => {
  const { mcqId } = req.params;
  const updated = await LabMcqQuestionModel.update(parseInt(mcqId, 10), req.body);
  if (!updated) {
    const e = new Error('MCQ not found or update failed.');
    e.statusCode = 404;
    throw e;
  }
  return successResponse(res, 200, 'MCQ updated successfully.', { mcq: updated });
});

export const deleteLabMcq = asyncHandler(async (req, res) => {
  const { mcqId } = req.params;
  const deleted = await LabMcqQuestionModel.deleteById(parseInt(mcqId, 10));
  if (!deleted) {
    const e = new Error('MCQ not found.');
    e.statusCode = 404;
    throw e;
  }
  return successResponse(res, 200, 'MCQ deleted successfully.');
});

export const publishLabMcq = asyncHandler(async (req, res) => {
  const { mcqId } = req.params;
  const mcq = await LabMcqQuestionModel.updateStatus(parseInt(mcqId, 10), 'published', true);
  if (!mcq) {
    const e = new Error('MCQ not found.');
    e.statusCode = 404;
    throw e;
  }
  return successResponse(res, 200, 'MCQ published successfully.', { mcq });
});

export const unpublishLabMcq = asyncHandler(async (req, res) => {
  const { mcqId } = req.params;
  const mcq = await LabMcqQuestionModel.updateStatus(parseInt(mcqId, 10), 'draft', false);
  if (!mcq) {
    const e = new Error('MCQ not found.');
    e.statusCode = 404;
    throw e;
  }
  return successResponse(res, 200, 'MCQ unpublished.', { mcq });
});

export const archiveLabMcq = asyncHandler(async (req, res) => {
  const { mcqId } = req.params;
  const mcq = await LabMcqQuestionModel.updateStatus(parseInt(mcqId, 10), 'archived', false);
  if (!mcq) {
    const e = new Error('MCQ not found.');
    e.statusCode = 404;
    throw e;
  }
  return successResponse(res, 200, 'MCQ archived.', { mcq });
});

export const unarchiveLabMcq = asyncHandler(async (req, res) => {
  const { mcqId } = req.params;
  const mcq = await LabMcqQuestionModel.updateStatus(parseInt(mcqId, 10), 'published', true);
  if (!mcq) {
    const e = new Error('MCQ not found.');
    e.statusCode = 404;
    throw e;
  }
  return successResponse(res, 200, 'MCQ unarchived and published.', { mcq });
});

export const getLabMcqTopicsSummary = asyncHandler(async (req, res) => {
  const topics = await LabMcqQuestionModel.getTopicsSummary();
  return successResponse(res, 200, 'MCQ topic summary retrieved.', { topics });
});
