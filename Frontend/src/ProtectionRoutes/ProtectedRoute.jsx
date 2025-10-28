import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, token, isAuthenticated, loading } = useSelector((s) => s.auth);
  const location = useLocation();

  // Wait while auth state initializes (redux-persist, profile fetch, etc.)
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-500 text-sm">
        Checking session…
      </div>
    );
  }

  // Allow only when we have a valid session
  const authed = Boolean(token && user && (isAuthenticated ?? true));
  if (!authed) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;