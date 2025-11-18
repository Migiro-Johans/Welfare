const { Member, AuditLog } = require('../models');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Generate a secure reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Request password reset (user-initiated)
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required'
      });
    }

    // Find member by email or phone
    const { Op } = require('sequelize');
    const member = await Member.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { phone: email }
        ],
        is_active: true
      }
    });

    // Always return success message (security best practice - don't reveal if account exists)
    if (!member) {
      return res.json({
        success: true,
        message: 'If an account with that email/phone exists, a password reset token has been generated. Please contact an administrator with your member ID to complete the reset.'
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save token to database
    member.reset_token = resetToken;
    member.reset_token_expires = tokenExpires;
    await member.save();

    logger.info(`Password reset requested for member: ${member.email}`);

    // In a production app, you would send an email here with the reset link
    // For now, we'll provide the token in the response for admin verification
    res.json({
      success: true,
      message: 'Password reset requested successfully. Please contact an administrator with your member ID to complete the reset.',
      data: {
        member_id: member.member_id,
        reset_token: resetToken,
        expires_at: tokenExpires
      }
    });
  } catch (error) {
    logger.error('Request password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request password reset'
    });
  }
};

// Reset password with token (user-initiated)
const resetPasswordWithToken = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required'
      });
    }

    // Validate password strength
    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find member with valid token
    const member = await Member.findOne({
      where: {
        reset_token: token,
        reset_token_expires: {
          [require('sequelize').Op.gt]: new Date()
        },
        is_active: true
      }
    });

    if (!member) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await Member.hashPassword(new_password);

    // Update password and clear reset token
    member.password_hash = hashedPassword;
    member.reset_token = null;
    member.reset_token_expires = null;
    await member.save();

    logger.info(`Password reset completed for member: ${member.email}`);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

// Admin: Reset member password
const adminResetPassword = async (req, res) => {
  try {
    const { member_id, new_password } = req.body;

    if (!member_id || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Member ID and new password are required'
      });
    }

    // Validate password strength
    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find the member
    const member = await Member.findOne({
      where: {
        id: member_id,
        is_active: true
      }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Hash new password
    const hashedPassword = await Member.hashPassword(new_password);

    // Update password
    member.password_hash = hashedPassword;
    member.password_reset_by = req.user.id;
    member.reset_token = null;
    member.reset_token_expires = null;
    await member.save();

    // Create audit log
    await AuditLog.create({
      member_id: req.user.id,
      action: 'ADMIN_RESET_PASSWORD',
      entity_type: 'member',
      entity_id: member.id,
      details: {
        target_member_id: member.member_id,
        target_member_email: member.email,
        reset_by: req.user.email
      }
    });

    logger.warn(`Password reset by admin ${req.user.email} for member: ${member.email}`);

    res.json({
      success: true,
      message: `Password reset successfully for ${member.full_name}`,
      data: {
        member_id: member.member_id,
        email: member.email,
        full_name: member.full_name
      }
    });
  } catch (error) {
    logger.error('Admin reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

// Admin: Generate temporary password
const adminGenerateTemporaryPassword = async (req, res) => {
  try {
    const { member_id } = req.body;

    if (!member_id) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required'
      });
    }

    // Find the member
    const member = await Member.findOne({
      where: {
        id: member_id,
        is_active: true
      }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Generate temporary password (8 characters)
    const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Hash temporary password
    const hashedPassword = await Member.hashPassword(tempPassword);

    // Update password
    member.password_hash = hashedPassword;
    member.password_reset_by = req.user.id;
    member.reset_token = null;
    member.reset_token_expires = null;
    await member.save();

    // Create audit log
    await AuditLog.create({
      member_id: req.user.id,
      action: 'ADMIN_GENERATE_TEMP_PASSWORD',
      entity_type: 'member',
      entity_id: member.id,
      details: {
        target_member_id: member.member_id,
        target_member_email: member.email,
        reset_by: req.user.email
      }
    });

    logger.warn(`Temporary password generated by admin ${req.user.email} for member: ${member.email}`);

    res.json({
      success: true,
      message: `Temporary password generated successfully for ${member.full_name}`,
      data: {
        member_id: member.member_id,
        email: member.email,
        full_name: member.full_name,
        temporary_password: tempPassword
      }
    });
  } catch (error) {
    logger.error('Admin generate temporary password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate temporary password'
    });
  }
};

module.exports = {
  requestPasswordReset,
  resetPasswordWithToken,
  adminResetPassword,
  adminGenerateTemporaryPassword
};
