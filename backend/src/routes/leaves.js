const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const leaveController = require('../controllers/leaveController');
const { applyLeaveRules } = require('../validators/leaveValidator');

router.post('/', authenticate, validate(applyLeaveRules), leaveController.apply);
router.get('/', authenticate, leaveController.getAll);
router.get('/pending', authenticate, leaveController.getPending);
router.get('/balance/:userId', authenticate, leaveController.getBalance);
router.get('/user/:userId', authenticate, leaveController.getByUser);
router.put('/:id/approve', authenticate, leaveController.approve);
router.put('/:id/reject', authenticate, leaveController.reject);
router.put('/:id/cancel', authenticate, leaveController.cancel);

module.exports = router;
