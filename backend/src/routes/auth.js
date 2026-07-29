const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
} = require('../validators/authValidator');
const authController = require('../controllers/authController');

router.post('/register', validate(registerRules), authLimiter, authController.register);
router.post('/login', validate(loginRules), authLimiter, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', validate(forgotPasswordRules), authLimiter, authController.forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordRules), authController.resetPassword);
router.post('/change-password', authenticate, validate(changePasswordRules), authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;
