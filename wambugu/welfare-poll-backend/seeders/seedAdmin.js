require('dotenv').config();
const { sequelize } = require('../src/config/database');
const Member = require('../src/models/Member');
const { Op } = require('sequelize');

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.error('ADMIN_EMAIL or ADMIN_INITIAL_PASSWORD not set in .env');
            process.exit(1);
        }

        // Find existing admin by email OR member_id
        let admin = await Member.findOne({
            where: {
                [Op.or]: [
                    { email: adminEmail },
                    { member_id: 'ADMIN001' }
                ]
            }
        });

        const passwordHash = await Member.hashPassword(adminPassword);

        if (admin) {
            console.log('Admin user found. Updating password...');
            admin.password_hash = passwordHash;
            admin.email = adminEmail; // Ensure email matches
            admin.is_admin = true;    // Ensure is_admin is true
            await admin.save();
            console.log('Admin password updated.');
        } else {
            console.log('Creating new admin user...');
            await Member.create({
                member_id: 'ADMIN001',
                email: adminEmail,
                full_name: 'System Admin',
                phone: '0000000000',
                password_hash: passwordHash,
                is_admin: true,
                is_active: true,
                email_verified: true
            });
            console.log('Admin user created.');
        }

        console.log('----------------------------------------');
        console.log('Login Credentials:');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('----------------------------------------');

    } catch (error) {
        console.error('Failed to seed admin:', error);
    } finally {
        await sequelize.close();
    }
};

seedAdmin();
