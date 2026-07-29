const { Op } = require('sequelize');
const {
  Task, TaskChecklist, TaskDependency, User, Project,
  Sprint, Epic, ProjectMilestone, sequelize,
} = require('../models');
const ApiError = require('../utils/ApiError');
const TaskRepository = require('../repositories/taskRepository');
const HistoryService = require('./historyService');

const TaskService = {
  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      projectId: query.projectId,
      sprintId: query.sprintId,
      epicId: query.epicId,
      milestoneId: query.milestoneId,
      assigneeId: query.assigneeId,
      reporterId: query.reporterId,
      status: query.status,
      priority: query.priority,
      type: query.type,
      severity: query.severity,
      labels: query.labels,
      search: query.search,
      dueDateFrom: query.dueDateFrom,
      dueDateTo: query.dueDateTo,
      companyId: query.companyId,
    };
    return TaskRepository.findAll(parsedQuery);
  },

  async getById(id) {
    const task = await TaskRepository.findById(id);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }
    return task;
  },

  async create(data, userId) {
    const { projectId, sprintId, epicId, milestoneId, parentId, assigneeId } = data;

    const project = await Project.findByPk(projectId);
    if (!project) {
      throw ApiError.badRequest('Project not found');
    }

    if (sprintId) {
      const sprint = await Sprint.findByPk(sprintId);
      if (!sprint) {
        throw ApiError.badRequest('Sprint not found');
      }
    }

    if (epicId) {
      const epic = await Epic.findByPk(epicId);
      if (!epic) {
        throw ApiError.badRequest('Epic not found');
      }
    }

    if (milestoneId) {
      const milestone = await ProjectMilestone.findByPk(milestoneId);
      if (!milestone) {
        throw ApiError.badRequest('Milestone not found');
      }
    }

    if (parentId) {
      const parent = await Task.findByPk(parentId);
      if (!parent) {
        throw ApiError.badRequest('Parent task not found');
      }
    }

    if (assigneeId) {
      const assignee = await User.findByPk(assigneeId);
      if (!assignee) {
        throw ApiError.badRequest('Assignee not found');
      }
    }

    const transaction = await sequelize.transaction();
    try {
      const task = await TaskRepository.create(
        { ...data, reporterId: userId },
        { transaction }
      );

      await HistoryService.logChange(
        task.id, userId, 'title', null, task.title, 'create'
      );

      await transaction.commit();

      return TaskRepository.findById(task.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async update(id, data, userId) {
    const task = await this.getById(id);

    const trackableFields = [
      'title', 'description', 'type', 'status', 'priority', 'severity',
      'storyPoints', 'estimatedHours', 'dueDate', 'startDate',
      'assigneeId', 'sprintId', 'epicId', 'milestoneId', 'parentId',
      'labels', 'environment', 'stepsToReproduce', 'expectedResult', 'actualResult',
    ];

    const changedFields = [];
    for (const field of trackableFields) {
      if (data[field] !== undefined && String(data[field]) !== String(task[field])) {
        changedFields.push({
          field,
          oldValue: task[field],
          newValue: data[field],
        });
      }
    }

    if (changedFields.length === 0) {
      return task;
    }

    const transaction = await sequelize.transaction();
    try {
      const updated = await TaskRepository.update(id, data, { transaction });

      for (const change of changedFields) {
        let historyType = 'update';
        if (change.field === 'status') historyType = 'status_change';
        else if (change.field === 'assigneeId') historyType = 'assignee_change';

        await HistoryService.logChange(
          id, userId, change.field, change.oldValue, change.newValue, historyType,
          { transaction }
        );
      }

      await transaction.commit();
      return TaskRepository.findById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async delete(id, userId) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const transaction = await sequelize.transaction();
    try {
      await TaskRepository.delete(id, { transaction });

      await HistoryService.logChange(
        id, userId, 'deletedAt', null, new Date().toISOString(), 'update',
        { transaction }
      );

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async reorderTasks(projectId, tasks, userId) {
    const taskIds = tasks.map((t) => t.id);
    const existingTasks = await Task.findAll({
      where: { id: { [Op.in]: taskIds }, projectId },
      attributes: ['id'],
    });

    if (existingTasks.length !== taskIds.length) {
      throw ApiError.badRequest('Some tasks do not belong to the specified project');
    }

    const transaction = await sequelize.transaction();
    try {
      await TaskRepository.reorderTasks(tasks, { transaction });

      for (const item of tasks) {
        await HistoryService.logChange(
          item.id, userId, 'sortOrder', null, item.sortOrder, 'update',
          { transaction }
        );
        await HistoryService.logChange(
          item.id, userId, 'status', null, item.status, 'update',
          { transaction }
        );
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async getBoard(projectId) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }
    return TaskRepository.findByProjectAndStatus(projectId);
  },

  async getTaskStats(projectId) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const tasks = await Task.findAll({
      where: { projectId },
      attributes: ['id', 'status', 'priority', 'assigneeId', 'dueDate'],
    });

    const total = tasks.length;
    const byStatus = {};
    const byPriority = {};
    const byAssignee = {};
    let overdueCount = 0;
    const now = new Date();

    tasks.forEach((task) => {
      byStatus[task.status] = (byStatus[task.status] || 0) + 1;
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;

      if (task.assigneeId) {
        byAssignee[task.assigneeId] = (byAssignee[task.assigneeId] || 0) + 1;
      }

      if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'done' && task.status !== 'cancelled') {
        overdueCount++;
      }
    });

    const assigneeIds = Object.keys(byAssignee);
    let assigneeMap = {};
    if (assigneeIds.length > 0) {
      const users = await User.findAll({
        where: { id: assigneeIds },
        attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'],
        raw: true,
      });
      users.forEach((u) => { assigneeMap[u.id] = u; });
    }

    const assigneeStats = Object.entries(byAssignee).map(([userId, count]) => ({
      assignee: assigneeMap[userId] || { id: userId },
      count,
    }));

    const sprint = await Sprint.findOne({
      where: { projectId, status: 'active' },
      attributes: ['id', 'name'],
    });

    return {
      total,
      byStatus,
      byPriority,
      assigneeStats,
      overdueCount,
      activeSprint: sprint,
    };
  },

  async addChecklist(taskId, items, userId) {
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const transaction = await sequelize.transaction();
    try {
      const maxSortOrder = await TaskChecklist.max('sortOrder', {
        where: { taskId },
      });

      const checklistItems = items.map((item, index) => ({
        taskId,
        title: item.title,
        sortOrder: (maxSortOrder || 0) + index + 1,
      }));

      const created = await TaskChecklist.bulkCreate(checklistItems, { transaction });

      await HistoryService.logChange(
        taskId, userId, 'checklist', null,
        `Added ${created.length} checklist items`, 'update',
        { transaction }
      );

      await transaction.commit();
      return created;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async updateChecklistItem(itemId, data, userId) {
    const item = await TaskChecklist.findByPk(itemId);
    if (!item) {
      throw ApiError.notFound('Checklist item not found');
    }

    const transaction = await sequelize.transaction();
    try {
      const updateData = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.isCompleted !== undefined) {
        updateData.isCompleted = data.isCompleted;
        updateData.completedBy = data.isCompleted ? userId : null;
        updateData.completedAt = data.isCompleted ? new Date() : null;
      }
      if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

      await item.update(updateData, { transaction });

      if (data.isCompleted !== undefined) {
        await HistoryService.logChange(
          item.taskId, userId, `checklist:${item.title}`,
          !data.isCompleted ? 'completed' : 'pending',
          data.isCompleted ? 'completed' : 'pending',
          'update',
          { transaction }
        );
      }

      await transaction.commit();
      return TaskChecklist.findByPk(itemId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async deleteChecklistItem(itemId, userId) {
    const item = await TaskChecklist.findByPk(itemId);
    if (!item) {
      throw ApiError.notFound('Checklist item not found');
    }

    const transaction = await sequelize.transaction();
    try {
      await item.destroy({ transaction });

      await HistoryService.logChange(
        item.taskId, userId, 'checklist', item.title, null, 'update',
        { transaction }
      );

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async addDependency(taskId, dependsOnId, type, userId) {
    if (taskId === dependsOnId) {
      throw ApiError.badRequest('Task cannot depend on itself');
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const dependsOn = await Task.findByPk(dependsOnId);
    if (!dependsOn) {
      throw ApiError.notFound('Dependency task not found');
    }

    const existing = await TaskDependency.findOne({
      where: { taskId, dependsOnId },
    });
    if (existing) {
      throw ApiError.badRequest('Dependency already exists');
    }

    const circular = await this._checkCircularDependency(taskId, dependsOnId);
    if (circular) {
      throw ApiError.badRequest('Circular dependency detected');
    }

    const transaction = await sequelize.transaction();
    try {
      const dependency = await TaskDependency.create(
        { taskId, dependsOnId, type: type || 'relates_to' },
        { transaction }
      );

      await HistoryService.logChange(
        taskId, userId, 'dependency', null, `Depends on ${dependsOnId} (${type})`, 'update',
        { transaction }
      );

      await transaction.commit();
      return TaskDependency.findByPk(dependency.id, {
        include: [{ model: Task, as: 'dependsOn', attributes: ['id', 'title', 'status'] }],
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async _checkCircularDependency(taskId, dependsOnId) {
    const visited = new Set();
    const queue = [dependsOnId];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (currentId === taskId) return true;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const deps = await TaskDependency.findAll({
        where: { taskId: currentId },
        attributes: ['dependsOnId'],
      });

      for (const dep of deps) {
        if (!visited.has(dep.dependsOnId)) {
          queue.push(dep.dependsOnId);
        }
      }
    }

    return false;
  },

  async removeDependency(id, userId) {
    const dependency = await TaskDependency.findByPk(id);
    if (!dependency) {
      throw ApiError.notFound('Dependency not found');
    }

    const transaction = await sequelize.transaction();
    try {
      await dependency.destroy({ transaction });

      await HistoryService.logChange(
        dependency.taskId, userId, 'dependency',
        `Depends on ${dependency.dependsOnId}`, null, 'update',
        { transaction }
      );

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};

module.exports = TaskService;
