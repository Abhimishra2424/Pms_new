const { ActivityLog, User } = require('../models');
const ApiError = require('../utils/ApiError');
const PaginationHelper = require('../utils/pagination');
const { Op } = require('sequelize');

const activityLogService = {
  async log(userId, companyId, action, resourceType, resourceId, description, metadata, req) {
    const logEntry = await ActivityLog.create({
      userId,
      companyId,
      action,
      resourceType,
      resourceId: resourceId || null,
      description: description || null,
      metadata: metadata || null,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.headers?.['user-agent'] || null,
    });

    return logEntry;
  },

  async getAll(query) {
    const pagination = PaginationHelper.getPaginationOptions(query);

    const where = {};

    if (query.companyId) where.companyId = query.companyId;
    if (query.resourceType) where.resourceType = query.resourceType;
    if (query.userId) where.userId = query.userId;
    if (query.action) where.action = query.action;
    if (query.startDate && query.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(query.startDate), new Date(query.endDate)],
      };
    }

    const { rows, count } = await ActivityLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset,
    });

    return {
      activityLogs: rows,
      pagination: PaginationHelper.getPaginationMeta(count, pagination.page, pagination.limit),
    };
  },

  async getByResource(resourceType, resourceId) {
    const logs = await ActivityLog.findAll({
      where: { resourceType, resourceId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    return logs;
  },

  async getByUser(userId) {
    const logs = await ActivityLog.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    return logs;
  },
};

module.exports = activityLogService;
