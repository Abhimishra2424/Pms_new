const { body } = require('express-validator');

const taskTypes = ['task', 'bug', 'story', 'epic', 'sub_task'];
const taskStatuses = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];
const priorities = ['low', 'medium', 'high', 'urgent'];
const severities = ['critical', 'major', 'minor', 'trivial'];

const createTaskRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 2, max: 500 }).withMessage('Title must be between 2 and 500 characters'),

  body('description')
    .optional()
    .trim(),

  body('type')
    .optional()
    .isIn(taskTypes).withMessage('Invalid task type'),

  body('status')
    .optional()
    .isIn(taskStatuses).withMessage('Invalid status'),

  body('priority')
    .optional()
    .isIn(priorities).withMessage('Invalid priority'),

  body('severity')
    .optional()
    .isIn(severities).withMessage('Invalid severity'),

  body('storyPoints')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Story points must be between 0 and 100'),

  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Invalid due date'),

  body('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date'),

  body('projectId')
    .notEmpty().withMessage('Project ID is required')
    .isUUID().withMessage('Invalid project ID'),

  body('sprintId')
    .optional()
    .isUUID().withMessage('Invalid sprint ID'),

  body('epicId')
    .optional()
    .isUUID().withMessage('Invalid epic ID'),

  body('milestoneId')
    .optional()
    .isUUID().withMessage('Invalid milestone ID'),

  body('parentId')
    .optional()
    .isUUID().withMessage('Invalid parent task ID'),

  body('assigneeId')
    .optional()
    .isUUID().withMessage('Invalid assignee ID'),

  body('labels')
    .optional()
    .isArray().withMessage('Labels must be an array'),

  body('environment')
    .optional()
    .trim(),

  body('stepsToReproduce')
    .optional()
    .trim(),

  body('expectedResult')
    .optional()
    .trim(),

  body('actualResult')
    .optional()
    .trim(),

  body('attachments')
    .optional()
    .isArray().withMessage('Attachments must be an array'),
];

const updateTaskRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 500 }).withMessage('Title must be between 2 and 500 characters'),

  body('description')
    .optional()
    .trim(),

  body('type')
    .optional()
    .isIn(taskTypes).withMessage('Invalid task type'),

  body('status')
    .optional()
    .isIn(taskStatuses).withMessage('Invalid status'),

  body('priority')
    .optional()
    .isIn(priorities).withMessage('Invalid priority'),

  body('severity')
    .optional()
    .isIn(severities).withMessage('Invalid severity'),

  body('storyPoints')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Story points must be between 0 and 100'),

  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Invalid due date'),

  body('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date'),

  body('projectId')
    .optional()
    .isUUID().withMessage('Invalid project ID'),

  body('sprintId')
    .optional()
    .isUUID().withMessage('Invalid sprint ID'),

  body('epicId')
    .optional()
    .isUUID().withMessage('Invalid epic ID'),

  body('milestoneId')
    .optional()
    .isUUID().withMessage('Invalid milestone ID'),

  body('parentId')
    .optional()
    .isUUID().withMessage('Invalid parent task ID'),

  body('assigneeId')
    .optional()
    .isUUID().withMessage('Invalid assignee ID'),

  body('labels')
    .optional()
    .isArray().withMessage('Labels must be an array'),

  body('environment')
    .optional()
    .trim(),

  body('stepsToReproduce')
    .optional()
    .trim(),

  body('expectedResult')
    .optional()
    .trim(),

  body('actualResult')
    .optional()
    .trim(),

  body('attachments')
    .optional()
    .isArray().withMessage('Attachments must be an array'),
];

const reorderTasksRules = [
  body('projectId')
    .notEmpty().withMessage('Project ID is required')
    .isUUID().withMessage('Invalid project ID'),

  body('tasks')
    .isArray({ min: 1 }).withMessage('Tasks must be a non-empty array'),

  body('tasks.*.id')
    .notEmpty().withMessage('Task ID is required')
    .isUUID().withMessage('Invalid task ID'),

  body('tasks.*.status')
    .notEmpty().withMessage('Status is required')
    .isIn(taskStatuses).withMessage('Invalid status'),

  body('tasks.*.sortOrder')
    .notEmpty().withMessage('Sort order is required')
    .isInt({ min: 0 }).withMessage('Sort order must be a positive integer'),
];

module.exports = { createTaskRules, updateTaskRules, reorderTasksRules };
