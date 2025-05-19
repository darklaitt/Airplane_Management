const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/config');
const { logger, stream } = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

// Импорт маршрутов
const planeRoutes = require('./routes/planeRoutes');
const flightRoutes = require('./routes/flightRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Создание приложения Express
const app = express();

// Middleware для безопасности (упрощенный для разработки)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS настройки
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (более мягкий для разработки)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // увеличил лимит для разработки
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Пропускаем localhost в development
    return req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === 'localhost';
  }
});

app.use('/api/', limiter);

// Логирование запросов (только в development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: 'connected' // TODO: добавить реальную проверку БД
  });
});

// API маршруты (БЕЗ АУТЕНТИФИКАЦИИ для разработки)
app.use('/api/planes', planeRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/reports', reportRoutes);

// Простые auth routes для тестирования
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Простая проверка для разработки
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
        accessToken: 'dev-access-token',
        refreshToken: 'dev-refresh-token'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Неверные учетные данные'
    });
  }
});

app.get('/api/auth/verify', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 1,
      username: 'admin',
      role: 'admin',
      permissions: ['*']
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      permissions: ['*']
    }
  });
});

// Отладочный middleware для логирования всех запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Маршрут ${req.originalUrl} не найден`,
    availableRoutes: [
      'GET /api/planes',
      'POST /api/planes',
      'GET /api/flights',
      'POST /api/flights',
      'GET /api/tickets',
      'POST /api/tickets',
      'GET /api/reports'
    ]
  });
});

// Глобальный обработчик ошибок
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: error.message || 'Внутренняя ошибка сервера',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

module.exports = app;