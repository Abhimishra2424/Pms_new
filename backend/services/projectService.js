const { Op } = require('sequelize');
const { Project, ProjectMember, User, Task } = require('../models');

const findAll = async (userId) => {
  const projects = await Project.findAll({
    where: { [Op.or]: [{ owner_id: userId }, { '$memberRecords.user_id$': userId }] },
    include: [
      { model: User, as: 'owner', attributes: ['name'] },
      { model: ProjectMember, as: 'memberRecords', attributes: [] },
    ],
    order: [['updated_at', 'DESC']],
  });

  for (const project of projects) {
    project.dataValues.task_count = await Task.count({ where: { project_id: project.id } });
    project.dataValues.done_count = await Task.count({ where: { project_id: project.id, status: 'done' } });
  }
  return projects;
};

const findById = async (id, userId) => {
  const project = await Project.findOne({
    where: { id, [Op.or]: [{ owner_id: userId }, { '$memberRecords.user_id$': userId }] },
    include: [
      { model: User, as: 'owner', attributes: ['name'] },
      { model: ProjectMember, as: 'memberRecords', where: { user_id: userId }, required: false },
    ],
  });
  if (project) {
    project.dataValues.task_count = await Task.count({ where: { project_id: id } });
    project.dataValues.done_count = await Task.count({ where: { project_id: id, status: 'done' } });
  }
  return project;
};

const create = async (userId, { name, description, color }) => {
  return await Project.create({ name, description: description || '', color: color || '#6366f1', owner_id: userId });
};

const update = async (id, userId, { name, description, color }) => {
  await Project.update(
    { name, description: description || '', color: color || '#6366f1' },
    { where: { id, owner_id: userId } }
  );
  return await Project.findByPk(id);
};

const remove = async (id, userId) => {
  const deleted = await Project.destroy({ where: { id, owner_id: userId } });
  return deleted > 0;
};

const getMembers = async (projectId) => {
  return await ProjectMember.findAll({
    where: { project_id: projectId },
    include: [{ model: User, attributes: ['id', 'name', 'email', 'avatar'] }],
  });
};

const addMember = async (projectId, userId, role = 'member') => {
  await ProjectMember.findOrCreate({ where: { project_id: projectId, user_id: userId }, defaults: { role } });
};

const removeMember = async (projectId, userId) => {
  await ProjectMember.destroy({ where: { project_id: projectId, user_id: userId } });
};

module.exports = { findAll, findById, create, update, remove, getMembers, addMember, removeMember };
