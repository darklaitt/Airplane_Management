import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Common/Loader';

const ProtectedRoute = ({ children, requiredPermission = null, requiredRole = null }) => {
  const { isAuthenticated, loading, checkPermission, hasRole } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    // Сохраняем текущий маршрут для редиректа после входа
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Проверяем права доступа, если они указаны
  if (requiredPermission && !checkPermission(requiredPermission)) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h2>🚫 Доступ запрещен</h2>
          <p>У вас недостаточно прав для просмотра этой страницы.</p>
          <p>Требуемое разрешение: <code>{requiredPermission}</code></p>
        </div>
      </div>
    );
  }

  // Проверяем роль, если она указана
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h2>🚫 Доступ запрещен</h2>
          <p>У вас нет необходимой роли для просмотра этой страницы.</p>
          <p>Требуемая роль: <code>{requiredRole}</code></p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;