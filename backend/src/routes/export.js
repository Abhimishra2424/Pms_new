const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const exportController = require('../controllers/exportController');

router.get('/projects', authenticate, exportController.exportProjects);
router.get('/tasks', authenticate, exportController.exportTasks);
router.get('/employees', authenticate, exportController.exportEmployees);
router.get('/invoices', authenticate, exportController.exportInvoices);

module.exports = router;
