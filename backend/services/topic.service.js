// ──────────────────────────────────────────────
// Topic Service — Business Logic
// ──────────────────────────────────────────────

import TopicModel from '../models/topic.model.js';
import SubtopicModel from '../models/subtopic.model.js';
import SubtopicContentModel from '../models/subtopicContent.model.js';
import TopicFeedbackModel from '../models/topicFeedback.model.js';
import ProgressModel from '../models/progress.model.js';
import StudentModel from '../models/student.model.js';
import PrerequisiteModel from '../models/prerequisite.model.js';
import RoomService from './room.service.js';

const TopicService = {
  // ── Topic Operations ────────────────────────
  createTopic: async ({ title, description }) => {
    return TopicModel.create({ title, description });
  },

  getAllTopics: async () => {
    return TopicModel.findAll();
  },

  getTopicsForStudent: async (userId) => {
    return RoomService.getStudentTopics(userId);
  },

  getTopicById: async (topicId, userRole = null) => {
    const topic = await TopicModel.findById(topicId);
    if (!topic) {
      const error = new Error('Topic not found.');
      error.statusCode = 404;
      throw error;
    }
    const onlyPublished = userRole === 'student';
    const subtopics = await SubtopicModel.findByTopicId(topicId, { onlyPublished });
    return {
      ...topic,
      subtopics,
    };
  },

  getTopicSubtopics: async (topicId, userRole = null) => {
    const topic = await TopicModel.findById(topicId);
    if (!topic) {
      const error = new Error('Topic not found.');
      error.statusCode = 404;
      throw error;
    }
    const onlyPublished = userRole === 'student';
    return SubtopicModel.findByTopicId(topicId, { onlyPublished });
  },

  updateTopic: async (topicId, { title, description }) => {
    await TopicService.getTopicById(topicId);
    return TopicModel.update(topicId, { title, description });
  },

  deleteTopic: async (topicId) => {
    await TopicService.getTopicById(topicId);
    return TopicModel.deleteById(topicId);
  },

  // ── Subtopic Operations ─────────────────────
  createSubtopic: async (topicId, { title, order_index, is_published }) => {
    await TopicService.getTopicById(topicId);
    return SubtopicModel.create({ topic_id: topicId, title, order_index, is_published });
  },

  getSubtopicById: async (subtopicId, userRole = null) => {
    const subtopic = await SubtopicModel.findById(subtopicId);
    if (!subtopic || (userRole === 'student' && !subtopic.is_published)) {
      const error = new Error('Subtopic not found.');
      error.statusCode = 404;
      throw error;
    }
    const content = await SubtopicContentModel.findBySubtopicId(subtopicId);
    return {
      ...subtopic,
      content,
    };
  },

  updateSubtopic: async (subtopicId, data) => {
    await TopicService.getSubtopicById(subtopicId);
    return SubtopicModel.update(subtopicId, data);
  },

  deleteSubtopic: async (subtopicId) => {
    await TopicService.getSubtopicById(subtopicId);
    return SubtopicModel.deleteById(subtopicId);
  },

  // ── Subtopic Content Operations ─────────────
  getSubtopicContent: async (subtopicId, userRole = null) => {
    const subtopic = await TopicService.getSubtopicById(subtopicId, userRole);
    const content = await SubtopicContentModel.findBySubtopicId(subtopicId);
    return content || { aim: '', theory: '', video_explanation_url: null, subtopic_id: subtopic.subtopic_id };
  },

  upsertContent: async (subtopicId, { aim, theory, video_explanation_url }) => {
    await TopicService.getSubtopicById(subtopicId);
    const existing = await SubtopicContentModel.findBySubtopicId(subtopicId);
    if (existing) {
      return SubtopicContentModel.update(existing.content_id, { aim, theory, video_explanation_url: video_explanation_url || null });
    }
    return SubtopicContentModel.create({ subtopic_id: subtopicId, aim, theory, video_explanation_url: video_explanation_url || null });
  },

  publishSubtopicContent: async (subtopicId) => {
    await TopicService.getSubtopicById(subtopicId);
    return SubtopicModel.setPublishStatus(subtopicId, true);
  },

  unpublishSubtopicContent: async (subtopicId) => {
    await TopicService.getSubtopicById(subtopicId);
    return SubtopicModel.setPublishStatus(subtopicId, false);
  },

  // ── Topic Feedback Operations ───────────────
  createFeedback: async (userId, topicId, { rating, comment }) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    await TopicService.getTopicById(topicId);

    const existing = await TopicFeedbackModel.findByStudentAndTopic(student.student_id, topicId);
    if (existing) {
      const error = new Error('You have already submitted feedback for this topic.');
      error.statusCode = 409;
      throw error;
    }

    return TopicFeedbackModel.create({
      student_id: student.student_id,
      topic_id: topicId,
      rating,
      comment,
    });
  },

  getTopicFeedback: async (topicId) => {
    await TopicService.getTopicById(topicId);
    return TopicFeedbackModel.findByTopicId(topicId);
  },

  updateFeedback: async (userId, topicId, { rating, comment }) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const existing = await TopicFeedbackModel.findByStudentAndTopic(student.student_id, topicId);
    if (!existing) {
      const error = new Error('Feedback not found.');
      error.statusCode = 404;
      throw error;
    }

    return TopicFeedbackModel.update(student.student_id, topicId, { rating, comment });
  },

  deleteFeedback: async (userId, topicId) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const existing = await TopicFeedbackModel.findByStudentAndTopic(student.student_id, topicId);
    if (!existing) {
      const error = new Error('Feedback not found.');
      error.statusCode = 404;
      throw error;
    }

    return TopicFeedbackModel.deleteByStudentAndTopic(student.student_id, topicId);
  },

  // ── Progress Operations ──────────────────────
  updateProgress: async (userId, topicId, { status, time_spent }) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    await TopicService.getTopicById(topicId);

    return ProgressModel.upsert({
      student_id: student.student_id,
      topic_id: topicId,
      status,
      time_spent,
    });
  },

  getStudentProgress: async (userId) => {
    const student = await StudentModel.findByUserId(userId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      throw error;
    }

    return ProgressModel.findByStudentId(student.student_id);
  },

  // ── Prerequisite Operations ─────────────────
  getTopicPrerequisites: async (topicId) => {
    const topic = await TopicModel.findById(topicId);
    if (!topic) {
      const error = new Error('Topic not found.');
      error.statusCode = 404;
      throw error;
    }
    return PrerequisiteModel.findByTopicId(topicId);
  },
};

export default TopicService;
