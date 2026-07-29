require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/sockets');
const { initCron } = require('./src/cron');
const { sequelize } = require('./src/models');
const { setIO } = require('./src/services/notificationService');
const logger = require('./src/utils/logger');
const env = require('./src/config/env');

const server = http.createServer(app);
const io = initSocket(server);
setIO(io);

const PORT = env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    logger.info('Database connected successfully');
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
      initCron();
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to database:', err);
    process.exit(1);
  });

module.exports = { server, io };
