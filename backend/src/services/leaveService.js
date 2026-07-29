const ApiError = require('../utils/ApiError');
const LeaveRepository = require('../repositories/leaveRepository');

const LEAVE_LIMITS = {
  annual: 20,
  sick: 12,
  personal: 5,
  maternity: 180,
  paternity: 15,
  bereavement: 5,
  other: 10,
};

const LeaveService = {
  async apply(userId, companyId, data) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const year = startDate.getFullYear();
    const usedLeaves = await this.getLeaveBalance(userId, year);
    const available = (LEAVE_LIMITS[data.type] || 10) - (usedLeaves.usedByType[data.type] || 0);

    if (totalDays > available) {
      throw ApiError.badRequest(
        `Insufficient leave balance. Available: ${available} ${data.type} day(s), requested: ${totalDays}`
      );
    }

    return LeaveRepository.create({
      userId,
      companyId,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays,
      reason: data.reason,
      attachments: data.attachments || null,
      status: 'pending',
    });
  },

  async approve(leaveId, approverId) {
    const leave = await LeaveRepository.findById(leaveId);
    if (!leave) {
      throw ApiError.notFound('Leave request not found');
    }
    if (leave.status !== 'pending') {
      throw ApiError.badRequest('Leave request is not pending');
    }

    return LeaveRepository.update(leaveId, {
      status: 'approved',
      approvedBy: approverId,
      approvedAt: new Date(),
    });
  },

  async reject(leaveId, approverId, reason) {
    const leave = await LeaveRepository.findById(leaveId);
    if (!leave) {
      throw ApiError.notFound('Leave request not found');
    }
    if (leave.status !== 'pending') {
      throw ApiError.badRequest('Leave request is not pending');
    }

    return LeaveRepository.update(leaveId, {
      status: 'rejected',
      approvedBy: approverId,
      approvedAt: new Date(),
      rejectionReason: reason || 'Rejected',
    });
  },

  async getAll(query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      userId: query.userId,
      companyId: query.companyId,
      status: query.status,
      type: query.type,
      startDate: query.startDate,
      endDate: query.endDate,
    };
    return LeaveRepository.findAll(parsedQuery);
  },

  async getByUser(userId, query) {
    const parsedQuery = {
      page: parseInt(query.page, 10) || 1,
      limit: parseInt(query.limit, 10) || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
      status: query.status,
    };
    return LeaveRepository.findByUserId(userId, parsedQuery);
  },

  async getPending(companyId) {
    return LeaveRepository.findPendingByCompany(companyId);
  },

  async getLeaveBalance(userId, year) {
    const yearNum = parseInt(year, 10) || new Date().getFullYear();
    const approvedLeaves = await LeaveRepository.findApprovedByUserAndYear(userId, yearNum);

    const usedByType = {};
    let totalUsed = 0;

    approvedLeaves.forEach((leave) => {
      const days = leave.totalDays || 0;
      usedByType[leave.type] = (usedByType[leave.type] || 0) + days;
      totalUsed += days;
    });

    const balances = {};
    Object.keys(LEAVE_LIMITS).forEach((type) => {
      const limit = LEAVE_LIMITS[type];
      const used = usedByType[type] || 0;
      balances[type] = {
        limit,
        used,
        available: limit - used,
      };
    });

    return {
      userId,
      year: yearNum,
      totalUsed,
      balances,
      usedByType,
    };
  },

  async cancel(leaveId, userId) {
    const leave = await LeaveRepository.findById(leaveId);
    if (!leave) {
      throw ApiError.notFound('Leave request not found');
    }
    if (leave.userId !== userId) {
      throw ApiError.forbidden('You can only cancel your own leave requests');
    }
    if (leave.status !== 'pending') {
      throw ApiError.badRequest('Only pending leave requests can be cancelled');
    }

    return LeaveRepository.update(leaveId, { status: 'cancelled' });
  },
};

module.exports = LeaveService;
