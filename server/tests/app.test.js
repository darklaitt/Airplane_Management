// server/tests/app.test.js
const request = require('supertest');
const app = require('../src/app');

// Mock database connection
jest.mock('../src/utils/database', () => ({
  testConnection: jest.fn(() => Promise.resolve()),
  query: jest.fn(() => Promise.resolve([])),
  getClient: jest.fn(() => Promise.resolve({
    query: jest.fn(),
    release: jest.fn()
  }))
}));

describe('Express App', () => {
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
        .send({}) // Empty body to trigger validation error
        .expect(400);
    });

    it('should have planes routes', async () => {
      await request(app)
        .get('/api/planes')
        .expect(401); // Unauthorized expected without token
    });

    it('should have flights routes', async () => {
      await request(app)
        .get('/api/flights')
        .expect(401); // Unauthorized expected without token
    });

    it('should have tickets routes', async () => {
      await request(app)
        .get('/api/tickets')
        .expect(401); // Unauthorized expected without token
    });

    it('should have reports routes', async () => {
      await request(app)
        .get('/api/reports/general')
        .expect(401); // Unauthorized expected without token
    });
  });

  describe('CORS', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parsing errors', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});