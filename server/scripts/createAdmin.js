import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { config } from '../src/config/env.js';
import { logger } from '../src/utils/logger.js';

const createAdmin = async () => {
  try {
    await connectDB();
    const email = process.env.ADMIN_EMAIL || config.admin.email;
    const password = process.env.ADMIN_PASSWORD || config.admin.password;
    const name = process.env.ADMIN_NAME || config.admin.name;

    let admin = await User.findOne({ email });
    if (admin) {
      admin.role = 'admin';
      admin.password = password;
      await admin.save();
      logger.info(`Existing user ${email} upgraded to admin role.`);
    } else {
      admin = await User.create({
        name,
        email,
        password,
        role: 'admin'
      });
      logger.info(`Admin user created: ${email}`);
    }
  } catch (err) {
    logger.error('Error creating admin user:', err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

createAdmin();
