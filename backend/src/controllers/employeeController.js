const employeeService = require('../services/employeeService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await employeeService.getAll(req.query);
  return ApiResponse.success(res, result, 'Employees retrieved successfully');
});

const getById = catchAsync(async (req, res) => {
  const employee = await employeeService.getById(req.params.id);
  return ApiResponse.success(res, employee, 'Employee retrieved successfully');
});

const create = catchAsync(async (req, res) => {
  const employee = await employeeService.create(req.body);
  return ApiResponse.success(res, employee, 'Employee created successfully', 201);
});

const update = catchAsync(async (req, res) => {
  const employee = await employeeService.update(req.params.id, req.body);
  return ApiResponse.success(res, employee, 'Employee updated successfully');
});

const deleteEmployee = catchAsync(async (req, res) => {
  await employeeService.delete(req.params.id);
  return ApiResponse.success(res, null, 'Employee deleted successfully');
});

const getByDepartment = catchAsync(async (req, res) => {
  const result = await employeeService.getByDepartment(req.params.deptId, req.query);
  return ApiResponse.success(res, result, 'Employees retrieved successfully');
});

const getByCompany = catchAsync(async (req, res) => {
  const result = await employeeService.getByCompany(req.params.companyId, req.query);
  return ApiResponse.success(res, result, 'Employees retrieved successfully');
});

const getByManager = catchAsync(async (req, res) => {
  const result = await employeeService.getByManager(req.params.managerId, req.query);
  return ApiResponse.success(res, result, 'Employees retrieved successfully');
});

const getByRole = catchAsync(async (req, res) => {
  const result = await employeeService.getByRole(req.params.role, req.query);
  return ApiResponse.success(res, result, 'Employees retrieved successfully');
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteEmployee,
  getByDepartment,
  getByCompany,
  getByManager,
  getByRole,
};
