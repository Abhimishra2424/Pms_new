const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const activityLogController = require('../controllers/activityLogController');

router.get('/', authenticate, activityLogController.getAll);
router.get('/resource/:resourceType/:resourceId', authenticate, activityLogController.getByResource);
router.get('/user/:userId', authenticate, activityLogController.getByUser);
router.get('/date-range', authenticate, activityLogController.getByDateRange);

module.exports = router;
