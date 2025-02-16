// migration/1623456789012-CreateAdminUser.js
const bcrypt = require('bcryptjs');
const adminUser = { email: "admin@user.com", password: "P@$$w0rd" }
module.exports = class CreateAdminUser {
    async up(queryRunner) {

        // we should always use generated hashed password here instead of generating here (for now m generating here)
        const hashedPassword = await bcrypt.hash(adminUser.password, 10);

        await queryRunner.query(`
        INSERT INTO "user" (username, email, password, role)
        VALUES ('admin', '${adminUser.email}', '${hashedPassword}', 'admin')
        ON CONFLICT (email) DO NOTHING;
      `);
    }

    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM "user" WHERE email = '${adminUser.email}'`);
    }
}
