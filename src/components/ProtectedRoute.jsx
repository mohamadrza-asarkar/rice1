import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context';

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, isLoadingAuth } = useApp();
  const location = useLocation();

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-8 text-emerald-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700 ml-3" />
        <span>در حال بررسی دسترسی...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
