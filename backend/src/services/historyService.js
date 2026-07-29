const { TaskHistory, User } = require('../models');

const userAttributes = ['id', 'firstName', 'lastName', 'email', 'avatar'];

const HistoryService = {
  async getByTask(taskId) {
    return TaskHistory.findAll({
      where: { taskId },
      include: [{ model: User, as: 'user', attributes: userAttributes }],
      order: [['createdAt', 'DESC']],
    });
  },

  async logChange(taskId, userId, field, oldValue, newValue, type = 'update', options = {}) {
    return TaskHistory.create({
      taskId,
      userId,
      field,
      oldValue: oldValue != null ? String(oldValue) : null,
      newValue: newValue != null ? String(newValue) : null,
      type,
    }, options);
  },
};

module.exports = HistoryService;
