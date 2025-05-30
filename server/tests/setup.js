// server/tests/setup.js
// Глобальные настройки для тестов

// Подавляем консольные логи во время тестов
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Устанавливаем переменные окружения для тестов
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_airline_management';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';

// Очистка после каждого теста
afterEach(() => {
  jest.clearAllMocks();
});

// Глобальная очистка после всех тестов
afterAll(() => {
  // Восстанавливаем консоль
  global.console = originalConsole;
});