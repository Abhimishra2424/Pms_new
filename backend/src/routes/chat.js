const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { ChatConversation, ChatParticipant, ChatMessage, User } = require('../models');
const { authenticate } = require('../middleware/auth');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

router.use(authenticate);

router.get('/conversations', async (req, res, next) => {
  try {
    const conversations = await ChatConversation.findAll({
      include: [
        {
          model: ChatParticipant,
          as: 'participants',
          where: { userId: req.user.id },
          include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }],
        },
        {
          model: ChatMessage,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [{ model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
        },
      ],
      order: [['lastMessageAt', 'DESC']],
    });

    const result = await Promise.all(conversations.map(async (conv) => {
      const convJson = conv.toJSON();
      const unreadCount = await ChatMessage.count({
        where: {
          conversationId: conv.id,
          senderId: { [Op.ne]: req.user.id },
          isRead: false,
        },
      });
      return { ...convJson, unreadCount };
    }));

    return ApiResponse.success(res, result, 'Conversations retrieved successfully');
  } catch (error) {
    next(error);
  }
});

router.post('/conversations', async (req, res, next) => {
  try {
    const { type, name, participantIds } = req.body;

    if (type === 'direct') {
      const existingConversation = await ChatConversation.findOne({
        include: [
          {
            model: ChatParticipant,
            as: 'participants',
            where: { userId: req.user.id },
            required: true,
          },
          {
            model: ChatParticipant,
            as: 'participants',
            where: { userId: participantIds[0] },
            required: true,
          },
        ],
      });

      if (existingConversation) {
        const fullConv = await ChatConversation.findByPk(existingConversation.id, {
          include: [
            {
              model: ChatParticipant,
              as: 'participants',
              include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }],
            },
          ],
        });
        return ApiResponse.success(res, fullConv, 'Conversation already exists');
      }
    }

    const conversation = await ChatConversation.create({
      type: type || 'direct',
      name: name || null,
      createdBy: req.user.id,
    });

    const allParticipantIds = [req.user.id, ...(participantIds || [])];
    const uniqueIds = [...new Set(allParticipantIds)];

    const participants = await ChatParticipant.bulkCreate(
      uniqueIds.map((userId) => ({
        conversationId: conversation.id,
        userId,
      }))
    );

    const result = await ChatConversation.findByPk(conversation.id, {
      include: [
        {
          model: ChatParticipant,
          as: 'participants',
          include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }],
        },
      ],
    });

    return ApiResponse.success(res, result, 'Conversation created successfully', 201);
  } catch (error) {
    next(error);
  }
});

router.get('/conversations/:id', async (req, res, next) => {
  try {
    const participant = await ChatParticipant.findOne({
      where: { conversationId: req.params.id, userId: req.user.id },
    });
    if (!participant) {
      throw ApiError.forbidden('You are not a participant of this conversation');
    }

    const conversation = await ChatConversation.findByPk(req.params.id, {
      include: [
        {
          model: ChatParticipant,
          as: 'participants',
          include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }],
        },
      ],
    });

    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    return ApiResponse.success(res, conversation, 'Conversation retrieved successfully');
  } catch (error) {
    next(error);
  }
});

router.get('/conversations/:id/messages', async (req, res, next) => {
  try {
    const participant = await ChatParticipant.findOne({
      where: { conversationId: req.params.id, userId: req.user.id },
    });
    if (!participant) {
      throw ApiError.forbidden('You are not a participant of this conversation');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const { rows, count } = await ChatMessage.findAndCountAll({
      where: { conversationId: req.params.id },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit,
      distinct: true,
    });

    return ApiResponse.success(res, {
      data: rows.reverse(),
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    }, 'Messages retrieved successfully');
  } catch (error) {
    next(error);
  }
});

router.post('/conversations/:id/messages', async (req, res, next) => {
  try {
    const participant = await ChatParticipant.findOne({
      where: { conversationId: req.params.id, userId: req.user.id },
    });
    if (!participant) {
      throw ApiError.forbidden('You are not a participant of this conversation');
    }

    const { message, messageType, attachments } = req.body;

    const chatMessage = await ChatMessage.create({
      conversationId: req.params.id,
      senderId: req.user.id,
      message,
      messageType: messageType || 'text',
      attachments: attachments || null,
    });

    await ChatConversation.update(
      { lastMessageAt: new Date() },
      { where: { id: req.params.id } }
    );

    const result = await ChatMessage.findByPk(chatMessage.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
      ],
    });

    return ApiResponse.success(res, result, 'Message sent successfully', 201);
  } catch (error) {
    next(error);
  }
});

router.put('/messages/:id', async (req, res, next) => {
  try {
    const message = await ChatMessage.findByPk(req.params.id);
    if (!message) {
      throw ApiError.notFound('Message not found');
    }

    if (message.senderId !== req.user.id) {
      throw ApiError.forbidden('You can only edit your own messages');
    }

    message.message = req.body.message;
    message.editedAt = new Date();
    await message.save();

    return ApiResponse.success(res, message, 'Message updated successfully');
  } catch (error) {
    next(error);
  }
});

router.delete('/messages/:id', async (req, res, next) => {
  try {
    const message = await ChatMessage.findByPk(req.params.id);
    if (!message) {
      throw ApiError.notFound('Message not found');
    }

    if (message.senderId !== req.user.id) {
      throw ApiError.forbidden('You can only delete your own messages');
    }

    await message.destroy();
    return ApiResponse.success(res, null, 'Message deleted successfully');
  } catch (error) {
    next(error);
  }
});

router.post('/conversations/:id/read', async (req, res, next) => {
  try {
    const participant = await ChatParticipant.findOne({
      where: { conversationId: req.params.id, userId: req.user.id },
    });
    if (!participant) {
      throw ApiError.forbidden('You are not a participant of this conversation');
    }

    await ChatMessage.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          conversationId: req.params.id,
          senderId: { [Op.ne]: req.user.id },
          isRead: false,
        },
      }
    );

    participant.lastReadAt = new Date();
    await participant.save();

    return ApiResponse.success(res, null, 'Conversation marked as read');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
