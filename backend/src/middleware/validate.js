const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    const errorMessage = extractedErrors.map((e) => `${e.field}: ${e.message}`).join(', ');

    next(new ApiError(422, 'Validation failed', extractedErrors));
  };
};

module.exports = validate;
