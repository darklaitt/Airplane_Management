const { body, param, query } = require('express-validator');

/**
 * Валидация для аутентификации и авторизации
 */
const authValidation = {
  // Валидация регистрации пользователя
  register: [
    body('username')
      .isLength({ min: 3, max: 50 })
      .withMessage('Имя пользователя должно содержать от 3 до 50 символов')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Имя пользователя может содержать только буквы, цифры и подчеркивания')
      .trim(),
    
    body('email')
      .isEmail()
      .withMessage('Некорректный email адрес')
      .normalizeEmail()
      .isLength({ max: 100 })
      .withMessage('Email не должен превышать 100 символов'),
    
    body('password')
      .isLength({ min: 6, max: 128 })
      .withMessage('Пароль должен содержать от 6 до 128 символов')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Пароль должен содержать хотя бы одну строчную букву, одну заглавную букву и одну цифру'),
    
    body('first_name')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Имя должно содержать от 1 до 50 символов')
      .matches(/^[а-яё\s\-a-z]+$/i)
      .withMessage('Имя может содержать только буквы, пробелы и дефисы')
      .trim(),
    
    body('last_name')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Фамилия должна содержать от 1 до 50 символов')
      .matches(/^[а-яё\s\-a-z]+$/i)
      .withMessage('Фамилия может содержать только буквы, пробелы и дефисы')
      .trim(),
    
    body('role_id')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Некорректный ID роли')
      .toInt()
  ],

  // Валидация входа в систему
  login: [
    body('username')
      .notEmpty()
      .withMessage('Имя пользователя обязательно')
      .isLength({ max: 50 })
      .withMessage('Имя пользователя слишком длинное')
      .trim(),
    
    body('password')
      .notEmpty()
      .withMessage('Пароль обязателен')
      .isLength({ max: 128 })
      .withMessage('Пароль слишком длинный')
  ],

  // Валидация обновления токена
  refreshToken: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token обязателен')
      .isJWT()
      .withMessage('Некорректный формат токена')
  ]
};

/**
 * Валидация для самолетов
 */
const planeValidation = {
  // Валидация создания самолета
  create: [
    body('name')
      .isLength({ min: 1, max: 100 })
      .withMessage('Название самолета должно содержать от 1 до 100 символов')
      .matches(/^[а-яё\s\-a-z0-9]+$/i)
      .withMessage('Название может содержать только буквы, цифры, пробелы и дефисы')
      .trim(),
    
    body('category')
      .isIn(['Региональный', 'Средний', 'Дальний'])
      .withMessage('Категория должна быть одной из: Региональный, Средний, Дальний'),
    
    body('seats_count')
      .isInt({ min: 1, max: 1000 })
      .withMessage('Количество мест должно быть от 1 до 1000')
      .toInt()
  ],

  // Валидация обновления самолета
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Некорректный ID самолета')
      .toInt(),
    
    body('name')
      .isLength({ min: 1, max: 100 })
      .withMessage('Название самолета должно содержать от 1 до 100 символов')
      .matches(/^[а-яё\s\-a-z0-9]+$/i)
      .withMessage('Название может содержать только буквы, цифры, пробелы и дефисы')
      .trim(),
    
    body('category')
      .isIn(['Региональный', 'Средний', 'Дальний'])
      .withMessage('Категория должна быть одной из: Региональный, Средний, Дальний'),
    
    body('seats_count')
      .isInt({ min: 1, max: 1000 })
      .withMessage('Количество мест должно быть от 1 до 1000')
      .toInt()
  ],

  // Валидация получения самолета по ID
  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Некорректный ID самолета')
      .toInt()
  ],

  // Валидация удаления самолета
  delete: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Некорректный ID самолета')
      .toInt()
  ]
};

/**
 * Валидация для рейсов
 */
