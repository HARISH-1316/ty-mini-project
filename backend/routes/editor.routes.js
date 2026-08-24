// ──────────────────────────────────────────────
// Editor & Execution Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import {
  executeCode,
  submitCode,
  getQuestions,
  addTcaQuestion,
  updateTcaQuestion,
  deleteTcaQuestion,
  addTcaTestCase,
  updateTcaTestCase,
  deleteTcaTestCase,
  addSubtopicCodingQuestion,
  updateSubtopicCodingQuestion,
  deleteSubtopicCodingQuestion,
  addSubtopicTestCase,
  updateSubtopicTestCase,
  deleteSubtopicTestCase,
} from '../controllers/execution.controller.js';
import { isAuthenticated, isStudent, isFacultyOrAdmin } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validation.middleware.js';
import {
  executeCodeValidation,
  submitCodeValidation,
  questionManageValidation,
  testCaseManageValidation,
} from '../validations/editor.validation.js';

const router = Router();

// =========================================================
// 1. STUDENT EXECUTION & SUBMISSION (Also accessible to faculty for testing)
// =========================================================

// Run Code (Dry run with custom input)
router.post('/execute', isAuthenticated, validate(executeCodeValidation), executeCode);
router.post('/:roomId/execute', isAuthenticated, validate(executeCodeValidation), executeCode);

// Submit Solution (Graded against test cases)
router.post('/submit', isAuthenticated, isStudent, validate(submitCodeValidation), submitCode);
router.post('/:roomId/submit', isAuthenticated, isStudent, validate(submitCodeValidation), submitCode);

// Fetch Assessment Questions & Public Test Cases
router.get('/questions/:assessmentType/:refId', isAuthenticated, getQuestions);
router.get('/:roomId/questions/:assessmentType/:refId', isAuthenticated, getQuestions);

// =========================================================
// 2. FACULTY & ADMIN QUESTION MANAGEMENT
// =========================================================

// ── TCA Questions & Test Cases ───────────────────
router.post('/tca/:tcaId/questions', isAuthenticated, isFacultyOrAdmin, validate(questionManageValidation), addTcaQuestion);
router.put('/tca/questions/:questionId', isAuthenticated, isFacultyOrAdmin, validate(questionManageValidation), updateTcaQuestion);
router.delete('/tca/questions/:questionId', isAuthenticated, isFacultyOrAdmin, deleteTcaQuestion);

router.post('/tca/questions/:questionId/testcases', isAuthenticated, isFacultyOrAdmin, validate(testCaseManageValidation), addTcaTestCase);
router.put('/tca/testcases/:testCaseId', isAuthenticated, isFacultyOrAdmin, validate(testCaseManageValidation), updateTcaTestCase);
router.delete('/tca/testcases/:testCaseId', isAuthenticated, isFacultyOrAdmin, deleteTcaTestCase);

// ── Subtopic Questions & Test Cases ──────────────
router.post('/subtopic/:contentId/questions', isAuthenticated, isFacultyOrAdmin, validate(questionManageValidation), addSubtopicCodingQuestion);
router.put('/subtopic/questions/:questionId', isAuthenticated, isFacultyOrAdmin, validate(questionManageValidation), updateSubtopicCodingQuestion);
router.delete('/subtopic/questions/:questionId', isAuthenticated, isFacultyOrAdmin, deleteSubtopicCodingQuestion);

router.post('/subtopic/questions/:questionId/testcases', isAuthenticated, isFacultyOrAdmin, validate(testCaseManageValidation), addSubtopicTestCase);
router.put('/subtopic/testcases/:testCaseId', isAuthenticated, isFacultyOrAdmin, validate(testCaseManageValidation), updateSubtopicTestCase);
router.delete('/subtopic/testcases/:testCaseId', isAuthenticated, isFacultyOrAdmin, deleteSubtopicTestCase);

export default router;
