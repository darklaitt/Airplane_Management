import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ErrorMessage from '../Common/ErrorMessage';
import Loader from '../Common/Loader';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаем ошибку при изменении ввода
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.username) {
      setError('Введите имя пользователя');
      return false;
    }
    if (!formData.password) {
      setError('Введите пароль');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Ошибка входа в систему. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <span className="logo-icon">✈️</span>
              <h1>AirlineMS</h1>
            </div>
            <p className="login-subtitle">Система управления авиаперевозками</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Имя пользователя</label>
              <div className="input-group">
                <span className="input-icon">👤</span>
                <input
                  id="username"
                  type="text"
                  name="username"
                  className="form-control"
                  value={formData.username}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Введите имя пользователя"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Введите пароль"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && <ErrorMessage message={error} type="danger" />}

            <button
              type="submit"
              className="btn btn-primary login-btn"
              disabled={loading || !formData.username || !formData.password}
            >
              {loading ? (
                <>
                  <Loader />
                  Вход...
                </>
              ) : (
                '🚪 Войти'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </p>
            <p className="version-info">
              Версия 1.0.0 | © 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;