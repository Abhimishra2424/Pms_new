const { Op } = require('sequelize');
const { Project, ProjectMember, ProjectMilestone, Sprint, Epic, User, Company, Client, Task } = require('../models');

const projectIncludes = [
  { model: User, as: 'lead', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
  { model: Company, as: 'company', attributes: ['id', 'name', 'slug'] },
  { model: Client, as: 'client', attributes: ['id', 'name', 'email', 'company'] },
  { model: ProjectMember, as: 'members', include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }] },
  { model: Task, as: 'tasks', attributes: ['id', 'title', 'status', 'priority', 'assigneeId', 'dueDate', 'storyPoints'] },
];

const ProjectRepository = {
  async findAll(query) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', status, priority, category, companyId, leadId, clientId, search } = query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (companyId) where.companyId = companyId;
    if (leadId) where.leadId = leadId;
    if (clientId) where.clientId = clientId;

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { key: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const allowedSortFields = ['createdAt', 'name', 'status', 'priority', 'deadline'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortField === 'deadline' ? [['endDate', sortOrder === 'ASC' ? 'ASC' : 'DESC']] : [[sortField, sortOrder === 'ASC' ? 'ASC' : 'DESC']];

    const offset = (page - 1) * limit;

    const { count: total, rows: projects } = await Project.findAndCountAll({
      where,
      include: projectIncludes,
      order,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return { projects, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  },

  async findById(id) {
    return Project.findByPk(id, {
      include: [
        { model: User, as: 'lead', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] },
        { model: Company, as: 'company', attributes: ['id', 'name', 'slug'] },
        { model: Client, as: 'client', attributes: ['id', 'name', 'email', 'company'] },
        { model: ProjectMember, as: 'members', include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'role'] }] },
        { model: ProjectMilestone, as: 'milestones', order: [['sortOrder', 'ASC']] },
        { model: Sprint, as: 'sprints', order: [['createdAt', 'DESC']] },
        { model: Epic, as: 'epics', order: [['sortOrder', 'ASC']] },
        { model: Task, as: 'tasks' },
      ],
    });
  },

  async create(data, options) {
    return Project.create(data, options);
  },

  async update(id, data, options) {
    const project = await Project.findByPk(id, { paranoid: false });
    if (!project) return null;
    await project.update(data, options);
    return project;
  },

  async delete(id, options) {
    const project = await Project.findByPk(id, { paranoid: false });
    if (!project) return false;
    await project.destroy(options);
    return true;
  },

  async getProjectStats(projectId) {
    const tasks = await Task.findAll({ where: { projectId }, attributes: ['status', 'storyPoints'], paranoid: false });

    const statusCounts = { backlog: 0, todo: 0, in_progress: 0, in_review: 0, done: 0, cancelled: 0 };
    let totalStoryPoints = 0;
    let completedStoryPoints = 0;

    tasks.forEach((task) => {
      if (statusCounts[task.status] !== undefined) {
        statusCounts[task.status]++;
      }
      if (task.storyPoints) {
        totalStoryPoints += task.storyPoints;
        if (task.status === 'done') {
          completedStoryPoints += task.storyPoints;
        }
      }
    });

    const totalMembers = await ProjectMember.count({ where: { projectId } });
    const completionPercentage = tasks.length > 0 ? Math.round((statusCounts.done / tasks.length) * 100) : 0;

    return { statusCounts, totalMembers, completionPercentage, totalTasks: tasks.length, totalStoryPoints, completedStoryPoints };
  },

  async getProjectTimeline(projectId) {
    const milestones = await ProjectMilestone.findAll({
      where: { projectId },
      order: [['dueDate', 'ASC']],
      attributes: ['id', 'title', 'status', 'dueDate', 'sortOrder', 'createdAt'],
    });

    const sprints = await Sprint.findAll({
      where: { projectId },
      order: [['startDate', 'ASC']],
      attributes: ['id', 'name', 'status', 'startDate', 'endDate', 'createdAt'],
    });

    return { milestones, sprints };
  },
};

module.exports = ProjectRepository;
