const { query, getClient } = require('../utils/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class User {
  static async create(userData) {
    const { username, email, password, role_id, first_name, last_name } = userData;
    
    // Хешируем пароль
    const saltRounds = 10;
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
    
    // Логируем вход в систему
    await this.logAction(userId, 'LOGIN', null, null, { ip_address: ipAddress });
  }

  static async incrementFailedLoginAttempts(userId) {
    const result = await query(
      `UPDATE users SET 
        failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE 
          WHEN failed_login_attempts + 1 >= 5 THEN CURRENT_TIMESTAMP + INTERVAL '30 minutes'
          ELSE locked_until
        END
       WHERE id = $1 
       RETURNING failed_login_attempts, locked_until`,
      [userId]
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

    const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, config.jwtRefreshSecret, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  static async saveSession(userId, tokenHash, expiresAt, ipAddress, userAgent) {
    await query(
      `INSERT INTO user_sessions (user_id, token_hash, expires_at, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, tokenHash, expiresAt, ipAddress, userAgent]
    );
  }

  static async removeSession(tokenHash) {
    await query(
      `DELETE FROM user_sessions WHERE token_hash = $1`,
      [tokenHash]
    );
  }

  static async logAction(userId, action, resourceType = null, resourceId = null, details = {}) {
    await query(
      `INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, action, resourceType, resourceId, JSON.stringify(details), details.ip_address, details.user_agent]
    );
  }

  static async getAuditLogs(limit = 100, offset = 0) {
    const result = await query(
      `SELECT al.*, u.username, u.first_name, u.last_name 
       FROM audit_log al 
       LEFT JOIN users u ON al.user_id = u.id 
       ORDER BY al.timestamp DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result;
  }

  static verifyToken(token, secret) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }
}

module.exports = User;