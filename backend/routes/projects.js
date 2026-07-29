const { Router } = require('express');
const { auth } = require('../middleware');
const projectService = require('../services/projectService');

const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    const projects = await projectService.findAll(req.userId);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const project = await projectService.findById(req.params.id, req.userId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });
  try {
    const project = await projectService.create(req.userId, req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });
  try {
    const project = await projectService.update(req.params.id, req.userId, req.body);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const ok = await projectService.remove(req.params.id, req.userId);
    if (!ok) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/members', auth, async (req, res) => {
  try {
    const members = await projectService.getMembers(req.params.id);
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/members', auth, async (req, res) => {
  const { userId, role } = req.body;
  try {
    await projectService.addMember(req.params.id, userId, role);
    res.status(201).json({ message: 'Member added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    await projectService.removeMember(req.params.id, req.params.userId);
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
