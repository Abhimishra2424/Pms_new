const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/upload');
const importController = require('../controllers/importController');

router.post('/employees', authenticate, uploadDocument.single('file'), importController.importEmployees);
router.post('/projects', authenticate, uploadDocument.single('file'), importController.importProjects);
router.post('/tasks', authenticate, uploadDocument.single('file'), importController.importTasks);
router.post('/clients', authenticate, uploadDocument.single('file'), importController.importClients);

module.exports = router;
