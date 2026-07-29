const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.get('/', authenticate, notificationController.getAll);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.put('/read-all', authenticate, notificationController.markAllAsRead);
router.get('/unread-count', authenticate, notificationController.getUnreadCount);
router.delete('/:id', authenticate, notificationController.delete);

module.exports = router;
