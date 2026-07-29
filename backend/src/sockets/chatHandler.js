const { ChatMessage, ChatConversation, ChatParticipant } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

module.exports = (namespace, socket) => {
  socket.on('join_conversation', async (data) => {
    try {
      const { conversationId } = data;
      if (!conversationId) return;

      const participant = await ChatParticipant.findOne({
        where: { conversationId, userId: socket.userId },
      });

      if (!participant) {
        socket.emit('error', { message: 'You are not a participant of this conversation' });
        return;
      }

      socket.join(`conversation:${conversationId}`);
      socket.emit('joined_conversation', { conversationId });
    } catch (error) {
      logger.error('join_conversation error:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  socket.on('leave_conversation', (data) => {
    const { conversationId } = data;
    if (conversationId) {
      socket.leave(`conversation:${conversationId}`);
      socket.emit('left_conversation', { conversationId });
    }
  });

  socket.on('send_message', async (data) => {
    try {
      const { conversationId, message, messageType, attachments } = data;

      if (!conversationId || !message) {
        socket.emit('error', { message: 'Conversation ID and message are required' });
        return;
      }

      const participant = await ChatParticipant.findOne({
        where: { conversationId, userId: socket.userId },
      });

      if (!participant) {
        socket.emit('error', { message: 'You are not a participant of this conversation' });
        return;
      }

      const validTypes = ['text', 'image', 'file', 'voice', 'system'];
      const msgType = validTypes.includes(messageType) ? messageType : 'text';

      const chatMessage = await ChatMessage.create({
        senderId: socket.userId,
        conversationId,
        message,
        messageType: msgType,
        attachments: attachments || null,
      });

      await ChatConversation.update(
        { lastMessageAt: new Date() },
        { where: { id: conversationId } }
      );

      const messageData = chatMessage.toJSON();
      messageData.sender = { id: socket.userId };

      namespace.to(`conversation:${conversationId}`).emit('new_message', messageData);
    } catch (error) {
      logger.error('send_message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('typing', (data) => {
    const { conversationId } = data;
    if (conversationId) {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId: socket.userId,
      });
    }
  });

  socket.on('stop_typing', (data) => {
    const { conversationId } = data;
    if (conversationId) {
      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
        conversationId,
        userId: socket.userId,
      });
    }
  });

  socket.on('mark_read', async (data) => {
    try {
      const { conversationId } = data;
      if (!conversationId) return;

      await ChatParticipant.update(
        { lastReadAt: new Date() },
        { where: { conversationId, userId: socket.userId } }
      );

      await ChatMessage.update(
        { isRead: true, readAt: new Date() },
        {
          where: {
            conversationId,
            senderId: { [Op.ne]: socket.userId },
            isRead: false,
          },
        }
      );

      namespace.to(`conversation:${conversationId}`).emit('messages_read', {
        conversationId,
        userId: socket.userId,
      });
    } catch (error) {
      logger.error('mark_read error:', error);
    }
  });

  socket.on('get_messages', async (data) => {
    try {
      const { conversationId, page = 1, limit = 50 } = data;
      if (!conversationId) return;

      const participant = await ChatParticipant.findOne({
        where: { conversationId, userId: socket.userId },
      });

      if (!participant) {
        socket.emit('error', { message: 'You are not a participant of this conversation' });
        return;
      }

      const offset = (page - 1) * limit;
      const { rows, count } = await ChatMessage.findAndCountAll({
        where: { conversationId },
        order: [['createdAt', 'DESC']],
        offset,
        limit,
        include: [
          {
            association: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
        ],
      });

      socket.emit('messages_history', {
        conversationId,
        messages: rows.reverse(),
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      logger.error('get_messages error:', error);
      socket.emit('error', { message: 'Failed to fetch messages' });
    }
  });
};
