// Настройка окружения для тестов
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';

// Отключаем логирование в тестах
const winston = require('winston');
winston.configure({
  transports: [
    new winston.transports.Console({
      silent: true
    })
  ]
});

// Глобальная настройка для тестов
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  // Ждем завершения всех асинхронных операций
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Подавляем вывод console.log в тестах
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};