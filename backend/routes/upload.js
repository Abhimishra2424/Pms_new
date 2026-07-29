const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { auth } = require('../middleware');

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + crypto.randomBytes(6).toString('hex') + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ file_path: req.file.filename, original_name: req.file.originalname, size: req.file.size });
});

module.exports = router;
