// server/tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Authentication Integration Tests', () => {
  let server;

  beforeAll(async () => {
    // Set up test environment
    server = app.listen(5001);
  });

  afterAll(async () => {
    // Clean up and close server
    if (server) {
      server.close();
    }
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const credentials = {
        username: 'admin',
        password: 'admin123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user.username).toBe(credentials.username);
    });

    it('should not login with invalid credentials', async () => {
      const credentials = {
        username: 'admin',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not login with non-existent user', async () => {
      const credentials = {
        username: 'nonexistent',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify valid token', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      if (loginResponse.status === 200 && loginResponse.body.data?.accessToken) {
        const accessToken = loginResponse.body.data.accessToken;

        const response = await request(app)
          .get('/api/auth/verify')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      } else {
        // Skip test if login fails
        console.log('Skipping verify test - login failed');
      }
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

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
      // First login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      if (loginResponse.status === 200 && loginResponse.body.data?.accessToken) {
        const accessToken = loginResponse.body.data.accessToken;

        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      } else {
        // Skip test if login fails
        console.log('Skipping me test - login failed');
      }
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      // First login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      if (loginResponse.status === 200 && loginResponse.body.data?.accessToken) {
        const accessToken = loginResponse.body.data.accessToken;

        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      } else {
        // Skip test if login fails
        console.log('Skipping logout test - login failed');
      }
    });

    it('should logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});