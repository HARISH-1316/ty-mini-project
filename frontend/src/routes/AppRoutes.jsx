// ──────────────────────────────────────────────
// AppRoutes — Application Route Registry
// ──────────────────────────────────────────────

import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import Dashboard from '../pages/Dashboard';

// Error Pages
import Forbidden from '../pages/Forbidden';
import NotFound from '../pages/NotFound';

// Layouts
import StudentLayout from '../layouts/StudentLayout';
import FacultyLayout from '../layouts/FacultyLayout';
import AdminLayout from '../layouts/AdminLayout';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import MyRooms from '../pages/student/MyRooms';
import JoinRoom from '../pages/student/JoinRoom';
import RoomDetails from '../pages/student/RoomDetails';
import TopicDetails from '../pages/student/TopicDetails';
import StudentProgress from '../pages/student/StudentProgress';

// Faculty Pages
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import FacultyRooms from '../pages/faculty/FacultyRooms';
import RoomManagement from '../pages/faculty/RoomManagement';
import TopicManagement from '../pages/faculty/TopicManagement';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import RoleManagement from '../pages/admin/RoleManagement';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import { StudentRoute, FacultyRoute, AdminRoute } from './RoleRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Workspaces */}
      <Route element={<ProtectedRoute />}>
        {/* Smart Dashboard Redirect */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Student Workspace */}
        <Route element={<StudentRoute />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/rooms" element={<MyRooms />} />
            <Route path="/student/join-room" element={<JoinRoom />} />
            <Route path="/student/rooms/:roomId" element={<RoomDetails />} />
            <Route path="/student/topics" element={<TopicManagement />} />
            <Route path="/student/topics/:topicId" element={<TopicDetails />} />
            <Route path="/student/progress" element={<StudentProgress />} />
          </Route>
        </Route>

        {/* Faculty Workspace */}
        <Route element={<FacultyRoute />}>
          <Route element={<FacultyLayout />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/rooms" element={<FacultyRooms />} />
            <Route path="/faculty/rooms/:roomId" element={<RoomManagement />} />
            <Route path="/faculty/topics" element={<TopicManagement />} />
          </Route>
        </Route>

        {/* Admin Workspace */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/roles" element={<RoleManagement />} />
          </Route>
        </Route>
      </Route>

      {/* Error & Root Fallback */}
      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
