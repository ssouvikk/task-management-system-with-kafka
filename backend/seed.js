// backend/seed.js
const { AppDataSource } = require('./src/config/db');
const { User } = require('./src/models/user.entity');
const bcrypt = require('bcryptjs');

// we should always use generated hashed password here instead of generating here (for now m generating here)
const appAdminUser = { email: "admin@user.com", password: "P@$$w0rd" }

async function seedDatabase() {
    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);

    // চেক করুন admin user ইতিমধ্যে আছে কিনা
    const adminExists = await userRepository.findOne({ where: { email: appAdminUser.email } });

    if (!adminExists) {
        // we should always use generated hashed password here instead of generating here (for now m generating here)
        const hashedPassword = await bcrypt.hash(appAdminUser.password, 10);
        const adminUser = userRepository.create({
            username: 'admin',
            email: appAdminUser.email,
            password: hashedPassword,
            role: 'admin'
        });

        await userRepository.save(adminUser);
        console.log('✅ Admin user created successfully');
    } else {
        console.log('ℹ️ Admin user already exists');
    }

    process.exit(0);
}

seedDatabase().catch((err) => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
});
