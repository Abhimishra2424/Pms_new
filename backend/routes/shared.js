const { Router } = require('express');
const noteService = require('../services/noteService');

const router = Router();

router.get('/:token', async (req, res) => {
  try {
    const note = await noteService.findByShareToken(req.params.token);
    if (!note) return res.status(404).json({ error: 'Note not found or has been deleted' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
