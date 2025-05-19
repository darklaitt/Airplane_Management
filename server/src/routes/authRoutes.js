const express = require('express');
const router = express.Router();

// Временный маршрут для тестирования
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
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
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token'
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
  res.json({
    success: true,
    message: 'Токен проверен'
  });
});

module.exports = router;