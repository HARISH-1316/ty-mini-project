// ──────────────────────────────────────────────
// Dashboard Redirect Component
// ──────────────────────────────────────────────
// Automatically redirects authenticated users to their
// role-specific workspace dashboard:
//  - student -> /student/dashboard
//  - faculty -> /faculty/dashboard
//  - admin   -> /admin/dashboard
// ──────────────────────────────────────────────

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'student') {
        navigate('/student/dashboard', { replace: true });
      } else if (user.role === 'faculty') {
        navigate('/faculty/dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return <LoadingSpinner label="Redirecting to your workspace dashboard..." />;
};

export default Dashboard;
