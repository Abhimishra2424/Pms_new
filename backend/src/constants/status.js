module.exports = {
  PROJECT_STATUS: {
    PLANNING: 'planning',
    ACTIVE: 'active',
    ON_HOLD: 'on_hold',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    ARCHIVED: 'archived',
  },

  TASK_STATUS: {
    BACKLOG: 'backlog',
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    IN_REVIEW: 'in_review',
    DONE: 'done',
    CANCELLED: 'cancelled',
  },

  PRIORITY: {
    LOWEST: 'lowest',
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    HIGHEST: 'highest',
    CRITICAL: 'critical',
  },

  BUG_SEVERITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
    BLOCKER: 'blocker',
  },

  MEETING_STATUS: {
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },

  INVOICE_STATUS: {
    DRAFT: 'draft',
    SENT: 'sent',
    PAID: 'paid',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
  },

  LEAVE_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
  },

  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
    HALF_DAY: 'half_day',
    WFH: 'wfh',
    ON_LEAVE: 'on_leave',
  },

  PROJECT_CATEGORY: {
    INTERNAL: 'internal',
    EXTERNAL: 'external',
    MAINTENANCE: 'maintenance',
    RESEARCH: 'research',
    OTHER: 'other',
  },
};
