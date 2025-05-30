// server/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Временные маршруты для тестирования
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Валидация входных данных
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Имя пользователя и пароль обязательны'
      });
    }
    
    // Простая проверка для тестирования
    if (username === 'admin' && password === 'admin123') {
      res.json({
        success: true,
        message: 'Успешный вход в систему',
        data: {
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
            permissions: ['*']
          },
          accessToken: 'test-access-token-' + Date.now(),
          refreshToken: 'test-refresh-token-' + Date.now()
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Неверное имя пользователя или пароль'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Токен не предоставлен'
    });
  }
  
  if (token.startsWith('test-access-token')) {
    res.json({
      success: true,
      message: 'Токен действителен',
      data: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['*']
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Недействительный токен'
    });
  }
});

router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Токен не предоставлен'
    });
  }
  
  if (token.startsWith('test-access-token')) {
    res.json({
      success: true,
      data: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        permissions: ['*'],
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Недействительный токен'
    });
  }
});

router.post('/logout', (req, res) => {
  // Простая реализация для тестирования
  res.json({
    success: true,
    message: 'Успешный выход из системы'
  });
});

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Все поля обязательны для заполнения'
    });
  }
  
  // Простая проверка для тестирования
  if (username === 'admin') {
    return res.status(409).json({
      success: false,
      message: 'Пользователь с таким именем уже существует'
    });
  }
  
  res.status(201).json({
    success: true,
    message: 'Пользователь успешно зарегистрирован',
    data: {
      id: 2,
      username: username,
      email: email
    }
  });
});

module.exports = router;