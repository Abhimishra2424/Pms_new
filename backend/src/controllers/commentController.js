const CommentService = require('../services/commentService');
const ApiResponse = require('../utils/ApiResponse');

const commentController = {
  async getByTask(req, res, next) {
    try {
      const comments = await CommentService.getByTask(req.params.taskId);
      return ApiResponse.success(res, { comments }, 'Comments fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const comment = await CommentService.create(
        { ...req.body, taskId: req.params.taskId },
        req.user.id
      );
      return ApiResponse.success(res, { comment }, 'Comment created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const comment = await CommentService.update(req.params.id, req.body, req.user.id);
      return ApiResponse.success(res, { comment }, 'Comment updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await CommentService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Comment deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = commentController;
