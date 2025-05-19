import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверяем токен при загрузке приложения
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Проверяем валидность токена
        const userData = await authService.verifyToken();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Токен недействителен, очищаем localStorage
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      const { user: userData, accessToken, refreshToken } = response;

      // Сохраняем токены в localStorage (в продакшене лучше использовать httpOnly куки)
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Очищаем localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

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
      const { accessToken } = response;

      localStorage.setItem('access_token', accessToken);
      return accessToken;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const checkPermission = (permission) => {
    if (!user || !user.permissions) return false;
    
    // Админ имеет все права
    if (user.permissions.includes('*')) return true;
    
    // Проверяем конкретное разрешение
    return user.permissions.includes(permission);
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshAccessToken,
    checkPermission,
    hasRole,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};