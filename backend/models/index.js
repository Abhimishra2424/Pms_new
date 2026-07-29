require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'pms',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  }
);

const User = require('./User')(sequelize);
const Project = require('./Project')(sequelize);
const ProjectMember = require('./ProjectMember')(sequelize);
const Task = require('./Task')(sequelize);
const TaskComment = require('./TaskComment')(sequelize);

User.hasMany(Project, { foreignKey: 'owner_id', as: 'ownedProjects' });
Project.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'user_id', otherKey: 'project_id', as: 'memberProjects' });
Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'project_id', otherKey: 'user_id', as: 'members' });
Project.hasMany(ProjectMember, { foreignKey: 'project_id', as: 'memberRecords' });
ProjectMember.belongsTo(User, { foreignKey: 'user_id' });
ProjectMember.belongsTo(Project, { foreignKey: 'project_id' });

Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

Task.belongsTo(User, { foreignKey: 'assignee_id', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Task.hasMany(TaskComment, { foreignKey: 'task_id', as: 'comments' });
TaskComment.belongsTo(Task, { foreignKey: 'task_id' });
TaskComment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

const syncDB = async () => {
  await sequelize.sync({ alter: true });
  console.log('Database synced');
};

module.exports = { sequelize, User, Project, ProjectMember, Task, TaskComment, syncDB };
