// ──────────────────────────────────────────────
// Progress Controller — Student, Faculty, and Admin Request Handlers
// ──────────────────────────────────────────────

import ProgressService from '../services/progress.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// =========================================================
// 1. STUDENT PROGRESS HANDLERS
// =========================================================

export const getMyOverallProgress = asyncHandler(async (req, res) => {
  const data = await ProgressService.getStudentOverallProgress(req.user.user_id);
  return successResponse(res, 200, 'Student overall progress retrieved.', data);
});

export const getMyTopicDetailedProgress = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const data = await ProgressService.getStudentTopicDetailedProgress(req.user.user_id, topicId, req.user.role);
  return successResponse(res, 200, 'Topic detailed progress retrieved.', data);
});

export const trackSubtopicActivity = asyncHandler(async (req, res) => {
  const { subtopicId } = req.params;
  const data = await ProgressService.trackSubtopicActivity(req.user.user_id, subtopicId, req.body);
  return successResponse(res, 200, 'Subtopic activity tracked.', { progress: data });
});

export const getMyQuizHistory = asyncHandler(async (req, res) => {
  const attempts = await ProgressService.getStudentQuizHistory(req.user.user_id);
  return successResponse(res, 200, 'Student quiz history retrieved.', { attempts });
});

// =========================================================
// 2. FACULTY PROGRESS & ANALYTICS HANDLERS
// =========================================================

export const getFacultyStudentsProgress = asyncHandler(async (req, res) => {
  const result = await ProgressService.getFacultyStudentsProgress(req.user.user_id, req.query);
  return successResponse(res, 200, 'Faculty authorized students progress retrieved.', result);
});

export const getFacultyStudentDetailedProgress = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const data = await ProgressService.getFacultyStudentDetailedProgress(req.user.user_id, studentId);
  return successResponse(res, 200, 'Student detailed progress retrieved.', data);
});

export const getFacultyAnalytics = asyncHandler(async (req, res) => {
  const analytics = await ProgressService.getFacultyAnalytics(req.user.user_id);
  return successResponse(res, 200, 'Faculty analytics retrieved.', analytics);
});

// =========================================================
// 3. ADMIN PROGRESS & PLATFORM ANALYTICS HANDLERS
// =========================================================

export const getAdminStudentsProgress = asyncHandler(async (req, res) => {
  const result = await ProgressService.getAdminStudentsProgress(req.query);
  return successResponse(res, 200, 'Platform student progress retrieved.', result);
});

export const getAdminStudentDetailedProgress = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const data = await ProgressService.getAdminStudentDetailedProgress(studentId);
  return successResponse(res, 200, 'Admin student detailed progress retrieved.', data);
});

export const getAdminPlatformAnalytics = asyncHandler(async (req, res) => {
  const analytics = await ProgressService.getAdminPlatformAnalytics();
  return successResponse(res, 200, 'Platform analytics retrieved.', analytics);
});
