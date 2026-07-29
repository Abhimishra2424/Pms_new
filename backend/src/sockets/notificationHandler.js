const { Notification } = require('../models');
const logger = require('../utils/logger');

module.exports = (namespace, socket) => {
  socket.on('notification:send', (data) => {
    const { userId, notification } = data;
    if (userId && notification) {
      namespace.to(`user:${userId}`).emit('notification:receive', notification);
    }
  });

  socket.on('notification:mark_read', async (data) => {
    try {
      const { notificationId } = data;
      if (!notificationId) return;

      await Notification.update(
        { isRead: true, readAt: new Date() },
        { where: { id: notificationId, userId: socket.userId } }
      );

      socket.emit('notification:marked_read', { notificationId });
    } catch (error) {
      logger.error('notification:mark_read error:', error);
    }
  });

  socket.on('notification:get_all', async (data) => {
    try {
      const page = parseInt(data.page, 10) || 1;
      const limit = parseInt(data.limit, 10) || 20;
      const offset = (page - 1) * limit;

      const { rows, count } = await Notification.findAndCountAll({
        where: { userId: socket.userId },
        order: [['createdAt', 'DESC']],
        offset,
        limit,
      });

      socket.emit('notification:all', {
        notifications: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      logger.error('notification:get_all error:', error);
      socket.emit('error', { message: 'Failed to fetch notifications' });
    }
  });
};
