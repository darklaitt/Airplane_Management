import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../Common/Loader';

const ProtectedRoute = ({ children, requiredPermission = null, requiredRole = null }) => {
  const { isAuthenticated, loading, user, checkPermission, hasRole } = useContext(AuthContext);
  const location = useLocation();

  // Show loader while checking authentication status
  if (loading) {
    return (
      <div className="protected-route-loading">
        <Loader text="Проверка авторизации..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check permission if specified
  if (requiredPermission && !checkPermission(requiredPermission)) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h2>🚫 Доступ запрещен</h2>
          <p>У вас недостаточно прав для просмотра этой страницы.</p>
          <p><strong>Требуемое разрешение:</strong> <code>{requiredPermission}</code></p>
          <p><strong>Ваша роль:</strong> <code>{user?.role || 'Не определена'}</code></p>
          <p><strong>Ваши разрешения:</strong> <code>{user?.permissions?.join(', ') || 'Не определены'}</code></p>
          <p>Пожалуйста, обратитесь к администратору системы для получения необходимых прав доступа.</p>
          <div className="mt-4">
            <button 
              className="btn btn-primary"
              onClick={() => window.history.back()}
            >
              Вернуться назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check role if specified
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h2>🚫 Доступ запрещен</h2>
          <p>Для доступа к этой странице требуется роль <code>{requiredRole}</code>.</p>
          <p>Ваша текущая роль: <code>{user?.role || 'Не определена'}</code></p>
          <p>Пожалуйста, обратитесь к администратору системы для изменения вашей роли.</p>
          <div className="mt-4">
            <button 
              className="btn btn-primary"
              onClick={() => window.history.back()}
            >
              Вернуться назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has required permission/role
  return children;
};

export default ProtectedRoute;