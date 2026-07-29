const User = require('./User');
const Company = require('./Company');
const Department = require('./Department');
const Designation = require('./Designation');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const ProjectMilestone = require('./ProjectMilestone');
const Sprint = require('./Sprint');
const Epic = require('./Epic');
const Task = require('./Task');
const TaskChecklist = require('./TaskChecklist');
const TaskDependency = require('./TaskDependency');
const TaskComment = require('./TaskComment');
const TaskHistory = require('./TaskHistory');
const BugReport = require('./BugReport');
const TimeEntry = require('./TimeEntry');
const Attendance = require('./Attendance');
const Leave = require('./Leave');
const Holiday = require('./Holiday');
const Meeting = require('./Meeting');
const MeetingAttendee = require('./MeetingAttendee');
const Client = require('./Client');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');
const Expense = require('./Expense');
const Document = require('./Document');
const KnowledgeBase = require('./KnowledgeBase');
const Wiki = require('./Wiki');
const Announcement = require('./Announcement');
const Notification = require('./Notification');
const ChatMessage = require('./ChatMessage');
const ChatConversation = require('./ChatConversation');
const ChatParticipant = require('./ChatParticipant');
const ActivityLog = require('./ActivityLog');
const Setting = require('./Setting');

const models = {
  User,
  Company,
  Department,
  Designation,
  Project,
  ProjectMember,
  ProjectMilestone,
  Sprint,
  Epic,
  Task,
  TaskChecklist,
  TaskDependency,
  TaskComment,
  TaskHistory,
  BugReport,
  TimeEntry,
  Attendance,
  Leave,
  Holiday,
  Meeting,
  MeetingAttendee,
  Client,
  Invoice,
  InvoiceItem,
  Expense,
  Document,
  KnowledgeBase,
  Wiki,
  Announcement,
  Notification,
  ChatMessage,
  ChatConversation,
  ChatParticipant,
  ActivityLog,
  Setting,
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = models;
