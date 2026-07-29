const { Router } = require('express');
const { auth } = require('../middleware');
const tagService = require('../services/tagService');

const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    const tags = await tagService.findAll(req.userId);
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Tag name is required' });
  try {
    const tag = await tagService.create(req.userId, req.body);
    res.status(201).json(tag);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Tag already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const ok = await tagService.remove(req.params.id, req.userId);
    if (!ok) return res.status(404).json({ error: 'Tag not found' });
    res.json({ message: 'Tag deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
