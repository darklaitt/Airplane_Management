const jwt = require('jsonwebtoken');

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Токен доступа отсутствует' 
      });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'test-secret', (err, user) => {
      if (err) {
        console.error('JWT verification error:', err.message);
        return res.status(403).json({ 
          success: false, 
          message: 'Недействительный токен' 
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка аутентификации' 
    });
  }
};

// Middleware для проверки разрешений
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    // Если нет пользователя (не прошел authenticateToken)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Пользователь не аутентифицирован' 
      });
    }

    // Для админа разрешаем всё
    if (req.user.role === 'admin') {
      return next();
    }

    // Здесь должна быть логика проверки конкретных разрешений
    // Для упрощения в тестовой версии разрешаем всё
    next();
  };
};

module.exports = {
  authenticateToken,
  checkPermission
};