const { query, getClient } = require('../utils/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class User {
  static async create(userData) {
    const { username, email, password, role_id, first_name, last_name } = userData;
    
    // Хешируем пароль
    const saltRounds = config.security?.bcryptRounds || 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const result = await query(
      `INSERT INTO users (username, email, password_hash, role_id, first_name, last_name) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, role_id, first_name, last_name, is_active, created_at`,
      [username, email, password_hash, role_id, first_name, last_name]
    );
    
    return result[0];
  }

  static async findByUsername(username) {
    const result = await query(
      `SELECT u.*, r.name as role_name, r.permissions 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.username = $1`,
      [username]
    );
    return result[0];
  }

  static async findByEmail(email) {
    const result = await query(
      `SELECT u.*, r.name as role_name, r.permissions 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = $1`,
      [email]
    );
    return result[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT u.*, r.name as role_name, r.permissions 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1`,
      [id]
    );
    return result[0];
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateLastLogin(userId, ipAddress) {
    await query(
      `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
      [userId]
    );
  }

  static async incrementFailedLoginAttempts(userId) {
    const maxAttempts = config.security?.maxLoginAttempts || 5;
    const lockoutDuration = config.security?.lockoutDuration || 30;
    
    const result = await query(
      `UPDATE users SET 
        failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE 
          WHEN failed_login_attempts + 1 >= $2 THEN CURRENT_TIMESTAMP + INTERVAL '${lockoutDuration} minutes'
          ELSE locked_until
        END
       WHERE id = $1 
       RETURNING failed_login_attempts, locked_until`,
      [userId, maxAttempts]
    );
    return result[0];
  }

  static async resetFailedLoginAttempts(userId) {
    await query(
      `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1`,
      [userId]
    );
  }

  static generateTokens(user) {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role_name,
      permissions: user.permissions
    };

    const accessToken = jwt.sign(payload, config.jwt?.secret || process.env.JWT_SECRET, { 
      expiresIn: config.jwt?.accessTokenExpiry || '15m',
      issuer: config.jwt?.issuer || 'airline-management-system',
      audience: config.jwt?.audience || 'airline-users'
    });
    
    const refreshToken = jwt.sign({ id: user.id }, config.jwt?.refreshSecret || process.env.JWT_REFRESH_SECRET, { 
      expiresIn: config.jwt?.refreshTokenExpiry || '7d',
      issuer: config.jwt?.issuer || 'airline-management-system',
      audience: config.jwt?.audience || 'airline-users'
    });

    return { accessToken, refreshToken };
  }

  static async saveSession(userId, tokenHash, expiresAt, ipAddress, userAgent) {
    await query(
      `INSERT INTO user_sessions (user_id, token_hash, expires_at, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, tokenHash, expiresAt, ipAddress, userAgent]
    );
  }

  static async findSession(tokenHash) {
    const result = await query(
      `SELECT * FROM user_sessions WHERE token_hash = $1`,
      [tokenHash]
    );
    return result[0];
  }

  static async removeSession(tokenHash) {
    await query(
      `DELETE FROM user_sessions WHERE token_hash = $1`,
      [tokenHash]
    );
  }

  static verifyToken(token, secret) {
    try {
      return jwt.verify(token, secret, {
        issuer: config.jwt?.issuer || 'airline-management-system',
        audience: config.jwt?.audience || 'airline-users'
      });
    } catch (error) {
      return null;
    }
  }

  static async updateProfile(userId, profileData) {
    const { first_name, last_name, email } = profileData;
    const result = await query(
      `UPDATE users SET 
        first_name = $1, 
        last_name = $2, 
        email = $3,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 
       RETURNING id, username, email, first_name, last_name`,
      [first_name, last_name, email, userId]
    );
    return result[0];
  }

  static async updatePassword(userId, newPassword) {
    const saltRounds = config.security?.bcryptRounds || 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    await query(
      `UPDATE users SET 
        password_hash = $1,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [password_hash, userId]
    );
  }
}

module.exports = User;