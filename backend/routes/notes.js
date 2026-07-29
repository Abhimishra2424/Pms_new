const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { auth } = require('../middleware');
const noteService = require('../services/noteService');
const tagService = require('../services/tagService');

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + crypto.randomBytes(6).toString('hex') + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', auth, async (req, res) => {
  try {
    const notes = await noteService.findAll(req.userId, req.query);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/trash', auth, async (req, res) => {
  try {
    const notes = await noteService.findTrash(req.userId);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/upcoming', auth, async (req, res) => {
  try {
    const notes = await noteService.findUpcoming(req.userId);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const note = await noteService.findById(req.params.id, req.userId);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    const note = await noteService.create(req.userId, req.body);
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    const note = await noteService.update(req.params.id, req.userId, req.body);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/pin', auth, async (req, res) => {
  try {
    const pinned = await noteService.togglePin(req.params.id, req.userId);
    if (pinned === null) return res.status(404).json({ error: 'Note not found' });
    res.json({ pinned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/archive', auth, async (req, res) => {
  try {
    const archived = await noteService.toggleArchive(req.params.id, req.userId);
    if (archived === null) return res.status(404).json({ error: 'Note not found' });
    res.json({ archived });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/restore', auth, async (req, res) => {
  try {
    const note = await noteService.restore(req.params.id, req.userId);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const ok = await noteService.softDelete(req.params.id, req.userId);
    if (!ok) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note moved to trash' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const ok = await noteService.permanentDelete(req.params.id, req.userId);
    if (!ok) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note permanently deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/share', auth, async (req, res) => {
  try {
    const note = await noteService.findById(req.params.id, req.userId);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    let token = note.share_token;
    if (!token) {
      token = crypto.randomUUID();
      await noteService.setShareToken(req.params.id, req.userId, token);
    }
    res.json({ shareUrl: `${req.protocol}://${req.get('host')}/api/shared/${token}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/file', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    await noteService.setFilePath(req.params.id, req.userId, req.file.filename);
    res.json({ file_path: req.file.filename, original_name: req.file.originalname });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/tags', auth, async (req, res) => {
  try {
    const tags = await tagService.getNoteTags(req.params.id);
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/tags', auth, async (req, res) => {
  const { tagId } = req.body;
  try {
    await tagService.addToNote(req.params.id, tagId);
    res.status(201).json({ message: 'Tag added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:noteId/tags/:tagId', auth, async (req, res) => {
  try {
    await tagService.removeFromNote(req.params.noteId, req.params.tagId);
    res.json({ message: 'Tag removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
