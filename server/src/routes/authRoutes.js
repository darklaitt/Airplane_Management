const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const config = require('../config/config');
const { logger } = require('../utils/logger');

// Mock user database for testing (you already have a real DB setup)
// This is just to make it work without changing your DB schema
const users = [
  {
    id: 1,
    username: 'admin',
    password_hash: '$2a$12$fQUyiRX8QjPQQOJDJcZ34.pEnQJqkw26VC6WEUO3S4QtYnA0QmH.2', // admin123
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
    password_hash: '$2a$12$gEk0YjWi/LVH/iBJA1vvDeeSgvTlnZuoJuYUjEjXhXfimDu7ZxN2q', // manager123
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
    password_hash: '$2a$12$0JrxE0XDhUy9lVfTKQsbBedPZ.kLYAOKTIiKYhHUnOvL9J3fh2v0S', // cashier123
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
    password_hash: '$2a$12$9YvmSmpLRE9SWiS0asZ8yegYsI9S3Rf5lg4h9MlDa1ztoo6JvbjEO', // analyst123
    email: 'analyst@airline.com',
    first_name: 'Analyst',
    last_name: 'User',
    role_name: 'analyst',
    permissions: ['planes:read', 'flights:read', 'tickets:read', 'reports:read'],
    is_active: true
  }
];

// Helper function to find user
const findUserByUsername = (username) => {
  return users.find(user => user.username === username);
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Имя пользователя и пароль обязательны'
      });
    }
    
    // Find user
    const user = findUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверное имя пользователя или пароль'
      });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
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
    
    // Generate JWT tokens
    const accessTokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role_name,
      permissions: user.permissions
    };
    
    const accessToken = jwt.sign(
      accessTokenPayload,
      config.jwt.secret,
      { expiresIn: config.jwt.accessTokenExpiry }
    );
    
    const refreshToken = jwt.sign(
      { id: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshTokenExpiry }
    );
    
    // Log successful login
    logger.info(`User ${username} logged in successfully`);
    
    // Return user data and tokens
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
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role_id = 4 } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Имя пользователя, email и пароль обязательны'
      });
    }
    
    // Check if user exists
    const existingUser = findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Пользователь с таким именем уже существует'
      });
    }
    
    // Hash password
    const saltRounds = config.security.bcryptRounds;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Create new user (in a real implementation, this would save to the database)
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password_hash,
      first_name: first_name || null,
      last_name: last_name || null,
      role_name: 'analyst', // Default role for new users
      permissions: ['planes:read', 'flights:read', 'tickets:read', 'reports:read'],
      is_active: true
    };
    
    users.push(newUser);
    
    // Log registration
    logger.info(`New user registered: ${username}`);
    
    // Return success
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
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Token verification route
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
    
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
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
    logger.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Get current user info
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
    
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
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
    logger.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Token refresh route
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token обязателен'
    });
  }
  
  try {
    jwt.verify(refreshToken, config.jwt.refreshSecret, (err, decoded) => {
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
      
      // Generate new access token
      const accessToken = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role_name,
          permissions: user.permissions
        },
        config.jwt.secret,
        { expiresIn: config.jwt.accessTokenExpiry }
      );
      
      res.json({
        success: true,
        data: {
          accessToken
        }
      });
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  // In a real implementation, this would invalidate the token in the database
  res.json({
    success: true,
    message: 'Успешный выход из системы'
  });
});

module.exports = router;