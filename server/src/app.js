const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const config = require('./config/config');
const { logger, stream } = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

// Импорт маршрутов
const planeRoutes = require('./routes/planeRoutes');
const flightRoutes = require('./routes/flightRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');

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
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: config.rateLimit.message
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

// Swagger конфигурация
if (config.development.enableSwagger) {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Airline Management System API',
        version: '1.0.0',
        description: 'API для системы управления авиаперевозками',
        contact: {
          name: 'МИРЭА РТУ',
          email: 'admin@mirea.ru'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: `http://localhost:${config.port}/api`,
          description: 'Development server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: {
          Plane: {
            type: 'object',
            required: ['name', 'category', 'seats_count'],
            properties: {
              id: {
                type: 'integer',
                description: 'Уникальный идентификатор'
              },
              name: {
                type: 'string',
                description: 'Название самолета'
              },
              category: {
                type: 'string',
                enum: ['Региональный', 'Средний', 'Дальний'],
                description: 'Категория самолета'
              },
              seats_count: {
                type: 'integer',
                minimum: 1,
                description: 'Количество мест'
              }
            }
          },
          Flight: {
            type: 'object',
            required: ['flight_number', 'plane_id', 'stops', 'departure_time', 'free_seats', 'price'],
            properties: {
              id: {
                type: 'integer',
                description: 'Уникальный идентификатор'
              },
              flight_number: {
                type: 'string',
                description: 'Номер рейса'
              },
              plane_id: {
                type: 'integer',
                description: 'ID самолета'
              },
              stops: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Список остановок'
              },
              departure_time: {
                type: 'string',
                format: 'time',
                description: 'Время вылета'
              },
              free_seats: {
                type: 'integer',
                minimum: 0,
                description: 'Количество свободных мест'
              },
              price: {
                type: 'number',
                format: 'float',
                minimum: 0,
                description: 'Цена билета'
              }
            }
          },
          Ticket: {
            type: 'object',
            required: ['counter_number', 'flight_number', 'flight_date', 'sale_time'],
            properties: {
              id: {
                type: 'integer',
                description: 'Уникальный идентификатор'
              },
              counter_number: {
                type: 'integer',
                description: 'Номер кассы'
              },
              flight_number: {
                type: 'string',
                description: 'Номер рейса'
              },
              flight_date: {
                type: 'string',
                format: 'date',
                description: 'Дата вылета'
              },
              sale_time: {
                type: 'string',
                format: 'date-time',
                description: 'Время продажи'
              }
            }
          },
          SuccessResponse: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: true
              },
              message: {
                type: 'string',
                example: 'Операция выполнена успешно'
              },
              data: {
                type: 'object'
              }
            }
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: false
              },
              message: {
                type: 'string',
                example: 'Произошла ошибка'
              },
              errors: {
                type: 'array',
                items: {
                  type: 'object'
                }
              }
            }
          },
          LoginRequest: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
              username: {
                type: 'string',
                description: 'Имя пользователя'
              },
              password: {
                type: 'string',
                description: 'Пароль'
              }
            }
          },
          LoginResponse: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: true
              },
              message: {
                type: 'string',
                example: 'Успешный вход в систему'
              },
              data: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      username: { type: 'string' },
                      email: { type: 'string' },
                      role: { type: 'string' },
                      permissions: { 
                        type: 'array',
                        items: { type: 'string' }
                      }
                    }
                  },
                  accessToken: {
                    type: 'string',
                    description: 'JWT токен доступа'
                  },
                  refreshToken: {
                    type: 'string',
                    description: 'JWT refresh токен'
                  }
                }
              }
            }
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ]
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js']
  };

  const specs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customSiteTitle: 'Airline Management API',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true
    }
  }));
}

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

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Обработка неперехваченных исключений
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;