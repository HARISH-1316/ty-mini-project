// ──────────────────────────────────────────────
// Auth Context — Global Authentication State
// ──────────────────────────────────────────────
// Manages authentication state via session cookies.
// On mount, calls GET /api/auth/me to restore session.
// ──────────────────────────────────────────────

import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { signupApi, loginApi, logoutApi, getMeApi } from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on mount ─────────────────
  const refreshUser = useCallback(async () => {
    try {
      const data = await getMeApi();
      setUser(data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // ── Login ────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const data = await loginApi(credentials);
    setUser(data.data.user);
    return data;
  }, []);

  // ── Signup ───────────────────────────────────
  const signup = useCallback(async (formData) => {
    const data = await signupApi(formData);
    return data;
  }, []);

  // ── Logout ───────────────────────────────────
  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
  }, []);

  // ── Memoised context value ───────────────────
  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      refreshUser,
    }),
    [user, loading, login, signup, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
