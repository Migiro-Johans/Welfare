const { Vote, Member, PollSettings, AuditLog } = require('../models');
const { getResults } = require('../services/voteService');
const { sendBulkNotification } = require('../services/emailService');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const logger = require('../utils/logger');

const getAllVotes = async (req, res) => {
  try {
    const { vote_option, start_date, end_date, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const where = {};
    if (vote_option) where.vote_option = vote_option;
    if (start_date && end_date) {
      where.voted_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const memberWhere = {};
    if (search) {
      memberWhere[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { member_id: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Vote.findAndCountAll({
      where,
      include: [{
        model: Member,
        as: 'member',
        attributes: ['id', 'member_id', 'full_name', 'email', 'phone'],
        where: memberWhere
      }],
      order: [['voted_at', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: {
        votes: rows,
        pagination: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
          limit
        }
      }
    });
  } catch (error) {
    logger.error('Get all votes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get votes'
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const results = await getResults();

    // Get voting trend (votes per day)
    const votingTrend = await Vote.findAll({
      attributes: [
        [Vote.sequelize.fn('DATE', Vote.sequelize.col('voted_at')), 'date'],
        [Vote.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: [Vote.sequelize.fn('DATE', Vote.sequelize.col('voted_at'))],
      order: [[Vote.sequelize.fn('DATE', Vote.sequelize.col('voted_at')), 'ASC']],
      raw: true
    });

    // Get members who haven't voted - using subquery to avoid GROUP BY issues
    const nonVoters = await Member.findAll({
      where: {
        is_active: true,
        id: {
          [Op.notIn]: Vote.sequelize.literal('(SELECT DISTINCT member_id FROM votes)')
        }
      },
      attributes: ['id', 'member_id', 'full_name', 'email'],
      limit: 100
    });

    res.json({
      success: true,
      data: {
        ...results,
        voting_trend: votingTrend,
        non_voters: {
          count: nonVoters.length,
          members: nonVoters
        }
      }
    });
  } catch (error) {
    logger.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics'
    });
  }
};

const updatePollStatus = async (req, res) => {
  try {
    const { is_open } = req.body;

    let pollSettings = await PollSettings.findOne();

    if (!pollSettings) {
      pollSettings = await PollSettings.create({ is_open });
    } else {
      pollSettings.is_open = is_open;
      await pollSettings.save();
    }

    // Log action
    await AuditLog.create({
      member_id: req.user.id,
      action: 'UPDATE_POLL_STATUS',
      entity_type: 'poll_settings',
      entity_id: pollSettings.id,
      details: { is_open }
    });

    logger.info(`Poll status updated to ${is_open ? 'open' : 'closed'} by admin ${req.user.member_id}`);

    res.json({
      success: true,
      message: `Poll ${is_open ? 'opened' : 'closed'} successfully`,
      data: pollSettings
    });
  } catch (error) {
    logger.error('Update poll status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update poll status'
    });
  }
};

const updatePollSettings = async (req, res) => {
  try {
    const updates = req.validatedData;

    let pollSettings = await PollSettings.findOne();

    if (!pollSettings) {
      pollSettings = await PollSettings.create(updates);
    } else {
      await pollSettings.update(updates);
    }

    // Log action
    await AuditLog.create({
      member_id: req.user.id,
      action: 'UPDATE_POLL_SETTINGS',
      entity_type: 'poll_settings',
      entity_id: pollSettings.id,
      details: updates
    });

    res.json({
      success: true,
      message: 'Poll settings updated successfully',
      data: pollSettings
    });
  } catch (error) {
    logger.error('Update poll settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update poll settings'
    });
  }
};

const exportVotes = async (req, res) => {
  try {
    const votes = await Vote.findAll({
      include: [{
        model: Member,
        as: 'member',
        attributes: ['member_id', 'full_name', 'email', 'phone']
      }],
      order: [['voted_at', 'DESC']]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Votes');

    worksheet.columns = [
      { header: 'Vote ID', key: 'id', width: 10 },
      { header: 'Member ID', key: 'member_id', width: 15 },
      { header: 'Full Name', key: 'full_name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Vote Option', key: 'vote_option', width: 15 },
      { header: 'Voted At', key: 'voted_at', width: 20 },
      { header: 'Updated At', key: 'updated_at', width: 20 }
    ];

    votes.forEach(vote => {
      worksheet.addRow({
        id: vote.id,
        member_id: vote.member.member_id,
        full_name: vote.member.full_name,
        email: vote.member.email,
        phone: vote.member.phone,
        vote_option: `Option ${vote.vote_option}`,
        voted_at: vote.voted_at,
        updated_at: vote.updated_at || 'N/A'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=votes-export.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    logger.error('Export votes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export votes'
    });
  }
};

const sendNotifications = async (req, res) => {
  try {
    const { recipient_type, subject, message } = req.body;

    let members = [];

    if (recipient_type === 'all') {
      members = await Member.findAll({
        where: { is_active: true },
        attributes: ['id', 'email', 'full_name']
      });
    } else if (recipient_type === 'non_voters') {
      members = await Member.findAll({
        where: { is_active: true },
        include: [{
          model: Vote,
          as: 'vote',
          required: false
        }],
        having: Vote.sequelize.where(
          Vote.sequelize.fn('COUNT', Vote.sequelize.col('vote.id')),
          0
        ),
        group: ['Member.id'],
        attributes: ['id', 'email', 'full_name']
      });
    }

    await sendBulkNotification(members, subject, message);

    // Log action
    await AuditLog.create({
      member_id: req.user.id,
      action: 'SEND_BULK_NOTIFICATION',
      entity_type: 'notification',
      details: {
        recipient_type,
        recipients_count: members.length,
        subject
      }
    });

    res.json({
      success: true,
      message: `Notifications sent to ${members.length} members`
    });
  } catch (error) {
    logger.error('Send notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notifications'
    });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows } = await AuditLog.findAndCountAll({
      include: [{
        model: Member,
        as: 'member',
        attributes: ['member_id', 'full_name', 'email']
      }],
      order: [['timestamp', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: {
        logs: rows,
        pagination: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
          limit
        }
      }
    });
  } catch (error) {
    logger.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs'
    });
  }
};

const getAllMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows } = await Member.findAndCountAll({
      attributes: { exclude: ['password_hash'] },
      include: [{
        model: Vote,
        as: 'vote',
        required: false,
        attributes: ['id', 'vote_option', 'voted_at']
      }],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: {
        members: rows,
        pagination: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
          limit
        }
      }
    });
  } catch (error) {
    logger.error('Get all members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get members'
    });
  }
};

const resetVotes = async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const transaction = await sequelize.transaction();

    try {
      // Count votes before deletion
      const voteCount = await Vote.count();

      // Delete all votes
      await Vote.destroy({
        where: {},
        truncate: true,
        transaction
      });

      // Log action
      await AuditLog.create({
        member_id: req.user.id,
        action: 'RESET_VOTES',
        entity_type: 'votes',
        details: {
          deleted_count: voteCount,
          reset_by: req.user.email
        }
      }, { transaction });

      await transaction.commit();

      logger.warn(`All votes reset by admin ${req.user.email}. ${voteCount} votes deleted.`);

      res.json({
        success: true,
        message: `Successfully reset all votes. ${voteCount} votes were deleted.`,
        data: {
          deleted_count: voteCount
        }
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('Reset votes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset votes'
    });
  }
};

module.exports = {
  getAllVotes,
  getAnalytics,
  updatePollStatus,
  updatePollSettings,
  exportVotes,
  sendNotifications,
  getAuditLogs,
  getAllMembers,
  resetVotes
};
