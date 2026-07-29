const sequelize = require('../config/database');
const logger = require('../utils/logger');
const env = require('../config/env');

const runMigrations = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    const alter = env.NODE_ENV === 'development';

    await sequelize.sync({ alter });
    logger.info('All models were synchronized successfully.');
    logger.info(`Migration mode: ${alter ? 'alter' : 'force'}`);

    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

runMigrations();
