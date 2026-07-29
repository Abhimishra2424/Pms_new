const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const settingController = require('../controllers/settingController');

router.get('/', authenticate, settingController.getAll);
router.get('/:key', authenticate, settingController.getByKey);
router.put('/:key', authenticate, settingController.update);
router.put('/bulk', authenticate, settingController.updateBulk);

module.exports = router;
