const { Op, fn, col, literal } = require('sequelize');
const { Task, Project, User } = require('../models');

const findByProject = async (projectId) => {
  return await Task.findAll({
    where: { project_id: projectId },
    include: [
      { model: User, as: 'assignee', attributes: ['name', 'avatar'] },
    ],
    order: [
      [fn('FIELD', col('priority'), 'urgent', 'high', 'medium', 'low')],
      ['updated_at', 'DESC'],
    ],
  });
};

const findById = async (id) => {
  return await Task.findByPk(id, {
    include: [
      { model: User, as: 'assignee', attributes: ['name', 'avatar'] },
      { model: User, as: 'creator', attributes: ['name'] },
    ],
  });
};

const create = async (projectId, userId, { title, description, status, priority, assignee_id, due_date }) => {
  return await Task.create({
    project_id: projectId, title, description: description || '',
    status: status || 'todo', priority: priority || 'medium',
    assignee_id: assignee_id || null, due_date: due_date || null, created_by: userId,
  });
};

const update = async (id, { title, description, status, priority, assignee_id, due_date }) => {
  await Task.update(
    { title, description: description || '', status: status || 'todo', priority: priority || 'medium', assignee_id: assignee_id || null, due_date: due_date || null },
    { where: { id } }
  );
  return await findById(id);
};

const updateStatus = async (id, status) => {
  await Task.update({ status }, { where: { id } });
  return await findById(id);
};

const remove = async (id, userId) => {
  const deleted = await Task.destroy({ where: { id, created_by: userId } });
  return deleted > 0;
};

const getDashboardStats = async (userId) => {
  const projects = await Project.count({ where: { owner_id: userId } });

  const tasks = await Task.count({
    include: [{ model: Project, as: 'project', where: { owner_id: userId }, required: true }],
  });

  const todo = await Task.count({
    include: [{ model: Project, as: 'project', where: { owner_id: userId }, required: true }],
    where: { status: 'todo' },
  });

  const in_progress = await Task.count({
    include: [{ model: Project, as: 'project', where: { owner_id: userId }, required: true }],
    where: { status: 'in_progress' },
  });

  const done = await Task.count({
    include: [{ model: Project, as: 'project', where: { owner_id: userId }, required: true }],
    where: { status: 'done' },
  });

  const overdue = await Task.count({
    include: [{ model: Project, as: 'project', where: { owner_id: userId }, required: true }],
    where: { due_date: { [Op.lt]: new Date() }, status: { [Op.ne]: 'done' } },
  });

  const recent = await Task.findAll({
    include: [
      { model: Project, as: 'project', where: { owner_id: userId }, required: true, attributes: ['name', 'color'] },
    ],
    order: [['updated_at', 'DESC']],
    limit: 5,
  });

  return { projects, tasks, todo, in_progress, done, overdue, recent };
};

module.exports = { findByProject, findById, create, update, updateStatus, remove, getDashboardStats };
