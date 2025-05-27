const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { authValidation } = require('../middlewares/validation');
const { authenticateToken } = require('../middlewares/authController');
const User = require('../models/User');
const config = require('../config/config');
const { logger } = require('../utils/logger');

const router = express.Router();

/**
 * Вход в систему
 */
router.post('/login', authValidation.login, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ошибки валидации',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Находим пользователя
    const user = await User.findByUsername(username);
    if (!user) {
      logger.info(`Неудачная попытка входа: пользователь ${username} не найден`);
      
      return res.status(401).json({ 
        success: false, 
        message: 'Неверное имя пользователя или пароль' 
      });
    }

    // Проверяем, не заблокирован ли аккаунт
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const unlockTime = new Date(user.locked_until).toLocaleString('ru-RU');
      return res.status(423).json({ 
        success: false, 
        message: `Аккаунт заблокирован до ${unlockTime}` 
      });
    }

    // Проверяем пароль
    const isPasswordValid = await User.validatePassword(password, user.password_hash);
    if (!isPasswordValid) {
      await User.incrementFailedLoginAttempts(user.id);
      logger.info(`Неудачная попытка входа: неверный пароль для пользователя ${username}`);
      
      return res.status(401).json({ 
        success: false, 
        message: 'Неверное имя пользователя или пароль' 
      });
    }

    // Проверяем активность аккаунта
    if (!user.is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'Аккаунт деактивирован' 
      });
    }

    // Сбрасываем счетчик неудачных попыток
    await User.resetFailedLoginAttempts(user.id);

    // Генерируем токены
    const { accessToken, refreshToken } = User.generateTokens(user);

    // Сохраняем сессию
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 дней
    await User.saveSession(user.id, refreshTokenHash, expiresAt, ipAddress, userAgent);

    // Обновляем время последнего входа
    await User.updateLastLogin(user.id, ipAddress);

    // Подготавливаем данные пользователя (без пароля)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role_name,
      permissions: user.permissions
    };

    logger.info(`Успешный вход пользователя ${username}`);

    res.json({
      success: true,
      message: 'Успешный вход в систему',
      data: {
        user: userData,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Регистрация нового пользователя
 */
router.post('/register', authValidation.register, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ошибки валидации данных',
        errors: errors.array()
      });
    }

    const { username, email, password, first_name, last_name, role_id } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Пользователь с таким именем уже существует' 
      });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ 
        success: false, 
        message: 'Пользователь с таким email уже существует' 
      });
    }

    // Создаем пользователя
    const userData = {
      username,
      email,
      password,
      first_name: first_name || null,
      last_name: last_name || null,
      role_id: role_id || 4 // По умолчанию роль "analyst"
    };

    const newUser = await User.create(userData);

    logger.info(`Зарегистрирован новый пользователь: ${username}`);

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Обновление токена доступа
 */
router.post('/refresh', authValidation.refreshToken, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ошибки валидации',
        errors: errors.array()
      });
    }

    const { refreshToken } = req.body;
    
    // Проверяем refresh token
    const decoded = User.verifyToken(refreshToken, config.jwt.refreshSecret);
    if (!decoded) {
      return res.status(403).json({ 
        success: false, 
        message: 'Недействительный refresh token' 
      });
    }

    // Проверяем сессию в БД
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await User.findSession(refreshTokenHash);
    
    if (!session || new Date(session.expires_at) < new Date()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Сессия истекла' 
      });
    }

    // Получаем пользователя
    const user = await User.findById(decoded.id);
    if (!user || !user.is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'Пользователь не найден или заблокирован' 
      });
    }

    // Генерируем новый access token
    const { accessToken } = User.generateTokens(user);

    res.json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Выход из системы
 */
router.post('/logout', async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      // Удаляем сессию из БД
      const refreshToken = req.body.refreshToken;
      if (refreshToken) {
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await User.removeSession(refreshTokenHash);
      }
      
      // Логируем выход
      const decoded = User.verifyToken(token, config.jwt.secret);
      if (decoded) {
        logger.info(`Пользователь ${decoded.username} вышел из системы`);
      }
    }

    res.json({
      success: true,
      message: 'Успешный выход из системы'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Проверка действительности токена
 */
router.get('/verify', async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Токен не предоставлен' 
      });
    }

    const decoded = User.verifyToken(token, config.jwt.secret);
    if (!decoded) {
      return res.status(403).json({ 
        success: false, 
        message: 'Недействительный токен' 
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'Пользователь не найден или заблокирован' 
      });
    }

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role_name,
      permissions: user.permissions
    };

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Получение данных текущего пользователя
 */
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = req.user;
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role_name,
      permissions: user.permissions,
      last_login: user.last_login,
      created_at: user.created_at
    };

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;