import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ErrorMessage from '../Common/ErrorMessage';
import Loader from '../Common/Loader';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useContext(AuthContext);
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
    // Проверка имени пользователя
    if (!formData.username) {
      setError('Введите имя пользователя');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Имя пользователя должно содержать минимум 3 символа');
      return false;
    }
    
    // Проверка email
    if (!formData.email) {
      setError('Введите email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Введите корректный email адрес');
      return false;
    }
    
    // Проверка пароля
    if (!formData.password) {
      setError('Введите пароль');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    
    // Проверка подтверждения пароля
    if (!formData.confirmPassword) {
      setError('Подтвердите пароль');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null
      };

      await register(userData);
      
      setSuccess('Регистрация успешна! Сейчас вы будете перенаправлены на страницу входа.');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Ошибка при регистрации. Попробуйте позже.');
    } finally {
      setLoading(false);
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
            <p className="login-subtitle">Регистрация в системе</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Имя пользователя *</label>
                <div className="input-group">
                  <span className="input-icon">👤</span>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    className="form-control"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Введите имя пользователя"
                    autoComplete="username"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <div className="input-group">
                  <span className="input-icon">📧</span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Введите email"
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">Имя</label>
                <div className="input-group">
                  <span className="input-icon">👨</span>
                  <input
                    id="first_name"
                    type="text"
                    name="first_name"
                    className="form-control"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Введите имя"
                    autoComplete="given-name"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Фамилия</label>
                <div className="input-group">
                  <span className="input-icon">👨‍💼</span>
                  <input
                    id="last_name"
                    type="text"
                    name="last_name"
                    className="form-control"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Введите фамилию"
                    autoComplete="family-name"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль *</label>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Введите пароль"
                  autoComplete="new-password"
                  disabled={loading}
                  required
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Подтвердите пароль *</label>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Подтвердите пароль"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  disabled={loading}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && <ErrorMessage message={error} type="danger" />}
            {success && <ErrorMessage message={success} type="success" />}

            <button
              type="submit"
              className="btn btn-primary login-btn"
              disabled={loading}
              aria-label="Зарегистрироваться"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Регистрация...
                </>
              ) : (
                '📝 Зарегистрироваться'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Уже есть аккаунт? <Link to="/login">Войти</Link>
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

export default Register;