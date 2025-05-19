const request = require('supertest');
const app = require('../src/app');
const { testConnection } = require('../src/utils/database');

// Mock database connection
jest.mock('../src/utils/database', () => ({
  testConnection: jest.fn(),
  query: jest.fn(),
  getClient: jest.fn()
}));

describe('Express App', () => {
  beforeAll(async () => {
    testConnection.mockResolvedValue(true);
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('Health Check', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('API Endpoints', () => {
    it('should have auth routes', async () => {
      await request(app)
        .post('/api/auth/login')
        .expect(400); // Validation error expected
    });

    it('should have planes routes', async () => {
      await request(app)
        .get('/api/planes')
        .expect(401); // Unauthorized expected
    });
  });
});