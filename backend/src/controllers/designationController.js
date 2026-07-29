const designationService = require('../services/designationService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await designationService.getAll(req.query);
  return ApiResponse.success(res, result, 'Designations retrieved successfully');
});

const getById = catchAsync(async (req, res) => {
  const designation = await designationService.getById(req.params.id);
  return ApiResponse.success(res, designation, 'Designation retrieved successfully');
});

const create = catchAsync(async (req, res) => {
  const designation = await designationService.create(req.body);
  return ApiResponse.success(res, designation, 'Designation created successfully', 201);
});

const update = catchAsync(async (req, res) => {
  const designation = await designationService.update(req.params.id, req.body);
  return ApiResponse.success(res, designation, 'Designation updated successfully');
});

const deleteDesignation = catchAsync(async (req, res) => {
  await designationService.delete(req.params.id);
  return ApiResponse.success(res, null, 'Designation deleted successfully');
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteDesignation,
};
