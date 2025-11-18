const { Vote, Member, PollSettings } = require('../models');
const { sequelize } = require('../config/database');
const { calculatePercentage } = require('../utils/helpers');
const logger = require('../utils/logger');

const submitVote = async (memberId, voteOption, ipAddress, userAgent) => {
  const transaction = await sequelize.transaction();

  try {
    // Check if poll is open
    const pollSettings = await PollSettings.findOne();
    if (!pollSettings || !pollSettings.is_open) {
      throw new Error('Poll is currently closed');
    }

    // Check if end date has passed
    if (pollSettings.end_date && new Date() > new Date(pollSettings.end_date)) {
      throw new Error('Poll has ended');
    }

    // Check if existing vote
    const existingVote = await Vote.findOne({
      where: { member_id: memberId }
    });

    // Prevent vote changes - once voted, cannot vote again
    if (existingVote) {
      throw new Error('You have already cast your vote and cannot change it');
    }

    const timestamp = new Date();
    const voteHash = Vote.generateVoteHash(memberId, voteOption, timestamp);

    // Create new vote
    const vote = await Vote.create({
      member_id: memberId,
      vote_option: voteOption,
      voted_at: timestamp,
      ip_address: ipAddress,
      user_agent: userAgent,
      vote_hash: voteHash
    }, { transaction });

    logger.info(`New vote submitted by member ${memberId}: Option ${voteOption}`);

    await transaction.commit();
    return vote;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getResults = async () => {
  try {
    const [totalMembers, totalVotes, option1Votes, option2Votes, pollSettings] = await Promise.all([
      Member.count({ where: { is_active: true } }),
      Vote.count(),
      Vote.count({ where: { vote_option: 1 } }),
      Vote.count({ where: { vote_option: 2 } }),
      PollSettings.findOne()
    ]);

    const participationRate = calculatePercentage(totalVotes, totalMembers);
    const option1Percentage = calculatePercentage(option1Votes, totalVotes);
    const option2Percentage = calculatePercentage(option2Votes, totalVotes);

    const minimumVotesRequired = pollSettings?.minimum_votes_option2 || 150;
    const threshold_met = option2Votes >= minimumVotesRequired;

    return {
      total_members: totalMembers,
      total_votes: totalVotes,
      participation_rate: participationRate,
      results: {
        option1: {
          count: option1Votes,
          percentage: option1Percentage
        },
        option2: {
          count: option2Votes,
          percentage: option2Percentage,
          threshold_met,
          required_votes: minimumVotesRequired
        }
      },
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error getting results:', error);
    throw error;
  }
};

const getMemberVote = async (memberId) => {
  try {
    const vote = await Vote.findOne({
      where: { member_id: memberId },
      attributes: ['id', 'vote_option', 'voted_at', 'updated_at']
    });
    return vote;
  } catch (error) {
    logger.error('Error getting member vote:', error);
    throw error;
  }
};

const deleteVote = async (voteId) => {
  try {
    const vote = await Vote.findByPk(voteId);
    if (!vote) {
      throw new Error('Vote not found');
    }
    await vote.destroy();
    logger.info(`Vote ${voteId} deleted`);
    return true;
  } catch (error) {
    logger.error('Error deleting vote:', error);
    throw error;
  }
};

module.exports = {
  submitVote,
  getResults,
  getMemberVote,
  deleteVote
};
