const bcrypt = require('bcryptjs');
const { User } = require('../models');

const createUser = async ({ name, email, password }) => {
  const hash = await bcrypt.hash(password, 10);
  return await User.create({ name, email, password: hash });
};

const findUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

const findUserById = async (id) => {
  return await User.findByPk(id, { attributes: { exclude: ['password'] } });
};

module.exports = { createUser, findUserByEmail, findUserById };
