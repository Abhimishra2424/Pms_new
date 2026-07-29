require('dotenv').config();
const { sequelize, syncDB } = require('./models');

const initDB = async () => {
  await sequelize.authenticate();
  console.log('Database connected');
  await syncDB();
};

module.exports = { initDB };
