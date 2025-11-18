const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready');
  } catch (error) {
    console.error('Email service error:', error);
  }
};

module.exports = { transporter, verifyEmailConfig };
