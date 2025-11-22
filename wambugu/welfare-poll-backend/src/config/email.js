const nodemailer = require('nodemailer');
require('dotenv').config();

// Check if email is enabled
const isEmailEnabled = process.env.EMAIL_ENABLED !== 'false' &&
                       process.env.SMTP_USER !== 'disabled';

// Create transporter only if email is enabled, otherwise use ethereal test account
let transporter;

if (isEmailEnabled) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  // Use a mock transporter that doesn't actually send emails
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('📧 Email disabled - would have sent:', {
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      return { messageId: 'disabled' };
    }
  };
}

const verifyEmailConfig = async () => {
  try {
    if (!isEmailEnabled) {
      console.log('⚠️  Email service is DISABLED (development mode)');
      console.log('   To enable emails, configure SMTP settings in .env');
      return;
    }

    await transporter.verify();
    console.log('✅ Email service is ready');
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    console.log('   App will continue without email functionality');
  }
};

module.exports = { transporter, verifyEmailConfig };
