import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  console.log("ProtectedRoute check:", { isAuthenticated, hasUser: !!user, hasToken: !!token });

  // Check if user is authenticated
  if (!isAuthenticated || !token) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;