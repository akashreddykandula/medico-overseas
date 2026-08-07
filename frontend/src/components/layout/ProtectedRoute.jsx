import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Wrap protected route trees with this. If `roles` is provided, only users
 * whose role is included are allowed through; everyone else is redirected.
 */
const ProtectedRoute = ({ roles }) => {
  const { user, initialized } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!initialized) {
    return <div className="flex min-h-screen items-center justify-center text-navy-400">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
