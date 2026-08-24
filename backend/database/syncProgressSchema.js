// ──────────────────────────────────────────────
// Progress & Coding Submissions Schema Sync & Verification Script
// ──────────────────────────────────────────────

import { pool, testConnection } from '../config/database.js';
import ProgressService from '../services/progress.service.js';

const syncAndVerifyProgress = async () => {
  console.log('🔄 Syncing Progress & Coding Submission Tables in PostgreSQL...');

  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Database connection failed.');
    process.exit(1);
  }

  try {
    // 1. Create subtopic_progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subtopic_progress (
        subtopic_progress_id SERIAL PRIMARY KEY,
        student_id INT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
        subtopic_id INT NOT NULL REFERENCES subtopics(subtopic_id) ON DELETE CASCADE,
        aim_viewed BOOLEAN DEFAULT FALSE,
        theory_viewed BOOLEAN DEFAULT FALSE,
        video_viewed BOOLEAN DEFAULT FALSE,
        status progress_status DEFAULT 'Not Started',
        time_spent INT DEFAULT 0,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, subtopic_id)
      );

      DO $$ BEGIN
        CREATE TYPE assessment_type_enum AS ENUM ('topic', 'subtopic', 'lab', 'assignment');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS coding_submissions (
        submission_id SERIAL PRIMARY KEY,
        student_id INT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
        assessment_type assessment_type_enum NOT NULL DEFAULT 'topic',
        assessment_ref_id INT NOT NULL,
        question_id INT,
        source_code TEXT,
        language VARCHAR(50) DEFAULT 'cpp',
        status VARCHAR(50) DEFAULT 'Completed',
        score INT DEFAULT 0,
        total_marks INT DEFAULT 0,
        questions_solved INT DEFAULT 0,
        total_questions INT DEFAULT 0,
        percentage NUMERIC(5,2) DEFAULT 0,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_subtopic_progress_student ON subtopic_progress(student_id);
      CREATE INDEX IF NOT EXISTS idx_subtopic_progress_subtopic ON subtopic_progress(subtopic_id);
      CREATE INDEX IF NOT EXISTS idx_coding_submissions_student ON coding_submissions(student_id);
      CREATE INDEX IF NOT EXISTS idx_coding_submissions_ref ON coding_submissions(assessment_type, assessment_ref_id);
    `);

    console.log('✅ Tables subtopic_progress and coding_submissions verified/created successfully.');

    // 2. Test Admin Platform Analytics
    const adminAnalytics = await ProgressService.getAdminPlatformAnalytics();
    console.log('\n📊 Platform Analytics Test:');
    console.log(`   Total Students: ${adminAnalytics.totalStudents}`);
    console.log(`   Total Faculty: ${adminAnalytics.totalFaculty}`);
    console.log(`   Total Rooms: ${adminAnalytics.totalRooms}`);
    console.log(`   Total Topics: ${adminAnalytics.totalTopics}`);
    console.log(`   Total Subtopics: ${adminAnalytics.totalSubtopics}`);
    console.log(`   Total Quiz Submissions: ${adminAnalytics.totalQuizAttempts}`);
    console.log(`   Average Quiz Score: ${adminAnalytics.avgQuizScore}%`);

    console.log('\n✅ All Progress & Analytics Engine checks passed!');
  } catch (err) {
    console.error('❌ Error during schema sync / verification:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

syncAndVerifyProgress();
