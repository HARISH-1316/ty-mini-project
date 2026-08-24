// ──────────────────────────────────────────────
// Progress Routes — Student Personal Progress & Tracking
// ──────────────────────────────────────────────

import { Router } from 'express';
import {
  getMyOverallProgress,
  getMyTopicDetailedProgress,
  trackSubtopicActivity,
  getMyQuizHistory,
} from '../controllers/progress.controller.js';
import { isAuthenticated, isStudent } from '../middlewares/auth.middleware.js';

const router = Router();

// Student can ONLY access their own progress
router.get('/me', isAuthenticated, isStudent, getMyOverallProgress);
router.get('/me/topics/:topicId', isAuthenticated, isStudent, getMyTopicDetailedProgress);
router.get('/me/quizzes', isAuthenticated, isStudent, getMyQuizHistory);
router.post('/track/:subtopicId', isAuthenticated, isStudent, trackSubtopicActivity);

export default router;
