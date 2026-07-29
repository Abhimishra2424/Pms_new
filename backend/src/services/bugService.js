const { Op } = require('sequelize');
const { Task, BugReport } = require('../models');
const ApiError = require('../utils/ApiError');
const BugRepository = require('../repositories/bugRepository');

const BugService = {
  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      severity: query.severity,
      status: query.status,
      projectId: query.projectId,
      assigneeId: query.assigneeId,
    };
    return BugRepository.findAll(parsedQuery);
  },

  async getById(id) {
    const bug = await BugRepository.findById(id);
    if (!bug) {
      throw ApiError.notFound('Bug report not found');
    }
    return bug;
  },

  async create(data) {
    const task = await Task.findByPk(data.taskId);
    if (!task) {
      throw ApiError.badRequest('Task not found');
    }

    const existingBug = await BugRepository.findByTaskId(data.taskId);
    if (existingBug) {
      throw ApiError.badRequest('Bug report already exists for this task');
    }

    await task.update({ type: 'bug', severity: data.severity });

    return BugRepository.create(data);
  },

  async update(id, data) {
    const bug = await this.getById(id);
    if (data.severity && data.severity !== bug.severity) {
      await Task.update({ severity: data.severity }, { where: { id: bug.taskId } });
    }
    const updated = await BugRepository.update(id, data);
    if (!updated) {
      throw ApiError.notFound('Bug report not found');
    }
    return updated;
  },

  async delete(id) {
    const bug = await BugRepository.findById(id);
    if (!bug) {
      throw ApiError.notFound('Bug report not found');
    }
    await BugRepository.delete(id);
    return true;
  },

  async getByProject(projectId) {
    const tasks = await Task.findAll({
      where: { projectId },
      attributes: ['id'],
    });
    const taskIds = tasks.map((t) => t.id);
    if (taskIds.length === 0) return { bugs: [], total: 0, page: 1, limit: taskIds.length };
    return BugRepository.findAll({ projectId });
  },

  async getByAssignee(assigneeId) {
    const tasks = await Task.findAll({
      where: { assigneeId },
      attributes: ['id'],
    });
    const taskIds = tasks.map((t) => t.id);
    if (taskIds.length === 0) return { bugs: [], total: 0, page: 1, limit: taskIds.length };
    return BugRepository.findAll({ assigneeId });
  },

  async getBySeverity(severity) {
    return BugRepository.findAll({ severity });
  },
};

module.exports = BugService;
