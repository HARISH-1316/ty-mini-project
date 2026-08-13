// ──────────────────────────────────────────────
// Database Initialisation Script
// ──────────────────────────────────────────────
// Reads schema.sql and seed.sql, then executes
// them against the configured database.
// Usage: node database/init.js
// ──────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, testConnection } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const init = async () => {
  console.log('🔧 Initialising database...\n');

  // 1. Test connection
  const connected = await testConnection();
  if (!connected) {
    console.error('Cannot proceed without a database connection.');
    process.exit(1);
  }

  // 2. Run schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  try {
    await pool.query(schemaSql);
    console.log('✅ Schema created successfully.\n');
  } catch (err) {
    console.error('❌ Schema creation failed:', err.message);
    process.exit(1);
  }

  // 3. Run seed.sql
  const seedPath = path.join(__dirname, 'seed.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf-8');

  try {
    await pool.query(seedSql);
    console.log('✅ Seed data inserted successfully.\n');
  } catch (err) {
    console.error('❌ Seed insertion failed:', err.message);
    process.exit(1);
  }

  // 4. Verify table count
  const result = await pool.query(
    `SELECT COUNT(*) FROM information_schema.tables
     WHERE table_schema = 'public'`
  );
  console.log(`📊 Total tables in database: ${result.rows[0].count}`);

  await pool.end();
  console.log('\n🎉 Database initialisation complete!');
};

init();
