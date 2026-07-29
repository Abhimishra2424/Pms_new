const { Op } = require('sequelize');
const { Task, Project } = require('../models');
const ApiError = require('../utils/ApiError');
const TimeEntryRepository = require('../repositories/timeEntryRepository');

const TimeEntryService = {
  async startTimer(userId, data) {
    const activeTimer = await TimeEntryRepository.findActiveTimer(userId);
    if (activeTimer) {
      throw ApiError.badRequest('You already have an active timer running');
    }

    const task = await Task.findByPk(data.taskId);
    if (!task) {
      throw ApiError.badRequest('Task not found');
    }

    const project = await Project.findByPk(data.projectId);
    if (!project) {
      throw ApiError.badRequest('Project not found');
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    return TimeEntryRepository.create({
      userId,
      taskId: data.taskId,
      projectId: data.projectId,
      description: data.description || null,
      startTime: now,
      source: 'timer',
      isBillable: data.isBillable !== undefined ? data.isBillable : true,
      date: dateStr,
    });
  },

  async stopTimer(userId, entryId) {
    const entry = await TimeEntryRepository.findById(entryId);
    if (!entry) {
      throw ApiError.notFound('Time entry not found');
    }
    if (entry.userId !== userId) {
      throw ApiError.forbidden('You can only stop your own timer');
    }
    if (entry.endTime) {
      throw ApiError.badRequest('Timer is already stopped');
    }

    const now = new Date();
    const duration = Math.floor((now - new Date(entry.startTime)) / 1000);

    return TimeEntryRepository.update(entryId, {
      endTime: now,
      duration,
    });
  },

  async getActiveTimer(userId) {
    return TimeEntryRepository.findActiveTimer(userId);
  },

  async createManual(userId, data) {
    const task = await Task.findByPk(data.taskId);
    if (!task) {
      throw ApiError.badRequest('Task not found');
    }

    const project = await Project.findByPk(data.projectId);
    if (!project) {
      throw ApiError.badRequest('Project not found');
    }

    let duration = data.duration;
    if (!duration && data.startTime && data.endTime) {
      duration = Math.floor((new Date(data.endTime) - new Date(data.startTime)) / 1000);
    }

    return TimeEntryRepository.create({
      userId,
      taskId: data.taskId,
      projectId: data.projectId,
      description: data.description || null,
      startTime: data.startTime,
      endTime: data.endTime || null,
      duration: duration || 0,
      isBillable: data.isBillable !== undefined ? data.isBillable : true,
      source: 'manual',
      date: data.date,
    });
  },

  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      userId: query.userId,
      taskId: query.taskId,
      projectId: query.projectId,
      startDate: query.startDate,
      endDate: query.endDate,
      isBillable: query.isBillable,
    };
    return TimeEntryRepository.findAll(parsedQuery);
  },

  async getByTask(taskId) {
    return TimeEntryRepository.findByTaskId(taskId);
  },

  async getWeeklyReport(userId, startDate, endDate) {
    const entries = await TimeEntryRepository.findByUserIdAndDateRange(userId, startDate, endDate);

    const dailyTotals = {};
    entries.forEach((entry) => {
      const day = entry.date;
      if (!dailyTotals[day]) {
        dailyTotals[day] = { date: day, totalSeconds: 0, entries: [] };
      }
      dailyTotals[day].totalSeconds += entry.duration || 0;
      dailyTotals[day].entries.push(entry);
    });

    const report = Object.values(dailyTotals).sort((a, b) => a.date.localeCompare(b.date));
    const grandTotal = report.reduce((sum, day) => sum + day.totalSeconds, 0);

    return { report, grandTotal, startDate, endDate };
  },

  async getDailyTotal(userId, date) {
    return TimeEntryRepository.getDailyTotal(userId, date);
  },

  async delete(userId, entryId) {
    const entry = await TimeEntryRepository.findById(entryId);
    if (!entry) {
      throw ApiError.notFound('Time entry not found');
    }
    if (entry.userId !== userId) {
      throw ApiError.forbidden('You can only delete your own time entries');
    }
    await TimeEntryRepository.delete(entryId);
    return true;
  },
};

module.exports = TimeEntryService;
