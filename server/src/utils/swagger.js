const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('../config/config');

// Swagger конфигурация
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Airline Management System API',
      version: '1.0.0',
      description: `
        # Система управления авиаперевозками
        
        Это API для управления авиаперевозками, включающее:
        - Управление самолетами
        - Управление рейсами
        - Продажу билетов
        - Формирование отчетов
        - Аутентификацию и авторизацию пользователей
        
        ## Аутентификация
        
        API использует JWT токены для аутентификации. Для получения токена используйте эндпоинт /auth/login.
        
        ## Разрешения
        
        Система поддерживает ролевую модель доступа с следующими ролями:
        - **admin** - полный доступ ко всем функциям
        - **manager** - управление самолетами, рейсами, билетами и просмотр отчетов
        - **cashier** - продажа билетов и просмотр рейсов
        - **analyst** - только просмотр данных и отчетов
      `,
      contact: {
        name: 'МИРЭА РТУ',
        email: 'admin@mirea.ru',
        url: 'https://www.mirea.ru'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      termsOfService: 'https://example.com/terms'
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api`,
        description: 'Development server'
      },
      {
        url: 'https://api.airline-system.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Введите JWT токен в поле значения'
        }
      },
      schemas: {
        // Модель самолета
        Plane: {
          type: 'object',
          required: ['name', 'category', 'seats_count'],
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор самолета',
              example: 1,
              readOnly: true
            },
            name: {
              type: 'string',
              description: 'Название модели самолета',
              example: 'Boeing 737-800',
              maxLength: 100
            },
            category: {
              type: 'string',
              enum: ['Региональный', 'Средний', 'Дальний'],
              description: 'Категория самолета по дальности полета',
              example: 'Средний'
            },
            seats_count: {
              type: 'integer',
              minimum: 1,
              maximum: 1000,
              description: 'Общее количество мест в самолете',
              example: 189
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Дата и время создания записи',
              readOnly: true
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Дата и время последнего обновления',
              readOnly: true
            }
          }
        },
        
        // Модель рейса
        Flight: {
          type: 'object',
          required: ['flight_number', 'plane_id', 'stops', 'departure_time', 'free_seats', 'price'],
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор рейса',
              example: 1,
              readOnly: true
            },
            flight_number: {
              type: 'string',
              pattern: '^[A-Z0-9]{2,10}$',
              description: 'Номер рейса (2-10 символов, только заглавные буквы и цифры)',
              example: 'SU1234'
            },
            plane_id: {
              type: 'integer',
              description: 'ID самолета, выполняющего рейс',
              example: 1
            },
            plane_name: {
              type: 'string',
              description: 'Название самолета',
              example: 'Boeing 737-800',
              readOnly: true
            },
            stops: {
              type: 'array',
              items: {
                type: 'string',
                maxLength: 100
              },
              minItems: 2,
              description: 'Список пунктов маршрута (минимум 2: отправление и назначение)',
              example: ['Москва', 'Санкт-Петербург']
            },
            departure_time: {
              type: 'string',
              format: 'time',
              pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$',
              description: 'Время вылета в формате HH:mm:ss',
              example: '10:30:00'
            },
            free_seats: {
              type: 'integer',
              minimum: 0,
              description: 'Количество свободных мест на рейсе',
              example: 150
            },
            seats_count: {
              type: 'integer',
              description: 'Общее количество мест (из самолета)',
              example: 189,
              readOnly: true
            },
            price: {
              type: 'number',
              format: 'float',
              minimum: 0.01,
              maximum: 1000000,
              description: 'Цена билета в рублях',
              example: 8500.00
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              readOnly: true
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              readOnly: true
            }
          }
        },
        
        // Модель билета
        Ticket: {
          type: 'object',
          required: ['counter_number', 'flight_number', 'flight_date', 'sale_time'],
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор билета',
              example: 1,
              readOnly: true
            },
            counter_number: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Номер кассы, через которую продан билет',
              example: 1
            },
            flight_number: {
              type: 'string',
              description: 'Номер рейса',
              example: 'SU1234'
            },
            flight_date: {
              type: 'string',
              format: 'date',
              description: 'Дата вылета',
              example: '2025-05-15'
            },
            sale_time: {
              type: 'string',
              format: 'date-time',
              description: 'Дата и время продажи билета',
              example: '2025-05-10T10:30:00Z'
            },
            plane_name: {
              type: 'string',
              description: 'Название самолета',
              readOnly: true
            },
            stops: {
              type: 'array',
              items: { type: 'string' },
              description: 'Маршрут рейса',
              readOnly: true
            },
            price: {
              type: 'number',
              description: 'Цена билета',
              readOnly: true
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              readOnly: true
            }
          }
        },
        
        // Модель пользователя
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор пользователя',
              example: 1
            },
            username: {
              type: 'string',
              description: 'Имя пользователя',
              example: 'admin'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя',
              example: 'admin@example.com'
            },
            first_name: {
              type: 'string',
              description: 'Имя',
              example: 'Иван'
            },
            last_name: {
              type: 'string',
              description: 'Фамилия',
              example: 'Иванов'
            },
            role: {
              type: 'string',
              description: 'Роль пользователя',
              example: 'admin'
            },
            permissions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Список разрешений пользователя',
              example: ['*']
            },
            last_login: {
              type: 'string',
              format: 'date-time',
              description: 'Время последнего входа'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Дата регистрации'
            }
          }
        },
        
        // Стандартные ответы
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
              description: 'Статус выполнения операции'
            },
            message: {
              type: 'string',
              example: 'Операция выполнена успешно',
              description: 'Сообщение о результате'
            },
            data: {
              type: 'object',
              description: 'Данные ответа (тип зависит от операции)'
            }
          }
        },
        
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
              description: 'Статус выполнения операции'
            },
            message: {
              type: 'string',
              example: 'Произошла ошибка',
              description: 'Основное сообщение об ошибке'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Поле, в котором произошла ошибка'
                  },
                  message: {
                    type: 'string',
                    description: 'Описание ошибки'
                  },
                  value: {
                    description: 'Значение, которое вызвало ошибку'
                  }
                }
              },
              description: 'Детальная информация об ошибках валидации'
            }
          }
        },
        
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Ошибки валидации данных'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'name' },
                  message: { type: 'string', example: 'Поле обязательно для заполнения' },
                  value: { example: '' }
                }
              }
            }
          }
        },
        
        // Аутентификация
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Имя пользователя или email',
              example: 'admin'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Пароль пользователя',
              example: 'password123'
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
                  $ref: '#/components/schemas/User'
                },
                accessToken: {
                  type: 'string',
                  description: 'JWT токен доступа (действует 15 минут)',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                refreshToken: {
                  type: 'string',
                  description: 'JWT refresh токен (действует 7 дней)',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        },
        
        // Отчеты
        GeneralReport: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                totalFlights: { type: 'integer', example: 10 },
                totalDirectFlights: { type: 'integer', example: 5 },
                flightsWithConnections: { type: 'integer', example: 5 },
                averagePrice: { type: 'string', example: '25000.00' },
                totalCapacity: { type: 'integer', example: 2000 },
                totalFreeSeats: { type: 'integer', example: 1200 },
                overallLoadPercentage: { type: 'string', example: '40.00' }
              }
            },
            mostExpensiveFlight: {
              $ref: '#/components/schemas/Flight'
            },
            flightsForReplacement: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  flight_number: { type: 'string' },
                  plane_name: { type: 'string' },
                  free_seats: { type: 'integer' },
                  seats_count: { type: 'integer' },
                  free_seats_percentage: { type: 'string' }
                }
              }
            }
          }
        }
      },
      
      parameters: {
        IdParam: {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1
          },
          description: 'Уникальный идентификатор записи'
        },
        DateParam: {
          name: 'date',
          in: 'query',
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Дата в формате YYYY-MM-DD'
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 50
          },
          description: 'Количество записей на странице'
        },
        OffsetParam: {
          name: 'offset',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 0,
            default: 0
          },
          description: 'Смещение для пагинации'
        }
      },
      
      responses: {
        Success: {
          description: 'Операция выполнена успешно',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SuccessResponse'
              }
            }
          }
        },
        Created: {
          description: 'Ресурс создан успешно',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SuccessResponse'
              }
            }
          }
        },
        BadRequest: {
          description: 'Неверный запрос',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError'
              }
            }
          }
        },
        Unauthorized: {
          description: 'Требуется аутентификация',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Токен доступа отсутствует'
              }
            }
          }
        },
        Forbidden: {
          description: 'Доступ запрещен',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Недостаточно прав для выполнения данного действия'
              }
            }
          }
        },
        NotFound: {
          description: 'Ресурс не найден',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Запись не найдена'
              }
            }
          }
        },
        Conflict: {
          description: 'Конфликт данных',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Ресурс уже существует или связан с другими записями'
              }
            }
          }
        },
        InternalError: {
          description: 'Внутренняя ошибка сервера',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Произошла внутренняя ошибка сервера'
              }
            }
          }
        }
      }
    },
    
    // Применяем аутентификацию ко всем маршрутам по умолчанию
    security: [
      {
        bearerAuth: []
      }
    ],
    
    // Теги для группировки операций
    tags: [
      {
        name: 'Authentication',
        description: 'Операции аутентификации и авторизации'
      },
      {
        name: 'Planes',
        description: 'Управление самолетами'
      },
      {
        name: 'Flights',
        description: 'Управление рейсами'
      },
      {
        name: 'Tickets',
        description: 'Управление билетами'
      },
      {
        name: 'Reports',
        description: 'Формирование отчетов'
      },
      {
        name: 'Health',
        description: 'Проверка состояния системы'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

// Создаем спецификацию OpenAPI
const specs = swaggerJsdoc(swaggerOptions);

// Настройки UI
const swaggerUiOptions = {
  customSiteTitle: 'Airline Management API Documentation',
  customfavIcon: '/favicon.ico',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #3b4151; }
    .swagger-ui .scheme-container { background: #fafafa; padding: 15px; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    docExpansion: 'list',
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    operationsSorter: 'alpha',
    tagsSorter: 'alpha'
  }
};

module.exports = {
  specs,
  swaggerUi,
  swaggerUiOptions
};