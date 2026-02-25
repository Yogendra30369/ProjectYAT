import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';

import { EducatorDashboard } from './pages/EducatorDashboard';
import { CreateCourse } from './pages/CreateCourse';
import { StudentDashboard } from './pages/StudentDashboard';
import { CourseBrowser } from './pages/CourseBrowser';
import { CourseDetails } from './pages/CourseDetails';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

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

          <Route path="/student" element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
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

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </CourseProvider>
    </AuthProvider>
  );
}

export default App;
