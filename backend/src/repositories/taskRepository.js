const { Op } = require('sequelize');
const {
  Task, TaskChecklist, TaskDependency, TaskComment, TaskHistory,
  User, Project, Sprint, Epic, ProjectMilestone, BugReport, TimeEntry,
} = require('../models');

const userAttributes = ['id', 'firstName', 'lastName', 'email', 'avatar'];

const baseIncludes = [
  { model: User, as: 'assignee', attributes: userAttributes },
  { model: User, as: 'reporter', attributes: userAttributes },
  { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
  { model: Sprint, as: 'sprint', attributes: ['id', 'name', 'status'] },
  { model: Epic, as: 'epic', attributes: ['id', 'name', 'status'] },
];

const TaskRepository = {
  async findAll(query) {
    const {
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC',
      projectId, sprintId, epicId, milestoneId, assigneeId, reporterId,
      status, priority, type, severity, labels, search,
      dueDateFrom, dueDateTo, companyId,
    } = query;

    const where = {};

    if (projectId) where.projectId = projectId;
    if (sprintId) where.sprintId = sprintId;
    if (epicId) where.epicId = epicId;
    if (milestoneId) where.milestoneId = milestoneId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (reporterId) where.reporterId = reporterId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (companyId) where.companyId = companyId;

    if (labels) {
      where.labels = { [Op.overlap]: Array.isArray(labels) ? labels : [labels] };
    }

    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate[Op.gte] = new Date(dueDateFrom);
      if (dueDateTo) where.dueDate[Op.lte] = new Date(dueDateTo);
    }

    const allowedSortFields = ['createdAt', 'updatedAt', 'dueDate', 'sortOrder', 'priority', 'title', 'status'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']];

    if (sortField !== 'sortOrder') {
      order.push(['sortOrder', 'ASC']);
    }

    const offset = (page - 1) * limit;

    const { count: total, rows: tasks } = await Task.findAndCountAll({
      where,
      include: baseIncludes,
      order,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { tasks, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    const task = await Task.findByPk(id, {
      include: [
        ...baseIncludes,
        { model: ProjectMilestone, as: 'milestone', attributes: ['id', 'title', 'status'] },
        { model: Task, as: 'parent', attributes: ['id', 'title', 'status'] },
        { model: Task, as: 'children', attributes: ['id', 'title', 'status', 'sortOrder', 'assigneeId'] },
        { model: TaskChecklist, as: 'checklists', order: [['sortOrder', 'ASC']] },
        {
          model: TaskComment,
          as: 'comments',
          include: [{ model: User, as: 'user', attributes: userAttributes }],
          order: [['createdAt', 'ASC']],
        },
        {
          model: TaskDependency,
          as: 'dependencies',
          include: [{ model: Task, as: 'dependsOn', attributes: ['id', 'title', 'status'] }],
        },
        {
          model: TaskHistory,
          as: 'histories',
          include: [{ model: User, as: 'user', attributes: userAttributes }],
          order: [['createdAt', 'DESC']],
        },
        { model: TimeEntry, as: 'timeEntries' },
        { model: BugReport, as: 'bugReport' },
      ],
    });

    if (!task) return null;

    const dependents = await TaskDependency.findAll({
      where: { dependsOnId: id },
      include: [{ model: Task, as: 'task', attributes: ['id', 'title', 'status'] }],
    });
    task.dataValues.dependents = dependents;

    return task;
  },

  async create(data, options) {
    return Task.create(data, options);
  },

  async update(id, data, options) {
    const task = await Task.findByPk(id, { paranoid: false });
    if (!task) return null;
    await task.update(data, options);
    return task;
  },

  async delete(id, options) {
    const task = await Task.findByPk(id, { paranoid: false });
    if (!task) return false;
    await task.destroy(options);
    return true;
  },

  async findByProjectAndStatus(projectId) {
    const tasks = await Task.findAll({
      where: { projectId },
      include: [
        { model: User, as: 'assignee', attributes: userAttributes },
        { model: User, as: 'reporter', attributes: userAttributes },
        { model: Sprint, as: 'sprint', attributes: ['id', 'name'] },
        { model: Epic, as: 'epic', attributes: ['id', 'name'] },
        { model: TaskChecklist, as: 'checklists', attributes: ['id', 'isCompleted'] },
      ],
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });

    const grouped = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
      cancelled: [],
    };

    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  },

  async reorderTasks(tasks, options = {}) {
    for (const item of tasks) {
      await Task.update(
        { status: item.status, sortOrder: item.sortOrder },
        { where: { id: item.id }, ...options }
      );
    }
    return true;
  },

  async getTaskCountsByProject(projectId) {
    const counts = await Task.findAll({
      where: { projectId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const result = { backlog: 0, todo: 0, in_progress: 0, in_review: 0, done: 0, cancelled: 0 };
    counts.forEach((row) => {
      result[row.status] = parseInt(row.count, 10);
    });

    return result;
  },

  async getTaskCountsByAssignee(projectId) {
    const counts = await Task.findAll({
      where: { projectId },
      attributes: [
        'assigneeId',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['assigneeId'],
      raw: true,
    });

    const assigneeIds = counts.map((r) => r.assigneeId).filter(Boolean);
    let users = [];
    if (assigneeIds.length > 0) {
      users = await User.findAll({
        where: { id: assigneeIds },
        attributes: userAttributes,
        raw: true,
      });
    }

    const userMap = {};
    users.forEach((u) => { userMap[u.id] = u; });

    return counts.map((row) => ({
      assignee: row.assigneeId ? (userMap[row.assigneeId] || { id: row.assigneeId }) : null,
      count: parseInt(row.count, 10),
    }));
  },
};

module.exports = TaskRepository;
