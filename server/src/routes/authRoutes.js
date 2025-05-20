const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const config = require('../config/config');
const { logger } = require('../utils/logger');

// Примечание: эта версия намеренно упрощена, чтобы работать без БД
// В реальном приложении вы бы использовали модели для работы с БД
const users = [
  {
    id: 1,
    username: 'admin',
    // admin123
    password_hash: '$2a$12$fQUyiRX8QjPQQOJDJcZ34.pEnQJqkw26VC6WEUO3S4QtYnA0QmH.2',
    email: 'admin@airline.com',
    first_name: 'Admin',
    last_name: 'User',
    role_name: 'admin',
    permissions: ['*'],
    is_active: true
  },
  {
    id: 2,
    username: 'manager',
    // manager123
    password_hash: '$2a$12$gEk0YjWi/LVH/iBJA1vvDeeSgvTlnZuoJuYUjEjXhXfimDu7ZxN2q',
    email: 'manager@airline.com',
    first_name: 'Manager',
    last_name: 'User',
    role_name: 'manager',
    permissions: ['planes:read', 'planes:write', 'flights:read', 'flights:write', 'tickets:read', 'tickets:write', 'reports:read'],
    is_active: true
  },
  {
    id: 3,
    username: 'cashier',
    // cashier123
    password_hash: '$2a$12$0JrxE0XDhUy9lVfTKQsbBedPZ.kLYAOKTIiKYhHUnOvL9J3fh2v0S',
    email: 'cashier@airline.com',
    first_name: 'Cashier',
    last_name: 'User',
    role_name: 'cashier',
    permissions: ['flights:read', 'tickets:read', 'tickets:write'],
    is_active: true
  },
  {
    id: 4,
    username: 'analyst',
    // analyst123
    password_hash: '$2a$12$9YvmSmpLRE9SWiS0asZ8yegYsI9S3Rf5lg4h9MlDa1ztoo6JvbjEO',
    email: 'analyst@airline.com',
    first_name: 'Analyst',
    last_name: 'User',
    role_name: 'analyst',
    permissions: ['planes:read', 'flights:read', 'tickets:read', 'reports:read'],
    is_active: true
  }
];

// Хэшируем пароль (для создания хэшей)
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Вспомогательная функция для поиска пользователя
const findUserByUsername = (username) => {
  return users.find(user => user.username === username);
};

