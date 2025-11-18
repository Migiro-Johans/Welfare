const { Member, AuditLog } = require('../models');
const { generateToken } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../services/emailService');
const { getClientIp, getUserAgent } = require('../utils/helpers');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    const { member_id, email, full_name, phone, password } = req.validatedData;

    // Hash password
    const password_hash = await Member.hashPassword(password);

    // Create member
    const member = await Member.create({
      member_id,
      email,
      full_name,
      phone,
      password_hash
    });

    // Log action
    await AuditLog.create({
      member_id: member.id,
      action: 'REGISTER',
      entity_type: 'member',
      entity_id: member.id,
      ip_address: getClientIp(req)
    });

    // Send welcome email (async, don't wait)
    sendWelcomeEmail(member).catch(err =>
      logger.error('Failed to send welcome email:', err)
    );

    // Generate token
    const token = generateToken(member.id);

    logger.info(`New member registered: ${member.member_id}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: member.id,
        member_id: member.member_id,
        email: member.email,
        full_name: member.full_name,
        token
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    // Find member by email or phone
    const { Op } = require('sequelize');
    const member = await Member.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { phone: email }  // 'email' field in request can contain phone number
        ]
      }
    });

    if (!member || !member.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await member.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Log action
    await AuditLog.create({
      member_id: member.id,
      action: 'LOGIN',
      entity_type: 'member',
      entity_id: member.id,
      ip_address: getClientIp(req),
      details: { user_agent: getUserAgent(req) }
    });

    // Generate token
    const token = generateToken(member.id);

    logger.info(`Member logged in: ${member.member_id}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: member.id,
        member_id: member.member_id,
        email: member.email,
        full_name: member.full_name,
        is_admin: member.is_admin,
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const member = await Member.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const member = await Member.findByPk(req.user.id);

    if (full_name) member.full_name = full_name;
    if (phone) member.phone = phone;

    await member.save();

    // Log action
    await AuditLog.create({
      member_id: member.id,
      action: 'UPDATE_PROFILE',
      entity_type: 'member',
      entity_id: member.id,
      ip_address: getClientIp(req)
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: member.id,
        member_id: member.member_id,
        email: member.email,
        full_name: member.full_name,
        phone: member.phone
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

const logout = async (req, res) => {
  try {
    // Log action
    await AuditLog.create({
      member_id: req.user.id,
      action: 'LOGOUT',
      entity_type: 'member',
      entity_id: req.user.id,
      ip_address: getClientIp(req)
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  logout
};
