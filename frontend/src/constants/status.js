export const PROJECT_STATUS = {
  PLANNING: { value: 'planning', label: 'Planning', color: 'info' },
  IN_PROGRESS: { value: 'in_progress', label: 'In Progress', color: 'primary' },
  ON_HOLD: { value: 'on_hold', label: 'On Hold', color: 'warning' },
  COMPLETED: { value: 'completed', label: 'Completed', color: 'success' },
  CANCELLED: { value: 'cancelled', label: 'Cancelled', color: 'error' },
  ARCHIVED: { value: 'archived', label: 'Archived', color: 'default' },
};

export const TASK_STATUS = {
  BACKLOG: { value: 'backlog', label: 'Backlog', color: 'default' },
  TODO: { value: 'todo', label: 'To Do', color: 'info' },
  IN_PROGRESS: { value: 'in_progress', label: 'In Progress', color: 'primary' },
  IN_REVIEW: { value: 'in_review', label: 'In Review', color: 'warning' },
  DONE: { value: 'done', label: 'Done', color: 'success' },
  CANCELLED: { value: 'cancelled', label: 'Cancelled', color: 'error' },
};

export const PRIORITY = {
  LOWEST: { value: 'lowest', label: 'Lowest', color: 'default' },
  LOW: { value: 'low', label: 'Low', color: 'info' },
  MEDIUM: { value: 'medium', label: 'Medium', color: 'warning' },
  HIGH: { value: 'high', label: 'High', color: 'error' },
  HIGHEST: { value: 'highest', label: 'Highest', color: 'error' },
};

export const BUG_SEVERITY = {
  TRIVIAL: { value: 'trivial', label: 'Trivial', color: 'default' },
  MINOR: { value: 'minor', label: 'Minor', color: 'info' },
  MAJOR: { value: 'major', label: 'Major', color: 'warning' },
  CRITICAL: { value: 'critical', label: 'Critical', color: 'error' },
  BLOCKER: { value: 'blocker', label: 'Blocker', color: 'error' },
};

export const MEETING_STATUS = {
  SCHEDULED: { value: 'scheduled', label: 'Scheduled', color: 'info' },
  ONGOING: { value: 'ongoing', label: 'Ongoing', color: 'primary' },
  COMPLETED: { value: 'completed', label: 'Completed', color: 'success' },
  CANCELLED: { value: 'cancelled', label: 'Cancelled', color: 'error' },
};

export const INVOICE_STATUS = {
  DRAFT: { value: 'draft', label: 'Draft', color: 'default' },
  SENT: { value: 'sent', label: 'Sent', color: 'info' },
  PAID: { value: 'paid', label: 'Paid', color: 'success' },
  PARTIALLY_PAID: { value: 'partially_paid', label: 'Partially Paid', color: 'warning' },
  OVERDUE: { value: 'overdue', label: 'Overdue', color: 'error' },
  CANCELLED: { value: 'cancelled', label: 'Cancelled', color: 'default' },
};

export const EXPENSE_STATUS = {
  PENDING: { value: 'pending', label: 'Pending', color: 'warning' },
  APPROVED: { value: 'approved', label: 'Approved', color: 'success' },
  REJECTED: { value: 'rejected', label: 'Rejected', color: 'error' },
};

export const LEAVE_STATUS = {
  PENDING: { value: 'pending', label: 'Pending', color: 'warning' },
  APPROVED: { value: 'approved', label: 'Approved', color: 'success' },
  REJECTED: { value: 'rejected', label: 'Rejected', color: 'error' },
  CANCELLED: { value: 'cancelled', label: 'Cancelled', color: 'default' },
};

export const ATTENDANCE_STATUS = {
  PRESENT: { value: 'present', label: 'Present', color: 'success' },
  ABSENT: { value: 'absent', label: 'Absent', color: 'error' },
  LATE: { value: 'late', label: 'Late', color: 'warning' },
  HALF_DAY: { value: 'half_day', label: 'Half Day', color: 'info' },
  WORK_FROM_HOME: { value: 'work_from_home', label: 'Work From Home', color: 'primary' },
  ON_LEAVE: { value: 'on_leave', label: 'On Leave', color: 'default' },
};
