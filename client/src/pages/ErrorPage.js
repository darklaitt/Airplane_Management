import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import '../styles/error.css';

const ErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract error information from location state
  const { error, title, message } = location.state || {
    error: null,
    title: 'Произошла ошибка',
    message: 'Что-то пошло не так. Пожалуйста, попробуйте снова.'
  };

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="error-page">
      <div className="container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h1>{title}</h1>
          <p className="error-message">{message}</p>
          
          {error && (
            <div className="error-details">
              <h2>Детали ошибки</h2>
              <pre>{typeof error === 'object' ? JSON.stringify(error, null, 2) : error}</pre>
            </div>
          )}
          
          <div className="error-actions">
            <button className="btn btn-secondary" onClick={goBack}>
              Вернуться назад
            </button>
            <button className="btn btn-primary" onClick={goHome}>
              На главную
            </button>
          </div>
          
          <div className="error-help">
            <p>Если проблема сохраняется, обратитесь к администратору системы.</p>
            <p>
              <Link to="/login">Перейти на страницу входа</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;