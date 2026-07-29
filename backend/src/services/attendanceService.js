const { Op } = require('sequelize');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const AttendanceRepository = require('../repositories/attendanceRepository');

const AttendanceService = {
  async clockIn(userId, companyId) {
    const today = new Date().toISOString().split('T')[0];

    const existing = await AttendanceRepository.findByUserAndDate(userId, today);
    if (existing) {
      throw ApiError.badRequest('Attendance already recorded for today');
    }

    return AttendanceRepository.create({
      userId,
      companyId,
      date: today,
      clockIn: new Date(),
      status: 'present',
    });
  },

  async clockOut(userId) {
    const today = new Date().toISOString().split('T')[0];

    const attendance = await AttendanceRepository.findByUserAndDate(userId, today);
    if (!attendance) {
      throw ApiError.badRequest('No clock-in record found for today');
    }
    if (attendance.clockOut) {
      throw ApiError.badRequest('Already clocked out today');
    }

    const clockOutTime = new Date();
    const clockInTime = new Date(attendance.clockIn);
    const totalHours = parseFloat(((clockOutTime - clockInTime) / (1000 * 60 * 60)).toFixed(2));

    return AttendanceRepository.update(attendance.id, {
      clockOut: clockOutTime,
      totalHours,
    });
  },

  async getToday(userId) {
    const today = new Date().toISOString().split('T')[0];
    return AttendanceRepository.findByUserAndDate(userId, today);
  },

  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'date',
      sortOrder: query.sortOrder || 'DESC',
      userId: query.userId,
      companyId: query.companyId,
      status: query.status,
      startDate: query.startDate,
      endDate: query.endDate,
    };
    return AttendanceRepository.findAll(parsedQuery);
  },

  async getByDateRange(companyId, startDate, endDate) {
    if (!startDate || !endDate) {
      throw ApiError.badRequest('Start date and end date are required');
    }
    return AttendanceRepository.findByCompanyAndDateRange(companyId, startDate, endDate);
  },

  async getMonthlyReport(userId, month, year) {
    const yearNum = parseInt(year, 10) || new Date().getFullYear();
    const monthNum = parseInt(month, 10) || (new Date().getMonth() + 1);

    const records = await AttendanceRepository.findByUserAndMonth(userId, yearNum, monthNum);

    const totalPresent = records.filter((r) => r.status === 'present' || (r.status === 'late')).length;
    const totalAbsent = records.filter((r) => r.status === 'absent').length;
    const totalLate = records.filter((r) => r.status === 'late').length;
    const totalHalfDays = records.filter((r) => r.status === 'half_day').length;
    const totalWFH = records.filter((r) => r.status === 'wfh').length;
    const totalHours = records.reduce((sum, r) => sum + parseFloat(r.totalHours || 0), 0);

    return {
      userId,
      year: yearNum,
      month: monthNum,
      summary: {
        totalRecords: records.length,
        totalPresent,
        totalAbsent,
        totalLate,
        totalHalfDays,
        totalWFH,
        totalHours: parseFloat(totalHours.toFixed(2)),
      },
      records,
    };
  },

  async markAbsent(userId, companyId, date) {
    const existing = await AttendanceRepository.findByUserAndDate(userId, date);
    if (existing) {
      throw ApiError.badRequest('Attendance record already exists for this date');
    }

    return AttendanceRepository.create({
      userId,
      companyId,
      date,
      status: 'absent',
    });
  },

  async getTeamAttendance(managerId, date) {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const teamMembers = await User.findAll({
      where: { managerId },
      attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'employeeId'],
    });

    const teamWithAttendance = await Promise.all(
      teamMembers.map(async (member) => {
        const attendance = await AttendanceRepository.findByUserAndDate(member.id, targetDate);
        return {
          user: member,
          attendance: attendance || null,
        };
      })
    );

    return teamWithAttendance;
  },
};

module.exports = AttendanceService;
