import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/auth';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - Auth state:', { user, loading });

  if (loading) {
    console.log('ProtectedRoute - Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  console.log('ProtectedRoute - Checking if user exists:', !!user);
  
  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute - User authenticated, rendering children');
  return children;
};

export default ProtectedRoute;