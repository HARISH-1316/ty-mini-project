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

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/rooms', roomRoutes);
router.use('/topics', topicRoutes);

export default router;
