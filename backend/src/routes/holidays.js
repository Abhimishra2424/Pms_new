const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const holidayController = require('../controllers/holidayController');
const { createHolidayRules, updateHolidayRules } = require('../validators/holidayValidator');

router.get('/', authenticate, holidayController.getAll);
router.get('/:id', authenticate, holidayController.getById);
router.post('/', authenticate, validate(createHolidayRules), holidayController.create);
router.put('/:id', authenticate, validate(updateHolidayRules), holidayController.update);
router.delete('/:id', authenticate, holidayController.delete);
router.get('/year/:year', authenticate, holidayController.getByYear);

module.exports = router;
