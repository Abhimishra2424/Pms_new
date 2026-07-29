const { User } = require('../models');

class AuthRepository {
  async findByEmail(email) {
    return User.findOne({
      where: { email },
      include: [
        { association: 'company' },
        { association: 'department' },
        { association: 'designation' },
      ],
    });
  }

  async findById(id) {
    return User.findByPk(id, {
      include: [
        { association: 'company' },
        { association: 'department' },
        { association: 'designation' },
      ],
    });
  }

  async createUser(data) {
    return User.create(data);
  }

  async updateUser(id, data) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.update(data);
  }

  async updateLastLogin(userId) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    user.lastLogin = new Date();
    return user.save();
  }
}

module.exports = new AuthRepository();
