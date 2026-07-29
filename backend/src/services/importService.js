const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { User, Project, Task, Client, Company, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const parseFile = (filePath, mimetype) => {
  if (mimetype === 'text/csv' || mimetype === 'application/vnd.ms-excel') {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      throw ApiError.badRequest('CSV file must have a header row and at least one data row');
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || null;
      });
      rows.push(row);
    }
    return rows;
  }

  if (
    mimetype ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    try {
      const XLSX = require('xlsx');
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      return data.map((row) => {
        const normalized = {};
        Object.keys(row).forEach((key) => {
          normalized[key.trim().toLowerCase()] = row[key];
        });
        return normalized;
      });
    } catch (error) {
      throw ApiError.badRequest('Failed to parse Excel file. Ensure xlsx package is installed.');
    }
  }

  throw ApiError.badRequest('Unsupported file format. Please upload a CSV or XLSX file.');
};

const requiredFields = {
  employees: ['firstname', 'lastname', 'email'],
  projects: ['name'],
  tasks: ['title'],
  clients: ['name', 'email'],
};

const importService = {
  async parseAndValidate(file, type) {
    if (!file) {
      throw ApiError.badRequest('No file uploaded');
    }

    const rows = parseFile(file.path, file.mimetype);
    const fields = requiredFields[type];
    if (!fields) {
      throw ApiError.badRequest(`Invalid import type: ${type}`);
    }

    const errors = [];
    const validRows = [];

    rows.forEach((row, index) => {
      const rowErrors = [];
      fields.forEach((field) => {
        if (!row[field] || !row[field].toString().trim()) {
          rowErrors.push(`Missing required field: ${field}`);
        }
      });

      if (rowErrors.length > 0) {
        errors.push({ row: index + 2, errors: rowErrors });
      } else {
        validRows.push(row);
      }
    });

    return { validRows, errors, totalRows: rows.length, validCount: validRows.length, errorCount: errors.length };
  },

  async bulkImport(data, type, companyId) {
    let created = 0;
    let failed = 0;
    const failedItems = [];

    await sequelize.transaction(async (transaction) => {
      for (const row of data) {
        try {
          switch (type) {
            case 'employees':
              await User.create(
                {
                  firstName: row.firstname,
                  lastName: row.lastname,
                  email: row.email,
                  password: row.password || 'Welcome123!',
                  phone: row.phone || null,
                  role: row.role || 'developer',
                  employeeId: row.employeeid || null,
                  companyId,
                  departmentId: row.departmentid || null,
                  designationId: row.designationid || null,
                  dateOfJoining: row.dateofjoining || null,
                  isActive: true,
                },
                { transaction }
              );
              break;

            case 'projects':
              await Project.create(
                {
                  name: row.name,
                  description: row.description || null,
                  key: row.key || null,
                  status: row.status || 'planning',
                  priority: row.priority || 'medium',
                  companyId,
                  startDate: row.startdate || null,
                  endDate: row.enddate || null,
                  budget: row.budget || null,
                  currency: row.currency || 'USD',
                  leadId: row.leadid || null,
                  clientId: row.clientid || null,
                },
                { transaction }
              );
              break;

            case 'tasks':
              await Task.create(
                {
                  title: row.title,
                  description: row.description || null,
                  type: row.type || 'task',
                  status: row.status || 'todo',
                  priority: row.priority || 'medium',
                  projectId: row.projectid || null,
                  companyId,
                  assigneeId: row.assigneeid || null,
                  reporterId: row.reporterid || null,
                  dueDate: row.duedate || null,
                  estimatedHours: row.estimatedhours || null,
                },
                { transaction }
              );
              break;

            case 'clients':
              await Client.create(
                {
                  name: row.name,
                  email: row.email,
                  phone: row.phone || null,
                  company: row.company || null,
                  website: row.website || null,
                  address: row.address || null,
                  city: row.city || null,
                  state: row.state || null,
                  country: row.country || null,
                  zipCode: row.zipcode || null,
                  notes: row.notes || null,
                  companyId,
                },
                { transaction }
              );
              break;

            default:
              throw new Error(`Unknown import type: ${type}`);
          }
          created++;
        } catch (error) {
          failed++;
          failedItems.push({ row, error: error.message });
          logger.error(`Import error [${type}]:`, error.message);
        }
      }
    });

    return { created, failed, failedItems, total: data.length };
  },
};

module.exports = importService;
