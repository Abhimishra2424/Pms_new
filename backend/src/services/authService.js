const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const authRepository = require('../repositories/authRepository');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role, companyId: user.companyId },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );
  }

  async register(data) {
    const existingUser = await authRepository.findByEmail(data.email);
    if (existingUser) {
      throw ApiError.badRequest('Email already registered');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await authRepository.createUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      role: 'developer',
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const userData = user.toJSON();
    delete userData.password;

    return { user: userData, accessToken, refreshToken };
  }

  async login(email, password) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated. Contact administrator.');
    }

    await authRepository.updateLastLogin(user.id);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const userData = user.toJSON();
    delete userData.password;

    return { user: userData, accessToken, refreshToken };
  }

  async refreshToken(token) {
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Refresh token has expired');
      }
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const user = await authRepository.findById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async forgotPassword(email) {
    const user = await authRepository.findByEmail(email);

    if (user) {
      const resetToken = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: '1h' });

      const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      // In production, send email via nodemailer
      // await sendEmail({ to: email, subject: 'Password Reset', html: `<a href="${resetLink}">Reset Password</a>` });

      // Fallback: log the reset link
      if (env.NODE_ENV === 'development') {
        console.log(`Password reset link: ${resetLink}`);
      }
    }

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async resetPassword(token, password) {
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw ApiError.badRequest('Reset token has expired');
      }
      throw ApiError.badRequest('Invalid reset token');
    }

    const user = await authRepository.findById(decoded.id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    await authRepository.updateUser(user.id, {
      password: hashedPassword,
    });
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await authRepository.updateUser(userId, { password: hashedPassword });
  }

  async getProfile(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const userData = user.toJSON();
    delete userData.password;
    return userData;
  }

  async updateProfile(userId, data) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const allowedFields = [
      'firstName', 'lastName', 'phone', 'avatar', 'address',
      'city', 'state', 'country', 'zipCode', 'timezone', 'language',
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const updatedUser = await authRepository.updateUser(userId, updateData);
    const userData = updatedUser.toJSON();
    delete userData.password;
    return userData;
  }
}

module.exports = new AuthService();
