// ──────────────────────────────────────────────
// Role-Based Route Guards
// ──────────────────────────────────────────────

import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const RoleRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Checking role permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export const StudentRoute = () => <RoleRoute allowedRoles={['student']} />;
export const FacultyRoute = () => <RoleRoute allowedRoles={['faculty', 'admin']} />;
export const AdminRoute = () => <RoleRoute allowedRoles={['admin']} />;

export default RoleRoute;
