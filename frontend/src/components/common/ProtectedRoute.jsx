import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, permissions, roles }) {
  const { isAuthenticated, user, permissions: userPermissions } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user?.role) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (permissions && userPermissions) {
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    const hasAllPermissions = requiredPermissions.every((perm) => userPermissions.includes(perm));
    if (!hasAllPermissions) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
