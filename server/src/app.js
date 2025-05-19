const { query, getClient } = require('../utils/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class User {
  static async create(userData) {
    const { username, email, password, role_id, first_name, last_name } = userData;
    
    // Хешируем пароль
    const saltRounds = config.security.bcryptRounds;
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
          WHEN failed_login_attempts + 1 >= $2 THEN CURRENT_TIMESTAMP + INTERVAL '${config.security.lockoutDuration} minutes'
          ELSE locked_until
        END
       WHERE id = $1 
       RETURNING failed_login_attempts, locked_until`,
      [userId, config.security.maxLoginAttempts]
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

    const accessToken = jwt.sign(payload, config.jwt.secret, { 
      expiresIn: config.jwt.accessTokenExpiry,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience
    });
    
    const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret, { 
      expiresIn: config.jwt.refreshTokenExpiry,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience
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
      return jwt.verify(token, secret, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience
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
    const saltRounds = config.security.bcryptRounds;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    await query(
      `UPDATE users SET 
        password_hash = $1,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [password_hash, userId]
    );
  }

  static async cleanupExpiredSessions() {
    const result = await query(
      `DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP`
    );
    return result.rowCount;
  }

  static async getUserStats(userId) {
    const result = await query(
      `SELECT 
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.last_login,
        u.created_at,
        r.name as role_name,
        COUNT(al.id) as total_actions,
        MAX(al.timestamp) as last_action
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN audit_log al ON u.id = al.user_id
       WHERE u.id = $1
       GROUP BY u.id, r.name`,
      [userId]
    );
    return result[0];
  }

  static async getAllUsers(limit = 50, offset = 0) {
    const result = await query(
      `SELECT 
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.is_active,
        u.last_login,
        u.created_at,
        r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result;
  }

  static async getUsersByRole(roleId) {
    const result = await query(
      `SELECT 
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.is_active,
        u.last_login
       FROM users u
       WHERE u.role_id = $1 AND u.is_active = true
       ORDER BY u.username`,
      [roleId]
    );
    return result;
  }

  static async deactivateUser(userId) {
    await query(
      `UPDATE users SET is_active = false WHERE id = $1`,
      [userId]
    );
    
    // Удаляем все активные сессии пользователя
    await query(
      `DELETE FROM user_sessions WHERE user_id = $1`,
      [userId]
    );
  }

  static async activateUser(userId) {
    await query(
      `UPDATE users SET 
        is_active = true, 
        failed_login_attempts = 0, 
        locked_until = NULL 
       WHERE id = $1`,
      [userId]
    );
  }

  static async changeUserRole(userId, newRoleId) {
    const result = await query(
      `UPDATE users SET role_id = $1 WHERE id = $2 RETURNING id`,
      [newRoleId, userId]
    );
    
    // Удаляем все активные сессии пользователя, чтобы права обновились
    await query(
      `DELETE FROM user_sessions WHERE user_id = $1`,
      [userId]
    );
    
    return result[0];
  }

  static async getSecurityMetrics() {
    const result = await query(`
      SELECT 
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users,
        COUNT(CASE WHEN locked_until > CURRENT_TIMESTAMP THEN 1 END) as locked_users,
        COUNT(CASE WHEN failed_login_attempts >= 3 THEN 1 END) as users_with_failed_attempts,
        (SELECT COUNT(*) FROM user_sessions WHERE expires_at > CURRENT_TIMESTAMP) as active_sessions,
        (SELECT COUNT(*) FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP) as expired_sessions
      FROM users
    `);
    return result[0];
  }
}

module.exports = User;