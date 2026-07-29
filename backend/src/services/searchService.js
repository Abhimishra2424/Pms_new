const { Op } = require('sequelize');
const {
  Project, Task, User, Document, KnowledgeBase, BugReport,
} = require('../models');

const searchService = {
  async globalSearch(query, companyId) {
    const searchTerm = query.trim();
    if (!searchTerm) {
      return { projects: [], tasks: [], employees: [], documents: [], knowledgeBase: [] };
    }

    const searchCondition = { [Op.like]: `%${searchTerm}%` };

    const projects = await Project.findAll({
      where: {
        companyId,
        [Op.or]: [
          { name: searchCondition },
          { key: searchCondition },
          { description: searchCondition },
        ],
      },
      attributes: ['id', 'name', 'key', 'status', 'priority'],
      limit: 5,
    });

    const tasks = await Task.findAll({
      where: {
        companyId,
        [Op.or]: [
          { title: searchCondition },
          { description: searchCondition },
        ],
      },
      attributes: ['id', 'title', 'status', 'priority', 'projectId'],
      limit: 5,
      include: [
        {
          association: 'project',
          attributes: ['name', 'key'],
        },
      ],
    });

    const employees = await User.findAll({
      where: {
        companyId,
        isActive: true,
        [Op.or]: [
          { firstName: searchCondition },
          { lastName: searchCondition },
          { email: searchCondition },
          { employeeId: searchCondition },
          { phone: searchCondition },
        ],
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId', 'role', 'avatar'],
      limit: 5,
    });

    const documents = await Document.findAll({
      where: {
        companyId,
        [Op.or]: [
          { name: searchCondition },
          { description: searchCondition },
        ],
      },
      attributes: ['id', 'name', 'description', 'fileType', 'fileUrl'],
      limit: 5,
    });

    const knowledgeBase = await KnowledgeBase.findAll({
      where: {
        companyId,
        [Op.or]: [
          { title: searchCondition },
          { content: searchCondition },
          { excerpt: searchCondition },
          { category: searchCondition },
        ],
      },
      attributes: ['id', 'title', 'slug', 'excerpt', 'category'],
      limit: 5,
    });

    return { projects, tasks, employees, documents, knowledgeBase };
  },
};

module.exports = searchService;
