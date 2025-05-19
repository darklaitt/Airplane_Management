
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Кастомный хук для использования контекста авторизации
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Хук для проверки конкретного разрешения
export const usePermission = (permission) => {
  const { checkPermission } = useAuth();
  return checkPermission(permission);
};

// Хук для проверки конкретной роли
export const useRole = (role) => {
  const { hasRole } = useAuth();
  return hasRole(role);
};

// Хук для получения информации о пользователе
export const useUser = () => {
  const { user, isAuthenticated } = useAuth();
  return { user, isAuthenticated };
};