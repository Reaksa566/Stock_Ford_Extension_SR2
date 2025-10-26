import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './services/auth';
import LoginPage from './pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Accessories from './pages/Accessories';
import Tools from './pages/Tools';
import Report from './pages/Report';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="accessories" element={<Accessories />} />
            <Route path="tools" element={<Tools />} />
            <Route path="reports" element={<Report />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;