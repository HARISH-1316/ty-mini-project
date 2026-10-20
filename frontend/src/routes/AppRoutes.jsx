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
import TopicLayout from '../layouts/TopicLayout';
import SubtopicLayout from '../layouts/SubtopicLayout';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import MyRooms from '../pages/student/MyRooms';
import JoinRoom from '../pages/student/JoinRoom';
import RoomDetails from '../pages/student/RoomDetails';
import TopicDetails from '../pages/student/TopicDetails';
import StudentProgress from '../pages/student/StudentProgress';
import LabAssessmentList from '../pages/student/LabAssessmentList';
import LabAssessmentWorkspace from '../pages/student/LabAssessmentWorkspace';
import LabAssessmentResult from '../pages/student/LabAssessmentResult';

// Student Topic Section Pages
import IntroductionPage from '../pages/student/topic/IntroductionPage';
import CoPosPage from '../pages/student/topic/CoPosPage';
import PrerequisitesPage from '../pages/student/topic/PrerequisitesPage';
import PrerequisiteQuizPage from '../pages/student/topic/PrerequisiteQuizPage';
import SubtopicsListPage from '../pages/student/topic/SubtopicsListPage';
import FinalQuizPage from '../pages/student/topic/FinalQuizPage';
import FinalAssessmentPage from '../pages/student/topic/FinalAssessmentPage';
import FeedbackPage from '../pages/student/topic/FeedbackPage';

// Student Subtopic Section Pages
import AimPage from '../pages/student/subtopic/AimPage';
import TheoryPage from '../pages/student/subtopic/TheoryPage';
import QuizPage from '../pages/student/subtopic/QuizPage';
import CodingAssessmentPage from '../pages/student/subtopic/CodingAssessmentPage';

// Faculty Pages
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import FacultyRooms from '../pages/faculty/FacultyRooms';
import RoomManagement from '../pages/faculty/RoomManagement';
import TopicManagement from '../pages/faculty/TopicManagement';
import QuizManagement from '../pages/faculty/QuizManagement';
import FacultyStudents from '../pages/faculty/FacultyStudents';
import FacultyAnalytics from '../pages/faculty/FacultyAnalytics';
import LabAssessmentManagement from '../pages/faculty/LabAssessmentManagement';
import CreateLabAssessment from '../pages/faculty/CreateLabAssessment';
import LabAssessmentResults from '../pages/faculty/LabAssessmentResults';
import LabQuestionBank from '../pages/faculty/LabQuestionBank';
import McqQuestionBank from '../pages/faculty/McqQuestionBank';

import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import RoleManagement from '../pages/admin/RoleManagement';
import AccountApprovals from '../pages/admin/AccountApprovals';
import AdminProgress from '../pages/admin/AdminProgress';

// Shared Progress Inspector
import StudentProgressDetail from '../pages/common/StudentProgressDetail';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import { StudentRoute, FacultyRoute, AdminRoute } from './RoleRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Workspaces */}
      <Route element={<ProtectedRoute />}>
        {/* Smart Dashboard Redirect */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Student Workspace */}
        <Route element={<StudentRoute />}>
          {/* Standard student pages with sidebar layout */}
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/rooms" element={<MyRooms />} />
            <Route path="/student/join-room" element={<JoinRoom />} />
            <Route path="/student/rooms/:roomId" element={<RoomDetails />} />
            <Route path="/student/progress" element={<StudentProgress />} />
            <Route path="/student/lab-assessments" element={<LabAssessmentList />} />
            <Route path="/student/lab-assessments/:labId" element={<LabAssessmentWorkspace />} />
            <Route path="/student/lab-assessments/:labId/result" element={<LabAssessmentResult />} />
          </Route>

          {/* Dedicated Topic Page — Virtual Labs Layout */}
          <Route path="/student/topics/:topicId" element={<TopicLayout />}>
            <Route index element={<Navigate to="introduction" replace />} />
            <Route path="introduction" element={<IntroductionPage />} />
            <Route path="co-pos" element={<CoPosPage />} />
            <Route path="prerequisites" element={<PrerequisitesPage />} />
            <Route path="prerequisite-quiz" element={<PrerequisiteQuizPage />} />
            <Route path="subtopics" element={<SubtopicsListPage />} />
            <Route path="final-quiz" element={<FinalQuizPage />} />
            <Route path="final-assessment" element={<FinalAssessmentPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
          </Route>

          {/* Dedicated Subtopic Page — Virtual Labs Layout */}
          <Route path="/student/topics/:topicId/subtopics/:subtopicId" element={<SubtopicLayout />}>
            <Route index element={<Navigate to="aim" replace />} />
            <Route path="aim" element={<AimPage />} />
            <Route path="theory" element={<TheoryPage />} />
            <Route path="quiz" element={<QuizPage />} />
            <Route path="coding-assessment" element={<CodingAssessmentPage />} />
          </Route>
        </Route>

        {/* Faculty Workspace */}
        <Route element={<FacultyRoute />}>
          <Route element={<FacultyLayout />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/rooms" element={<FacultyRooms />} />
            <Route path="/faculty/rooms/:roomId" element={<RoomManagement />} />
            <Route path="/faculty/topics" element={<TopicManagement />} />
            <Route path="/faculty/topics/:topicId/quizzes" element={<QuizManagement />} />
            <Route path="/faculty/students" element={<FacultyStudents />} />
            <Route path="/faculty/students/:studentId/progress" element={<StudentProgressDetail />} />
            <Route path="/faculty/analytics" element={<FacultyAnalytics />} />
            <Route path="/faculty/lab-assessments" element={<LabAssessmentManagement />} />
            <Route path="/faculty/lab-assessments/:labId" element={<CreateLabAssessment />} />
            <Route path="/faculty/lab-assessments/:labId/results" element={<LabAssessmentResults />} />
            <Route path="/faculty/lab-questions" element={<LabQuestionBank />} />
            <Route path="/faculty/mcq-bank" element={<McqQuestionBank />} />
          </Route>
        </Route>

        {/* Admin Workspace */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/approvals" element={<AccountApprovals />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/roles" element={<AccountApprovals />} />
            <Route path="/admin/progress" element={<AdminProgress />} />
            <Route path="/admin/students/:studentId/progress" element={<StudentProgressDetail />} />
            <Route path="/admin/lab-assessments" element={<LabAssessmentManagement />} />
            <Route path="/admin/lab-assessments/:labId" element={<CreateLabAssessment />} />
            <Route path="/admin/lab-assessments/:labId/results" element={<LabAssessmentResults />} />
            <Route path="/admin/lab-questions" element={<LabQuestionBank />} />
            <Route path="/admin/mcq-bank" element={<McqQuestionBank />} />
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
