const winston = require('winston');
const path = require('path');
const config = require('../config/config');

// Определяем форматы логирования
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Добавляем метаданные если есть
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// Создаем транспорты (куда писать логи)
const transports = [];

// Консольный транспорт (для разработки)
if (config.logging.console) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: config.logging.level
    })
  );
}

// Файловые транспорты
if (config.logging.file) {
  // Общие логи
  transports.push(
    new winston.transports.File({
      filename: config.logging.file,
      format: logFormat,
      level: config.logging.level,
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      tailable: true
    })
  );
  
  // Логи ошибок отдельно
  transports.push(
    new winston.transports.File({
      filename: path.join(path.dirname(config.logging.file), 'error.log'),
      format: logFormat,
      level: 'error',
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      tailable: true
    })
  );
  
  // Логи аудита отдельно
  transports.push(
    new winston.transports.File({
      filename: path.join(path.dirname(config.logging.file), 'audit.log'),
      format: logFormat,
      level: 'info',
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      tailable: true
    })
  );
}

// Создаем основной логгер
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { 
    service: 'airline-management-api',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports,
  // Не завершаем процесс при ошибке логирования
  exitOnError: false
});

// Создаем специализированные логгеры
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { 
    type: 'audit',
    service: 'airline-management-api'
  },
  transports: [
    new winston.transports.File({
      filename: path.join(path.dirname(config.logging.file || './logs/app.log'), 'audit.log'),
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      tailable: true
    })
  ]
});

const securityLogger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { 
    type: 'security',
    service: 'airline-management-api'
  },
  transports: [
    new winston.transports.File({
      filename: path.join(path.dirname(config.logging.file || './logs/app.log'), 'security.log'),
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      tailable: true
    })
  ]
});

// Вспомогательные функции для логирования
const loggerHelpers = {
  // Логирование действий пользователей
  logUserAction: (userId, action, resource, details = {}) => {
    auditLogger.info('User action', {
      userId,
      action,
      resource,
      details,
      timestamp: new Date().toISOString()
    });
  },
  
  // Логирование событий безопасности
  logSecurityEvent: (event, severity, details = {}) => {
    securityLogger.log(severity, `Security event: ${event}`, {
      event,
      severity,
      details,
      timestamp: new Date().toISOString()
    });
  },
  
  // Логирование API запросов
  logApiRequest: (req, res, duration) => {
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    };
    
    if (res.statusCode >= 400) {
      logger.warn('API request failed', logData);
    } else {
      logger.info('API request', logData);
    }
  },
  
  // Логирование ошибок базы данных
  logDatabaseError: (operation, error, query = null) => {
    logger.error('Database error', {
      operation,
      error: error.message,
      stack: error.stack,
      query,
      timestamp: new Date().toISOString()
    });
  },
  
  // Логирование производительности
  logPerformance: (operation, duration, metadata = {}) => {
    logger.info('Performance metric', {
      operation,
      duration: `${duration}ms`,
      metadata,
      timestamp: new Date().toISOString()
    });
  }
};

// Экспортируем логгер и вспомогательные функции
module.exports = {
  logger,
  auditLogger,
  securityLogger,
  ...loggerHelpers
};

// Stream для morgan middleware
module.exports.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};