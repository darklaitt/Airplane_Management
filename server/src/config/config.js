require('dotenv').config();

module.exports = {
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
    max: parseInt(process.env.DB_MAX_CONNECTIONS, 10) || 10,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 5000
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '24h', // Увеличиваем для тестирования
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'airline-management-system',
    audience: process.env.JWT_AUDIENCE || 'airline-users'
  },
  
  // Security configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION, 10) || 30, // minutes
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT, 10) || 60, // minutes
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 6
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // requests per window
    message: 'Слишком много запросов, попробуйте позже'
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '10MB',
    maxFiles: parseInt(process.env.LOG_MAX_FILES, 10) || 5,
    console: process.env.NODE_ENV === 'development'
  },
  
  // Development configuration
  development: {
    useMockData: true, // Используем тестовые данные всегда
    enableSwagger: process.env.ENABLE_SWAGGER !== 'false'
  }
};