// ──────────────────────────────────────────────
// Admin Progress & Analytics Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import {
  getAdminStudentsProgress,
  getAdminStudentDetailedProgress,
  getAdminPlatformAnalytics,
} from '../controllers/progress.controller.js';
import { isAuthenticated, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Admin can view all students and platform-wide analytics
router.get('/progress', isAuthenticated, isAdmin, getAdminStudentsProgress);
router.get('/students/:studentId/progress', isAuthenticated, isAdmin, getAdminStudentDetailedProgress);
router.get('/analytics', isAuthenticated, isAdmin, getAdminPlatformAnalytics);

export default router;
