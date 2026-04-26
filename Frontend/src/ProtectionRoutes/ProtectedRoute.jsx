import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../shared/Loading';

const ProtectedRoute = ({ children }) => {
  const { user, token, isAuthenticated, isInitializing } = useSelector((s) => s.auth);
  const location = useLocation();

  // Wait only while app is initializing (token rehydration on startup)
  if (isInitializing) {
    return <Loading />;
  }

  // Allow only when we have a valid session
  const authed = Boolean(token && user && (isAuthenticated ?? true));
  if (!authed) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;