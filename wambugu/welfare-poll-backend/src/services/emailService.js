const { transporter } = require('../config/email');
const logger = require('../utils/logger');

const sendVoteConfirmation = async (member, voteOption) => {
  try {
    const optionDetails = voteOption === 1
      ? 'Option 1: Micro-Insurance Cover (Britam)'
      : 'Option 2: Internal Welfare Contribution Scheme';

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: member.email,
      subject: 'Vote Confirmation - Welfare Members Poll',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .vote-box { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Vote Confirmation</h2>
            </div>
            <div class="content">
              <p>Dear <strong>${member.full_name}</strong>,</p>
              <p>Thank you for participating in the Welfare Members Poll.</p>
              <div class="vote-box">
                <strong>Your vote:</strong> ${optionDetails}
              </div>
              <p>You can change your vote anytime before the poll closes by logging into the voting portal.</p>
              <p>Your participation is valuable in helping us make the best decision for all members.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br><strong>Welfare Committee</strong></p>
              <p style="font-size: 10px;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Vote confirmation email sent to ${member.email}`);
    return true;
  } catch (error) {
    logger.error('Email sending error:', error);
    return false;
  }
};

const sendWelcomeEmail = async (member) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: member.email,
      subject: 'Welcome to Welfare Members Poll',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Welcome!</h2>
            </div>
            <div class="content">
              <p>Dear <strong>${member.full_name}</strong>,</p>
              <p>Your account has been successfully created!</p>
              <p><strong>Member ID:</strong> ${member.member_id}</p>
              <p>You can now log in and cast your vote in the Welfare Members Poll.</p>
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Vote</a>
              </p>
            </div>
            <div class="footer">
              <p>Best regards,<br><strong>Welfare Committee</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${member.email}`);
    return true;
  } catch (error) {
    logger.error('Email sending error:', error);
    return false;
  }
};

const sendBulkNotification = async (members, subject, message) => {
  try {
    const promises = members.map(member => {
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: member.email,
        subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .content { padding: 20px; background: #f9f9f9; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <p>Dear <strong>${member.full_name}</strong>,</p>
                ${message}
              </div>
            </div>
          </body>
          </html>
        `
      };
      return transporter.sendMail(mailOptions);
    });

    await Promise.all(promises);
    logger.info(`Bulk notification sent to ${members.length} members`);
    return true;
  } catch (error) {
    logger.error('Bulk email sending error:', error);
    return false;
  }
};

module.exports = {
  sendVoteConfirmation,
  sendWelcomeEmail,
  sendBulkNotification
};
