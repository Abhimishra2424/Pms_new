const sequelize = require('../../config/database');
const User = require('../../models/User');

async function seed() {
  try {
    await sequelize.authenticate();
    const existing = await User.findOne({ where: { email: 'admin@pms.com' } });
    if (existing) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@pms.com',
      password: 'Admin@123',
      role: 'super_admin',
      isActive: true,
      emailVerified: new Date(),
    });
    console.log('Admin user created: admin@pms.com / Admin@123');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();