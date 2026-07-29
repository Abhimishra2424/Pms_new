const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError, BaseError } = require('sequelize');
const { TokenExpiredError, JsonWebTokenError } = require('jsonwebtoken');
const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  logger.error(`${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.method !== 'GET' ? req.body : undefined,
    ip: req.ip,
  });

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err instanceof ValidationError) {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
  }

  if (err instanceof UniqueConstraintError) {
    const field = err.errors && err.errors[0] ? err.errors[0].path : 'field';
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}. This ${field} already exists.`,
    });
  }

  if (err instanceof ForeignKeyConstraintError) {
    return res.status(409).json({
      success: false,
      message: 'Referenced record not found. Please check the related data.',
    });
  }

  if (err instanceof TokenExpiredError) {
    return res.status(401).json({
      success: false,
      message: 'Token has expired. Please login again.',
    });
  }

  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.',
    });
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof BaseError) {
    return res.status(500).json({
      success: false,
      message: 'Database error occurred.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
