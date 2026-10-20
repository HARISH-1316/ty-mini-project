// ──────────────────────────────────────────────
// Lab MCQ Routes — /api/lab-mcqs
// ──────────────────────────────────────────────

import { Router } from 'express';
import { isAuthenticated, isFacultyOrAdmin } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validation.middleware.js';
import {
  listLabMcqs,
  getLabMcq,
  createLabMcq,
  updateLabMcq,
  deleteLabMcq,
  publishLabMcq,
  unpublishLabMcq,
  archiveLabMcq,
  unarchiveLabMcq,
  getLabMcqTopicsSummary,
} from '../controllers/labMcq.controller.js';
import {
  createLabMcqValidation,
  updateLabMcqValidation,
} from '../validations/labAssessment.validation.js';

const router = Router();

router.get('/topics-summary', isAuthenticated, isFacultyOrAdmin, getLabMcqTopicsSummary);
router.get('/', isAuthenticated, listLabMcqs);
router.get('/:mcqId', isAuthenticated, getLabMcq);
router.post('/', isAuthenticated, isFacultyOrAdmin, validate(createLabMcqValidation), createLabMcq);
router.put('/:mcqId', isAuthenticated, isFacultyOrAdmin, validate(updateLabMcqValidation), updateLabMcq);
router.delete('/:mcqId', isAuthenticated, isFacultyOrAdmin, deleteLabMcq);

// Publishing & Archiving
router.patch('/:mcqId/publish', isAuthenticated, isFacultyOrAdmin, publishLabMcq);
router.put('/:mcqId/publish', isAuthenticated, isFacultyOrAdmin, publishLabMcq);
router.patch('/:mcqId/unpublish', isAuthenticated, isFacultyOrAdmin, unpublishLabMcq);
router.put('/:mcqId/unpublish', isAuthenticated, isFacultyOrAdmin, unpublishLabMcq);
router.patch('/:mcqId/archive', isAuthenticated, isFacultyOrAdmin, archiveLabMcq);
router.put('/:mcqId/archive', isAuthenticated, isFacultyOrAdmin, archiveLabMcq);
router.patch('/:mcqId/unarchive', isAuthenticated, isFacultyOrAdmin, unarchiveLabMcq);
router.put('/:mcqId/unarchive', isAuthenticated, isFacultyOrAdmin, unarchiveLabMcq);

export default router;