const flightValidation = {
  // Валидация создания рейса
  create: [
    body('flight_number')
      .matches(/^[A-Z0-9]{2,10}$/)
      .withMessage('Номер рейса должен содержать от 2 до 10 символов (только заглавные буквы и цифры)')
      .trim(),
    
    body('plane_id')
      .isInt({ min: 1 })
      .withMessage('Некорректный ID самолета')
      .toInt(),
    
    body('stops')
      .isArray({ min: 2 })
      .withMessage('Должны быть указаны минимум пункт отправления и пункт назначения'),
    
    body('stops.*')
      .isLength({ min: 1, max: 100 })
      .withMessage('Название пункта должно содержать от 1 до 100 символов')
      .matches(/^[а-яё\s\-a-z]+$/i)
      .withMessage('Название пункта может содержать только буквы, пробелы и дефисы')
      .trim(),
    
    body('departure_time')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
      .withMessage('Неверный формат времени (HH:mm:ss)'),
    
    body('free_seats')
      .isInt({ min: 0 })
      .withMessage('Количество свободных мест не может быть отрицательным')
      .toInt(),
    
    body('price')
      .isFloat({ min: 0.01, max: 1000000 })
      .withMessage('Цена должна быть от 0.01 до 1,000,000')
      .toFloat()
  ],

  // Валидация обновления рейса
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Некорректный ID рейса')
      .toInt(),
    
    body('flight_number')
      .matches(/^[A-Z0-9]{2,10}$/)
      .withMessage('Номер рейса должен содержать от 2 до 10 символов (только заглавные буквы и цифры)')
      .trim(),
    
    body('plane_id')
      .isInt({ min: 1 })
      .withMessage('Некорректный ID самолета')
      .toInt(),
    
    body('stops')
      .isArray({ min: 2 })
      .withMessage('Должны быть указаны минимум пункт отправления и пункт назначения'),
    
    body('stops.*')
      .isLength({ min: 1, max: 100 })
      .withMessage('Название пункта должно содержать от 1 до 100 символов')
      .matches(/^[а-яё\s\-a-z]+$/i)
      .withMessage('Название пункта может содержать только буквы, пробелы и дефисы')
      .trim(),
    
    body('departure_time')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
      .withMessage('Неверный формат времени (HH:mm:ss)'),
    
    body('free_seats')
      .isInt({ min: 0 })
      .withMessage('Количество свободных мест не может быть отрицательным')
      .toInt(),
    
    body('price')
      .isFloat({ min: 0.01, max: 1000000 })
      .withMessage('Цена должна быть от 0.01 до 1,000,000')
      .toFloat()
  ],

  // Валидация получения рейса по ID
  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Некорректный ID рейса')
      .toInt()
  ],

  // Валидация удаления рейса
  delete: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Некорректный ID рейса')
      .toInt()
  ],

  // Валидация поиска ближайшего рейса
  findNearest: [
    query('destination')
      .isLength({ min: 1, max: 100 })
      .withMessage('Пункт назначения должен содержать от 1 до 100 символов')
      .matches(/^[а-яё\s\-a-z]+$/i)
      .withMessage('Пункт назначения может содержать только буквы, пробелы и дефисы')
      .trim()
  ],

  // Валидация получения рейсов по самолету
  getByPlane: [
    param('planeId')
      .isInt({ min: 1 })
      .withMessage('Некорректный ID самолета')
      .toInt()
  ],

  // Валидация получения загруженности рейса
  getFlightLoad: [
    param('flightNumber')
      .matches(/^[A-Z0-9]{2,10}$/)
      .withMessage('Некорректный номер рейса')
      .trim(),
    
    query('startDate')
      .isISO8601()
      .withMessage('Некорректная дата начала (формат: YYYY-MM-DD)')
      .toDate(),
    
    query('endDate')
      .isISO8601()
      .withMessage('Некорректная дата окончания (формат: YYYY-MM-DD)')
      .toDate()
      .custom((endDate, { req }) => {
        if (endDate <= req.query.startDate) {
          throw new Error('Дата окончания должна быть больше даты начала');
        }
        return true;
      })
  ],

  // Валидация проверки свободных мест
  checkSeats: [
    param('flightNumber')
      .matches(/^[A-Z0-9]{2,10}$/)
      .withMessage('Некорректный номер рейса')
      .trim()
  ],

  // Валидация поиска рейсов для замены самолета
  getReplacementCandidates: [
    query('minFreeSeatsPercentage')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Процент свободных мест должен быть от 0 до 100')
      .toFloat()
  ]
};

/**
 * Валидация для билетов
 */
