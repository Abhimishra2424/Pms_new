const companyService = require('../services/companyService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const result = await companyService.getAll(req.query);
  return ApiResponse.success(res, result, 'Companies retrieved successfully');
});

const getById = catchAsync(async (req, res) => {
  const company = await companyService.getById(req.params.id);
  return ApiResponse.success(res, company, 'Company retrieved successfully');
});

const create = catchAsync(async (req, res) => {
  const company = await companyService.create(req.body);
  return ApiResponse.success(res, company, 'Company created successfully', 201);
});

const update = catchAsync(async (req, res) => {
  const company = await companyService.update(req.params.id, req.body);
  return ApiResponse.success(res, company, 'Company updated successfully');
});

const deleteCompany = catchAsync(async (req, res) => {
  await companyService.delete(req.params.id);
  return ApiResponse.success(res, null, 'Company deleted successfully');
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteCompany,
};
