import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <nav className="navbar">
          <Link to="/" className="navbar-brand">AirlineMS</Link>
          <ul className="navbar-nav">
            <li><Link to="/" className="nav-link">Главная</Link></li>
            <li><Link to="/planes" className="nav-link">Самолеты</Link></li>
            <li><Link to="/flights" className="nav-link">Рейсы</Link></li>
            <li><Link to="/tickets" className="nav-link">Билеты</Link></li>
            <li><Link to="/reports" className="nav-link">Отчеты</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;