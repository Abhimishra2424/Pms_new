const { Op } = require('sequelize');
const { Notification, User } = require('../models');
const ApiError = require('../utils/ApiError');
const PaginationHelper = require('../utils/pagination');
const logger = require('../utils/logger');
const env = require('../config/env');

let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

const notificationService = {
  async create(userId, data) {
    const { title, message, type, referenceId, referenceType, companyId } = data;

    const notification = await Notification.create({
      userId,
      companyId: companyId || null,
      title,
      message: message || null,
      type,
      referenceId: referenceId || null,
      referenceType: referenceType || null,
    });

    return notification;
  },

  async sendPush(userId, title, message, type, reference) {
    try {
      const notification = await this.create(userId, {
        title,
        message,
        type,
        referenceId: reference?.id || null,
        referenceType: reference?.type || null,
      });

      if (ioInstance) {
        ioInstance.of('/notifications')
          .to(`user:${userId}`)
          .emit('notification:receive', notification.toJSON());
      }

      return notification;
    } catch (error) {
      logger.error('sendPush error:', error);
      return null;
    }
  },

  async sendEmail(userId, subject, html) {
    try {
      const user = await User.findByPk(userId, { attributes: ['id', 'email', 'firstName', 'lastName'] });
      if (!user || !user.email) {
        logger.warn(`Cannot send email to user ${userId}: no email found`);
        return false;
      }

      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"PMS" <${env.SMTP_USER}>`,
        to: user.email,
        subject,
        html,
      });

      return true;
    } catch (error) {
      logger.error('sendEmail error:', error);
      return false;
    }
  },

  async getAll(userId, query) {
    const pagination = PaginationHelper.getPaginationOptions(query);

    const where = { userId };

    if (query.type) {
      where.type = query.type;
    }
    if (query.isRead !== undefined) {
      where.isRead = query.isRead === 'true' || query.isRead === true;
    }

    const { rows, count } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset,
    });

    return {
      notifications: rows,
      pagination: PaginationHelper.getPaginationMeta(count, pagination.page, pagination.limit),
    };
  },

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  },

  async markAllAsRead(userId) {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId, isRead: false } }
    );

    return true;
  },

  async getUnreadCount(userId) {
    const count = await Notification.count({
      where: { userId, isRead: false },
    });

    return count;
  },

  async delete(notificationId, userId) {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    await notification.destroy();
    return true;
  },
};

module.exports = { notificationService, setIO };
