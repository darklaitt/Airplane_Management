const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Логируем ошибку
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Ошибки валидации
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Ошибки валидации',
      errors: err.errors
    });
  }

  // Ошибки подключения к БД
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      message: 'Сервис временно недоступен'
    });
  }

  // PostgreSQL ошибки
  if (err.code === '23505') { // unique_violation
    return res.status(409).json({
      success: false,
      message: 'Запись с такими данными уже существует'
    });
  }

  if (err.code === '23503') { // foreign_key_violation
    return res.status(400).json({
      success: false,
      message: 'Ссылочная целостность нарушена'
    });
  }

  if (err.code === '22P02') { // invalid_text_representation
    return res.status(400).json({
      success: false,
      message: 'Неверный формат данных'
    });
  }

  // JWT ошибки
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Недействительный токен'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Токен истек'
    });
  }

  // Общая ошибка
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';

  res.status(status).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;