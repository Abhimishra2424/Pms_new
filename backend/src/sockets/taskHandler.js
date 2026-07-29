const logger = require('../utils/logger');

module.exports = (namespace, socket) => {
  socket.on('join_project', (data) => {
    const { projectId } = data;
    if (projectId) {
      socket.join(`project:${projectId}`);
      logger.debug(`Socket ${socket.userId} joined project:${projectId}`);
    }
  });

  socket.on('leave_project', (data) => {
    const { projectId } = data;
    if (projectId) {
      socket.leave(`project:${projectId}`);
    }
  });

  socket.on('task:created', (data) => {
    const { projectId, task } = data;
    if (projectId && task) {
      namespace.to(`project:${projectId}`).emit('task:created', {
        task,
        updatedBy: socket.userId,
      });
    }
  });

  socket.on('task:updated', (data) => {
    const { projectId, task, changes } = data;
    if (projectId && task) {
      namespace.to(`project:${projectId}`).emit('task:updated', {
        task,
        changes: changes || null,
        updatedBy: socket.userId,
      });
    }
  });

  socket.on('task:deleted', (data) => {
    const { projectId, taskId } = data;
    if (projectId && taskId) {
      namespace.to(`project:${projectId}`).emit('task:deleted', {
        taskId,
        deletedBy: socket.userId,
      });
    }
  });

  socket.on('task:commented', (data) => {
    const { projectId, taskId, comment } = data;
    if (projectId && taskId && comment) {
      namespace.to(`project:${projectId}`).emit('task:commented', {
        taskId,
        comment,
        commentedBy: socket.userId,
      });
    }
  });

  socket.on('task:assigned', (data) => {
    const { projectId, task, assigneeId } = data;
    if (projectId && task && assigneeId) {
      namespace.to(`project:${projectId}`).emit('task:assigned', {
        task,
        assigneeId,
        assignedBy: socket.userId,
      });

      socket.to(`user:${assigneeId}`).emit('notification:send', {
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned to task: ${task.title}`,
        referenceId: task.id,
        referenceType: 'task',
      });
    }
  });

  socket.on('sprint:updated', (data) => {
    const { projectId, sprint } = data;
    if (projectId && sprint) {
      namespace.to(`project:${projectId}`).emit('sprint:updated', {
        sprint,
        updatedBy: socket.userId,
      });
    }
  });
};
