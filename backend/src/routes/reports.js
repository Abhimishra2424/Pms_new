const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

router.get('/employee', authenticate, reportController.getEmployeeReport);
router.get('/project', authenticate, reportController.getProjectReport);
router.get('/task', authenticate, reportController.getTaskReport);
router.get('/sprint', authenticate, reportController.getSprintReport);
router.get('/bug', authenticate, reportController.getBugReport);
router.get('/timesheet', authenticate, reportController.getTimesheetReport);
router.get('/performance', authenticate, reportController.getPerformanceReport);
router.get('/dashboard-stats', authenticate, reportController.getDashboardStats);

module.exports = router;