const ticketValidation = {
  // Валидация создания билета (продажи)
  create: [
    body('counter_number')
      .isInt({ min: 1, max: 100 })
      .withMessage('Номер кассы должен быть от 1 до 100')
      .toInt(),
    
    body('flight_number')
      .matches(/^[A-Z0-9]{2,10}$/)
      .withMessage('Некорректный номер рейса')
      .trim(),
    
    body('flight_date')
      .isISO8601()
      .withMessage('Некорректная дата вылета (формат: YYYY-MM-DD)')
      .toDate()
      .custom((flightDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (flightDate < today) {
          throw new Error('Дата вылета не может быть в прошлом');
        }
        return true;
      }),
    
    body('sale_time')
      .isISO8601()
      .withMessage('Некорректное время продажи (формат: YYYY-MM-DDTHH:mm:ss)')
      .toDate()
      .custom((saleTime) => {
        const now = new Date();
        const maxTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 часа
        if (saleTime > maxTime) {
          throw new Error('Время продажи не может быть в далеком будущем');
        }
        return true;
      })
  ],

  // Валидация получения билета по ID
  getById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Некорректный ID билета')
      .toInt()
  ],

  // Валидация удаления билета
  delete: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Некорректный ID билета')
      .toInt()
  ],

  // Валидация получения билетов по рейсу
  getByFlight: [
    param('flightNumber')
      .matches(/^[A-Z0-9]{2,10}$/)
      .withMessage('Некорректный номер рейса')
      .trim()
  ],

  // Валидация получения билетов по диапазону дат
  getByDateRange: [
    query('startDate')
      .isISO8601()
      .withMessage('Некорректная дата начала (формат: YYYY-MM-DD)')
      .toDate(),
    
    query('endDate')
      .isISO8601()
      .withMessage('Некорректная дата окончания (формат: YYYY-MM-DD)')
      .toDate()
      .custom((endDate, { req }) => {
        if (endDate <= req.query.startDate) {
          throw new Error('Дата окончания должна быть больше даты начала');
        }
        const daysDiff = (endDate - req.query.startDate) / (1000 * 60 * 60 * 24);
        if (daysDiff > 365) {
          throw new Error('Период не может превышать 365 дней');
        }
        return true;
      })
  ],

  // Валидация получения продаж по кассам
  getSalesByCounter: [
    query('startDate')
      .isISO8601()
      .withMessage('Некорректная дата начала (формат: YYYY-MM-DD)')
      .toDate(),
    
    query('endDate')
      .isISO8601()
      .withMessage('Некорректная дата окончания (формат: YYYY-MM-DD)')
      .toDate()
      .custom((endDate, { req }) => {
        if (endDate <= req.query.startDate) {
          throw new Error('Дата окончания должна быть больше даты начала');
        }
        return true;
      })
  ]
};

/**
 * Валидация для отчетов
 */
const reportValidation = {
  // Валидация отчета по загруженности рейсов
  flightLoad: [
    query('startDate')
      .isISO8601()
      .withMessage('Некорректная дата начала (формат: YYYY-MM-DD)')
      .toDate(),
    
    query('endDate')
      .isISO8601()
      .withMessage('Некорректная дата окончания (формат: YYYY-MM-DD)')
      .toDate()
      .custom((endDate, { req }) => {
        if (endDate <= req.query.startDate) {
          throw new Error('Дата окончания должна быть больше даты начала');
        }
        return true;
      })
  ],

  // Валидация отчета по продажам
  sales: [
    query('startDate')
      .isISO8601()
      .withMessage('Некорректная дата начала (формат: YYYY-MM-DD)')
      .toDate(),
    
    query('endDate')
      .isISO8601()
      .withMessage('Некорректная дата окончания (формат: YYYY-MM-DD)')
      .toDate()
      .custom((endDate, { req }) => {
        if (endDate <= req.query.startDate) {
          throw new Error('Дата окончания должна быть больше даты начала');
        }
        return true;
      })
  ]
};

/**
 * Общие валидационные функции
 */
const commonValidation = {
  // Валидация ID в параметрах
  idParam: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Некорректный ID')
      .toInt()
  ],

  // Валидация пагинации
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Номер страницы должен быть от 1 до 1000')
      .toInt(),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Лимит записей должен быть от 1 до 100')
      .toInt()
  ],

  // Валидация сортировки
  sorting: [
    query('sortBy')
      .optional()
      .isAlpha()
      .withMessage('Поле сортировки может содержать только буквы'),
    
    query('sortDirection')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Направление сортировки должно быть asc или desc')
  ]
};

/**
 * Middleware для обработки ошибок валидации
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Ошибки валидации данных',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

module.exports = {
  authValidation,
  planeValidation,
  flightValidation,
  ticketValidation,
  reportValidation,
  commonValidation,
  handleValidationErrors
};