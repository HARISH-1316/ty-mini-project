// ──────────────────────────────────────────────
// Subtopic & Content Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import {
  getSubtopicById,
  updateSubtopic,
  deleteSubtopic,
  getSubtopicContent,
  upsertSubtopicContent,
  publishSubtopicContent,
  unpublishSubtopicContent,
} from '../controllers/topic.controller.js';
import { isAuthenticated, isFacultyOrAdmin } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validation.middleware.js';
import { upsertSubtopicContentValidation } from '../validations/subtopic.validation.js';
import SubtopicModel from '../models/subtopic.model.js';
import RoomService from '../services/room.service.js';
import { errorResponse } from '../utils/response.js';

/**
 * Middleware: Enforce room-based topic access for students when accessing subtopics.
 */
const studentSubtopicAccessGuard = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'student') {
      const { subtopicId } = req.params;
      const subtopic = await SubtopicModel.findById(subtopicId);
      if (!subtopic) {
        return errorResponse(res, 404, 'Subtopic not found.');
      }
      const hasAccess = await RoomService.checkStudentTopicAccess(req.user.user_id, subtopic.topic_id);
      if (!hasAccess) {
        return errorResponse(
          res,
          403,
          'Access denied. This subtopic is not available in any of your joined rooms.'
        );
      }
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

const router = Router();

// ── Subtopic Detail & Content Routes ─────────────
router.get('/:subtopicId', isAuthenticated, studentSubtopicAccessGuard, getSubtopicById);
router.put('/:subtopicId', isAuthenticated, isFacultyOrAdmin, updateSubtopic);
router.delete('/:subtopicId', isAuthenticated, isFacultyOrAdmin, deleteSubtopic);

router.get('/:subtopicId/content', isAuthenticated, studentSubtopicAccessGuard, getSubtopicContent);
router.post('/:subtopicId/content', isAuthenticated, isFacultyOrAdmin, validate(upsertSubtopicContentValidation), upsertSubtopicContent);
router.put('/:subtopicId/content', isAuthenticated, isFacultyOrAdmin, validate(upsertSubtopicContentValidation), upsertSubtopicContent);

router.patch('/:subtopicId/content/publish', isAuthenticated, isFacultyOrAdmin, publishSubtopicContent);
router.patch('/:subtopicId/content/unpublish', isAuthenticated, isFacultyOrAdmin, unpublishSubtopicContent);

export default router;
