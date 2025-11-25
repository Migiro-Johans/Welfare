const { submitVote, getResults, getMemberVote } = require('../services/voteService');
const { sendVoteConfirmation } = require('../services/emailService');
const { AuditLog, Member } = require('../models');
const { getClientIp, getUserAgent } = require('../utils/helpers');
const logger = require('../utils/logger');

const vote = async (req, res) => {
  try {
    const { vote_option } = req.validatedData;
    const memberId = req.user.id;
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    const voteRecord = await submitVote(memberId, vote_option, ipAddress, userAgent);

    // Log action
    await AuditLog.create({
      member_id: memberId,
      action: 'VOTE',
      entity_type: 'vote',
      entity_id: voteRecord.id,
      ip_address: ipAddress,
      details: {
        vote_option,
        previous_vote: voteRecord.previous_vote
      }
    });

    // Send confirmation email (async)
    const member = await Member.findByPk(memberId);
    sendVoteConfirmation(member, vote_option).catch(err =>
      logger.error('Failed to send vote confirmation:', err)
    );

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      const results = await getResults();
      req.app.get('io').emit('voteResults', results);
    }

    res.status(201).json({
      success: true,
      message: 'Vote submitted successfully',
      data: {
        vote_id: voteRecord.id,
        vote_option: voteRecord.vote_option,
        voted_at: voteRecord.voted_at
      }
    });
  } catch (error) {
    logger.error('Vote submission error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit vote'
    });
  }
};

const results = async (req, res) => {
  try {
    const resultsData = await getResults();

    res.json({
      success: true,
      data: resultsData
    });
  } catch (error) {
    logger.error('Get results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get results'
    });
  }
};

const myVote = async (req, res) => {
  try {
    const vote = await getMemberVote(req.user.id);

    if (!vote) {
      return res.json({
        success: true,
        data: null,
        message: 'No vote found'
      });
    }

    res.json({
      success: true,
      data: vote
    });
  } catch (error) {
    logger.error('Get my vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vote'
    });
  }
};

module.exports = {
  vote,
  results,
  myVote
};
