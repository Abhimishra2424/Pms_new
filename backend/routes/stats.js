const { Router } = require('express');
const { auth } = require('../middleware');
const statsService = require('../services/statsService');
const noteService = require('../services/noteService');

const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    const stats = await statsService.getStats(req.userId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export', auth, async (req, res) => {
  try {
    const notes = await noteService.getAllForExport(req.userId);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=notes-export.json');
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
