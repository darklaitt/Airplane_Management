import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        // No token found, user is not authenticated
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Try to get user from localStorage first for immediate UI update
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }

      // Then verify with server (async)
      try {
        const userData = await authService.verifyToken();
        setUser(userData);
        setIsAuthenticated(true);
        setAuthError(null);
      } catch (verifyError) {
        console.warn('Token verification failed:', verifyError);
        logout();
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      // Token invalid or expired, clear stored data
      logout();
      setAuthError('Сессия истекла. Пожалуйста, войдите снова.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await authService.login(username, password);
      
      const { user: userData } = response.data;
      setUser(userData);
      setIsAuthenticated(true);
      setAuthError(null);
      
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError(error.message || 'Ошибка входа в систему');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      setAuthError(null);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      setAuthError(error.message || 'Ошибка регистрации');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(refreshToken);
      return response.data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  // Check if user has specific permission
  const checkPermission = (permission) => {
    if (!user || !user.permissions) {
      return false;
    }
    
    // Admin has all permissions
    if (user.permissions.includes('*')) {
      return true;
    }
    
    // Check specific permission
    return user.permissions.includes(permission);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Get user's full name or username
  const getUserDisplayName = () => {
    if (!user) return '';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    }
    
    return user.username;
  };

  // Context value
  const authContextValue = {
    user,
    loading,
    isAuthenticated,
    error: authError,
    login,
    register,
    logout,
    refreshAccessToken,
    checkPermission,
    hasRole,
    getUserDisplayName,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};