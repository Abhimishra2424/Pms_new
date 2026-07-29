const { verifyToken } = require('../utils/helpers');
const ApiError = require('../utils/ApiError');
const { ROLES, ROLE_PERMISSIONS } = require('../constants/roles');

const authenticate = (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized('Access denied. No token provided.');
    }

    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      companyId: decoded.companyId || null,
      permissions: ROLE_PERMISSIONS[decoded.role] || [],
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else if (error.name === 'TokenExpiredError') {
      next(ApiError.unauthorized('Token has expired.'));
    } else if (error.name === 'JsonWebTokenError') {
      next(ApiError.unauthorized('Invalid token.'));
    } else {
      next(ApiError.unauthorized('Authentication failed.'));
    }
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to access this resource.'));
    }

    next();
  };
};

const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!req.user.permissions.includes(permission)) {
      return next(ApiError.forbidden('You do not have permission to perform this action.'));
    }

    next();
  };
};

module.exports = { authenticate, authorize, hasPermission };
