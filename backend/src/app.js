require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const env = require('./config/env');
const sequelize = require('./config/database');

const app = express();

const corsOptions = {
  origin: env.FRONTEND_URL.split(',').map((url) => url.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
};

app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use(generalLimiter);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
    });
  });
  next();
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PMS API is running',
    data: {
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

const routePrefix = '/api';
const mountRoute = (path, modulePath) => {
  try {
    const route = require(modulePath);
    app.use(`${routePrefix}${path}`, route);
    logger.info(`Mounted route: ${routePrefix}${path}`);
  } catch (error) {
    logger.warn(`Route not mounted: ${routePrefix}${path} - ${error.message}`);
  }
};

mountRoute('/auth', './routes/auth');
mountRoute('/company', './routes/company');
mountRoute('/departments', './routes/departments');
mountRoute('/designations', './routes/designations');
mountRoute('/employees', './routes/employees');
mountRoute('/projects', './routes/projects');
mountRoute('/milestones', './routes/milestones');
mountRoute('/sprints', './routes/sprints');
mountRoute('/epics', './routes/epics');
mountRoute('/tasks', './routes/tasks');
mountRoute('/bugs', './routes/bugs');
mountRoute('/time-tracking', './routes/timeTracking');
mountRoute('/attendance', './routes/attendance');
mountRoute('/leaves', './routes/leaves');
mountRoute('/holidays', './routes/holidays');
mountRoute('/meetings', './routes/meetings');
mountRoute('/clients', './routes/clients');
mountRoute('/invoices', './routes/invoices');
mountRoute('/expenses', './routes/expenses');
mountRoute('/documents', './routes/documents');
mountRoute('/knowledge-base', './routes/knowledgeBase');
mountRoute('/wiki', './routes/wiki');
mountRoute('/announcements', './routes/announcements');
mountRoute('/notifications', './routes/notifications');
mountRoute('/chat', './routes/chat');
mountRoute('/reports', './routes/reports');
mountRoute('/search', './routes/search');
mountRoute('/activity-logs', './routes/activityLogs');
mountRoute('/import', './routes/import');
mountRoute('/export', './routes/export');
mountRoute('/settings', './routes/settings');

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      logger.info('Database connected');
      if (env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
        logger.info('Database synced (alter)');
      }
      const server = app.listen(env.PORT, () => {
        logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
      });
      const { initSocket } = require('./sockets');
      initSocket(server);
      const { initCron } = require('./cron');
      initCron();
    } catch (err) {
      logger.error('Startup failed:', err);
      process.exit(1);
    }
  })();
}

module.exports = app;
