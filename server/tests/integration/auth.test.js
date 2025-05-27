const request = require('supertest');
const app = require('../../src/app');
const bcrypt = require('bcryptjs');

// Мокаем базу данных для интеграционных тестов
jest.mock('../../src/utils/database', () => ({
  query: jest.fn(),
  getClient: jest.fn(() => ({
    query: jest.fn(),
    release: jest.fn(),
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn()
  })),
  testConnection: jest.fn().mockResolvedValue(true)
}));

describe('Authentication Integration Tests', () => {
  let server;
  let accessToken;
  let refreshToken;
  let userId = 1;
  const { query } = require('../../src/utils/database');

  beforeAll(async () => {
    // Set up test environment
    server = app.listen(0); // Используем случайный порт
  });

  afterAll(async () => {
    // Clean up and close server
    if (server) {
      server.close();
    }
  });

  beforeEach(() => {
    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        first_name: 'Test',
        last_name: 'User'
      };

      // Мокаем проверку существования пользователя
      query
        .mockResolvedValueOnce([]) // findByUsername - пользователь не найден
        .mockResolvedValueOnce([]) // findByEmail - email не найден
        .mockResolvedValueOnce([{ // create user
          id: userId,
          username: userData.username,
          email: userData.email,
          created_at: new Date()
        }]);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(userData.username);
      expect(response.body.data.email).toBe(userData.email);
    });

    it('should not register user with existing username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test2@example.com',
        password: 'Password123!'
      };

      // Мокаем что пользователь уже существует
      query.mockResolvedValueOnce([{
        id: 1,
        username: userData.username
      }]);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('уже существует');
    });

    it('should validate password strength', async () => {
      const userData = {
        username: 'testuser2',
        email: 'test3@example.com',
        password: 'weak' // Слабый пароль
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('валидации');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const credentials = {
        username: 'testuser',
        password: 'Password123!'
      };

      const hashedPassword = await bcrypt.hash(credentials.password, 12);

      // Мокаем успешный поиск пользователя и проверку пароля
      query.mockResolvedValueOnce([{
        id: userId,
        username: credentials.username,
        email: 'test@example.com',
        password_hash: hashedPassword,
        role_name: 'analyst',
        permissions: ['planes:read', 'flights:read', 'tickets:read', 'reports:read'],
        is_active: true,
        locked_until: null
      }]);

      // Мокаем сохранение сессии
      query.mockResolvedValueOnce([]);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.username).toBe(credentials.username);

      // Save tokens for subsequent tests
      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });

    it('should not login with invalid credentials', async () => {
      const credentials = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      // Мокаем поиск пользователя
      query.mockResolvedValueOnce([{
        id: userId,
        username: credentials.username,
        password_hash: '$2b$12$mockedhashedpassword',
        is_active: true
      }]);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not login with non-existent user', async () => {
      const credentials = {
        username: 'nonexistent',
        password: 'Password123!'
      };

      // Мокаем что пользователь не найден
      query.mockResolvedValueOnce([]);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify valid token', async () => {
      // Мокаем пользователя для проверки токена
      query.mockResolvedValueOnce([{
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role_name: 'analyst',
        permissions: ['planes:read'],
        is_active: true
      }]);

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe('testuser');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject missing token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user info', async () => {
      // Мокаем пользователя
      query.mockResolvedValueOnce([{
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role_name: 'analyst',
        permissions: ['planes:read'],
        is_active: true
      }]);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe('testuser');
      expect(response.body.data.email).toBe('test@example.com');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token', async () => {
      // Мокаем поиск сессии
      query.mockResolvedValueOnce([{
        id: 1,
        user_id: userId,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней
      }]);

      // Мокаем пользователя
      query.mockResolvedValueOnce([{
        id: userId,
        username: 'testuser',
        role_name: 'analyst',
        permissions: ['planes:read'],
        is_active: true
      }]);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      // Мокаем удаление сессии
      query.mockResolvedValueOnce([]);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});