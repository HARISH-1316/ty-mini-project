// ──────────────────────────────────────────────
// Lab Assessment API Client
// ──────────────────────────────────────────────

import api from './axios';

// =========================================================
// FACULTY — Assessment Management
// =========================================================

export const createLabAssessmentApi = (data) =>
  api.post('/lab-assessments', data);

export const getFacultyLabAssessmentsApi = () =>
  api.get('/lab-assessments');

export const getTopicsSummaryApi = () =>
  api.get('/lab-assessments/topics-summary');

export const getLabAssessmentDetailApi = (labId) =>
  api.get(`/lab-assessments/${labId}`);

export const updateLabAssessmentApi = (labId, data) =>
  api.put(`/lab-assessments/${labId}`, data);

export const publishLabAssessmentApi = (labId) =>
  api.put(`/lab-assessments/${labId}/publish`);

export const cancelLabAssessmentApi = (labId) =>
  api.put(`/lab-assessments/${labId}/cancel`);

export const addTopicToAssessmentApi = (labId, topic_id) =>
  api.post(`/lab-assessments/${labId}/topics`, { topic_id });

export const removeTopicFromAssessmentApi = (labId, topicId) =>
  api.delete(`/lab-assessments/${labId}/topics/${topicId}`);

export const getQuestionPoolApi = (labId) =>
  api.get(`/lab-assessments/${labId}/question-pool`);

export const getLabResultsApi = (labId) =>
  api.get(`/lab-assessments/${labId}/results`);

// =========================================================
// FACULTY — Question Bank
// =========================================================

export const createLabQuestionApi = (data) =>
  api.post('/lab-questions', data);

export const listLabQuestionsApi = (topicId = null) =>
  api.get('/lab-questions', { params: topicId ? { topicId } : {} });

export const getLabQuestionApi = (questionId) =>
  api.get(`/lab-questions/${questionId}`);

export const updateLabQuestionApi = (questionId, data) =>
  api.put(`/lab-questions/${questionId}`, data);

export const deleteLabQuestionApi = (questionId) =>
  api.delete(`/lab-questions/${questionId}`);

export const addLabTestCaseApi = (questionId, data) =>
  api.post(`/lab-questions/${questionId}/testcases`, data);

export const updateLabTestCaseApi = (testCaseId, data) =>
  api.put(`/lab-questions/testcases/${testCaseId}`, data);

export const deleteLabTestCaseApi = (testCaseId) =>
  api.delete(`/lab-questions/testcases/${testCaseId}`);

// =========================================================
// STUDENT — Assessment Participation
// =========================================================

export const getStudentAvailableLabsApi = () =>
  api.get('/lab-assessments/student/available');

export const getStudentLabInfoApi = (labId) =>
  api.get(`/lab-assessments/student/${labId}`);

export const startOrResumeLabApi = (labId) =>
  api.post(`/lab-assessments/student/${labId}/start`);

export const getStudentQuestionsApi = (labId) =>
  api.get(`/lab-assessments/student/${labId}/questions`);

export const labRunCodeApi = (labId, data) =>
  api.post(`/lab-assessments/student/${labId}/run`, data);

export const labSubmitQuestionApi = (labId, data) =>
  api.post(`/lab-assessments/student/${labId}/submit-question`, data);

export const getLabSubmissionStatusApi = (labId) =>
  api.get(`/lab-assessments/student/${labId}/submission-status`);

export const submitLabAssessmentApi = (labId) =>
  api.post(`/lab-assessments/student/${labId}/submit`);

export const getLabResultApi = (labId) =>
  api.get(`/lab-assessments/student/${labId}/result`);
