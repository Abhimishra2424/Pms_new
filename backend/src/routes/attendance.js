const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const attendanceController = require('../controllers/attendanceController');
const { createAttendanceRules } = require('../validators/attendanceValidator');

router.post('/clock-in', authenticate, attendanceController.clockIn);
router.post('/clock-out', authenticate, attendanceController.clockOut);
router.get('/today', authenticate, attendanceController.getToday);
router.get('/', authenticate, attendanceController.getAll);
router.get('/range', authenticate, attendanceController.getByRange);
router.get('/monthly/:userId', authenticate, attendanceController.getMonthlyReport);
router.post('/mark-absent', authenticate, validate(createAttendanceRules), attendanceController.markAbsent);
router.get('/team', authenticate, attendanceController.getTeamAttendance);

module.exports = router;
