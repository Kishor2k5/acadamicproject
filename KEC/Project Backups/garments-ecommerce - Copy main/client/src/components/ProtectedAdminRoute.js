import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdmin();
  
  console.log("ProtectedAdminRoute: loading=", loading, "isAuthenticated=", isAuthenticated());

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    console.log("ProtectedAdminRoute: Not authenticated, redirecting to login");
    return <Navigate to="/admin/login" replace />;
  }

  console.log("ProtectedAdminRoute: Authenticated, showing dashboard");
  return children;
};

export default ProtectedAdminRoute;
