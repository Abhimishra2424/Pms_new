const { Project, Task, User, Invoice, InvoiceItem, Client, Company, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const exportService = {
  async exportProjects(companyId, query) {
    const where = { companyId };
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;

    const projects = await Project.findAll({
      where,
      include: [
        { association: 'lead', attributes: ['firstName', 'lastName', 'email'] },
        { association: 'client', attributes: ['name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const headers = [
      'Name', 'Key', 'Status', 'Priority', 'Lead', 'Client',
      'Start Date', 'End Date', 'Budget', 'Currency', 'Progress',
      'Estimated Hours', 'Actual Hours', 'Created At',
    ];

    const data = projects.map((p) => ({
      Name: p.name,
      Key: p.key,
      Status: p.status,
      Priority: p.priority,
      Lead: p.lead ? `${p.lead.firstName} ${p.lead.lastName}` : '',
      Client: p.client ? p.client.name : '',
      'Start Date': p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
      'End Date': p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : '',
      Budget: p.budget || '',
      Currency: p.currency || '',
      Progress: p.progress || 0,
      'Estimated Hours': p.estimatedHours || '',
      'Actual Hours': p.actualHours || 0,
      'Created At': new Date(p.createdAt).toISOString().split('T')[0],
    }));

    return { headers, data, filename: 'projects_export.csv' };
  },

  async exportTasks(companyId, query) {
    const where = { companyId };
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;
    if (query.assigneeId) where.assigneeId = query.assigneeId;

    const tasks = await Task.findAll({
      where,
      include: [
        { association: 'project', attributes: ['name', 'key'] },
        { association: 'assignee', attributes: ['firstName', 'lastName', 'email'] },
        { association: 'reporter', attributes: ['firstName', 'lastName', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const headers = [
      'Title', 'Type', 'Status', 'Priority', 'Project', 'Assignee',
      'Reporter', 'Due Date', 'Estimated Hours', 'Actual Hours',
      'Story Points', 'Created At',
    ];

    const data = tasks.map((t) => ({
      Title: t.title,
      Type: t.type,
      Status: t.status,
      Priority: t.priority,
      Project: t.project ? `${t.project.name} (${t.project.key})` : '',
      Assignee: t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : '',
      Reporter: t.reporter ? `${t.reporter.firstName} ${t.reporter.lastName}` : '',
      'Due Date': t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
      'Estimated Hours': t.estimatedHours || '',
      'Actual Hours': t.actualHours || 0,
      'Story Points': t.storyPoints || '',
      'Created At': new Date(t.createdAt).toISOString().split('T')[0],
    }));

    return { headers, data, filename: 'tasks_export.csv' };
  },

  async exportEmployees(companyId, query) {
    const where = { companyId, isActive: true };
    if (query.role) where.role = query.role;
    if (query.departmentId) where.departmentId = query.departmentId;

    const employees = await User.findAll({
      where,
      include: [
        { association: 'department', attributes: ['name'] },
        { association: 'designation', attributes: ['title'] },
        { association: 'manager', attributes: ['firstName', 'lastName'] },
      ],
      order: [['firstName', 'ASC']],
    });

    const headers = [
      'Employee ID', 'First Name', 'Last Name', 'Email', 'Phone',
      'Role', 'Department', 'Designation', 'Manager', 'Date of Joining',
      'Status',
    ];

    const data = employees.map((e) => ({
      'Employee ID': e.employeeId || '',
      'First Name': e.firstName,
      'Last Name': e.lastName,
      Email: e.email,
      Phone: e.phone || '',
      Role: e.role,
      Department: e.department ? e.department.name : '',
      Designation: e.designation ? e.designation.title : '',
      Manager: e.manager ? `${e.manager.firstName} ${e.manager.lastName}` : '',
      'Date of Joining': e.dateOfJoining || '',
      Status: e.isActive ? 'Active' : 'Inactive',
    }));

    return { headers, data, filename: 'employees_export.csv' };
  },

  async exportInvoices(companyId, query) {
    const where = { companyId };
    if (query.status) where.status = query.status;
    if (query.clientId) where.clientId = query.clientId;

    const invoices = await Invoice.findAll({
      where,
      include: [
        { association: 'client', attributes: ['name', 'email', 'phone'] },
        { association: 'items', attributes: ['description', 'quantity', 'rate', 'amount'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const headers = [
      'Invoice #', 'Client', 'Client Email', 'Issue Date', 'Due Date',
      'Status', 'Subtotal', 'Tax', 'Discount', 'Total', 'Paid',
      'Balance', 'Currency',
    ];

    const data = invoices.map((inv) => ({
      'Invoice #': inv.invoiceNumber,
      Client: inv.client ? inv.client.name : '',
      'Client Email': inv.client ? inv.client.email : '',
      'Issue Date': inv.issueDate || '',
      'Due Date': inv.dueDate || '',
      Status: inv.status,
      Subtotal: inv.subtotal || 0,
      Tax: inv.taxAmount || 0,
      Discount: inv.discountAmount || 0,
      Total: inv.total || 0,
      Paid: inv.amountPaid || 0,
      Balance: inv.balanceDue || inv.total || 0,
      Currency: inv.currency || 'USD',
    }));

    return { headers, data, filename: 'invoices_export.csv' };
  },

  generateCSV(headers, data) {
    const headerLine = headers.join(',');
    const rows = data.map((row) =>
      headers.map((h) => {
        const value = row[h];
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    );

    return `${headerLine}\n${rows.join('\n')}`;
  },

  generateJSON(data) {
    return JSON.stringify(data, null, 2);
  },
};

module.exports = exportService;
