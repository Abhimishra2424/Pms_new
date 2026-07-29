const { TaskComment, User } = require('../models');

const findByTask = async (taskId) => {
  return await TaskComment.findAll({
    where: { task_id: taskId },
    include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }],
    order: [['created_at', 'ASC']],
  });
};

const create = async (taskId, userId, content) => {
  const comment = await TaskComment.create({ task_id: taskId, user_id: userId, content });
  return await TaskComment.findByPk(comment.id, {
    include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }],
  });
};

const remove = async (id, userId) => {
  const deleted = await TaskComment.destroy({ where: { id, user_id: userId } });
  return deleted > 0;
};

module.exports = { findByTask, create, remove };
