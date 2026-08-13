// ──────────────────────────────────────────────
// Server Entry Point
// ──────────────────────────────────────────────
// Starts the HTTP server on the configured PORT.
// ──────────────────────────────────────────────

import app from './app.js';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Test PostgreSQL connection
  const isConnected = await testConnection();
  if (!isConnected) {
    console.warn('⚠️ Warning: PostgreSQL database is not reachable. Check your credentials in .env.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
