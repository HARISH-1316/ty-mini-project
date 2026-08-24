// ──────────────────────────────────────────────
// Execution Service — Multi-Language Execution & Grading Engine
// ──────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getLanguageConfig } from '../config/languages.js';
import DockerService from './docker.service.js';
import { compareOutputs } from '../utils/outputComparator.js';
import TcaQuestionModel from '../models/tcaQuestion.model.js';
import TcaTestCaseModel from '../models/tcaTestCase.model.js';
import SubtopicCodingAssessmentModel from '../models/subtopicCodingAssessment.model.js';
import SccaTestCaseModel from '../models/sccaTestCase.model.js';
import CodingSubmissionModel from '../models/codingSubmission.model.js';
import StudentModel from '../models/student.model.js';
import SubtopicContentModel from '../models/subtopicContent.model.js';
import SubtopicModel from '../models/subtopic.model.js';
import TopicCodingAssessmentModel from '../models/topicCodingAssessment.model.js';
import ProgressModel from '../models/progress.model.js';
import SubtopicProgressModel from '../models/subtopicProgress.model.js';
import { query } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TMP_DIR = path.resolve(__dirname, '..', 'tmp');

// Ensure tmp directory exists
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

const ExecutionService = {
  /**
   * Helper to create a unique isolated workspace directory.
   */
  createWorkspace: () => {
    const uniqueId = `exec-${crypto.randomUUID().slice(0, 12)}`;
    const workspacePath = path.join(TMP_DIR, uniqueId);
    fs.mkdirSync(workspacePath, { recursive: true });
    return workspacePath;
  },

  /**
   * Helper to cleanup workspace directory.
   */
  cleanupWorkspace: (workspacePath) => {
    if (workspacePath && fs.existsSync(workspacePath)) {
      try {
        fs.rmSync(workspacePath, { recursive: true, force: true });
      } catch (err) {
        console.warn(`Failed to cleanup workspace ${workspacePath}:`, err.message);
      }
    }
  },

  /**
   * Run student code against custom stdin input.
   */
  runCode: async ({ language, code, input = '', timeoutMs = 5000 }) => {
    const langConfig = getLanguageConfig(language);
    if (!langConfig) {
      const error = new Error(`Unsupported language: ${language}. Supported languages are: C, C++, Java, Python.`);
      error.statusCode = 400;
      throw error;
    }

    if (!code || typeof code !== 'string' || code.trim() === '') {
      const error = new Error('Source code cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    const workspacePath = ExecutionService.createWorkspace();

    try {
      // 1. Write source file
      const sourceFilePath = path.join(workspacePath, langConfig.sourceFile);
      fs.writeFileSync(sourceFilePath, code, 'utf-8');

      // 2. Compilation step (for compiled languages C, C++, Java)
      if (langConfig.compileCommand) {
        const compileResult = await DockerService.runContainer({
          image: langConfig.dockerImage,
          workspacePath,
          command: langConfig.compileCommand,
          timeoutMs: 12000,
        });

        if (compileResult.timedOut) {
          return {
            success: false,
            errorType: 'COMPILATION_ERROR',
            output: '',
            error: 'Compilation timed out.',
            executionTime: compileResult.executionTime,
          };
        }

        if (compileResult.exitCode !== 0) {
          return {
            success: false,
            errorType: 'COMPILATION_ERROR',
            output: '',
            error: compileResult.stderr || compileResult.stdout || 'Compilation error occurred.',
            executionTime: compileResult.executionTime,
          };
        }
      }

      // 3. Execution step
      const runResult = await DockerService.runContainer({
        image: langConfig.dockerImage,
        workspacePath,
        command: langConfig.runCommand,
        input,
        timeoutMs,
      });

      if (runResult.timedOut) {
        return {
          success: false,
          errorType: 'TIME_LIMIT_EXCEEDED',
          output: runResult.stdout,
          error: 'Execution timed out. Time limit exceeded (5s).',
          executionTime: runResult.executionTime,
        };
      }

      if (runResult.exitCode !== 0) {
        return {
          success: false,
          errorType: 'RUNTIME_ERROR',
          output: runResult.stdout,
          error: runResult.stderr || `Runtime error (Process exited with code ${runResult.exitCode})`,
          executionTime: runResult.executionTime,
        };
      }

      return {
        success: true,
        errorType: null,
        output: runResult.stdout,
        error: null,
        executionTime: runResult.executionTime,
      };
    } finally {
      ExecutionService.cleanupWorkspace(workspacePath);
    }
  },

  /**
   * Submit student code to be tested against all test cases.
   */
  submitCode: async ({ language, code, questionId, assessmentType = 'topic', userId }) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const langConfig = getLanguageConfig(language);
    if (!langConfig) {
      const error = new Error(`Unsupported language: ${language}. Supported languages are: C, C++, Java, Python.`);
      error.statusCode = 400;
      throw error;
    }

    if (!code || typeof code !== 'string' || code.trim() === '') {
      const error = new Error('Source code cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    // 1. Fetch Question & Test Cases
    let question = null;
    let testCases = [];
    let assessmentRefId = 0;
    let topicId = null;
    let subtopicId = null;

    if (assessmentType === 'topic') {
      question = await TcaQuestionModel.findById(questionId);
      if (!question) {
        const error = new Error('Topic coding question not found.');
        error.statusCode = 404;
        throw error;
      }
      assessmentRefId = question.tca_id;
      const tca = await TopicCodingAssessmentModel.findById(question.tca_id);
      if (tca) topicId = tca.topic_id;

      testCases = await TcaTestCaseModel.findByQuestionId(questionId);
      if (testCases.length === 0 && question.sample_input) {
        // Fallback to sample if no extra test cases
        testCases = [{
          tca_testcase_id: 1,
          input: question.sample_input,
          expected_output: question.sample_output,
          is_hidden: false,
          order_index: 1,
        }];
      }
    } else if (assessmentType === 'subtopic') {
      question = await SubtopicCodingAssessmentModel.findById(questionId);
      if (!question) {
        const error = new Error('Subtopic coding question not found.');
        error.statusCode = 404;
        throw error;
      }
      assessmentRefId = question.content_id;
      const content = await SubtopicContentModel.findById(question.content_id);
      if (content) {
        subtopicId = content.subtopic_id;
        const subtopic = await SubtopicModel.findById(content.subtopic_id);
        if (subtopic) topicId = subtopic.topic_id;
      }

      testCases = await SccaTestCaseModel.findBySccaId(questionId);
      if (testCases.length === 0 && question.sample_input) {
        testCases = [{
          scca_testcase_id: 1,
          input: question.sample_input,
          expected_output: question.sample_output,
          is_hidden: false,
          order_index: 1,
        }];
      }
    } else {
      const error = new Error(`Unsupported assessment type: ${assessmentType}`);
      error.statusCode = 400;
      throw error;
    }

    const workspacePath = ExecutionService.createWorkspace();

    try {
      // 2. Write source file
      const sourceFilePath = path.join(workspacePath, langConfig.sourceFile);
      fs.writeFileSync(sourceFilePath, code, 'utf-8');

      // 3. Compile ONCE for all test cases (for compiled languages)
      if (langConfig.compileCommand) {
        const compileResult = await DockerService.runContainer({
          image: langConfig.dockerImage,
          workspacePath,
          command: langConfig.compileCommand,
          timeoutMs: 12000,
        });

        if (compileResult.timedOut || compileResult.exitCode !== 0) {
          const compError = compileResult.timedOut
            ? 'Compilation timed out.'
            : (compileResult.stderr || compileResult.stdout || 'Compilation error occurred.');

          return {
            success: false,
            errorType: 'COMPILATION_ERROR',
            status: 'COMPILATION_ERROR',
            score: 0,
            totalMarks: question.marks || 10,
            percentage: 0,
            passedTestCases: 0,
            totalTestCases: testCases.length,
            error: compError,
            testCaseResults: [],
          };
        }
      }

      // 4. Run against each test case
      let passedCount = 0;
      let totalExecutionTime = 0;
      const testCaseResults = [];

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const tcId = tc.tca_testcase_id || tc.scca_testcase_id || (i + 1);

        const runResult = await DockerService.runContainer({
          image: langConfig.dockerImage,
          workspacePath,
          command: langConfig.runCommand,
          input: tc.input || '',
          timeoutMs: 5000,
        });

        totalExecutionTime += runResult.executionTime;

        if (runResult.timedOut) {
          testCaseResults.push({
            testCaseId: tcId,
            orderIndex: tc.order_index || (i + 1),
            passed: false,
            isHidden: tc.is_hidden,
            status: 'TIME_LIMIT_EXCEEDED',
            executionTime: runResult.executionTime,
            input: tc.is_hidden ? undefined : tc.input,
            expectedOutput: tc.is_hidden ? undefined : tc.expected_output,
            actualOutput: tc.is_hidden ? undefined : runResult.stdout,
            error: 'Time limit exceeded (5s)',
          });
          continue;
        }

        if (runResult.exitCode !== 0) {
          testCaseResults.push({
            testCaseId: tcId,
            orderIndex: tc.order_index || (i + 1),
            passed: false,
            isHidden: tc.is_hidden,
            status: 'RUNTIME_ERROR',
            executionTime: runResult.executionTime,
            input: tc.is_hidden ? undefined : tc.input,
            expectedOutput: tc.is_hidden ? undefined : tc.expected_output,
            actualOutput: tc.is_hidden ? undefined : runResult.stdout,
            error: runResult.stderr || `Exit code ${runResult.exitCode}`,
          });
          continue;
        }

        const comparison = compareOutputs(runResult.stdout, tc.expected_output);
        if (comparison.isMatch) {
          passedCount++;
        }

        testCaseResults.push({
          testCaseId: tcId,
          orderIndex: tc.order_index || (i + 1),
          passed: comparison.isMatch,
          isHidden: tc.is_hidden,
          status: comparison.isMatch ? 'PASSED' : 'WRONG_ANSWER',
          executionTime: runResult.executionTime,
          input: tc.is_hidden ? undefined : tc.input,
          expectedOutput: tc.is_hidden ? undefined : tc.expected_output,
          actualOutput: tc.is_hidden ? undefined : runResult.stdout,
        });
      }

      // 5. Calculate Marks & Pass/Fail Status
      const totalTestCases = testCases.length || 1;
      const questionMarks = question.marks || 10;
      const score = Math.round((passedCount / totalTestCases) * questionMarks);
      const percentage = parseFloat(((score / questionMarks) * 100).toFixed(2));
      const isCompleted = passedCount === totalTestCases;
      const submissionStatus = isCompleted ? 'Completed' : 'Attempted';

      // 6. Record Submission in DB
      const submission = await CodingSubmissionModel.create({
        student_id: student.student_id,
        assessment_type: assessmentType,
        assessment_ref_id: assessmentRefId,
        question_id: questionId,
        source_code: code,
        language,
        status: submissionStatus,
        score,
        total_marks: questionMarks,
        questions_solved: isCompleted ? 1 : 0,
        total_questions: 1,
        percentage,
      });

      // 7. Update Student Progress
      try {
        if (subtopicId) {
          await query(
            `INSERT INTO subtopic_progress (student_id, subtopic_id, status, last_accessed)
             VALUES ($1, $2, 'In Progress', CURRENT_TIMESTAMP)
             ON CONFLICT (student_id, subtopic_id)
             DO UPDATE SET last_accessed = CURRENT_TIMESTAMP`,
            [student.student_id, subtopicId]
          );
        }

        if (topicId) {
          await query(
            `INSERT INTO progress (student_id, topic_id, status, last_accessed)
             VALUES ($1, $2, 'In Progress', CURRENT_TIMESTAMP)
             ON CONFLICT (student_id, topic_id)
             DO UPDATE SET last_accessed = CURRENT_TIMESTAMP`,
            [student.student_id, topicId]
          );
        }
      } catch (progErr) {
        console.error('Non-critical: Error updating progress after coding submission:', progErr.message);
      }

      return {
        success: true,
        submissionId: submission.submission_id,
        status: isCompleted ? 'PASSED' : 'FAILED',
        isCompleted,
        score,
        totalMarks: questionMarks,
        percentage,
        passedTestCases: passedCount,
        totalTestCases,
        totalExecutionTime,
        testCaseResults,
      };
    } finally {
      ExecutionService.cleanupWorkspace(workspacePath);
    }
  },

  /**
   * Get Coding Questions for Student or Faculty.
   */
  getQuestions: async ({ assessmentType, refId, isStudent = true }) => {
    if (assessmentType === 'topic') {
      let tcaId = refId;
      let questions = await TcaQuestionModel.findByTcaId(tcaId);

      // If no questions found by direct TCA ID, check if refId is topic_id
      if (questions.length === 0) {
        const tcaList = await TopicCodingAssessmentModel.findByTopicId(refId);
        if (tcaList.length > 0) {
          tcaId = tcaList[0].tca_id;
          questions = await TcaQuestionModel.findByTcaId(tcaId);
        }
      }

      const enriched = [];
      for (const q of questions) {
        const testCases = isStudent
          ? await TcaTestCaseModel.findByQuestionIdForStudent(q.tca_question_id)
          : await TcaTestCaseModel.findByQuestionId(q.tca_question_id);

        enriched.push({
          ...q,
          testCases,
        });
      }
      return enriched;
    } else if (assessmentType === 'subtopic') {
      let contentId = refId;
      let questions = await SubtopicCodingAssessmentModel.findByContentId(contentId);

      // If no questions found by content_id, check if refId is subtopic_id
      if (questions.length === 0) {
        const content = await SubtopicContentModel.findBySubtopicId(refId);
        if (content) {
          contentId = content.content_id;
          questions = await SubtopicCodingAssessmentModel.findByContentId(contentId);
        }
      }

      const enriched = [];
      for (const q of questions) {
        const testCases = isStudent
          ? await SccaTestCaseModel.findBySccaIdForStudent(q.scca_id)
          : await SccaTestCaseModel.findBySccaId(q.scca_id);

        enriched.push({
          ...q,
          testCases,
        });
      }
      return enriched;
    }

    return [];
  },
};

export default ExecutionService;
