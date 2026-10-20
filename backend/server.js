// ──────────────────────────────────────────────
// Server Entry Point
// ──────────────────────────────────────────────
// Starts the HTTP server on the configured PORT.
// ──────────────────────────────────────────────

import app from './app.js';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';

dotenv.config();

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  // Test PostgreSQL connection
  const isConnected = await testConnection();
  if (!isConnected) {
    console.warn('⚠️ Warning: PostgreSQL database is not reachable. Check your credentials in .env.');
  }

  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
