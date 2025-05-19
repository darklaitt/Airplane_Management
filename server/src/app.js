const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/config');
const { logger, stream } = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

// Импорт маршрутов
const authRoutes = require('./routes/authRoutes');
const planeRoutes = require('./routes/planeRoutes');
const flightRoutes = require('./routes/flightRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Создание приложения Express
const app = express();

// Middleware для безопасности
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS настройки
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit?.windowMs || 15 * 60 * 1000, // 15 minutes
  max: config.rateLimit?.max || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: config.rateLimit?.message || 'Too many requests'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Исключения для определенных IP (например, для localhost в разработке)
  skip: (req) => {
    if (config.nodeEnv === 'development' && req.ip === '::1') {
      return true;
    }
    return false;
  }
});

app.use('/api/', limiter);

// Логирование запросов
app.use(morgan('combined', { stream }));

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
    memory: process.memoryUsage()
  });
});

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/planes', planeRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/reports', reportRoutes);

// Swagger конфигурация (опционально)
if (config.development?.enableSwagger && config.nodeEnv === 'development') {
  try {
    const swaggerUi = require('swagger-ui-express');
    const swaggerJsdoc = require('swagger-jsdoc');

    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Airline Management System API',
          version: '1.0.0',
          description: 'API для системы управления авиаперевозками',
        },
        servers: [
          {
            url: `http://localhost:${config.port}/api`,
            description: 'Development server'
          }
        ],
      },
      apis: ['./src/routes/*.js', './src/controllers/*.js'],
    };

    const specs = swaggerJsdoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    logger.info('Swagger documentation enabled at /api-docs');
  } catch (error) {
    logger.warn('Swagger not available:', error.message);
  }
}

// Статические файлы (если нужно)
if (config.nodeEnv === 'production') {
  app.use(express.static('public'));
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Маршрут ${req.originalUrl} не найден`
  });
});

// Глобальный обработчик ошибок
app.use(errorHandler);

module.exports = app;