// Вход в систему
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Имя пользователя и пароль обязательны'
      });
    }
    
    // Проверка прямо для тестирования
    if (username === 'admin' && password === 'admin123') {
      const user = users[0];
      // Генерируем токены
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role_name, permissions: user.permissions },
        config.jwt.secret || 'your-super-secret-jwt-key-change-in-production',
        { expiresIn: config.jwt.accessTokenExpiry || '1h' }
      );
      
      const refreshToken = jwt.sign(
        { id: user.id },
        config.jwt.refreshSecret || 'your-super-secret-refresh-key-change-in-production',
        { expiresIn: config.jwt.refreshTokenExpiry || '7d' }
      );
      
      return res.json({
        success: true,
        message: 'Успешный вход в систему',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role_name,
            permissions: user.permissions
          },
          accessToken,
          refreshToken
        }
      });
    }
    
    // Ищем пользователя
    const user = findUserByUsername(username);
    if (!user) {
      logger.info(`Неудачная попытка входа: пользователь ${username} не найден`);
      return res.status(401).json({
        success: false,
        message: 'Неверное имя пользователя или пароль'
      });
    }
    
    // Проверяем пароль
    let isPasswordValid = false;
    
    // Проверяем простой пароль для тестирования
    if (
      (username === 'manager' && password === 'manager123') ||
      (username === 'cashier' && password === 'cashier123') ||
      (username === 'analyst' && password === 'analyst123')
    ) {
      isPasswordValid = true;
    } else {
      try {
        // Настоящая проверка пароля с bcrypt
        isPasswordValid = await bcrypt.compare(password, user.password_hash);
      } catch (err) {
        logger.error(`Ошибка при проверке пароля: ${err.message}`);
        isPasswordValid = false;
      }
    }
    
    if (!isPasswordValid) {
      logger.info(`Неудачная попытка входа: неверный пароль для пользователя ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Неверное имя пользователя или пароль'
      });
    }
    
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Аккаунт деактивирован'
      });
    }
    
    // Генерируем токены
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role_name, permissions: user.permissions },
      config.jwt.secret || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: config.jwt.accessTokenExpiry || '1h' }
    );
    
    const refreshToken = jwt.sign(
      { id: user.id },
      config.jwt.refreshSecret || 'your-super-secret-refresh-key-change-in-production',
      { expiresIn: config.jwt.refreshTokenExpiry || '7d' }
    );
    
    logger.info(`Успешный вход пользователя ${username}`);
    
    // Возвращаем данные пользователя и токены
    res.json({
      success: true,
      message: 'Успешный вход в систему',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role_name,
          permissions: user.permissions
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error(`Ошибка при входе: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Имя пользователя, email и пароль обязательны'
      });
    }
    
    // Проверяем, существует ли пользователь
    const existingUser = findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Пользователь с таким именем уже существует'
      });
    }
    
    // Хешируем пароль
    const password_hash = await hashPassword(password);
    
    // Создаем нового пользователя
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password_hash,
      first_name: first_name || null,
      last_name: last_name || null,
      role_name: 'analyst', // По умолчанию - аналитик
      permissions: ['planes:read', 'flights:read', 'tickets:read', 'reports:read'],
      is_active: true
    };
    
    // Добавляем пользователя в массив
    users.push(newUser);
    
    logger.info(`Зарегистрирован новый пользователь: ${username}`);
    
    // Возвращаем успех
    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role_name
      }
    });
  } catch (error) {
    logger.error(`Ошибка при регистрации: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Проверка токена
router.get('/verify', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Токен не предоставлен'
      });
    }
    
    jwt.verify(token, config.jwt.secret || 'your-super-secret-jwt-key-change-in-production', (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Недействительный токен'
        });
      }
      
      const user = users.find(u => u.id === decoded.id);
      if (!user || !user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Пользователь не найден или заблокирован'
        });
      }
      
      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role_name,
          permissions: user.permissions
        }
      });
    });
  } catch (error) {
    logger.error(`Ошибка при проверке токена: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Получение информации о текущем пользователе
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Токен не предоставлен'
      });
    }
    
    jwt.verify(token, config.jwt.secret || 'your-super-secret-jwt-key-change-in-production', (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Недействительный токен'
        });
      }
      
      const user = users.find(u => u.id === decoded.id);
      if (!user || !user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Пользователь не найден или заблокирован'
        });
      }
      
      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role_name,
          permissions: user.permissions,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      });
    });
  } catch (error) {
    logger.error(`Ошибка при получении данных пользователя: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Обновление токена
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token обязателен'
    });
  }
  
  try {
    jwt.verify(refreshToken, config.jwt.refreshSecret || 'your-super-secret-refresh-key-change-in-production', (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Недействительный refresh token'
        });
      }
      
      const user = users.find(u => u.id === decoded.id);
      if (!user || !user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Пользователь не найден или заблокирован'
        });
      }
      
      // Генерируем новый access token
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role_name, permissions: user.permissions },
        config.jwt.secret || 'your-super-secret-jwt-key-change-in-production',
        { expiresIn: config.jwt.accessTokenExpiry || '1h' }
      );
      
      res.json({
        success: true,
        data: {
          accessToken
        }
      });
    });
  } catch (error) {
    logger.error(`Ошибка при обновлении токена: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Изменение прав пользователя
router.put('/users/:id/role', (req, res) => {
  try {
    const { id } = req.params;
    const { role_name } = req.body;
    
    // Проверяем авторизацию (должен быть админ)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация'
      });
    }
    
    jwt.verify(token, config.jwt.secret || 'your-super-secret-jwt-key-change-in-production', (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Недействительный токен'
        });
      }
      
      // Проверяем, что пользователь - админ
      if (decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Недостаточно прав для изменения ролей пользователей'
        });
      }
      
      // Ищем пользователя для изменения
      const userIndex = users.findIndex(u => u.id === parseInt(id));
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }
      
      // Проверяем, что роль допустима
      const validRoles = {
        admin: ['*'],
        manager: ['planes:read', 'planes:write', 'flights:read', 'flights:write', 'tickets:read', 'tickets:write', 'reports:read'],
        cashier: ['flights:read', 'tickets:read', 'tickets:write'],
        analyst: ['planes:read', 'flights:read', 'tickets:read', 'reports:read']
      };
      
      if (!validRoles[role_name]) {
        return res.status(400).json({
          success: false,
          message: 'Неверная роль. Допустимые роли: admin, manager, cashier, analyst'
        });
      }
      
      // Обновляем роль и разрешения
      users[userIndex].role_name = role_name;
      users[userIndex].permissions = validRoles[role_name];
      
      logger.info(`Изменена роль пользователя ${users[userIndex].username} на ${role_name}`);
      
      res.json({
        success: true,
        message: `Роль пользователя изменена на ${role_name}`,
        data: {
          id: users[userIndex].id,
          username: users[userIndex].username,
          role: users[userIndex].role_name,
          permissions: users[userIndex].permissions
        }
      });
    });
  } catch (error) {
    logger.error(`Ошибка при изменении роли: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Получение списка всех пользователей (только для админа)
router.get('/users', (req, res) => {
  try {
    // Проверяем авторизацию (должен быть админ)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация'
      });
    }
    
    jwt.verify(token, config.jwt.secret || 'your-super-secret-jwt-key-change-in-production', (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Недействительный токен'
        });
      }
      
      // Проверяем, что пользователь - админ
      if (decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Недостаточно прав для просмотра списка пользователей'
        });
      }
      
      // Возвращаем список пользователей (без паролей)
      const usersList = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role_name,
        is_active: user.is_active
      }));
      
      res.json({
        success: true,
        data: usersList
      });
    });
  } catch (error) {
    logger.error(`Ошибка при получении списка пользователей: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Выход из системы
router.post('/logout', (req, res) => {
  // В реальном приложении здесь бы инвалидировали токен
  // Но в данной реализации это не требуется
  res.json({
    success: true,
    message: 'Успешный выход из системы'
  });
});

module.exports = router;

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     security: []  # Отключаем требование токена для этого эндпоинта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 */