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

export const listLabQuestionsApi = (params = {}) => {
  const queryParams = typeof params === 'object' && params !== null
    ? params
    : (params ? { topicId: params } : {});
  return api.get('/lab-questions', { params: queryParams });
};

export const getLabQuestionApi = (questionId) =>
  api.get(`/lab-questions/${questionId}`);

export const updateLabQuestionApi = (questionId, data) =>
  api.put(`/lab-questions/${questionId}`, data);

export const deleteLabQuestionApi = (questionId) =>
  api.delete(`/lab-questions/${questionId}`);

export const publishLabQuestionApi = (questionId) =>
  api.patch(`/lab-questions/${questionId}/publish`);

export const unpublishLabQuestionApi = (questionId) =>
  api.patch(`/lab-questions/${questionId}/unpublish`);

export const archiveLabQuestionApi = (questionId) =>
  api.patch(`/lab-questions/${questionId}/archive`);

export const unarchiveLabQuestionApi = (questionId) =>
  api.patch(`/lab-questions/${questionId}/unarchive`);

export const getQuestionBankTopicsSummaryApi = () =>
  api.get('/lab-questions/topics-summary');

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

export const submitLabMcqApi = (labId, data) =>
  api.post(`/lab-assessments/student/${labId}/submit-mcq`, data);

export const getRoomLabAssessmentsApi = (roomId) =>
  api.get(`/rooms/${roomId}/lab-assessments`);

// =========================================================
// FACULTY — MCQ Question Bank
// =========================================================

export const listLabMcqsApi = (params = {}) =>
  api.get('/lab-mcqs', { params });

export const getLabMcqApi = (mcqId) =>
  api.get(`/lab-mcqs/${mcqId}`);

export const createLabMcqApi = (data) =>
  api.post('/lab-mcqs', data);

export const updateLabMcqApi = (mcqId, data) =>
  api.put(`/lab-mcqs/${mcqId}`, data);

export const deleteLabMcqApi = (mcqId) =>
  api.delete(`/lab-mcqs/${mcqId}`);

export const publishLabMcqApi = (mcqId) =>
  api.patch(`/lab-mcqs/${mcqId}/publish`);

export const unpublishLabMcqApi = (mcqId) =>
  api.patch(`/lab-mcqs/${mcqId}/unpublish`);

export const getLabMcqTopicsSummaryApi = () =>
  api.get('/lab-mcqs/topics-summary');
