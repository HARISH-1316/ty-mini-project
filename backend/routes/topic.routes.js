// ──────────────────────────────────────────────
// Topic Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import {
  createTopic,
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
  createSubtopic,
  getSubtopicsByTopicId,
  getSubtopicById,
  updateSubtopic,
  deleteSubtopic,
  getSubtopicContent,
  upsertSubtopicContent,
  publishSubtopicContent,
  unpublishSubtopicContent,
  createTopicFeedback,
  getTopicFeedback,
  updateTopicFeedback,
  deleteTopicFeedback,
  updateProgress,
  getMyProgress,
  getTopicPrerequisites,
  getTopicVideos,
  addTopicVideo,
  updateTopicVideo,
  deleteTopicVideo,
} from '../controllers/topic.controller.js';
import { isAuthenticated, isStudent, isFacultyOrAdmin } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validation.middleware.js';
import {
  createTopicValidation,
  updateTopicValidation,
  topicFeedbackValidation,
  updateProgressValidation,
} from '../validations/topic.validation.js';
import RoomService from '../services/room.service.js';
import { errorResponse } from '../utils/response.js';

/**
 * Middleware: Enforce room-based topic access for students.
 * Faculty and admin users bypass this check entirely.
 * Students must be enrolled in at least one room that has the topic assigned.
 */
const studentTopicAccessGuard = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'student') {
      const { topicId } = req.params;
      const hasAccess = await RoomService.checkStudentTopicAccess(req.user.user_id, topicId);
      if (!hasAccess) {
        return errorResponse(
          res,
          403,
          'Access denied. This topic is not available in any of your joined rooms.'
        );
      }
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

const router = Router();

// ── Student Progress Routes (must come before :topicId wildcard) ──
router.get('/progress/my', isAuthenticated, isStudent, getMyProgress);

// ── Subtopics Detail Routes (legacy aliases before :topicId wildcard) ──
router.get('/subtopics/:subtopicId', isAuthenticated, getSubtopicById);
router.put('/subtopics/:subtopicId', isAuthenticated, isFacultyOrAdmin, updateSubtopic);
router.delete('/subtopics/:subtopicId', isAuthenticated, isFacultyOrAdmin, deleteSubtopic);
router.get('/subtopics/:subtopicId/content', isAuthenticated, getSubtopicContent);
router.put('/subtopics/:subtopicId/content', isAuthenticated, isFacultyOrAdmin, upsertSubtopicContent);
router.patch('/subtopics/:subtopicId/content/publish', isAuthenticated, isFacultyOrAdmin, publishSubtopicContent);
router.patch('/subtopics/:subtopicId/content/unpublish', isAuthenticated, isFacultyOrAdmin, unpublishSubtopicContent);

// ── Topic Collection Routes ────────────────────
router.get('/', isAuthenticated, getAllTopics);
router.post('/', isAuthenticated, isFacultyOrAdmin, validate(createTopicValidation), createTopic);

// ── Topic Specific Routes ─────────────────────
router.get('/:topicId', isAuthenticated, studentTopicAccessGuard, getTopicById);
router.put('/:topicId', isAuthenticated, isFacultyOrAdmin, validate(updateTopicValidation), updateTopic);
router.delete('/:topicId', isAuthenticated, isFacultyOrAdmin, deleteTopic);

// ── Topic Subtopics Routes ────────────────────
router.get('/:topicId/subtopics', isAuthenticated, studentTopicAccessGuard, getSubtopicsByTopicId);
router.post('/:topicId/subtopics', isAuthenticated, isFacultyOrAdmin, createSubtopic);

// ── Topic Feedback Routes (Student only) ───────
router.post('/:topicId/feedback', isAuthenticated, isStudent, studentTopicAccessGuard, validate(topicFeedbackValidation), createTopicFeedback);
router.get('/:topicId/feedback', isAuthenticated, studentTopicAccessGuard, getTopicFeedback);
router.put('/:topicId/feedback', isAuthenticated, isStudent, studentTopicAccessGuard, validate(topicFeedbackValidation), updateTopicFeedback);
router.delete('/:topicId/feedback', isAuthenticated, isStudent, studentTopicAccessGuard, deleteTopicFeedback);

// ── Prerequisite Routes ──────────────────────
router.get('/:topicId/prerequisites', isAuthenticated, studentTopicAccessGuard, getTopicPrerequisites);

// ── Progress Route ────────────────────────────
router.post('/:topicId/progress', isAuthenticated, isStudent, studentTopicAccessGuard, validate(updateProgressValidation), updateProgress);

// ── Topic Video References Routes ─────────────
router.get('/:topicId/videos', isAuthenticated, studentTopicAccessGuard, getTopicVideos);
router.post('/:topicId/videos', isAuthenticated, isFacultyOrAdmin, addTopicVideo);
router.put('/:topicId/videos/:videoId', isAuthenticated, isFacultyOrAdmin, updateTopicVideo);
router.delete('/:topicId/videos/:videoId', isAuthenticated, isFacultyOrAdmin, deleteTopicVideo);

export default router;
