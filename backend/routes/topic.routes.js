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
  getSubtopicById,
  updateSubtopic,
  deleteSubtopic,
  upsertSubtopicContent,
  createTopicFeedback,
  getTopicFeedback,
  updateTopicFeedback,
  deleteTopicFeedback,
  updateProgress,
  getMyProgress,
} from '../controllers/topic.controller.js';
import { isAuthenticated, isStudent, isFacultyOrAdmin } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validation.middleware.js';
import {
  createTopicValidation,
  updateTopicValidation,
  topicFeedbackValidation,
  updateProgressValidation,
} from '../validations/topic.validation.js';

const router = Router();

// ── Student Progress Routes (must come before :topicId wildcard) ──
router.get('/progress/my', isAuthenticated, isStudent, getMyProgress);

// ── Subtopics Detail Routes (must come before :topicId wildcard) ──
router.get('/subtopics/:subtopicId', isAuthenticated, getSubtopicById);
router.put('/subtopics/:subtopicId', isAuthenticated, isFacultyOrAdmin, updateSubtopic);
router.delete('/subtopics/:subtopicId', isAuthenticated, isFacultyOrAdmin, deleteSubtopic);
router.put('/subtopics/:subtopicId/content', isAuthenticated, isFacultyOrAdmin, upsertSubtopicContent);

// ── Topic Collection Routes ────────────────────
router.get('/', isAuthenticated, getAllTopics);
router.post('/', isAuthenticated, isFacultyOrAdmin, validate(createTopicValidation), createTopic);

// ── Topic Specific Routes ─────────────────────
router.get('/:topicId', isAuthenticated, getTopicById);
router.put('/:topicId', isAuthenticated, isFacultyOrAdmin, validate(updateTopicValidation), updateTopic);
router.delete('/:topicId', isAuthenticated, isFacultyOrAdmin, deleteTopic);

// ── Topic Subtopics Routes ────────────────────
router.post('/:topicId/subtopics', isAuthenticated, isFacultyOrAdmin, createSubtopic);

// ── Topic Feedback Routes (Student only) ───────
router.post('/:topicId/feedback', isAuthenticated, isStudent, validate(topicFeedbackValidation), createTopicFeedback);
router.get('/:topicId/feedback', isAuthenticated, getTopicFeedback);
router.put('/:topicId/feedback', isAuthenticated, isStudent, validate(topicFeedbackValidation), updateTopicFeedback);
router.delete('/:topicId/feedback', isAuthenticated, isStudent, deleteTopicFeedback);

// ── Progress Route ────────────────────────────
router.post('/:topicId/progress', isAuthenticated, isStudent, validate(updateProgressValidation), updateProgress);

export default router;
