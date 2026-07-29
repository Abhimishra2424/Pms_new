const departmentService = require('../services/departmentService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await departmentService.getAll(req.query);
  return ApiResponse.success(res, result, 'Departments retrieved successfully');
});

const getById = catchAsync(async (req, res) => {
  const department = await departmentService.getById(req.params.id);
  return ApiResponse.success(res, department, 'Department retrieved successfully');
});

const create = catchAsync(async (req, res) => {
  const department = await departmentService.create(req.body);
  return ApiResponse.success(res, department, 'Department created successfully', 201);
});

const update = catchAsync(async (req, res) => {
  const department = await departmentService.update(req.params.id, req.body);
  return ApiResponse.success(res, department, 'Department updated successfully');
});

const deleteDepartment = catchAsync(async (req, res) => {
  await departmentService.delete(req.params.id);
  return ApiResponse.success(res, null, 'Department deleted successfully');
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteDepartment,
};
