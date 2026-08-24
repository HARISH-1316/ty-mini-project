// ──────────────────────────────────────────────
// Express Application Setup
// ──────────────────────────────────────────────
// Assembles all middleware, Passport, session store,
// routes, and the global error handler in correct order.
// ──────────────────────────────────────────────

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import passport from 'passport';
import dotenv from 'dotenv';

import { pool } from './config/database.js';
import configurePassport from './config/passport.js';
import routes from './routes/index.js';
import globalErrorHandler from './middlewares/error.middleware.js';

// Load environment variables
dotenv.config();

const app = express();
const PgSession = connectPgSimple(session);

// ── Security Headers ─────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true, // Allow cookies to be sent cross-origin
  }),
);

// ── Body Parsing ─────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Session Configuration (PostgreSQL store) ──
app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,                                          // Prevent client-side JS access
      secure: process.env.NODE_ENV === 'production',           // HTTPS only in production
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
);

// ── Passport Initialisation ──────────────────
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// ── API Routes ───────────────────────────────
app.use('/api', routes);

// ── Health Check ─────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running.' });
});

// ── Global Error Handler (must be last) ──────
app.use(globalErrorHandler);

export default app;
