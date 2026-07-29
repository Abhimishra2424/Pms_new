const { ProjectMember, User } = require('../models');
const ApiError = require('../utils/ApiError');

const ProjectMemberService = {
  async addMember(projectId, data) {
    const user = await User.findByPk(data.userId);
    if (!user) {
      throw ApiError.badRequest('User not found');
    }

    const existing = await ProjectMember.findOne({ where: { projectId, userId: data.userId } });
    if (existing) {
      throw ApiError.badRequest('User is already a member of this project');
    }

    const member = await ProjectMember.create({
      projectId,
      userId: data.userId,
      role: data.role,
      hourlyRate: data.hourlyRate || null,
    });

    return ProjectMember.findByPk(member.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'role'] }],
    });
  },

  async removeMember(projectId, userId) {
    const member = await ProjectMember.findOne({ where: { projectId, userId } });
    if (!member) {
      throw ApiError.notFound('Member not found in this project');
    }
    await member.destroy();
    return true;
  },

  async getMembers(projectId) {
    return ProjectMember.findAll({
      where: { projectId },
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'role'] }],
      order: [['createdAt', 'ASC']],
    });
  },

  async updateMemberRole(projectId, userId, role) {
    const member = await ProjectMember.findOne({ where: { projectId, userId } });
    if (!member) {
      throw ApiError.notFound('Member not found in this project');
    }
    await member.update({ role });
    return ProjectMember.findByPk(member.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'role'] }],
    });
  },
};

module.exports = ProjectMemberService;
