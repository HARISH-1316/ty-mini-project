// ──────────────────────────────────────────────
// Lab Assessment Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import { isAuthenticated, isStudent, isFacultyOrAdmin } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validation.middleware.js';

import {
  createLabAssessment,
  getFacultyLabAssessments,
  getTopicsSummary,
  getLabAssessmentDetail,
  updateLabAssessment,
  publishLabAssessment,
  cancelLabAssessment,
  addTopicToAssessment,
  removeTopicFromAssessment,
  getQuestionPool,
  getLabResults,
  getStudentAvailableLabs,
  getStudentLabInfo,
  startOrResumeLab,
  getStudentQuestions,
  studentRunCode,
  studentSubmitQuestion,
  getSubmissionStatus,
  submitLabAssessment,
  getLabResult,
  studentSubmitMcq,
  logStudentViolation,
  getLabViolations,
  getRecentFacultyViolations,
} from '../controllers/labAssessment.controller.js';

import {
  createLabQuestion,
  listLabQuestions,
  getLabQuestion,
  updateLabQuestion,
  deleteLabQuestion,
  publishLabQuestion,
  unpublishLabQuestion,
  archiveLabQuestion,
  unarchiveLabQuestion,
  getQuestionBankTopicsSummary,
  addLabTestCase,
  updateLabTestCase,
  deleteLabTestCase,
} from '../controllers/labQuestion.controller.js';

import {
  createLabAssessmentValidation,
  updateLabAssessmentValidation,
  addTopicValidation,
  createLabQuestionValidation,
  updateLabQuestionValidation,
  labTestCaseValidation,
  laRunCodeValidation,
  laSubmitQuestionValidation,
  laSubmitMcqValidation,
} from '../validations/labAssessment.validation.js';

const router = Router();

// =========================================================
// STUDENT ROUTES — /api/lab-assessments/student/*
// MUST come before /:labId to avoid routing conflict
// =========================================================

router.get('/student/available', isAuthenticated, isStudent, getStudentAvailableLabs);
router.get('/student/:labId', isAuthenticated, isStudent, getStudentLabInfo);
router.post('/student/:labId/start', isAuthenticated, isStudent, startOrResumeLab);
router.get('/student/:labId/questions', isAuthenticated, isStudent, getStudentQuestions);
router.post('/student/:labId/run', isAuthenticated, isStudent, validate(laRunCodeValidation), studentRunCode);
router.post('/student/:labId/submit-question', isAuthenticated, isStudent, validate(laSubmitQuestionValidation), studentSubmitQuestion);
router.post('/student/:labId/submit-mcq', isAuthenticated, isStudent, validate(laSubmitMcqValidation), studentSubmitMcq);
router.get('/student/:labId/submission-status', isAuthenticated, isStudent, getSubmissionStatus);
router.post('/student/:labId/submit', isAuthenticated, isStudent, submitLabAssessment);
router.get('/student/:labId/result', isAuthenticated, isStudent, getLabResult);
router.post('/student/:labId/log-violation', isAuthenticated, isStudent, logStudentViolation);

// =========================================================
// FACULTY / ADMIN ROUTES — /api/lab-assessments/*
// =========================================================

router.get('/:labId/violations', isAuthenticated, isFacultyOrAdmin, getLabViolations);

// Assessment collection
router.get('/faculty/recent-violations', isAuthenticated, isFacultyOrAdmin, getRecentFacultyViolations);
router.post('/', isAuthenticated, isFacultyOrAdmin, validate(createLabAssessmentValidation), createLabAssessment);
router.get('/', isAuthenticated, isFacultyOrAdmin, getFacultyLabAssessments);
router.get('/topics-summary', isAuthenticated, isFacultyOrAdmin, getTopicsSummary);

// Assessment specific
router.get('/:labId', isAuthenticated, isFacultyOrAdmin, getLabAssessmentDetail);
router.put('/:labId', isAuthenticated, isFacultyOrAdmin, validate(updateLabAssessmentValidation), updateLabAssessment);
router.put('/:labId/publish', isAuthenticated, isFacultyOrAdmin, publishLabAssessment);
router.patch('/:labId/publish', isAuthenticated, isFacultyOrAdmin, publishLabAssessment);
router.put('/:labId/cancel', isAuthenticated, isFacultyOrAdmin, cancelLabAssessment);
router.get('/:labId/question-pool', isAuthenticated, isFacultyOrAdmin, getQuestionPool);
router.get('/:labId/results', isAuthenticated, isFacultyOrAdmin, getLabResults);

// Topic management
router.post('/:labId/topics', isAuthenticated, isFacultyOrAdmin, validate(addTopicValidation), addTopicToAssessment);
router.delete('/:labId/topics/:topicId', isAuthenticated, isFacultyOrAdmin, removeTopicFromAssessment);

// =========================================================
// QUESTION BANK ROUTES — /api/lab-questions/*
// Mounted separately in routes/index.js
// =========================================================

export const questionBankRouter = Router();

questionBankRouter.post('/', isAuthenticated, isFacultyOrAdmin, validate(createLabQuestionValidation), createLabQuestion);
questionBankRouter.get('/', isAuthenticated, listLabQuestions);
questionBankRouter.get('/topics-summary', isAuthenticated, isFacultyOrAdmin, getQuestionBankTopicsSummary);
questionBankRouter.get('/:questionId', isAuthenticated, getLabQuestion);
questionBankRouter.put('/:questionId', isAuthenticated, isFacultyOrAdmin, validate(updateLabQuestionValidation), updateLabQuestion);
questionBankRouter.delete('/:questionId', isAuthenticated, isFacultyOrAdmin, deleteLabQuestion);

// Publishing & Archiving
questionBankRouter.patch('/:questionId/publish', isAuthenticated, isFacultyOrAdmin, publishLabQuestion);
questionBankRouter.put('/:questionId/publish', isAuthenticated, isFacultyOrAdmin, publishLabQuestion);
questionBankRouter.patch('/:questionId/unpublish', isAuthenticated, isFacultyOrAdmin, unpublishLabQuestion);
questionBankRouter.put('/:questionId/unpublish', isAuthenticated, isFacultyOrAdmin, unpublishLabQuestion);
questionBankRouter.patch('/:questionId/archive', isAuthenticated, isFacultyOrAdmin, archiveLabQuestion);
questionBankRouter.put('/:questionId/archive', isAuthenticated, isFacultyOrAdmin, archiveLabQuestion);
questionBankRouter.patch('/:questionId/unarchive', isAuthenticated, isFacultyOrAdmin, unarchiveLabQuestion);
questionBankRouter.put('/:questionId/unarchive', isAuthenticated, isFacultyOrAdmin, unarchiveLabQuestion);

// Test cases
questionBankRouter.post('/:questionId/testcases', isAuthenticated, isFacultyOrAdmin, validate(labTestCaseValidation), addLabTestCase);
questionBankRouter.put('/testcases/:testCaseId', isAuthenticated, isFacultyOrAdmin, validate(labTestCaseValidation), updateLabTestCase);
questionBankRouter.delete('/testcases/:testCaseId', isAuthenticated, isFacultyOrAdmin, deleteLabTestCase);

export default router;
