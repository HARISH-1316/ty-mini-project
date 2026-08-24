// ──────────────────────────────────────────────
// Progress Service — Comprehensive Multi-Role Progress & Analytics Engine
// ──────────────────────────────────────────────

import { query } from '../config/database.js';
import StudentModel from '../models/student.model.js';
import FacultyModel from '../models/faculty.model.js';
import TopicModel from '../models/topic.model.js';
import SubtopicModel from '../models/subtopic.model.js';
import PrerequisiteModel from '../models/prerequisite.model.js';
import PrerequisiteQuizModel from '../models/prerequisiteQuiz.model.js';
import FinalQuizModel from '../models/finalQuiz.model.js';
import TopicCodingAssessmentModel from '../models/topicCodingAssessment.model.js';
import ProgressModel from '../models/progress.model.js';
import SubtopicProgressModel from '../models/subtopicProgress.model.js';
import QuizAttemptModel from '../models/quizAttempt.model.js';
import CodingSubmissionModel from '../models/codingSubmission.model.js';
import RoomService from './room.service.js';

const ProgressService = {
  // =========================================================
  // 1. STUDENT PROGRESS ENGINE
  // =========================================================

  /**
   * Calculate complete overall progress for a student.
   */
  getStudentOverallProgress: async (userId) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    // Get all topics assigned to rooms joined by this student
    const accessibleTopics = await RoomService.getStudentTopics(userId);
    const accessibleTopicIds = accessibleTopics.map((t) => t.topic_id);

    if (accessibleTopicIds.length === 0) {
      return {
        student: {
          name: student.name,
          roll_number: student.roll_number,
          course: student.course,
          year: student.year,
        },
        overallProgress: 0,
        completedTopicsCount: 0,
        totalTopicsCount: 0,
        completedSubtopicsCount: 0,
        totalSubtopicsCount: 0,
        completedQuizzesCount: 0,
        totalQuizzesCount: 0,
        completedAssessmentsCount: 0,
        totalAssessmentsCount: 0,
        totalTimeSpent: 0,
        recentActivity: [],
        topicsProgress: [],
      };
    }

    let totalSubtopicsCount = 0;
    let completedSubtopicsCount = 0;
    let totalQuizzesCount = 0;
    let completedQuizzesCount = 0;
    let totalAssessmentsCount = 0;
    let completedAssessmentsCount = 0;
    let totalTimeSpent = 0;

    const topicsProgress = [];

    for (const topic of accessibleTopics) {
      const topicId = topic.topic_id;

      // 1. Subtopics & Subtopic Progress
      const subtopics = await SubtopicModel.findByTopicId(topicId);
      const subProgressList = await SubtopicProgressModel.findByStudentAndTopic(student.student_id, topicId);
      const subProgressMap = new Map(subProgressList.map((sp) => [sp.subtopic_id, sp]));

      let topicSubtopicsCompleted = 0;
      for (const st of subtopics) {
        totalSubtopicsCount++;
        const sp = subProgressMap.get(st.subtopic_id);
        if (sp) {
          totalTimeSpent += (sp.time_spent || 0);
          if (sp.status === 'Completed' || (sp.aim_viewed && sp.theory_viewed)) {
            completedSubtopicsCount++;
            topicSubtopicsCompleted++;
          }
        }
      }

      // 2. Prerequisite Quiz
      let prereqQuizCompleted = false;
      let prereqQuizScore = null;
      let prereqQuizTotal = null;
      let prereqQuizStatus = 'NOT_ATTEMPTED';
      let prereqAttemptsCount = 0;
      const prereqs = await PrerequisiteModel.findByTopicId(topicId);
      if (prereqs.length > 0) {
        const prereqQuizzes = await PrerequisiteQuizModel.findByPrereqId(prereqs[0].prereq_id);
        if (prereqQuizzes.length > 0) {
          totalQuizzesCount++;
          prereqQuizTotal = prereqQuizzes[0].total_marks || 12;
          const attempts = await QuizAttemptModel.findByStudentAndQuiz(student.student_id, 'prerequisite', prereqQuizzes[0].prereq_quiz_id);
          prereqAttemptsCount = attempts.length;
          if (attempts.length > 0) {
            const bestAttempt = attempts.reduce((prev, curr) => (!prev || curr.score > prev.score ? curr : prev), null);
            prereqQuizScore = bestAttempt ? bestAttempt.score : 0;
            if (bestAttempt && bestAttempt.passed) {
              completedQuizzesCount++;
              prereqQuizCompleted = true;
              prereqQuizStatus = 'PASSED';
            } else {
              prereqQuizStatus = 'FAILED';
            }
          }
        }
      }

      // 3. Subtopic Quizzes & Subtopic Details List
      let topicSubtopicQuizzesCompleted = 0;
      const topicSubtopicsList = [];
      for (const st of subtopics) {
        const sp = subProgressMap.get(st.subtopic_id);
        let stStatus = 'Not Started';
        if (sp) {
          if (sp.status === 'Completed' || (sp.aim_viewed && sp.theory_viewed)) {
            stStatus = 'Completed';
          } else if (sp.status === 'In Progress' || sp.aim_viewed || sp.theory_viewed) {
            stStatus = 'In Progress';
          }
        }

        // Query subtopic content for quiz
        const contentRes = await query('SELECT content_id FROM subtopic_content WHERE subtopic_id = $1', [st.subtopic_id]);
        let stQuizStatus = 'NOT_ATTEMPTED';
        let stQuizScore = null;
        let stQuizTotal = 10;
        if (contentRes.rows.length > 0) {
          totalQuizzesCount++;
          const attempts = await QuizAttemptModel.findByStudentAndQuiz(student.student_id, 'subtopic', contentRes.rows[0].content_id);
          if (attempts.length > 0) {
            const bestAttempt = attempts.reduce((prev, curr) => (!prev || curr.score > prev.score ? curr : prev), null);
            stQuizScore = bestAttempt ? bestAttempt.score : 0;
            stQuizTotal = bestAttempt ? bestAttempt.total_marks : 10;
            if (bestAttempt && bestAttempt.passed) {
              completedQuizzesCount++;
              topicSubtopicQuizzesCompleted++;
              stQuizStatus = 'PASSED';
            } else {
              stQuizStatus = 'FAILED';
            }
          }
        }

        topicSubtopicsList.push({
          subtopic_id: st.subtopic_id,
          title: st.title,
          order_index: st.order_index,
          status: stStatus,
          quizStatus: stQuizStatus,
          quizScore: stQuizScore,
          quizTotal: stQuizTotal,
        });
      }

      // 4. Final Quiz
      let finalQuizCompleted = false;
      let finalQuizScore = null;
      let finalQuizTotal = null;
      let finalQuizStatus = 'NOT_ATTEMPTED';
      let finalAttemptsCount = 0;
      const finalQuizzes = await FinalQuizModel.findByTopicId(topicId);
      if (finalQuizzes.length > 0) {
        totalQuizzesCount++;
        finalQuizTotal = finalQuizzes[0].total_marks || 10;
        const attempts = await QuizAttemptModel.findByStudentAndQuiz(student.student_id, 'final', finalQuizzes[0].final_quiz_id);
        finalAttemptsCount = attempts.length;
        if (attempts.length > 0) {
          const bestAttempt = attempts.reduce((prev, curr) => (!prev || curr.score > prev.score ? curr : prev), null);
          finalQuizScore = bestAttempt ? bestAttempt.score : 0;
          if (bestAttempt && bestAttempt.passed) {
            completedQuizzesCount++;
            finalQuizCompleted = true;
            finalQuizStatus = 'PASSED';
          } else {
            finalQuizStatus = 'FAILED';
          }
        }
      }

      // 5. Coding Assessment
      let codingCompleted = false;
      let codingScore = null;
      let codingTotal = null;
      let codingStatus = 'NOT_ATTEMPTED';
      const tcaList = await TopicCodingAssessmentModel.findByTopicId(topicId);
      if (tcaList.length > 0) {
        totalAssessmentsCount++;
        codingTotal = tcaList[0].total_marks || 20;
        const bestSubmission = await CodingSubmissionModel.findBestSubmission(student.student_id, 'topic', tcaList[0].tca_id);
        if (bestSubmission) {
          codingScore = bestSubmission.score;
          codingTotal = bestSubmission.total_marks || 20;
          if (bestSubmission.status === 'Completed' || bestSubmission.score >= codingTotal) {
            completedAssessmentsCount++;
            codingCompleted = true;
            codingStatus = 'COMPLETED';
          } else {
            codingStatus = 'ATTEMPTED';
          }
        }
      }

      // 6. Topic Progress Time Spent & Status
      const topicProgressRec = await ProgressModel.findByStudentAndTopic(student.student_id, topicId);
      if (topicProgressRec) {
        totalTimeSpent += (topicProgressRec.time_spent || 0);
      }

      // Calculation of Topic Completion Percentage:
      const topicSubtopicPct = subtopics.length > 0 ? (topicSubtopicsCompleted / subtopics.length) : 1;
      const topicTotalQuizzes = (prereqs.length > 0 ? 1 : 0) + subtopics.length + (finalQuizzes.length > 0 ? 1 : 0);
      const topicCompletedQuizzes = (prereqQuizCompleted ? 1 : 0) + topicSubtopicQuizzesCompleted + (finalQuizCompleted ? 1 : 0);
      const topicQuizPct = topicTotalQuizzes > 0 ? (topicCompletedQuizzes / topicTotalQuizzes) : 1;
      const topicCodingPct = tcaList.length > 0 ? (codingCompleted ? 1 : 0) : 1;

      // Component-weighted percentage: 40% subtopics, 40% quizzes, 20% coding
      let topicOverallPct = Math.round((topicSubtopicPct * 40) + (topicQuizPct * 40) + (topicCodingPct * 20));
      if (topicOverallPct > 100) topicOverallPct = 100;

      let topicStatus = 'Not Started';
      if (topicOverallPct === 100) {
        topicStatus = 'Completed';
      } else if (topicOverallPct > 0 || topicProgressRec?.status === 'In Progress') {
        topicStatus = 'In Progress';
      }

      topicsProgress.push({
        topic_id: topic.topic_id,
        title: topic.title,
        description: topic.description,
        status: topicStatus,
        progressPercentage: topicOverallPct,
        subtopicsCount: subtopics.length,
        subtopicsCompleted: topicSubtopicsCompleted,
        subtopics: topicSubtopicsList,
        prereqCompleted: prereqs.length === 0 || prereqQuizCompleted,
        prereqStatus: prereqQuizStatus,
        prereqScore: prereqQuizScore,
        prereqTotal: prereqQuizTotal,
        prereqAttemptsCount,
        finalQuizCompleted,
        finalQuizStatus,
        finalQuizScore,
        finalQuizTotal,
        finalAttemptsCount,
        codingCompleted,
        codingStatus,
        codingScore,
        codingTotal,
        last_accessed: topicProgressRec?.last_accessed || null,
        time_spent: (topicProgressRec?.time_spent || 0),
      });
    }

    // Overall Progress across accessible topics
    const completedTopicsCount = topicsProgress.filter((tp) => tp.status === 'Completed').length;
    const totalTopicsCount = topicsProgress.length;

    const overallProgress = totalTopicsCount > 0
      ? Math.round(topicsProgress.reduce((sum, tp) => sum + tp.progressPercentage, 0) / totalTopicsCount)
      : 0;

    // Recent Activity Feed
    const recentAttempts = await query(
      `SELECT qa.attempt_id, qa.quiz_type, qa.score, qa.total_marks, qa.percentage, qa.passed, qa.submitted_at,
              COALESCE(pq.title, fq.title, s.title || ' Quiz', 'Quiz Assessment') as activity_title
       FROM quiz_attempts qa
       LEFT JOIN prerequisite_quiz pq ON qa.quiz_type = 'prerequisite' AND qa.quiz_ref_id = pq.prereq_quiz_id
       LEFT JOIN final_quiz fq ON qa.quiz_type = 'final' AND qa.quiz_ref_id = fq.final_quiz_id
       LEFT JOIN subtopic_content sc ON qa.quiz_type = 'subtopic' AND qa.quiz_ref_id = sc.content_id
       LEFT JOIN subtopics s ON sc.subtopic_id = s.subtopic_id
       WHERE qa.student_id = $1 AND qa.submitted_at IS NOT NULL
       ORDER BY qa.submitted_at DESC
       LIMIT 5`,
      [student.student_id]
    );

    return {
      student: {
        name: student.name,
        email: student.email,
        roll_number: student.roll_number,
        course: student.course,
        year: student.year,
      },
      overallProgress,
      completedTopicsCount,
      totalTopicsCount,
      completedSubtopicsCount,
      totalSubtopicsCount,
      completedQuizzesCount,
      totalQuizzesCount,
      completedAssessmentsCount,
      totalAssessmentsCount,
      totalTimeSpent,
      recentActivity: recentAttempts.rows,
      topicsProgress,
    };
  },

  /**
   * Detailed topic-level progress breakdown.
   */
  getStudentTopicDetailedProgress: async (userId, topicId, userRole) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    if (userRole === 'student') {
      const hasAccess = await RoomService.checkStudentTopicAccess(userId, topicId);
      if (!hasAccess) {
        const error = new Error('Access denied. This topic is not in any of your joined rooms.');
        error.statusCode = 403;
        throw error;
      }
    }

    const topic = await TopicModel.findById(topicId);
    if (!topic) {
      const error = new Error('Topic not found.');
      error.statusCode = 404;
      throw error;
    }

    // 1. Prerequisites
    const prereqs = await PrerequisiteModel.findByTopicId(topicId);
    let prereqData = null;
    if (prereqs.length > 0) {
      const prereqQuizzes = await PrerequisiteQuizModel.findByPrereqId(prereqs[0].prereq_id);
      let quizInfo = null;
      if (prereqQuizzes.length > 0) {
        const attempts = await QuizAttemptModel.findByStudentAndQuiz(student.student_id, 'prerequisite', prereqQuizzes[0].prereq_quiz_id);
        const bestAttempt = attempts.reduce((prev, curr) => (!prev || curr.score > prev.score ? curr : prev), null);
        const latestAttempt = attempts[0] || null;

        quizInfo = {
          quiz_id: prereqQuizzes[0].prereq_quiz_id,
          title: prereqQuizzes[0].title,
          total_marks: prereqQuizzes[0].total_marks || 12,
          time_limit: prereqQuizzes[0].time_limit || 15,
          attempts_count: attempts.length,
          best_score: bestAttempt ? bestAttempt.score : null,
          latest_score: latestAttempt ? latestAttempt.score : null,
          percentage: bestAttempt ? parseFloat(bestAttempt.percentage) : 0,
          passed: bestAttempt ? bestAttempt.passed : false,
          status: attempts.length > 0 ? 'Completed' : 'Not Started',
          last_attempted: latestAttempt ? latestAttempt.submitted_at : null,
        };
      }

      prereqData = {
        prereq_id: prereqs[0].prereq_id,
        description: prereqs[0].description,
        content_completed: true,
        quiz: quizInfo,
      };
    }

    // 2. Subtopics Detailed List
    const subtopics = await SubtopicModel.findByTopicId(topicId);
    const subProgressList = await SubtopicProgressModel.findByStudentAndTopic(student.student_id, topicId);
    const subProgressMap = new Map(subProgressList.map((sp) => [sp.subtopic_id, sp]));

    const subtopicsDetail = [];
    for (const st of subtopics) {
      const sp = subProgressMap.get(st.subtopic_id);

      // Subtopic quiz attempts
      const contentRes = await query('SELECT content_id FROM subtopic_content WHERE subtopic_id = $1', [st.subtopic_id]);
      let quizDetail = null;
      if (contentRes.rows.length > 0) {
        const attempts = await QuizAttemptModel.findByStudentAndQuiz(student.student_id, 'subtopic', contentRes.rows[0].content_id);
        const bestAttempt = attempts.reduce((prev, curr) => (!prev || curr.score > prev.score ? curr : prev), null);
        const latestAttempt = attempts[0] || null;

        quizDetail = {
          content_id: contentRes.rows[0].content_id,
          attempts_count: attempts.length,
          best_score: bestAttempt ? bestAttempt.score : null,
          latest_score: latestAttempt ? latestAttempt.score : null,
          percentage: bestAttempt ? parseFloat(bestAttempt.percentage) : 0,
          status: attempts.length > 0 ? 'Completed' : 'Not Started',
        };
      }

      subtopicsDetail.push({
        subtopic_id: st.subtopic_id,
        title: st.title,
        order_index: st.order_index,
        aim_viewed: sp ? sp.aim_viewed : false,
        theory_viewed: sp ? sp.theory_viewed : false,
        video_viewed: sp ? sp.video_viewed : false,
        status: sp ? sp.status : 'Not Started',
        time_spent: sp ? sp.time_spent : 0,
        last_accessed: sp ? sp.last_accessed : null,
        quiz: quizDetail,
      });
    }

    // 3. Final Quiz
    const finalQuizzes = await FinalQuizModel.findByTopicId(topicId);
    let finalQuizDetail = null;
    if (finalQuizzes.length > 0) {
      const attempts = await QuizAttemptModel.findByStudentAndQuiz(student.student_id, 'final', finalQuizzes[0].final_quiz_id);
      const bestAttempt = attempts.reduce((prev, curr) => (!prev || curr.score > prev.score ? curr : prev), null);
      const latestAttempt = attempts[0] || null;

      finalQuizDetail = {
        final_quiz_id: finalQuizzes[0].final_quiz_id,
        title: finalQuizzes[0].title,
        total_marks: finalQuizzes[0].total_marks || 12,
        time_limit: finalQuizzes[0].time_limit || 15,
        attempts_count: attempts.length,
        best_score: bestAttempt ? bestAttempt.score : null,
        latest_score: latestAttempt ? latestAttempt.score : null,
        percentage: bestAttempt ? parseFloat(bestAttempt.percentage) : 0,
        passed: bestAttempt ? bestAttempt.passed : false,
        status: attempts.length > 0 ? 'Completed' : 'Not Started',
        last_attempted: latestAttempt ? latestAttempt.submitted_at : null,
      };
    }

    // 4. Topic Coding Assessment
    const tcaList = await TopicCodingAssessmentModel.findByTopicId(topicId);
    let codingDetail = null;
    if (tcaList.length > 0) {
      const bestSubmission = await CodingSubmissionModel.findBestSubmission(student.student_id, 'topic', tcaList[0].tca_id);
      codingDetail = {
        tca_id: tcaList[0].tca_id,
        title: tcaList[0].title,
        total_marks: tcaList[0].total_marks || 20,
        score: bestSubmission ? bestSubmission.score : null,
        percentage: bestSubmission ? parseFloat(bestSubmission.percentage) : 0,
        questions_solved: bestSubmission ? bestSubmission.questions_solved : 0,
        total_questions: bestSubmission ? bestSubmission.total_questions : 1,
        status: bestSubmission ? 'Completed' : 'Not Started',
        last_submitted: bestSubmission ? bestSubmission.submitted_at : null,
      };
    }

    return {
      topic,
      prerequisite: prereqData,
      subtopics: subtopicsDetail,
      finalQuiz: finalQuizDetail,
      codingAssessment: codingDetail,
    };
  },

  /**
   * Track student interaction with subtopic aim, theory, or video.
   */
  trackSubtopicActivity: async (userId, subtopicId, activityData) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const subtopic = await SubtopicModel.findById(subtopicId);
    if (!subtopic) {
      const error = new Error('Subtopic not found.');
      error.statusCode = 404;
      throw error;
    }

    const updatedSubProgress = await SubtopicProgressModel.upsert({
      student_id: student.student_id,
      subtopic_id: subtopicId,
      aim_viewed: activityData.aim_viewed,
      theory_viewed: activityData.theory_viewed,
      video_viewed: activityData.video_viewed,
      status: activityData.status || 'In Progress',
      time_spent: activityData.time_spent || 1,
    });

    // Touch topic progress
    await ProgressModel.upsert({
      student_id: student.student_id,
      topic_id: subtopic.topic_id,
      status: 'In Progress',
      time_spent: activityData.time_spent || 1,
    });

    return updatedSubProgress;
  },

  /**
   * Student Quiz Attempt History.
   */
  getStudentQuizHistory: async (userId) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const result = await query(
      `SELECT qa.*,
              COALESCE(pq.title, fq.title, s.title || ' Quiz', 'Quiz Assessment') as quiz_title,
              COALESCE(t1.title, t2.title, t3.title, 'General Topic') as topic_title
       FROM quiz_attempts qa
       LEFT JOIN prerequisite_quiz pq ON qa.quiz_type = 'prerequisite' AND qa.quiz_ref_id = pq.prereq_quiz_id
       LEFT JOIN prerequisite p ON pq.prereq_id = p.prereq_id
       LEFT JOIN topics t1 ON p.topic_id = t1.topic_id
       LEFT JOIN final_quiz fq ON qa.quiz_type = 'final' AND qa.quiz_ref_id = fq.final_quiz_id
       LEFT JOIN topics t2 ON fq.topic_id = t2.topic_id
       LEFT JOIN subtopic_content sc ON qa.quiz_type = 'subtopic' AND qa.quiz_ref_id = sc.content_id
       LEFT JOIN subtopics s ON sc.subtopic_id = s.subtopic_id
       LEFT JOIN topics t3 ON s.topic_id = t3.topic_id
       WHERE qa.student_id = $1 AND qa.submitted_at IS NOT NULL
       ORDER BY qa.submitted_at DESC`,
      [student.student_id]
    );

    return result.rows;
  },

  // =========================================================
  // 2. FACULTY PROGRESS & ANALYTICS ENGINE
  // =========================================================

  /**
   * Paginated list of students belonging to rooms managed by the faculty member.
   */
  getFacultyStudentsProgress: async (facultyUserId, options = {}) => {
    const faculty = await FacultyModel.findByUserId(facultyUserId);
    if (!faculty) {
      const error = new Error('Faculty profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 20;
    const offset = (page - 1) * limit;
    const search = options.search ? `%${options.search.trim()}%` : null;
    const roomId = options.roomId ? parseInt(options.roomId, 10) : null;

    // Base query for students in rooms owned by this faculty
    const params = [faculty.faculty_id];
    let whereClauses = ['r.faculty_id = $1'];

    if (roomId) {
      params.push(roomId);
      whereClauses.push(`r.room_id = $${params.length}`);
    }

    if (search) {
      params.push(search);
      whereClauses.push(`(u.name ILIKE $${params.length} OR s.roll_number ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }

    const whereStr = whereClauses.join(' AND ');

    // Total Count
    const countRes = await query(
      `SELECT COUNT(DISTINCT s.student_id) as total
       FROM student s
       JOIN users u ON s.user_id = u.user_id
       JOIN student_rooms sr ON s.student_id = sr.student_id
       JOIN rooms r ON sr.room_id = r.room_id
       WHERE ${whereStr}`,
      params
    );
    const totalStudents = parseInt(countRes.rows[0].total, 10) || 0;

    // Student Rows with room names
    params.push(limit, offset);
    const studentsRes = await query(
      `SELECT s.student_id, s.roll_number, s.course, s.year, u.name, u.email, u.last_login,
              ARRAY_AGG(DISTINCT r.room_name) as room_names,
              COUNT(DISTINCT qa.attempt_id) as quizzes_completed,
              COALESCE(AVG(qa.percentage), 0)::numeric(5,2) as avg_quiz_score,
              COUNT(DISTINCT cs.submission_id) as coding_completed,
              MAX(COALESCE(qa.submitted_at, cs.submitted_at, u.last_login)) as last_activity
       FROM student s
       JOIN users u ON s.user_id = u.user_id
       JOIN student_rooms sr ON s.student_id = sr.student_id
       JOIN rooms r ON sr.room_id = r.room_id
       LEFT JOIN quiz_attempts qa ON s.student_id = qa.student_id AND qa.submitted_at IS NOT NULL
       LEFT JOIN coding_submissions cs ON s.student_id = cs.student_id
       WHERE ${whereStr}
       GROUP BY s.student_id, s.roll_number, s.course, s.year, u.name, u.email, u.last_login
       ORDER BY u.name ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    // Calculate overall progress for each student
    const studentList = [];
    for (const row of studentsRes.rows) {
      const overallProg = await ProgressService.getStudentOverallProgress(row.user_id || (await StudentModel.findById(row.student_id))?.user_id);
      studentList.push({
        student_id: row.student_id,
        name: row.name,
        email: row.email,
        roll_number: row.roll_number,
        course: row.course,
        year: row.year,
        rooms: row.room_names,
        overallProgress: overallProg.overallProgress,
        quizzesCompleted: parseInt(row.quizzes_completed, 10) || 0,
        avgQuizScore: parseFloat(row.avg_quiz_score) || 0,
        codingCompleted: parseInt(row.coding_completed, 10) || 0,
        lastActivity: row.last_activity,
      });
    }

    return {
      students: studentList,
      pagination: {
        page,
        limit,
        total: totalStudents,
        totalPages: Math.ceil(totalStudents / limit) || 1,
      },
    };
  },

  /**
   * Detailed student progress for faculty (with authorization verification).
   */
  getFacultyStudentDetailedProgress: async (facultyUserId, studentId) => {
    const faculty = await FacultyModel.findByUserId(facultyUserId);
    if (!faculty) {
      const error = new Error('Faculty profile not found.');
      error.statusCode = 404;
      throw error;
    }

    // Verify student belongs to at least one room owned by this faculty
    const checkRes = await query(
      `SELECT 1 FROM student_rooms sr
       JOIN rooms r ON sr.room_id = r.room_id
       WHERE sr.student_id = $1 AND r.faculty_id = $2
       LIMIT 1`,
      [studentId, faculty.faculty_id]
    );

    if (checkRes.rows.length === 0) {
      const error = new Error('Access denied. This student is not enrolled in any of your rooms.');
      error.statusCode = 403;
      throw error;
    }

    const student = await StudentModel.findById(studentId);
    if (!student) {
      const error = new Error('Student not found.');
      error.statusCode = 404;
      throw error;
    }

    return ProgressService.getStudentOverallProgress(student.user_id);
  },

  /**
   * Faculty Analytics for authorized rooms and content.
   */
  getFacultyAnalytics: async (facultyUserId) => {
    const faculty = await FacultyModel.findByUserId(facultyUserId);
    if (!faculty) {
      const error = new Error('Faculty profile not found.');
      error.statusCode = 404;
      throw error;
    }

    // 1. Total Distinct Students in faculty rooms
    const studentsCountRes = await query(
      `SELECT COUNT(DISTINCT sr.student_id) as total_students
       FROM rooms r
       JOIN student_rooms sr ON r.room_id = sr.room_id
       WHERE r.faculty_id = $1`,
      [faculty.faculty_id]
    );
    const totalStudents = parseInt(studentsCountRes.rows[0].total_students, 10) || 0;

    // 2. Active Students (accessed in last 30 days)
    const activeStudentsRes = await query(
      `SELECT COUNT(DISTINCT sr.student_id) as active_students
       FROM rooms r
       JOIN student_rooms sr ON r.room_id = sr.room_id
       JOIN progress p ON sr.student_id = p.student_id
       WHERE r.faculty_id = $1 AND p.last_accessed > (CURRENT_TIMESTAMP - INTERVAL '30 days')`,
      [faculty.faculty_id]
    );
    const activeStudents = parseInt(activeStudentsRes.rows[0].active_students, 10) || 0;

    // 3. Overall Quiz Average across faculty students
    const quizAvgRes = await query(
      `SELECT COALESCE(AVG(qa.percentage), 0)::numeric(5,2) as avg_quiz_score,
              COUNT(qa.attempt_id) as total_quiz_attempts
       FROM rooms r
       JOIN student_rooms sr ON r.room_id = sr.room_id
       JOIN quiz_attempts qa ON sr.student_id = qa.student_id
       WHERE r.faculty_id = $1 AND qa.submitted_at IS NOT NULL`,
      [faculty.faculty_id]
    );

    // 4. Room Performance Breakdown
    const roomPerfRes = await query(
      `SELECT r.room_id, r.room_name, r.room_code,
              COUNT(DISTINCT sr.student_id) as student_count,
              COUNT(DISTINCT rt.topic_id) as topic_count,
              COALESCE(AVG(qa.percentage), 0)::numeric(5,2) as avg_progress
       FROM rooms r
       LEFT JOIN student_rooms sr ON r.room_id = sr.room_id
       LEFT JOIN room_topics rt ON r.room_id = rt.room_id
       LEFT JOIN quiz_attempts qa ON sr.student_id = qa.student_id AND qa.submitted_at IS NOT NULL
       WHERE r.faculty_id = $1
       GROUP BY r.room_id, r.room_name, r.room_code
       ORDER BY r.created_at DESC`,
      [faculty.faculty_id]
    );

    return {
      totalStudents,
      activeStudents,
      avgQuizScore: parseFloat(quizAvgRes.rows[0].avg_quiz_score) || 0,
      totalQuizAttempts: parseInt(quizAvgRes.rows[0].total_quiz_attempts, 10) || 0,
      roomPerformance: roomPerfRes.rows,
    };
  },

  // =========================================================
  // 3. ADMIN PROGRESS & PLATFORM ANALYTICS ENGINE
  // =========================================================

  /**
   * Paginated list of all students across the platform for Admin.
   */
  getAdminStudentsProgress: async (options = {}) => {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 20;
    const offset = (page - 1) * limit;
    const search = options.search ? `%${options.search.trim()}%` : null;
    const course = options.course || null;
    const year = options.year ? parseInt(options.year, 10) : null;

    const params = [];
    let whereClauses = [];

    if (search) {
      params.push(search);
      whereClauses.push(`(u.name ILIKE $${params.length} OR s.roll_number ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }

    if (course) {
      params.push(course);
      whereClauses.push(`s.course = $${params.length}`);
    }

    if (year) {
      params.push(year);
      whereClauses.push(`s.year = $${params.length}`);
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT COUNT(*) as total
       FROM student s
       JOIN users u ON s.user_id = u.user_id
       ${whereStr}`,
      params
    );
    const totalStudents = parseInt(countRes.rows[0].total, 10) || 0;

    params.push(limit, offset);
    const studentsRes = await query(
      `SELECT s.student_id, s.user_id, s.roll_number, s.course, s.year, u.name, u.email, u.last_login,
              COUNT(DISTINCT sr.room_id) as joined_rooms_count,
              COUNT(DISTINCT qa.attempt_id) as quizzes_completed,
              COALESCE(AVG(qa.percentage), 0)::numeric(5,2) as avg_quiz_score,
              COUNT(DISTINCT cs.submission_id) as coding_completed,
              MAX(COALESCE(qa.submitted_at, cs.submitted_at, u.last_login)) as last_activity
       FROM student s
       JOIN users u ON s.user_id = u.user_id
       LEFT JOIN student_rooms sr ON s.student_id = sr.student_id
       LEFT JOIN quiz_attempts qa ON s.student_id = qa.student_id AND qa.submitted_at IS NOT NULL
       LEFT JOIN coding_submissions cs ON s.student_id = cs.student_id
       ${whereStr}
       GROUP BY s.student_id, s.user_id, s.roll_number, s.course, s.year, u.name, u.email, u.last_login
       ORDER BY u.name ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const studentList = [];
    for (const row of studentsRes.rows) {
      const overallProg = await ProgressService.getStudentOverallProgress(row.user_id);
      studentList.push({
        student_id: row.student_id,
        user_id: row.user_id,
        name: row.name,
        email: row.email,
        roll_number: row.roll_number,
        course: row.course,
        year: row.year,
        roomsCount: parseInt(row.joined_rooms_count, 10) || 0,
        overallProgress: overallProg.overallProgress,
        quizzesCompleted: parseInt(row.quizzes_completed, 10) || 0,
        avgQuizScore: parseFloat(row.avg_quiz_score) || 0,
        codingCompleted: parseInt(row.coding_completed, 10) || 0,
        lastActivity: row.last_activity,
      });
    }

    return {
      students: studentList,
      pagination: {
        page,
        limit,
        total: totalStudents,
        totalPages: Math.ceil(totalStudents / limit) || 1,
      },
    };
  },

  /**
   * Detailed student progress for Admin (unrestricted global access).
   */
  getAdminStudentDetailedProgress: async (studentId) => {
    const student = await StudentModel.findById(studentId);
    if (!student) {
      const error = new Error('Student not found.');
      error.statusCode = 404;
      throw error;
    }

    return ProgressService.getStudentOverallProgress(student.user_id);
  },

  /**
   * Platform-wide Analytics for Admin.
   */
  getAdminPlatformAnalytics: async () => {
    const [studentsRes, facultyRes, roomsRes, topicsRes, subtopicsRes, quizStatsRes] = await Promise.all([
      query('SELECT COUNT(*) as count FROM student'),
      query('SELECT COUNT(*) as count FROM faculty'),
      query('SELECT COUNT(*) as count FROM rooms'),
      query('SELECT COUNT(*) as count FROM topics'),
      query('SELECT COUNT(*) as count FROM subtopics'),
      query(`SELECT COUNT(*) as attempts, COALESCE(AVG(percentage), 0)::numeric(5,2) as avg_score FROM quiz_attempts WHERE submitted_at IS NOT NULL`),
    ]);

    const activeStudentsRes = await query(
      `SELECT COUNT(DISTINCT student_id) as count
       FROM progress
       WHERE last_accessed > (CURRENT_TIMESTAMP - INTERVAL '30 days')`
    );

    return {
      totalStudents: parseInt(studentsRes.rows[0].count, 10) || 0,
      totalFaculty: parseInt(facultyRes.rows[0].count, 10) || 0,
      totalRooms: parseInt(roomsRes.rows[0].count, 10) || 0,
      totalTopics: parseInt(topicsRes.rows[0].count, 10) || 0,
      totalSubtopics: parseInt(subtopicsRes.rows[0].count, 10) || 0,
      activeStudents: parseInt(activeStudentsRes.rows[0].count, 10) || 0,
      totalQuizAttempts: parseInt(quizStatsRes.rows[0].attempts, 10) || 0,
      avgQuizScore: parseFloat(quizStatsRes.rows[0].avg_score) || 0,
    };
  },
};

export default ProgressService;
