import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { Login } from './pages/Login';
import { EducatorLogin } from './pages/EducatorLogin';
import { StudentLogin } from './pages/StudentLogin';
import { StudentSignup } from './pages/StudentSignup';
import { Layout } from './components/Layout';

import { EducatorDashboard } from './pages/EducatorDashboard';
import { CreateCourse } from './pages/CreateCourse';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentProfile } from './pages/StudentProfile';
import { CourseBrowser } from './pages/CourseBrowser';
import { CourseDetails } from './pages/CourseDetails';
import { EditCourse } from './pages/EditCourse';
import { CourseStudents } from './pages/CourseStudents';
import { StudentsList } from './pages/StudentsList';
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />;
  return <Layout><div key={location.pathname}>{children}</div></Layout>;
};

function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/educator/login" element={<EducatorLogin />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/signup" element={<StudentSignup />} />

          <Route path="/educator" element={
            <ProtectedRoute allowedRole="educator">
              <EducatorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/create-course" element={
            <ProtectedRoute allowedRole="educator">
              <CreateCourse />
            </ProtectedRoute>
          } />

          <Route path="/edit-course/:courseId" element={
            <ProtectedRoute allowedRole="educator">
              <EditCourse />
            </ProtectedRoute>
          } />

          <Route path="/course-students/:courseId" element={
            <ProtectedRoute allowedRole="educator">
              <CourseStudents />
            </ProtectedRoute>
          } />

          <Route path="/students" element={
            <ProtectedRoute allowedRole="educator">
              <StudentsList />
            </ProtectedRoute>
          } />

          <Route path="/student" element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/student/profile" element={
            <ProtectedRoute allowedRole="student">
              <StudentProfile />
            </ProtectedRoute>
          } />

          <Route path="/courses" element={
            <ProtectedRoute allowedRole="student">
              <CourseBrowser />
            </ProtectedRoute>
          } />

          <Route path="/courses/:courseId" element={
            <ProtectedRoute allowedRole="student">
              <CourseDetails />
            </ProtectedRoute>
          } />

          <Route path="/about" element={
            <ProtectedRoute>
              <AboutUs />
            </ProtectedRoute>
          } />

          <Route path="/contact" element={
            <ProtectedRoute>
              <ContactUs />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </CourseProvider>
    </AuthProvider>
  );
}

export default App;
