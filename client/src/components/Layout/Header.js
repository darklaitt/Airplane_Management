import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout, getUserDisplayName } = useContext(AuthContext);
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      logout();
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Map roles to human-readable names and colors
  const roleInfo = {
    admin: { name: 'Администратор', className: 'badge-danger' },
    manager: { name: 'Менеджер', className: 'badge-warning' },
    cashier: { name: 'Кассир', className: 'badge-success' },
    analyst: { name: 'Аналитик', className: 'badge-info' }
  };

  // Get role display info
  const getRoleDisplay = () => {
    if (!user || !user.role) return { name: 'Пользователь', className: 'badge-secondary' };
    return roleInfo[user.role] || { name: user.role, className: 'badge-secondary' };
  };

  const roleDisplay = getRoleDisplay();

  return (
    <header className="header">
      <div className="container">
        <nav className="navbar">
          <Link to="/" className="navbar-brand">
            <span className="logo-icon">✈️</span>
            AirlineMS
          </Link>
          
          {isAuthenticated ? (
            <>
              <ul className="navbar-nav">
                <li className={`nav-item ${isActiveRoute('/')}`}>
                  <Link to="/" className="nav-link">
                    <span className="nav-icon">🏠</span>
                    Главная
                  </Link>
                </li>
                <li className={`nav-item ${isActiveRoute('/planes')}`}>
                  <Link to="/planes" className="nav-link">
                    <span className="nav-icon">✈️</span>
                    Самолеты
                  </Link>
                </li>
                <li className={`nav-item ${isActiveRoute('/flights')}`}>
                  <Link to="/flights" className="nav-link">
                    <span className="nav-icon">🛫</span>
                    Рейсы
                  </Link>
                </li>
                <li className={`nav-item ${isActiveRoute('/tickets')}`}>
                  <Link to="/tickets" className="nav-link">
                    <span className="nav-icon">🎫</span>
                    Билеты
                  </Link>
                </li>
                <li className={`nav-item ${isActiveRoute('/reports')}`}>
                  <Link to="/reports" className="nav-link">
                    <span className="nav-icon">📊</span>
                    Отчеты
                  </Link>
                </li>
              </ul>
              
              <div className="navbar-user">
                <div className="user-info">
                  <span className="user-greeting">
                    👋 {getUserDisplayName()}
                  </span>
                  <span className={`user-role badge ${roleDisplay.className}`}>
                    {roleDisplay.name}
                  </span>
                </div>
                <button 
                  className="btn btn-outline-light btn-sm" 
                  onClick={handleLogout}
                  title="Выйти из системы"
                >
                  🚪 Выйти
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-light">
                🔑 Войти
              </Link>
              <Link to="/register" className="btn btn-outline-light ms-2">
                📝 Регистрация
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;