const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const logger = require('../utils/logger');
const { User } = require('../models');
const chatHandler = require('./chatHandler');
const taskHandler = require('./taskHandler');
const notificationHandler = require('./notificationHandler');

const onlineUsers = new Map();

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 100;

function rateLimitMiddleware(socket, next) {
  const userId = socket.userId;
  if (!userId) return next();

  const now = Date.now();
  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, []);
  }

  const timestamps = rateLimitMap.get(userId).filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (timestamps.length >= RATE_LIMIT_MAX) {
    return next(new Error('Rate limit exceeded. Please slow down.'));
  }

  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  next();
}

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL.split(',').map((url) => url.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.use(rateLimitMiddleware);

  const chatNamespace = io.of('/chat');
  const notificationNamespace = io.of('/notifications');
  const taskNamespace = io.of('/tasks');

  chatNamespace.on('connection', (socket) => {
    logger.info(`Chat socket connected: ${socket.userId}`);
    onlineUsers.set(socket.userId, socket.id);
    chatNamespace.emit('user:online', { userId: socket.userId });

    chatHandler(chatNamespace, socket);

    socket.on('disconnect', () => {
      logger.info(`Chat socket disconnected: ${socket.userId}`);
      onlineUsers.delete(socket.userId);
      chatNamespace.emit('user:offline', { userId: socket.userId });
    });
  });

  notificationNamespace.on('connection', (socket) => {
    logger.info(`Notification socket connected: ${socket.userId}`);
    socket.join(`user:${socket.userId}`);

    notificationHandler(notificationNamespace, socket);

    socket.on('disconnect', () => {
      logger.info(`Notification socket disconnected: ${socket.userId}`);
    });
  });

  taskNamespace.on('connection', (socket) => {
    logger.info(`Task socket connected: ${socket.userId}`);

    taskHandler(taskNamespace, socket);

    socket.on('disconnect', () => {
      logger.info(`Task socket disconnected: ${socket.userId}`);
    });
  });

  io.on('connection', (socket) => {
    logger.info(`Default socket connected: ${socket.userId}`);
    socket.join(`user:${socket.userId}`);

    socket.on('disconnect', () => {
      logger.info(`Default socket disconnected: ${socket.userId}`);
    });
  });

  return io;
}

module.exports = { initSocket, onlineUsers };
