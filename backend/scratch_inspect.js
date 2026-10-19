import { query, pool } from './config/database.js';

async function check() {
  try {
    const topicsRes = await query('SELECT topic_id, title FROM topics ORDER BY topic_id');
    console.log('--- ALL TOPICS IN topics TABLE ---');
    console.table(topicsRes.rows);

    const subtopicsRes = await query('SELECT subtopic_id, topic_id, title, order_index FROM subtopics ORDER BY topic_id, order_index');
    console.log('--- ALL SUBTOPICS IN subtopics TABLE ---');
    console.table(subtopicsRes.rows);

    const questionsRes = await query(`
      SELECT topic_id, subtopic_id, COUNT(*) as count 
      FROM lab_coding_questions 
      GROUP BY topic_id, subtopic_id
    `);
    console.log('--- QUESTIONS GROUPED BY topic_id, subtopic_id ---');
    console.table(questionsRes.rows);

  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
check();
