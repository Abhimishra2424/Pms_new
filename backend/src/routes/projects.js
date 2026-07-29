const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const projectController = require('../controllers/projectController');
const ProjectMemberService = require('../services/projectMemberService');
const ApiResponse = require('../utils/ApiResponse');
const { createProjectRules, updateProjectRules } = require('../validators/projectValidator');
const { addMemberRules, updateMemberRoleRules } = require('../validators/projectMemberValidator');

router.get('/', authenticate, projectController.getAll);
router.get('/:id', authenticate, projectController.getById);
router.post('/', authenticate, validate(createProjectRules), projectController.create);
router.put('/:id', authenticate, validate(updateProjectRules), projectController.update);
router.delete('/:id', authenticate, projectController.delete);
router.get('/:id/stats', authenticate, projectController.getStats);
router.get('/:id/timeline', authenticate, projectController.getTimeline);

router.get('/:id/members', authenticate, async (req, res, next) => {
  try {
    const members = await ProjectMemberService.getMembers(req.params.id);
    return ApiResponse.success(res, { members }, 'Members fetched successfully');
  } catch (error) {
    next(error);
  }
});

router.post('/:id/members', authenticate, validate(addMemberRules), async (req, res, next) => {
  try {
    const member = await ProjectMemberService.addMember(req.params.id, req.body);
    return ApiResponse.success(res, { member }, 'Member added successfully', 201);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/members/:userId', authenticate, validate(updateMemberRoleRules), async (req, res, next) => {
  try {
    const member = await ProjectMemberService.updateMemberRole(req.params.id, req.params.userId, req.body.role);
    return ApiResponse.success(res, { member }, 'Member role updated successfully');
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/members/:userId', authenticate, async (req, res, next) => {
  try {
    await ProjectMemberService.removeMember(req.params.id, req.params.userId);
    return ApiResponse.success(res, null, 'Member removed successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
