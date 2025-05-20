const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// CORS настройки
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Базовые middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Логирование
app.use(morgan('dev'));

// Отладочный middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Подключение маршрутов
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Другие маршруты (если есть)
try {
  const planeRoutes = require('./routes/planeRoutes');
  app.use('/api/planes', planeRoutes);
} catch (e) {
  console.log('planeRoutes not found, skipping...');
}

try {
  const flightRoutes = require('./routes/flightRoutes');
  app.use('/api/flights', flightRoutes);
} catch (e) {
  console.log('flightRoutes not found, skipping...');
}

try {
  const ticketRoutes = require('./routes/ticketRoutes');
  app.use('/api/tickets', ticketRoutes);
} catch (e) {
  console.log('ticketRoutes not found, skipping...');
}

try {
  const reportRoutes = require('./routes/reportRoutes');
  app.use('/api/reports', reportRoutes);
} catch (e) {
  console.log('reportRoutes not found, skipping...');
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Маршрут ${req.originalUrl} не найден`
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера'
  });
});

module.exports = app;