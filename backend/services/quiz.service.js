// ──────────────────────────────────────────────
// Quiz Service — Business Logic for All 3 Quiz Types
// ──────────────────────────────────────────────

import { query } from '../config/database.js';
import PrerequisiteModel from '../models/prerequisite.model.js';
import PrerequisiteQuizModel from '../models/prerequisiteQuiz.model.js';
import PrerequisiteQuizQuestionModel from '../models/prerequisiteQuizQuestion.model.js';
import SubtopicModel from '../models/subtopic.model.js';
import SubtopicContentModel from '../models/subtopicContent.model.js';
import SubtopicQuizQuestionModel from '../models/subtopicQuizQuestion.model.js';
import FinalQuizModel from '../models/finalQuiz.model.js';
import FinalQuizQuestionModel from '../models/finalQuizQuestion.model.js';
import QuizAttemptModel from '../models/quizAttempt.model.js';
import TopicModel from '../models/topic.model.js';
import StudentModel from '../models/student.model.js';
import FacultyModel from '../models/faculty.model.js';
import RoomService from './room.service.js';

const QuizService = {
  // ── Helper: Check room access for student ──────
  ensureStudentRoomAccess: async (userId, userRole, topicId) => {
    if (userRole === 'student') {
      const hasAccess = await RoomService.checkStudentTopicAccess(userId, topicId);
      if (!hasAccess) {
        const error = new Error('You do not have access to this quiz. Topic is not in any of your joined rooms.');
        error.statusCode = 403;
        throw error;
      }
    }
  },

  // ── Recalculate Quiz Total Marks ─────────────
  recalculatePrereqQuizMarks: async (prereqQuizId) => {
    await query(
      `UPDATE prerequisite_quiz
       SET total_marks = (
         SELECT COALESCE(SUM(marks), 0)
         FROM prerequisite_quiz_questions
         WHERE prereq_quiz_id = $1
       )
       WHERE prereq_quiz_id = $1`,
      [prereqQuizId]
    );
  },

  recalculateFinalQuizMarks: async (finalQuizId) => {
    await query(
      `UPDATE final_quiz
       SET total_marks = (
         SELECT COALESCE(SUM(marks), 0)
         FROM final_quiz_questions
         WHERE final_quiz_id = $1
       )
       WHERE final_quiz_id = $1`,
      [finalQuizId]
    );
  },

  // =========================================================
  // 1. PREREQUISITE QUIZ OPERATIONS
  // =========================================================

  getPrerequisiteQuiz: async (topicId, userId, userRole) => {
    await QuizService.ensureStudentRoomAccess(userId, userRole, topicId);

    const topic = await TopicModel.findById(topicId);
    if (!topic) {
      const error = new Error('Topic not found.');
      error.statusCode = 404;
      throw error;
    }

    let prereqs = await PrerequisiteModel.findByTopicId(topicId);
    let prereq = prereqs[0];
    if (!prereq) {
      prereq = await PrerequisiteModel.create({
        topic_id: topicId,
        description: `Prerequisites for ${topic.title}`,
        content: `Basic concepts required before starting ${topic.title}.`,
        order_index: 1,
      });
    }

    let quizzes = await PrerequisiteQuizModel.findByPrereqId(prereq.prereq_id);
    let quiz = quizzes[0];
    if (!quiz) {
      quiz = await PrerequisiteQuizModel.create({
        prereq_id: prereq.prereq_id,
        title: `${topic.title} — Prerequisite Quiz`,
        total_marks: 12,
        passing_criteria: 50,
        time_limit: 15,
      });
    }

    const isStudent = userRole === 'student';
    const questions = isStudent
      ? await PrerequisiteQuizQuestionModel.findByQuizIdForStudent(quiz.prereq_quiz_id)
      : await PrerequisiteQuizQuestionModel.findByQuizId(quiz.prereq_quiz_id);

    return {
      quiz: {
        ...quiz,
        time_limit: quiz.time_limit || 15,
      },
      prerequisite: prereq,
      questions,
      topic_id: topicId,
      time_limit: quiz.time_limit || 15,
    };
  },

  startPrerequisiteAttempt: async (topicId, userId) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const { quiz, questions } = await QuizService.getPrerequisiteQuiz(topicId, userId, 'student');

    const attempt = await QuizAttemptModel.create({
      student_id: student.student_id,
      quiz_type: 'prerequisite',
      quiz_ref_id: quiz.prereq_quiz_id,
    });

    return {
      attempt,
      quiz,
      questions,
      time_limit: quiz.time_limit || 15,
    };
  },

  // =========================================================
  // 2. SUBTOPIC QUIZ OPERATIONS
  // =========================================================

  getSubtopicQuiz: async (subtopicId, userId, userRole) => {
    const subtopic = await SubtopicModel.findById(subtopicId);
    if (!subtopic) {
      const error = new Error('Subtopic not found.');
      error.statusCode = 404;
      throw error;
    }

    await QuizService.ensureStudentRoomAccess(userId, userRole, subtopic.topic_id);

    let content = await SubtopicContentModel.findBySubtopicId(subtopicId);
    if (!content) {
      content = await SubtopicContentModel.create({
        subtopic_id: subtopicId,
        aim: `Aim for ${subtopic.title}`,
        theory: `Theory for ${subtopic.title}`,
        time_limit: 15,
      });
    }

    const isStudent = userRole === 'student';
    const questions = isStudent
      ? await SubtopicQuizQuestionModel.findByContentIdForStudent(content.content_id)
      : await SubtopicQuizQuestionModel.findByContentId(content.content_id);

    const totalMarks = questions.reduce((sum, q) => sum + (parseInt(q.marks, 10) || 1), 0);

    return {
      subtopic,
      content,
      questions,
      total_marks: totalMarks,
      time_limit: content.time_limit || 15,
      topic_id: subtopic.topic_id,
    };
  },

  startSubtopicAttempt: async (subtopicId, userId) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const { content, subtopic, questions } = await QuizService.getSubtopicQuiz(subtopicId, userId, 'student');

    const attempt = await QuizAttemptModel.create({
      student_id: student.student_id,
      quiz_type: 'subtopic',
      quiz_ref_id: content.content_id,
    });

    return {
      attempt,
      subtopic,
      questions,
    };
  },

  // =========================================================
  // 3. TOPIC / FINAL QUIZ OPERATIONS
  // =========================================================

  getFinalQuiz: async (topicId, userId, userRole) => {
    await QuizService.ensureStudentRoomAccess(userId, userRole, topicId);

    const topic = await TopicModel.findById(topicId);
    if (!topic) {
      const error = new Error('Topic not found.');
      error.statusCode = 404;
      throw error;
    }

    let quizzes = await FinalQuizModel.findByTopicId(topicId);
    let quiz = quizzes[0];
    if (!quiz) {
      quiz = await FinalQuizModel.create({
        topic_id: topicId,
        title: `${topic.title} — Final Quiz`,
        total_marks: 10,
        time_limit: 15,
      });
    }

    const isStudent = userRole === 'student';
    const questions = isStudent
      ? await FinalQuizQuestionModel.findByQuizIdForStudent(quiz.final_quiz_id)
      : await FinalQuizQuestionModel.findByQuizId(quiz.final_quiz_id);

    return {
      quiz,
      questions,
      topic_id: topicId,
    };
  },

  startFinalAttempt: async (topicId, userId) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const { quiz, questions } = await QuizService.getFinalQuiz(topicId, userId, 'student');

    const attempt = await QuizAttemptModel.create({
      student_id: student.student_id,
      quiz_type: 'final',
      quiz_ref_id: quiz.final_quiz_id,
    });

    return {
      attempt,
      quiz,
      questions,
    };
  },

  // =========================================================
  // 4. SUBMIT QUIZ ATTEMPT & GRADE
  // =========================================================

  submitAttempt: async (attemptId, userId, answers = {}) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const attempt = await QuizAttemptModel.findById(attemptId);
    if (!attempt) {
      const error = new Error('Quiz attempt not found.');
      error.statusCode = 404;
      throw error;
    }

    if (attempt.student_id !== student.student_id) {
      const error = new Error('Access denied. This attempt does not belong to you.');
      error.statusCode = 403;
      throw error;
    }

    let questions = [];
    let passingCriteria = 50;
    let topicId = null;
    let subtopicId = null;

    if (attempt.quiz_type === 'prerequisite') {
      questions = await PrerequisiteQuizQuestionModel.findByQuizId(attempt.quiz_ref_id);
      const quiz = await PrerequisiteQuizModel.findById(attempt.quiz_ref_id);
      if (quiz && quiz.passing_criteria) {
        passingCriteria = quiz.passing_criteria;
      }
      if (quiz) {
        const prereq = await PrerequisiteModel.findById(quiz.prereq_id);
        if (prereq) topicId = prereq.topic_id;
      }
    } else if (attempt.quiz_type === 'subtopic') {
      questions = await SubtopicQuizQuestionModel.findByContentId(attempt.quiz_ref_id);
      passingCriteria = 50;
      const content = await SubtopicContentModel.findById(attempt.quiz_ref_id);
      if (content) {
        subtopicId = content.subtopic_id;
        const subtopic = await SubtopicModel.findById(content.subtopic_id);
        if (subtopic) topicId = subtopic.topic_id;
      }
    } else if (attempt.quiz_type === 'final') {
      questions = await FinalQuizQuestionModel.findByQuizId(attempt.quiz_ref_id);
      passingCriteria = 50;
      const finalQuiz = await FinalQuizModel.findById(attempt.quiz_ref_id);
      if (finalQuiz) {
        topicId = finalQuiz.topic_id;
        if (finalQuiz.time_limit) {
          const elapsedMinutes = (Date.now() - new Date(attempt.started_at).getTime()) / (1000 * 60);
          if (elapsedMinutes > finalQuiz.time_limit + 2) {
            console.warn(`Attempt ${attemptId} submitted after time limit (${elapsedMinutes.toFixed(1)}m > ${finalQuiz.time_limit}m)`);
          }
        }
      }
    }

    if (attempt.submitted_at) {
      // If already submitted and answers array already exists in JSONB format
      let storedAnswers = attempt.answers;
      if (Array.isArray(storedAnswers) && storedAnswers.length > 0) {
        return {
          attemptId: attempt.attempt_id,
          quizType: attempt.quiz_type,
          score: attempt.score,
          totalMarks: attempt.total_marks,
          percentage: parseFloat(attempt.percentage),
          status: attempt.passed ? 'PASSED' : 'FAILED',
          passed: attempt.passed,
          attempted: true,
          correctAnswers: attempt.correct_answers,
          incorrectAnswers: attempt.incorrect_answers,
          unanswered: attempt.unanswered,
          submittedAt: attempt.submitted_at,
          answers: storedAnswers,
          alreadySubmitted: true,
        };
      }
    }

    let totalMarks = 0;
    let score = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;

    const evaluatedAnswers = questions.map((q) => {
      const qId = q.pq_question_id || q.stq_id || q.fq_question_id;
      const qMarks = parseInt(q.marks, 10) || 1;
      totalMarks += qMarks;

      const rawChoice = answers[qId] !== undefined ? answers[qId] : answers[String(qId)];
      const studentChoice = rawChoice ? String(rawChoice).trim().toUpperCase() : '';
      const correctOption = q.correct_option ? String(q.correct_option).trim().toUpperCase() : '';
      const isCorrect = Boolean(studentChoice && studentChoice === correctOption);
      const marksObtained = isCorrect ? qMarks : 0;

      if (!studentChoice) {
        unanswered++;
      } else if (isCorrect) {
        correctAnswers++;
        score += qMarks;
      } else {
        incorrectAnswers++;
      }

      return {
        questionId: qId,
        questionText: q.question_text,
        options: {
          A: q.option_a,
          B: q.option_b,
          C: q.option_c,
          D: q.option_d,
        },
        selectedOption: studentChoice || null,
        correctOption,
        marks: qMarks,
        marksObtained,
        isCorrect,
      };
    });

    const percentage = totalMarks > 0 ? parseFloat(((score / totalMarks) * 100).toFixed(2)) : 0;
    const passed = percentage >= passingCriteria;

    const updatedAttempt = await QuizAttemptModel.submitAttempt(attemptId, {
      score,
      total_marks: totalMarks,
      percentage,
      correct_answers: correctAnswers,
      incorrect_answers: incorrectAnswers,
      unanswered,
      passed,
      answers: evaluatedAnswers,
    });

    // ── Update student progress in DB ─────────────
    try {
      if (attempt.quiz_type === 'subtopic' && subtopicId) {
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
      console.error('Non-critical: Error updating progress after quiz submission:', progErr.message);
    }

    return {
      attemptId: updatedAttempt.attempt_id,
      quizType: updatedAttempt.quiz_type,
      score: updatedAttempt.score,
      totalMarks: updatedAttempt.total_marks,
      percentage: parseFloat(updatedAttempt.percentage),
      status: passed ? 'PASSED' : 'FAILED',
      passed: updatedAttempt.passed,
      attempted: true,
      correctAnswers: updatedAttempt.correct_answers,
      incorrectAnswers: updatedAttempt.incorrect_answers,
      unanswered: updatedAttempt.unanswered,
      submittedAt: updatedAttempt.submitted_at,
      answers: evaluatedAnswers,
    };
  },

  // ── Student Quiz History ───────────────────────
  getMyAttempts: async (userId) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }
    return QuizAttemptModel.findByStudentId(student.student_id);
  },

  // =========================================================
  // 5. FACULTY QUESTION MANAGEMENT (CRUD)
  // =========================================================

  // ── Prerequisite Questions ─────────────────────
  addPrereqQuestion: async (prereqQuizId, data) => {
    const quiz = await PrerequisiteQuizModel.findById(prereqQuizId);
    if (!quiz) {
      const error = new Error('Prerequisite quiz not found.');
      error.statusCode = 404;
      throw error;
    }

    const question = await PrerequisiteQuizQuestionModel.create({
      prereq_quiz_id: prereqQuizId,
      ...data,
    });

    await QuizService.recalculatePrereqQuizMarks(prereqQuizId);
    return question;
  },

  updatePrereqQuestion: async (questionId, data) => {
    const question = await PrerequisiteQuizQuestionModel.findById(questionId);
    if (!question) {
      const error = new Error('Prerequisite question not found.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await PrerequisiteQuizQuestionModel.update(questionId, data);
    await QuizService.recalculatePrereqQuizMarks(question.prereq_quiz_id);
    return updated;
  },

  deletePrereqQuestion: async (questionId) => {
    const question = await PrerequisiteQuizQuestionModel.findById(questionId);
    if (!question) {
      const error = new Error('Prerequisite question not found.');
      error.statusCode = 404;
      throw error;
    }

    await PrerequisiteQuizQuestionModel.deleteById(questionId);
    await QuizService.recalculatePrereqQuizMarks(question.prereq_quiz_id);
    return { success: true };
  },

  // ── Subtopic Questions ─────────────────────────
  addSubtopicQuestion: async (contentId, data) => {
    const content = await SubtopicContentModel.findById(contentId);
    if (!content) {
      const error = new Error('Subtopic content not found.');
      error.statusCode = 404;
      throw error;
    }

    return SubtopicQuizQuestionModel.create({
      content_id: contentId,
      ...data,
    });
  },

  updateSubtopicQuestion: async (questionId, data) => {
    const question = await SubtopicQuizQuestionModel.findById(questionId);
    if (!question) {
      const error = new Error('Subtopic question not found.');
      error.statusCode = 404;
      throw error;
    }

    return SubtopicQuizQuestionModel.update(questionId, data);
  },

  deleteSubtopicQuestion: async (questionId) => {
    const question = await SubtopicQuizQuestionModel.findById(questionId);
    if (!question) {
      const error = new Error('Subtopic question not found.');
      error.statusCode = 404;
      throw error;
    }

    return SubtopicQuizQuestionModel.deleteById(questionId);
  },

  // ── Final Quiz Questions ───────────────────────
  addFinalQuestion: async (finalQuizId, data) => {
    const quiz = await FinalQuizModel.findById(finalQuizId);
    if (!quiz) {
      const error = new Error('Final quiz not found.');
      error.statusCode = 404;
      throw error;
    }

    const question = await FinalQuizQuestionModel.create({
      final_quiz_id: finalQuizId,
      ...data,
    });

    await QuizService.recalculateFinalQuizMarks(finalQuizId);
    return question;
  },

  updateFinalQuestion: async (questionId, data) => {
    const question = await FinalQuizQuestionModel.findById(questionId);
    if (!question) {
      const error = new Error('Final quiz question not found.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await FinalQuizQuestionModel.update(questionId, data);
    await QuizService.recalculateFinalQuizMarks(question.final_quiz_id);
    return updated;
  },

  deleteFinalQuestion: async (questionId) => {
    const question = await FinalQuizQuestionModel.findById(questionId);
    if (!question) {
      const error = new Error('Final quiz question not found.');
      error.statusCode = 404;
      throw error;
    }

    await FinalQuizQuestionModel.deleteById(questionId);
    await QuizService.recalculateFinalQuizMarks(question.final_quiz_id);
    return { success: true };
  },

  // ── Faculty Quiz Configurations ───────────────
  updatePrereqQuizConfig: async (prereqQuizId, data) => {
    const quiz = await PrerequisiteQuizModel.findById(prereqQuizId);
    if (!quiz) {
      const error = new Error('Prerequisite quiz not found.');
      error.statusCode = 404;
      throw error;
    }
    return PrerequisiteQuizModel.update(prereqQuizId, data);
  },

  updateFinalQuizConfig: async (finalQuizId, data) => {
    const quiz = await FinalQuizModel.findById(finalQuizId);
    if (!quiz) {
      const error = new Error('Final quiz not found.');
      error.statusCode = 404;
      throw error;
    }
    return FinalQuizModel.update(finalQuizId, data);
  },
};

export default QuizService;
