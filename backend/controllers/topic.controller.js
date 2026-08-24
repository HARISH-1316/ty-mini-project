// ──────────────────────────────────────────────
// Topic Controller
// ──────────────────────────────────────────────

import TopicService from '../services/topic.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// ── Topic CRUD ────────────────────────────────
export const createTopic = asyncHandler(async (req, res) => {
  const topic = await TopicService.createTopic(req.body);
  return successResponse(res, 201, 'Topic created successfully.', { topic });
});

export const getAllTopics = asyncHandler(async (req, res) => {
  let topics;
  if (req.user?.role === 'student') {
    topics = await TopicService.getTopicsForStudent(req.user.user_id);
  } else {
    topics = await TopicService.getAllTopics();
  }
  return successResponse(res, 200, 'Topics retrieved successfully.', { topics });
});

export const getTopicById = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const topic = await TopicService.getTopicById(topicId, req.user?.role);
  return successResponse(res, 200, 'Topic details retrieved.', { topic });
});

export const updateTopic = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const topic = await TopicService.updateTopic(topicId, req.body);
  return successResponse(res, 200, 'Topic updated successfully.', { topic });
});

export const deleteTopic = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  await TopicService.deleteTopic(topicId);
  return successResponse(res, 200, 'Topic deleted successfully.');
});

// ── Subtopics ─────────────────────────────────
export const createSubtopic = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const subtopic = await TopicService.createSubtopic(topicId, req.body);
  return successResponse(res, 201, 'Subtopic created successfully.', { subtopic });
});

export const getSubtopicsByTopicId = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const subtopics = await TopicService.getTopicSubtopics(topicId, req.user?.role);
  return successResponse(res, 200, 'Subtopics retrieved successfully.', { subtopics });
});

export const getSubtopicById = asyncHandler(async (req, res) => {
  const { subtopicId } = req.params;
  const subtopic = await TopicService.getSubtopicById(subtopicId, req.user?.role);
  return successResponse(res, 200, 'Subtopic retrieved successfully.', { subtopic });
});

export const updateSubtopic = asyncHandler(async (req, res) => {
  const { subtopicId } = req.params;
  const subtopic = await TopicService.updateSubtopic(subtopicId, req.body);
  return successResponse(res, 200, 'Subtopic updated successfully.', { subtopic });
});

export const deleteSubtopic = asyncHandler(async (req, res) => {
  const { subtopicId } = req.params;
  await TopicService.deleteSubtopic(subtopicId);
  return successResponse(res, 200, 'Subtopic deleted successfully.');
});

// ── Subtopic Content ──────────────────────────
export const getSubtopicContent = asyncHandler(async (req, res) => {
  const { subtopicId } = req.params;
  const content = await TopicService.getSubtopicContent(subtopicId, req.user?.role);
  return successResponse(res, 200, 'Subtopic content retrieved.', { content });
});

export const upsertSubtopicContent = asyncHandler(async (req, res) => {
  const { subtopicId } = req.params;
  const content = await TopicService.upsertContent(subtopicId, req.body);
  return successResponse(res, 200, 'Subtopic content updated successfully.', { content });
});

export const publishSubtopicContent = asyncHandler(async (req, res) => {
  const { subtopicId } = req.params;
  const subtopic = await TopicService.publishSubtopicContent(subtopicId);
  return successResponse(res, 200, 'Subtopic content published successfully.', { subtopic });
});

export const unpublishSubtopicContent = asyncHandler(async (req, res) => {
  const { subtopicId } = req.params;
  const subtopic = await TopicService.unpublishSubtopicContent(subtopicId);
  return successResponse(res, 200, 'Subtopic content unpublished successfully.', { subtopic });
});

// ── Topic Feedback ────────────────────────────
export const createTopicFeedback = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const feedback = await TopicService.createFeedback(req.user.user_id, topicId, req.body);
  return successResponse(res, 201, 'Feedback submitted successfully.', { feedback });
});

export const getTopicFeedback = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const feedback = await TopicService.getTopicFeedback(topicId);
  return successResponse(res, 200, 'Topic feedback retrieved.', { feedback });
});

export const updateTopicFeedback = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const feedback = await TopicService.updateFeedback(req.user.user_id, topicId, req.body);
  return successResponse(res, 200, 'Feedback updated successfully.', { feedback });
});

export const deleteTopicFeedback = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  await TopicService.deleteFeedback(req.user.user_id, topicId);
  return successResponse(res, 200, 'Feedback deleted successfully.');
});

// ── Progress ──────────────────────────────────
export const updateProgress = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const progress = await TopicService.updateProgress(req.user.user_id, topicId, req.body);
  return successResponse(res, 200, 'Progress updated successfully.', { progress });
});

export const getMyProgress = asyncHandler(async (req, res) => {
  const progress = await TopicService.getStudentProgress(req.user.user_id);
  return successResponse(res, 200, 'Student progress retrieved.', { progress });
});

// ── Prerequisites ─────────────────────────────
export const getTopicPrerequisites = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const prerequisites = await TopicService.getTopicPrerequisites(topicId);
  return successResponse(res, 200, 'Prerequisites retrieved.', { prerequisites });
});
