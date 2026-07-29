const { TaskComment, TaskHistory, User } = require('../models');
const ApiError = require('../utils/ApiError');
const HistoryService = require('./historyService');

const userAttributes = ['id', 'firstName', 'lastName', 'email', 'avatar'];

const CommentService = {
  async getByTask(taskId) {
    return TaskComment.findAll({
      where: { taskId },
      include: [{ model: User, as: 'user', attributes: userAttributes }],
      order: [['createdAt', 'ASC']],
    });
  },

  async create(data, userId) {
    const comment = await TaskComment.create({
      taskId: data.taskId,
      userId,
      content: data.content,
      mentions: data.mentions || null,
      attachments: data.attachments || null,
    });

    await HistoryService.logChange(
      data.taskId, userId, 'comment', null, 'Comment added', 'comment'
    );

    return TaskComment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: userAttributes }],
    });
  },

  async update(id, data, userId) {
    const comment = await TaskComment.findByPk(id);
    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    const oldContent = comment.content;
    await comment.update({
      content: data.content,
      mentions: data.mentions !== undefined ? data.mentions : comment.mentions,
      attachments: data.attachments !== undefined ? data.attachments : comment.attachments,
      editedAt: new Date(),
    });

    await HistoryService.logChange(
      comment.taskId, userId, 'comment', 'Comment edited', null, 'comment'
    );

    return TaskComment.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: userAttributes }],
    });
  },

  async delete(id) {
    const comment = await TaskComment.findByPk(id);
    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    await comment.destroy();
    return true;
  },
};

module.exports = CommentService;
