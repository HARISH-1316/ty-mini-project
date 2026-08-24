// ──────────────────────────────────────────────
// Editor & Code Execution API Client
// ──────────────────────────────────────────────

import api from './axios';

/**
 * Execute code with custom standard input (Run Code)
 */
export const executeCodeApi = async ({ roomId, language, code, input = '' }) => {
  const url = roomId && roomId !== 'global' ? `/editor/${roomId}/execute` : '/editor/execute';
  const response = await api.post(url, { language, code, input });
  return response.data;
};

/**
 * Submit solution against all test cases for grading
 */
export const submitCodeApi = async ({ roomId, language, code, questionId, assessmentType = 'topic' }) => {
  const url = roomId && roomId !== 'global' ? `/editor/${roomId}/submit` : '/editor/submit';
  const response = await api.post(url, {
    language,
    code,
    questionId,
    assessmentType,
  });
  return response.data;
};

/**
 * Fetch questions and public test cases for an assessment
 */
export const getCodingQuestionsApi = async ({ roomId, assessmentType, refId }) => {
  const url = roomId && roomId !== 'global'
    ? `/editor/${roomId}/questions/${assessmentType}/${refId}`
    : `/editor/questions/${assessmentType}/${refId}`;
  const response = await api.get(url);
  return response.data;
};
