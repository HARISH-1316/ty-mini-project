// ──────────────────────────────────────────────
// Quiz Controller — Request Handlers for Quizzes & Questions
// ──────────────────────────────────────────────

import QuizService from '../services/quiz.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// =========================================================
// 1. STUDENT QUIZ ENDPOINTS
// =========================================================

export const getPrerequisiteQuiz = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const result = await QuizService.getPrerequisiteQuiz(topicId, req.user.user_id, req.user.role);
  return successResponse(res, 200, 'Prerequisite quiz retrieved successfully.', result);
});

export const startPrerequisiteAttempt = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const result = await QuizService.startPrerequisiteAttempt(topicId, req.user.user_id);
  return successResponse(res, 201, 'Prerequisite quiz attempt started.', result);
});

export const getSubtopicQuiz = asyncHandler(async (req, res) => {
  const { subtopicId } = req.params;
  const result = await QuizService.getSubtopicQuiz(subtopicId, req.user.user_id, req.user.role);
  return successResponse(res, 200, 'Subtopic quiz retrieved successfully.', result);
});

export const startSubtopicAttempt = asyncHandler(async (req, res) => {
  const { subtopicId } = req.params;
  const result = await QuizService.startSubtopicAttempt(subtopicId, req.user.user_id);
  return successResponse(res, 201, 'Subtopic quiz attempt started.', result);
});

export const getFinalQuiz = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const result = await QuizService.getFinalQuiz(topicId, req.user.user_id, req.user.role);
  return successResponse(res, 200, 'Final quiz retrieved successfully.', result);
});

export const startFinalAttempt = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const result = await QuizService.startFinalAttempt(topicId, req.user.user_id);
  return successResponse(res, 201, 'Final quiz attempt started.', result);
});

export const submitAttempt = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const result = await QuizService.submitAttempt(attemptId, req.user.user_id, req.body.answers);
  return successResponse(res, 200, 'Quiz submitted successfully.', result);
});

export const getMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await QuizService.getMyAttempts(req.user.user_id);
  return successResponse(res, 200, 'Student quiz attempts retrieved.', { attempts });
});

// =========================================================
// 2. FACULTY/ADMIN MANAGEMENT ENDPOINTS
// =========================================================

// ── Prerequisite Quiz ──────────────────────────
export const getPrerequisiteQuizManage = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const result = await QuizService.getPrerequisiteQuiz(topicId, req.user.user_id, req.user.role);
  return successResponse(res, 200, 'Prerequisite quiz management details retrieved.', result);
});

export const addPrereqQuestion = asyncHandler(async (req, res) => {
  const { prereqQuizId } = req.params;
  const question = await QuizService.addPrereqQuestion(prereqQuizId, req.body);
  return successResponse(res, 201, 'Prerequisite question added successfully.', { question });
});

export const updatePrereqQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const question = await QuizService.updatePrereqQuestion(questionId, req.body);
  return successResponse(res, 200, 'Prerequisite question updated successfully.', { question });
});

export const deletePrereqQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  await QuizService.deletePrereqQuestion(questionId);
  return successResponse(res, 200, 'Prerequisite question deleted successfully.');
});

export const updatePrereqQuizConfig = asyncHandler(async (req, res) => {
  const { prereqQuizId } = req.params;
  const quiz = await QuizService.updatePrereqQuizConfig(prereqQuizId, req.body);
  return successResponse(res, 200, 'Prerequisite quiz configuration updated.', { quiz });
});

// ── Subtopic Quiz ──────────────────────────────
export const getSubtopicQuizManage = asyncHandler(async (req, res) => {
  const { subtopicId } = req.params;
  const result = await QuizService.getSubtopicQuiz(subtopicId, req.user.user_id, req.user.role);
  return successResponse(res, 200, 'Subtopic quiz management details retrieved.', result);
});

export const addSubtopicQuestion = asyncHandler(async (req, res) => {
  const { contentId } = req.params;
  const question = await QuizService.addSubtopicQuestion(contentId, req.body);
  return successResponse(res, 201, 'Subtopic question added successfully.', { question });
});

export const updateSubtopicQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const question = await QuizService.updateSubtopicQuestion(questionId, req.body);
  return successResponse(res, 200, 'Subtopic question updated successfully.', { question });
});

export const deleteSubtopicQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  await QuizService.deleteSubtopicQuestion(questionId);
  return successResponse(res, 200, 'Subtopic question deleted successfully.');
});

// ── Final Quiz ─────────────────────────────────
export const getFinalQuizManage = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const result = await QuizService.getFinalQuiz(topicId, req.user.user_id, req.user.role);
  return successResponse(res, 200, 'Final quiz management details retrieved.', result);
});

export const addFinalQuestion = asyncHandler(async (req, res) => {
  const { finalQuizId } = req.params;
  const question = await QuizService.addFinalQuestion(finalQuizId, req.body);
  return successResponse(res, 201, 'Final quiz question added successfully.', { question });
});

export const updateFinalQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const question = await QuizService.updateFinalQuestion(questionId, req.body);
  return successResponse(res, 200, 'Final quiz question updated successfully.', { question });
});

export const deleteFinalQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  await QuizService.deleteFinalQuestion(questionId);
  return successResponse(res, 200, 'Final quiz question deleted successfully.');
});

export const updateFinalQuizConfig = asyncHandler(async (req, res) => {
  const { finalQuizId } = req.params;
  const quiz = await QuizService.updateFinalQuizConfig(finalQuizId, req.body);
  return successResponse(res, 200, 'Final quiz configuration updated.', { quiz });
});
