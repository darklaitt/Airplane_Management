// Загружаем переменные окружения
require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'airline_management',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
  },
  
  // CORS configuration
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3000'
    ],
    credentials: true
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'development-secret-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'development-refresh-secret-key',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'airline-management-system',
    audience: process.env.JWT_AUDIENCE || 'airline-users'
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '10MB',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
    console: process.env.NODE_ENV === 'development'
  }
};

// Выводим конфигурацию в development режиме
if (config.nodeEnv === 'development') {
  console.log('📋 Конфигурация сервера:');
  console.log(`  Порт: ${config.port}`);
  console.log(`  База данных: ${config.database.host}:${config.database.port}/${config.database.database}`);
  console.log(`  CORS Origin: ${config.cors.origin}`);
}

module.exports = config;