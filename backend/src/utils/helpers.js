const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const slugifyLib = require('slugify');
const env = require('../config/env');

class Helpers {
  static generateToken(userId, role) {
    return jwt.sign(
      { id: userId, role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }

  static generateRefreshToken(userId) {
    return jwt.sign(
      { id: userId },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );
  }

  static verifyToken(token) {
    return jwt.verify(token, env.JWT_SECRET);
  }

  static verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  }

  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static generateRandomPassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
    return password;
  }

  static slugify(text) {
    return slugifyLib(text, { lower: true, strict: true });
  }

  static sanitizeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static parseDuration(seconds) {
    if (!seconds || seconds < 0) return '0 hours';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }
}

module.exports = Helpers;
