require('dotenv').config();
const { adminGenerateTemporaryPassword } = require('./src/controllers/passwordResetController');
const { sequelize } = require('./src/config/database');

// Mock Request and Response
const req = {
    body: {
        member_id: 1 // Assuming ID 1 exists
    },
    user: {
        id: 1, // Admin ID
        email: 'admin@welfarepoll.com',
        member_id: 'ADMIN001'
    }
};

const res = {
    status: function (code) {
        this.statusCode = code;
        return this;
    },
    json: function (data) {
        console.log('Response Status:', this.statusCode || 200);
        console.log('Response Data:', JSON.stringify(data, null, 2));
        return this;
    }
};

const runTest = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        await adminGenerateTemporaryPassword(req, res);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await sequelize.close();
    }
};

runTest();
