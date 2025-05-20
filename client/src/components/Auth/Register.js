import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import ErrorMessage from '../Common/ErrorMessage';
import { checkPasswordStrength } from '../../utils/crypto';

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
  const [passwordStrength, setPasswordStrength] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Проверяем силу пароля при его изменении
    if (name === 'password' && value) {
      setPasswordStrength(checkPasswordStrength(value));
    } else if (name === 'password' && !value) {
      setPasswordStrength(null);
    }
    
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
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Имя пользователя может содержать только буквы, цифры и подчеркивания');
      return false;
    }

    // Проверка email
    if (!formData.email) {
      setError('Введите email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
    
    // Расширенная проверка пароля
    const strengthCheck = checkPasswordStrength(formData.password);
    if (strengthCheck.score < 3) {
      setError('Пароль должен содержать хотя бы одну строчную букву, одну заглавную букву и одну цифру');
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

    // Проверка имени и фамилии (опционально)
    if (formData.first_name && !/^[а-яё\s\-a-z]+$/i.test(formData.first_name)) {
      setError('Имя может содержать только буквы, пробелы и дефисы');
      return false;
    }
    if (formData.last_name && !/^[а-яё\s\-a-z]+$/i.test(formData.last_name)) {
      setError('Фамилия может содержать только буквы, пробелы и дефисы');
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
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        role_id: 4 // По умолчанию роль "analyst"
      };

      await authService.register(registrationData);
      setSuccess('Регистрация успешна! Теперь вы можете войти в систему.');
      
      // Перенаправляем на страницу входа через 2 секунды
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case 'Очень слабый': return '#dc3545';
      case 'Слабый': return '#fd7e14';
      case 'Средний': return '#ffc107';
      case 'Сильный': return '#20c997';
      case 'Очень сильный': return '#28a745';
      default: return '#6c757d';
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
              
              {/* Индикатор силы пароля */}
              {passwordStrength && (
                <div className="password-strength" style={{ marginTop: '0.5rem' }}>
                  <div className="password-strength-bar">
                    <div 
                      className="password-strength-fill"
                      style={{
                        width: `${passwordStrength.percentage}%`,
                        backgroundColor: getPasswordStrengthColor(passwordStrength.strength),
                        height: '4px',
                        borderRadius: '2px',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                  <small style={{ color: getPasswordStrengthColor(passwordStrength.strength) }}>
                    Сила пароля: {passwordStrength.strength}
                  </small>
                </div>
              )}
              
              <small className="form-text">
                Минимум 6 символов, должен содержать буквы разного регистра и цифры
              </small>
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
                  <span className="spinner"></span>
                  Регистрация...
                </>
              ) : (
                <>
                  📝 Зарегистрироваться
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
            <p className="version-info">
              Версия 1.0.0 | © 2025 МИРЭА РТУ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;