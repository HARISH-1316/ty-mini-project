// ──────────────────────────────────────────────
// Faculty Progress & Analytics Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import {
  getFacultyStudentsProgress,
  getFacultyStudentDetailedProgress,
  getFacultyAnalytics,
} from '../controllers/progress.controller.js';
import { isAuthenticated, isFacultyOrAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Faculty can view students in their rooms and their room analytics
router.get('/students/progress', isAuthenticated, isFacultyOrAdmin, getFacultyStudentsProgress);
router.get('/students/:studentId/progress', isAuthenticated, isFacultyOrAdmin, getFacultyStudentDetailedProgress);
router.get('/analytics', isAuthenticated, isFacultyOrAdmin, getFacultyAnalytics);

export default router;
