// ──────────────────────────────────────────────
// Passport.js Configuration
// ──────────────────────────────────────────────
// Local Strategy: authenticates via email + password.
// Enforces approval status: pending/rejected accounts cannot log in.
// Session serialisation stores user_id; deserialisation
// fetches the full user record from the database.
// ──────────────────────────────────────────────

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import UserModel from '../models/user.model.js';

/**
 * Initialise Passport with Local Strategy and session support.
 */
const configurePassport = () => {
  // ── Local Strategy ───────────────────────────
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          // Normalize email consistently
          const normalizedEmail = (email || '').toLowerCase().trim();

          // 1. Find user by email (includes password_hash for comparison)
          const user = await UserModel.findByEmail(normalizedEmail);

          if (!user) {
            return done(null, false, { message: 'Invalid email or password.' });
          }

          // 2. Compare submitted password with stored hash
          const isMatch = await bcrypt.compare(password, user.password_hash);

          if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password.' });
          }

          // 3. Enforce Approval Status
          if (user.approval_status === 'pending') {
            return done(null, false, {
              status: 'pending',
              message: 'Your account is awaiting administrator approval. Please wait until your registration is approved.',
            });
          }

          if (user.approval_status === 'rejected') {
            return done(null, false, {
              status: 'rejected',
              message: `Your account registration was rejected. Reason: ${user.rejection_reason || 'Please contact administration.'}`,
            });
          }

          // 4. Update last_login timestamp
          await UserModel.updateLastLogin(user.user_id);

          // 5. Strip password_hash before passing on
          const { password_hash, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  // ── Serialise — store user_id in the session ─
  passport.serializeUser((user, done) => {
    done(null, user.user_id);
  });

  // ── Deserialise — fetch user from DB on each request ─
  passport.deserializeUser(async (userId, done) => {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        return done(null, false);
      }

      // Check if user account was subsequently rejected or revoked
      if (user.approval_status === 'rejected') {
        return done(null, false);
      }

      // Never expose password_hash to the request object
      const { password_hash, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (err) {
      return done(err);
    }
  });
};

export default configurePassport;
