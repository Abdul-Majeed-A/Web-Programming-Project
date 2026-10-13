import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Features from './pages/Features';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyProjects from './pages/student/MyProjects';
import CreateProject from './pages/student/CreateProject';
import EditProject from './pages/student/EditProject';
import ProjectDetails from './pages/student/ProjectDetails';
import ReviewSchedule from './pages/student/ReviewSchedule';
import StudentNotifications from './pages/student/StudentNotifications';
import StudentProfile from './pages/student/StudentProfile';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import AssignedProjects from './pages/faculty/AssignedProjects';
import ReviewForm from './pages/faculty/ReviewForm';
import ReviewHistory from './pages/faculty/ReviewHistory';
import FacultySchedules from './pages/faculty/FacultySchedules';
import FacultyNotifications from './pages/faculty/FacultyNotifications';
import FacultyProfile from './pages/faculty/FacultyProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import FacultyManagement from './pages/admin/FacultyManagement';
import ProjectManagement from './pages/admin/ProjectManagement';
import ReviewerAssignment from './pages/admin/ReviewerAssignment';
import ReviewScheduling from './pages/admin/ReviewScheduling';
import CriteriaConfiguration from './pages/admin/CriteriaConfiguration';
import EvaluationRecords from './pages/admin/EvaluationRecords';
import ReportsAnalytics from './pages/admin/ReportsAnalytics';
import NotificationManagement from './pages/admin/NotificationManagement';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          {/* Student Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="projects" element={<MyProjects />} />
            <Route path="projects/create" element={<CreateProject />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="projects/:id/edit" element={<EditProject />} />
            <Route path="schedules" element={<ReviewSchedule />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Faculty Protected Routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/faculty/dashboard" replace />} />
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="assigned" element={<AssignedProjects />} />
            <Route path="review/:id" element={<ReviewForm />} />
            <Route path="history" element={<ReviewHistory />} />
            <Route path="schedules" element={<FacultySchedules />} />
            <Route path="notifications" element={<FacultyNotifications />} />
            <Route path="profile" element={<FacultyProfile />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="faculty" element={<FacultyManagement />} />
            <Route path="projects" element={<ProjectManagement />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="assignments" element={<ReviewerAssignment />} />
            <Route path="schedules" element={<ReviewScheduling />} />
            <Route path="criteria" element={<CriteriaConfiguration />} />
            <Route path="evaluations" element={<EvaluationRecords />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="notifications" element={<NotificationManagement />} />
          </Route>

          {/* 404 Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
