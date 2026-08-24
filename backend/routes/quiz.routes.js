// ──────────────────────────────────────────────
// Quiz Routes — Student Quiz Taking & Faculty Management
// ──────────────────────────────────────────────

import { Router } from 'express';
import {
  getPrerequisiteQuiz,
  startPrerequisiteAttempt,
  getSubtopicQuiz,
  startSubtopicAttempt,
  getFinalQuiz,
  startFinalAttempt,
  submitAttempt,
  getMyAttempts,
  getPrerequisiteQuizManage,
  addPrereqQuestion,
  updatePrereqQuestion,
  deletePrereqQuestion,
  updatePrereqQuizConfig,
  getSubtopicQuizManage,
  addSubtopicQuestion,
  updateSubtopicQuestion,
  deleteSubtopicQuestion,
  getFinalQuizManage,
  addFinalQuestion,
  updateFinalQuestion,
  deleteFinalQuestion,
  updateFinalQuizConfig,
} from '../controllers/quiz.controller.js';
import { isAuthenticated, isStudent, isFacultyOrAdmin } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validation.middleware.js';
import {
  questionValidation,
  updateQuestionValidation,
  submitQuizValidation,
  updatePrereqQuizConfigValidation,
  updateFinalQuizConfigValidation,
} from '../validations/quiz.validation.js';

const router = Router();

// =========================================================
// 1. STUDENT QUIZ TAKING ROUTES
// =========================================================

// Student Attempts History
router.get('/my-attempts', isAuthenticated, isStudent, getMyAttempts);

// Prerequisite Quiz
router.get('/prerequisite/:topicId', isAuthenticated, getPrerequisiteQuiz);
router.post('/prerequisite/:topicId/attempt', isAuthenticated, isStudent, startPrerequisiteAttempt);

// Subtopic Quiz
router.get('/subtopic/:subtopicId', isAuthenticated, getSubtopicQuiz);
router.post('/subtopic/:subtopicId/attempt', isAuthenticated, isStudent, startSubtopicAttempt);

// Final / Topic Quiz
router.get('/final/:topicId', isAuthenticated, getFinalQuiz);
router.post('/final/:topicId/attempt', isAuthenticated, isStudent, startFinalAttempt);

// Submit Any Quiz Attempt
router.post('/attempts/:attemptId/submit', isAuthenticated, isStudent, validate(submitQuizValidation), submitAttempt);

// =========================================================
// 2. FACULTY & ADMIN QUIZ MANAGEMENT ROUTES
// =========================================================

// ── Prerequisite Quiz Management ─────────────────
router.get('/prerequisite/:topicId/manage', isAuthenticated, isFacultyOrAdmin, getPrerequisiteQuizManage);
router.post('/prerequisite/:prereqQuizId/questions', isAuthenticated, isFacultyOrAdmin, validate(questionValidation), addPrereqQuestion);
router.put('/questions/prerequisite/:questionId', isAuthenticated, isFacultyOrAdmin, validate(updateQuestionValidation), updatePrereqQuestion);
router.delete('/questions/prerequisite/:questionId', isAuthenticated, isFacultyOrAdmin, deletePrereqQuestion);
router.put('/prerequisite/:prereqQuizId/config', isAuthenticated, isFacultyOrAdmin, validate(updatePrereqQuizConfigValidation), updatePrereqQuizConfig);

// ── Subtopic Quiz Management ─────────────────────
router.get('/subtopic/:subtopicId/manage', isAuthenticated, isFacultyOrAdmin, getSubtopicQuizManage);
router.post('/subtopic/:contentId/questions', isAuthenticated, isFacultyOrAdmin, validate(questionValidation), addSubtopicQuestion);
router.put('/questions/subtopic/:questionId', isAuthenticated, isFacultyOrAdmin, validate(updateQuestionValidation), updateSubtopicQuestion);
router.delete('/questions/subtopic/:questionId', isAuthenticated, isFacultyOrAdmin, deleteSubtopicQuestion);

// ── Final Quiz Management ────────────────────────
router.get('/final/:topicId/manage', isAuthenticated, isFacultyOrAdmin, getFinalQuizManage);
router.post('/final/:finalQuizId/questions', isAuthenticated, isFacultyOrAdmin, validate(questionValidation), addFinalQuestion);
router.put('/questions/final/:questionId', isAuthenticated, isFacultyOrAdmin, validate(updateQuestionValidation), updateFinalQuestion);
router.delete('/questions/final/:questionId', isAuthenticated, isFacultyOrAdmin, deleteFinalQuestion);
router.put('/final/:finalQuizId/config', isAuthenticated, isFacultyOrAdmin, validate(updateFinalQuizConfigValidation), updateFinalQuizConfig);

export default router;
