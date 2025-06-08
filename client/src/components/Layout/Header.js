import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const location = useLocation();

  const getUserDisplayName = (user) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) {
      return user.first_name;
    }
    return user?.username || 'Пользователь';
  };

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      logout();
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path ? 'active' : '';
  };

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
                    👋 Привет, {getUserDisplayName(user)}!
                  </span>
                  <span className="user-role badge badge-info">
                    {user?.role || 'Пользователь'}
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
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;