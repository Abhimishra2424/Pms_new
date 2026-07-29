import React, { createContext, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginStart, registerStart, logoutStart, clearError } from '../redux/slices/authSlice';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const login = useCallback((data) => dispatch(loginStart(data)), [dispatch]);
  const register = useCallback((data) => dispatch(registerStart(data)), [dispatch]);
  const logout = useCallback(() => dispatch(logoutStart()), [dispatch]);
  const clearAuthError = useCallback(() => dispatch(clearError()), [dispatch]);

  const hasPermission = useCallback(
    (permission) => {
      return auth.permissions?.includes(permission) || false;
    },
    [auth.permissions]
  );

  const hasRole = useCallback(
    (roles) => {
      if (!auth.user?.role) return false;
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      return allowedRoles.includes(auth.user.role);
    },
    [auth.user?.role]
  );

  const value = {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    permissions: auth.permissions,
    login,
    register,
    logout,
    clearAuthError,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
