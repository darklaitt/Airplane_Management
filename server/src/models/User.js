const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class User {
  static async create(userData) {
    const { username, email, password, role_id } = userData;
    
    // Хешируем пароль
    const saltRounds = config.security?.bcryptRounds || 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    return {
      id: 1,
      username,
      email,
      role_id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      is_active: true,
      created_at: new Date()
    };
  }

  static async findByUsername(username) {
    // Mock для тестирования
    if (username === 'admin') {
      return {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        password_hash: await bcrypt.hash('admin123', 12),
        role_name: 'admin',
        permissions: ['*'],
        is_active: true,
        locked_until: null,
        failed_login_attempts: 0
      };
    }
    return null;
  }

  static async findByEmail(email) {
    // Mock для тестирования
    if (email === 'admin@example.com') {
      return {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role_name: 'admin',
        permissions: ['*']
      };
    }
    return null;
  }

  static async findById(id) {
    if (id === 1) {
      return {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role_name: 'admin',
        permissions: ['*'],
        is_active: true,
        locked_until: null
      };
    }
    return null;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateLastLogin(userId, ipAddress) {
    return true;
  }

  static async incrementFailedLoginAttempts(userId) {
    return { failed_login_attempts: 1, locked_until: null };
  }

  static async resetFailedLoginAttempts(userId) {
    return true;
  }

  static generateTokens(user) {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role_name,
      permissions: user.permissions
    };

    const accessToken = jwt.sign(payload, config.jwt?.secret || 'test-secret', { 
      expiresIn: '15m'
    });
    
    const refreshToken = jwt.sign({ id: user.id }, config.jwt?.refreshSecret || 'test-refresh-secret', { 
      expiresIn: '7d'
    });

    return { accessToken, refreshToken };
  }

  static async saveSession(userId, tokenHash, expiresAt, ipAddress, userAgent) {
    return true;
  }

  static async findSession(tokenHash) {
    return {
      id: 1,
      user_id: 1,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }

  static async removeSession(tokenHash) {
    return true;
  }

  static async logAction(userId, action, resourceType = null, resourceId = null, details = {}) {
    return true;
  }

  static verifyToken(token, secret) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }

  static async updateProfile(userId, profileData) {
    return {
      id: userId,
      ...profileData
    };
  }

  static async updatePassword(userId, newPassword) {
    return true;
  }
}

module.exports = User;