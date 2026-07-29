const { Op, fn, col, literal } = require('sequelize');
const {
  User, Project, Task, Sprint, BugReport, TimeEntry,
  Attendance, Leave, Company, sequelize,
} = require('../models');

const reportService = {
  async getEmployeeReport(query) {
    const { companyId, employeeId, startDate, endDate } = query;

    const where = { companyId };
    if (employeeId) where.id = employeeId;

    const employees = await User.findAll({
      where,
      attributes: [
        'id', 'firstName', 'lastName', 'email', 'employeeId', 'role',
        [fn('COALESCE', fn('COUNT', col('assignedTasks.id')), 0), 'totalTasks'],
        [fn('COALESCE', fn('SUM', literal('CASE WHEN tasks.status = "done" THEN 1 ELSE 0 END')), 0), 'completedTasks'],
      ],
      include: [
        {
          association: 'assignedTasks',
          attributes: [],
          where: startDate && endDate ? {
            createdAt: { [Op.between]: [new Date(startDate), new Date(endDate)] },
          } : {},
          required: false,
        },
      ],
      group: ['User.id'],
      subQuery: false,
    });

    const taskWhere = { companyId };
    if (employeeId) taskWhere.assigneeId = employeeId;
    if (startDate && endDate) {
      taskWhere.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const taskStats = await Task.findAll({
      where: taskWhere,
      attributes: [
        'assigneeId',
        [fn('COUNT', col('id')), 'total'],
        [fn('SUM', literal('CASE WHEN status = "done" THEN 1 ELSE 0 END')), 'completed'],
        [fn('SUM', literal('CASE WHEN status = "in_progress" THEN 1 ELSE 0 END')), 'inProgress'],
        [fn('SUM', literal('CASE WHEN status = "todo" THEN 1 ELSE 0 END')), 'todo'],
      ],
      group: ['assigneeId'],
    });

    const attendanceWhere = { companyId };
    if (employeeId) attendanceWhere.userId = employeeId;
    if (startDate && endDate) {
      attendanceWhere.date = { [Op.between]: [startDate, endDate] };
    }

    const attendanceStats = await Attendance.findAll({
      where: attendanceWhere,
      attributes: [
        'userId',
        [fn('COUNT', col('id')), 'total'],
        [fn('SUM', literal('CASE WHEN status = "present" THEN 1 ELSE 0 END')), 'present'],
        [fn('SUM', literal('CASE WHEN status = "absent" THEN 1 ELSE 0 END')), 'absent'],
        [fn('SUM', literal('CASE WHEN status = "late" THEN 1 ELSE 0 END')), 'late'],
        [fn('SUM', literal('CASE WHEN status = "half_day" THEN 1 ELSE 0 END')), 'halfDay'],
      ],
      group: ['userId'],
    });

    const leaveWhere = { companyId, status: 'approved' };
    if (employeeId) leaveWhere.userId = employeeId;
    if (startDate && endDate) {
      leaveWhere.startDate = { [Op.lte]: endDate };
      leaveWhere.endDate = { [Op.gte]: startDate };
    }

    const leaveStats = await Leave.findAll({
      where: leaveWhere,
      attributes: [
        'userId',
        [fn('COALESCE', fn('SUM', col('totalDays')), 0), 'totalDays'],
      ],
      group: ['userId'],
    });

    const timeWhere = { projectId: { [Op.ne]: null } };
    if (employeeId) timeWhere.userId = employeeId;
    if (startDate && endDate) {
      timeWhere.date = { [Op.between]: [startDate, endDate] };
    }

    const timeStats = await TimeEntry.findAll({
      where: timeWhere,
      attributes: [
        'userId',
        [fn('COALESCE', fn('SUM', col('duration')), 0), 'totalSeconds'],
      ],
      group: ['userId'],
    });

    return {
      employees,
      taskStats,
      attendanceStats,
      leaveStats,
      timeStats,
    };
  },

  async getProjectReport(query) {
    const { companyId, projectId, startDate, endDate } = query;

    const where = { companyId };
    if (projectId) where.id = projectId;

    const projects = await Project.findAll({
      where,
      attributes: [
        'id', 'name', 'key', 'status', 'priority', 'startDate', 'endDate',
        'estimatedHours', 'actualHours', 'budget', 'progress',
        [fn('COALESCE', fn('COUNT', col('tasks.id')), 0), 'totalTasks'],
        [fn('COALESCE', fn('SUM', literal('CASE WHEN tasks.status = "done" THEN 1 ELSE 0 END')), 0), 'completedTasks'],
        [fn('COALESCE', fn('SUM', literal('CASE WHEN tasks.status = "in_progress" THEN 1 ELSE 0 END')), 0), 'inProgressTasks'],
        [fn('COALESCE', fn('SUM', literal('CASE WHEN tasks.status = "todo" THEN 1 ELSE 0 END')), 0), 'todoTasks'],
        [fn('COALESCE', fn('SUM', literal('CASE WHEN tasks.status = "backlog" THEN 1 ELSE 0 END')), 0), 'backlogTasks'],
        [fn('COALESCE', fn('SUM', literal('CASE WHEN tasks.status = "cancelled" THEN 1 ELSE 0 END')), 0), 'cancelledTasks'],
      ],
      include: [
        {
          association: 'tasks',
          attributes: [],
          required: false,
        },
      ],
      group: ['Project.id'],
      subQuery: false,
    });

    const sprintWhere = { projectId: projectId || { [Op.ne]: null } };
    if (startDate && endDate) {
      sprintWhere.startDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const sprintStats = await Sprint.findAll({
      where: sprintWhere,
      attributes: [
        'projectId',
        [fn('COUNT', col('id')), 'total'],
        [fn('SUM', literal('CASE WHEN status = "completed" THEN 1 ELSE 0 END')), 'completed'],
        [fn('SUM', literal('CASE WHEN status = "active" THEN 1 ELSE 0 END')), 'active'],
        [fn('SUM', literal('CASE WHEN status = "planning" THEN 1 ELSE 0 END')), 'planning'],
        [fn('COALESCE', fn('SUM', col('totalStoryPoints')), 0), 'totalStoryPoints'],
        [fn('COALESCE', fn('SUM', col('completedStoryPoints')), 0), 'completedStoryPoints'],
      ],
      group: ['projectId'],
    });

    const projectIds = projectId ? [projectId] : projects.map((p) => p.id);

    const timeByProject = await TimeEntry.findAll({
      where: { projectId: projectIds },
      attributes: [
        'projectId',
        [fn('COALESCE', fn('SUM', col('duration')), 0), 'totalSeconds'],
        [fn('COALESCE', fn('SUM', col('totalAmount')), 0), 'totalAmount'],
      ],
      group: ['projectId'],
    });

    const expenseByProject = await sequelize.query(
      `SELECT project_id, COALESCE(SUM(amount), 0) as totalExpenses
       FROM expenses
       WHERE project_id IN (:projectIds) AND deleted_at IS NULL
       GROUP BY project_id`,
      {
        replacements: { projectIds },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return { projects, sprintStats, timeByProject, expenseByProject };
  },

  async getTaskReport(query) {
    const { companyId, projectId, startDate, endDate } = query;

    const where = { companyId };
    if (projectId) where.projectId = projectId;
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const byStatus = await Task.findAll({
      where,
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
    });

    const byPriority = await Task.findAll({
      where,
      attributes: ['priority', [fn('COUNT', col('id')), 'count']],
      group: ['priority'],
    });

    const byAssignee = await Task.findAll({
      where,
      attributes: [
        'assigneeId',
        [fn('COUNT', col('id')), 'total'],
        [fn('SUM', literal('CASE WHEN status = "done" THEN 1 ELSE 0 END')), 'completed'],
      ],
      group: ['assigneeId'],
    });

    const overdueCount = await Task.count({
      where: {
        ...where,
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.notIn]: ['done', 'cancelled'] },
      },
    });

    const totalCount = await Task.count({ where });

    return { byStatus, byPriority, byAssignee, overdueCount, totalCount };
  },

  async getSprintReport(query) {
    const { projectId, sprintId } = query;

    const where = {};
    if (projectId) where.projectId = projectId;
    if (sprintId) where.id = sprintId;

    const sprints = await Sprint.findAll({
      where,
      include: [
        {
          association: 'tasks',
          attributes: ['id', 'status', 'priority', 'storyPoints', 'estimatedHours', 'actualHours'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const report = sprints.map((sprint) => {
      const tasks = sprint.tasks || [];
      const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      const completedPoints = tasks
        .filter((t) => t.status === 'done')
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

      const daysTotal = sprint.endDate && sprint.startDate
        ? Math.max(1, Math.ceil((new Date(sprint.endDate) - new Date(sprint.startDate)) / (1000 * 60 * 60 * 24)))
        : 1;

      const daysElapsed = sprint.startDate
        ? Math.max(0, Math.ceil((Date.now() - new Date(sprint.startDate)) / (1000 * 60 * 60 * 24)))
        : 0;

      const burndown = [];
      for (let i = 0; i <= daysTotal; i++) {
        const day = new Date(sprint.startDate);
        day.setDate(day.getDate() + i);
        const idealLine = totalPoints - (totalPoints / daysTotal) * i;
        burndown.push({
          date: day.toISOString().split('T')[0],
          day: i + 1,
          idealPoints: Math.round(idealLine * 100) / 100,
        });
      }

      return {
        id: sprint.id,
        name: sprint.name,
        status: sprint.status,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === 'done').length,
        totalStoryPoints: totalPoints,
        completedStoryPoints: completedPoints,
        completionPercentage: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0,
        daysTotal,
        daysElapsed,
        isOverdue: sprint.status === 'active' && new Date() > new Date(sprint.endDate),
        burndown,
      };
    });

    return report;
  },

  async getBugReport(query) {
    const { companyId, projectId, startDate, endDate } = query;

    const where = {};
    if (companyId) where['$task.companyId$'] = companyId;
    if (projectId) where['$task.projectId$'] = projectId;

    const taskWhere = {};
    if (companyId) taskWhere.companyId = companyId;
    if (projectId) taskWhere.projectId = projectId;
    if (startDate && endDate) {
      taskWhere.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const bySeverity = await BugReport.findAll({
      include: [
        {
          association: 'task',
          where: taskWhere,
          attributes: [],
        },
      ],
      attributes: [
        [col('bug_reports.severity'), 'severity'],
        [fn('COUNT', col('bug_reports.id')), 'count'],
      ],
      group: ['bug_reports.severity'],
    });

    const byStatus = await BugReport.findAll({
      include: [
        {
          association: 'task',
          where: taskWhere,
          attributes: [],
        },
      ],
      attributes: [
        [col('task.status'), 'status'],
        [fn('COUNT', col('bug_reports.id')), 'count'],
      ],
      group: ['task.status'],
    });

    const totalBugs = await BugReport.count({
      include: [
        {
          association: 'task',
          where: taskWhere,
          required: true,
        },
      ],
    });

    const resolvedBugs = await BugReport.count({
      include: [
        {
          association: 'task',
          where: { ...taskWhere, status: 'done' },
          required: true,
        },
      ],
    });

    const resolutionTime = await BugReport.findAll({
      include: [
        {
          association: 'task',
          where: { ...taskWhere, status: 'done', completedDate: { [Op.ne]: null } },
          attributes: ['createdAt', 'completedDate'],
          required: true,
        },
      ],
      attributes: [
        [fn('TIMESTAMPDIFF', literal('HOUR'), col('task.createdAt'), col('task.completedDate')), 'resolutionHours'],
      ],
      limit: 100,
    });

    const avgResolutionTime = resolutionTime.length > 0
      ? resolutionTime.reduce((sum, r) => sum + (parseFloat(r.get('resolutionHours')) || 0), 0) / resolutionTime.length
      : 0;

    return {
      bySeverity,
      byStatus,
      totalBugs,
      resolvedBugs,
      openBugs: totalBugs - resolvedBugs,
      resolutionRate: totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 0,
      avgResolutionHours: Math.round(avgResolutionTime * 100) / 100,
    };
  },

  async getTimesheetReport(query) {
    const { companyId, userId, projectId, startDate, endDate, groupBy } = query;

    const where = {};
    if (userId) where.userId = userId;
    if (projectId) where.projectId = projectId;
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }

    let groupField;
    switch (groupBy) {
      case 'user':
        groupField = 'userId';
        break;
      case 'project':
        groupField = 'projectId';
        break;
      case 'date':
        groupField = 'date';
        break;
      default:
        groupField = 'userId';
    }

    const entries = await TimeEntry.findAll({
      where,
      attributes: [
        groupField,
        [fn('COUNT', col('id')), 'count'],
        [fn('COALESCE', fn('SUM', col('duration')), 0), 'totalSeconds'],
        [fn('COALESCE', fn('SUM', col('totalAmount')), 0), 'totalAmount'],
      ],
      group: [groupField],
      order: [[groupField, 'ASC']],
    });

    const totalSeconds = await TimeEntry.sum('duration', { where }) || 0;
    const totalAmount = await TimeEntry.sum('totalAmount', { where }) || 0;

    return {
      entries,
      summary: {
        totalEntries: entries.length,
        totalSeconds,
        totalHours: Math.round((totalSeconds / 3600) * 100) / 100,
        totalAmount: parseFloat(totalAmount),
      },
    };
  },

  async getPerformanceReport(query) {
    const { companyId, startDate, endDate } = query;

    const employees = await User.findAll({
      where: { companyId, isActive: true },
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'employeeId'],
    });

    const report = await Promise.all(
      employees.map(async (emp) => {
        const taskWhere = { assigneeId: emp.id, companyId };
        if (startDate && endDate) {
          taskWhere.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        const totalTasks = await Task.count({ where: taskWhere });
        const completedTasks = await Task.count({
          where: { ...taskWhere, status: 'done' },
        });
        const overdueTasks = await Task.count({
          where: {
            ...taskWhere,
            dueDate: { [Op.lt]: new Date() },
            status: { [Op.notIn]: ['done', 'cancelled'] },
          },
        });
        const onTimeTasks = await Task.count({
          where: {
            ...taskWhere,
            status: 'done',
            completedDate: { [Op.lte]: col('dueDate') },
          },
        });

        const attendanceWhere = { userId: emp.id, companyId };
        if (startDate && endDate) {
          attendanceWhere.date = { [Op.between]: [startDate, endDate] };
        }

        const totalDays = await Attendance.count({ where: attendanceWhere });
        const presentDays = await Attendance.count({
          where: { ...attendanceWhere, status: 'present' },
        });

        const timeWhere = { userId: emp.id };
        if (startDate && endDate) {
          timeWhere.date = { [Op.between]: [startDate, endDate] };
        }
        const totalHours = (await TimeEntry.sum('duration', { where: timeWhere })) || 0;

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const onTimeRate = completedTasks > 0 ? Math.round((onTimeTasks / completedTasks) * 100) : 0;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        return {
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          role: emp.role,
          employeeCode: emp.employeeId,
          totalTasks,
          completedTasks,
          overdueTasks,
          completionRate,
          onTimeRate,
          attendanceRate,
          totalHours: Math.round((totalHours / 3600) * 100) / 100,
        };
      })
    );

    report.sort((a, b) => b.completionRate - a.completionRate);

    return report;
  },

  async getDashboardStats(query) {
    const { companyId } = query;

    const totalProjects = await Project.count({ where: { companyId } });
    const activeProjects = await Project.count({
      where: { companyId, status: 'in_progress' },
    });
    const completedProjects = await Project.count({
      where: { companyId, status: 'completed' },
    });

    const totalTasks = await Task.count({ where: { companyId } });
    const completedTasks = await Task.count({
      where: { companyId, status: 'done' },
    });
    const inProgressTasks = await Task.count({
      where: { companyId, status: 'in_progress' },
    });
    const todoTasks = await Task.count({ where: { companyId, status: 'todo' } });
    const overdueTasks = await Task.count({
      where: {
        companyId,
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.notIn]: ['done', 'cancelled'] },
      },
    });

    const totalEmployees = await User.count({
      where: { companyId, isActive: true },
    });

    const activeSprints = await Sprint.count({
      include: [
        {
          association: 'project',
          where: { companyId },
          attributes: [],
        },
      ],
      where: { status: 'active' },
    });

    const today = new Date().toISOString().split('T')[0];
    const todayPresent = await Attendance.count({
      where: { date: today, status: 'present', companyId },
    });
    const todayAbsent = await Attendance.count({
      where: { date: today, status: 'absent', companyId },
    });
    const todayOnLeave = await Attendance.count({
      where: { date: today, status: 'on_leave', companyId },
    });

    const pendingLeaves = await Leave.count({
      where: { companyId, status: 'pending' },
    });

    const taskCompletionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    return {
      projects: { total: totalProjects, active: activeProjects, completed: completedProjects },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        todo: todoTasks,
        overdue: overdueTasks,
        completionRate: taskCompletionRate,
      },
      employees: { total: totalEmployees },
      sprints: { active: activeSprints },
      attendance: { present: todayPresent, absent: todayAbsent, onLeave: todayOnLeave },
      leaves: { pending: pendingLeaves },
    };
  },
};

module.exports = reportService;
