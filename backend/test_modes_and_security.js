import LabAssessmentService from './services/labAssessment.service.js';
import LaSelectedQuestionModel from './models/laSelectedQuestion.model.js';
import LaAllocationModel from './models/laAllocation.model.js';
import AssessmentTopicModel from './models/laAssessmentTopic.model.js';
import UserModel from './models/user.model.js';
import FacultyModel from './models/faculty.model.js';
import StudentModel from './models/student.model.js';
import { query } from './config/database.js';

async function runTests() {
  console.log('🧪 Testing Mode A, Mode B, Mode C, Difficulty Marks & Student Visibility...');

  const facultyUser = await UserModel.findByEmail('teacher@wcelab.ac.in');
  const faculty = await FacultyModel.findByUserId(facultyUser.user_id);
  const studentUser = await UserModel.findByEmail('student1@wcelab.ac.in');
  const student = await StudentModel.findByUserId(studentUser.user_id);

  // 1. Test Mode A: Faculty Selects Specific Questions
  console.log('\n--- 1. Testing Mode A: Specific Questions ---');
  const start = new Date(Date.now() - 60000).toISOString();
  const end = new Date(Date.now() + 86400000).toISOString();

  const labA = await LabAssessmentService.createAssessment(facultyUser.user_id, {
    title: 'Mode A Unit Test Lab',
    description: 'Specific questions mode',
    start_time: start,
    end_time: end,
    duration: 60,
    num_questions: 2,
    topic_ids: [2], // Arrays
    allocation_mode: 'specific',
    selected_question_ids: [2, 6], // Specific question IDs from Arrays
  });
  console.log('✅ Created Mode A assessment ID:', labA.lab_id);

  // Verify selected questions saved
  const selected = await LaSelectedQuestionModel.findByLabId(labA.lab_id);
  console.log('✅ Mode A selected questions count:', selected.length);
  if (selected.length !== 2) throw new Error('Expected 2 selected questions');

  // Publish Mode A
  await LabAssessmentService.publishAssessment(facultyUser.user_id, labA.lab_id);
  console.log('✅ Mode A published successfully');

  // Student starts Mode A
  const startResultA = await LabAssessmentService.startOrResumeLab(studentUser.user_id, labA.lab_id);
  console.log('✅ Student started Mode A assessment. Questions allocated:', startResultA.questions.length);
  const allocatedIdsA = startResultA.questions.map(q => q.lab_question_id).sort();
  if (JSON.stringify(allocatedIdsA) !== JSON.stringify([2, 6].sort())) {
    throw new Error(`Mode A allocation mismatch! Expected [2, 6], got ${JSON.stringify(allocatedIdsA)}`);
  }
  console.log('✅ Mode A gave exact faculty-selected questions [2, 6] to student');

  // Verify student view does NOT expose marks, difficulty, or hidden test cases
  for (const q of startResultA.questions) {
    if (q.marks !== undefined) throw new Error('Security leak: marks exposed to student!');
    if (q.difficulty !== undefined) throw new Error('Security leak: difficulty exposed to student!');
    if (q.testCases && q.testCases.some(tc => tc.is_hidden)) {
      throw new Error('Security leak: hidden test cases exposed to student!');
    }
  }
  console.log('✅ Mode A security check: marks, difficulty, and hidden cases are shielded from students');

  // 2. Test Mode B: Automatic Random Allocation
  console.log('\n--- 2. Testing Mode B: Automatic Random Allocation ---');
  const labB = await LabAssessmentService.createAssessment(facultyUser.user_id, {
    title: 'Mode B Unit Test Lab',
    description: 'Random allocation mode',
    start_time: start,
    end_time: end,
    duration: 60,
    num_questions: 3,
    topic_ids: [3], // Strings (5 questions in pool)
    allocation_mode: 'random',
  });
  await LabAssessmentService.publishAssessment(facultyUser.user_id, labB.lab_id);
  console.log('✅ Created and published Mode B assessment ID:', labB.lab_id);

  const startResultB = await LabAssessmentService.startOrResumeLab(studentUser.user_id, labB.lab_id);
  if (startResultB.questions.length !== 3) throw new Error('Expected 3 random questions');
  const uniqueIdsB = new Set(startResultB.questions.map(q => q.lab_question_id));
  if (uniqueIdsB.size !== 3) throw new Error('Expected 3 unique questions in random allocation');
  console.log('✅ Mode B allocated 3 unique random questions from Strings pool');

  // Test persistence on resume
  const resumeResultB = await LabAssessmentService.startOrResumeLab(studentUser.user_id, labB.lab_id);
  const resumeIds = resumeResultB.questions.map(q => q.lab_question_id);
  if (JSON.stringify(resumeIds) !== JSON.stringify(startResultB.questions.map(q => q.lab_question_id))) {
    throw new Error('Mode B persistence failure: questions changed on resume!');
  }
  console.log('✅ Mode B allocation is immutable on resume');

  // 3. Test Mode C: Hybrid Allocation
  console.log('\n--- 3. Testing Mode C: Hybrid Allocation ---');
  const labC = await LabAssessmentService.createAssessment(facultyUser.user_id, {
    title: 'Mode C Unit Test Lab',
    description: 'Hybrid allocation mode',
    start_time: start,
    end_time: end,
    duration: 60,
    num_questions: 2,
    topic_ids: [4], // Linked Lists
    allocation_mode: 'hybrid',
    manual_allocations: [
      {
        student_id: student.student_id,
        question_ids: [13, 14], // Manually assigned to student
      },
    ],
  });
  await LabAssessmentService.publishAssessment(facultyUser.user_id, labC.lab_id);
  console.log('✅ Created and published Mode C assessment ID:', labC.lab_id);

  const startResultC = await LabAssessmentService.startOrResumeLab(studentUser.user_id, labC.lab_id);
  const allocatedIdsC = startResultC.questions.map(q => q.lab_question_id).sort();
  if (JSON.stringify(allocatedIdsC) !== JSON.stringify([13, 14].sort())) {
    throw new Error(`Mode C manual allocation mismatch! Expected [13, 14], got ${JSON.stringify(allocatedIdsC)}`);
  }
  console.log('✅ Mode C preserved manual assignment [13, 14] for student');

  // Clean up test assessments
  await query('DELETE FROM lab_assessment WHERE lab_id IN ($1, $2, $3)', [labA.lab_id, labB.lab_id, labC.lab_id]);
  console.log('\n🎉 ALL ALLOCATION MODE & SECURITY TESTS PASSED PERFECTLY!\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
