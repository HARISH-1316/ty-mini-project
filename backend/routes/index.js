// ──────────────────────────────────────────────
// Central Route Aggregator
// ──────────────────────────────────────────────
// Mounts all route modules under their base paths.
// ──────────────────────────────────────────────

import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import roomRoutes from './room.routes.js';
import topicRoutes from './topic.routes.js';
import subtopicRoutes from './subtopic.routes.js';
import quizRoutes from './quiz.routes.js';
import progressRoutes from './progress.routes.js';
import facultyProgressRoutes from './facultyProgress.routes.js';
import adminProgressRoutes from './adminProgress.routes.js';
import editorRoutes from './editor.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/rooms', roomRoutes);
router.use('/topics', topicRoutes);
router.use('/subtopics', subtopicRoutes);
router.use('/quizzes', quizRoutes);
router.use('/progress', progressRoutes);
router.use('/faculty', facultyProgressRoutes);
router.use('/admin', adminProgressRoutes);
router.use('/editor', editorRoutes);

export default router;
