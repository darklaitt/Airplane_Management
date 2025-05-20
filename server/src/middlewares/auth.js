const User = require('../models/User');
const config = require('../config/config');

// Middleware для проверки JWT токена
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Токен доступа отсутствует' 
      });
    }

    const decoded = User.verifyToken(token, config.jwt.secret);
    if (!decoded) {
      return res.status(403).json({ 
        success: false, 
        message: 'Недействительный токен' 
      });
    }

    // Получаем актуальную информацию о пользователе
    const user = await User.findById(decoded.id);
    if (!user || !user.is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'Пользователь заблокирован или не найден' 
      });
    }

    // Проверяем блокировку
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({ 
        success: false, 
        message: 'Аккаунт временно заблокирован' 
      });
    }

    req.user = user;
    next();
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
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Пользователь не аутентифицирован' 
      });
    }

    // Если пользователь админ (имеет разрешение "*")
    if (user.permissions && user.permissions.includes('*')) {
      return next();
    }

    // Проверяем конкретное разрешение
    if (!user.permissions || !user.permissions.includes(requiredPermission)) {
      // Логируем попытку несанкционированного доступа
      User.logAction(
        user.id, 
        'UNAUTHORIZED_ACCESS', 
        null, 
        null, 
        { 
          required_permission: requiredPermission,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      );

      return res.status(403).json({ 
        success: false, 
        message: 'Недостаточно прав для выполнения данного действия' 
      });
    }

    next();
  };
};

// Middleware для логирования действий
const logAction = (action, resourceType = null) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
        const resourceId = req.params.id || req.body.id || null;
        const details = {
          method: req.method,
          url: req.originalUrl,
          body: req.method !== 'GET' ? req.body : undefined,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        };

        await User.logAction(req.user.id, action, resourceType, resourceId, details);
      }
    });
    next();
  };
};

module.exports = {
  authenticateToken,
  checkPermission,
  logAction
};