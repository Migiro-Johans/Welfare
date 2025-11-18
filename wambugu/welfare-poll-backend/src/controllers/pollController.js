const { PollSettings, Member, Vote } = require('../models');
const { calculatePercentage } = require('../utils/helpers');
const logger = require('../utils/logger');

const getPollSettings = async (req, res) => {
  try {
    let pollSettings = await PollSettings.findOne();

    if (!pollSettings) {
      pollSettings = await PollSettings.create({
        is_open: true,
        poll_title: 'WELFARE MEMBERS POLL',
        minimum_votes_option2: 150
      });
    }

    res.json({
      success: true,
      data: pollSettings
    });
  } catch (error) {
    logger.error('Get poll settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get poll settings'
    });
  }
};

const getPollStatus = async (req, res) => {
  try {
    const pollSettings = await PollSettings.findOne();

    if (!pollSettings) {
      return res.json({
        success: true,
        data: {
          is_open: true,
          message: 'Poll is open'
        }
      });
    }

    let isOpen = pollSettings.is_open;
    let message = 'Poll is open';

    // Check if end date has passed
    if (pollSettings.end_date && new Date() > new Date(pollSettings.end_date)) {
      isOpen = false;
      message = 'Poll has ended';
    }

    // Check if start date hasn't arrived
    if (pollSettings.start_date && new Date() < new Date(pollSettings.start_date)) {
      isOpen = false;
      message = 'Poll has not started yet';
    }

    res.json({
      success: true,
      data: {
        is_open: isOpen,
        message,
        start_date: pollSettings.start_date,
        end_date: pollSettings.end_date
      }
    });
  } catch (error) {
    logger.error('Get poll status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get poll status'
    });
  }
};

const getPollStatistics = async (req, res) => {
  try {
    const [totalMembers, totalVotes, votedToday] = await Promise.all([
      Member.count({ where: { is_active: true } }),
      Vote.count(),
      Vote.count({
        where: {
          voted_at: {
            [require('sequelize').Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    const participationRate = calculatePercentage(totalVotes, totalMembers);
    const remainingVotes = totalMembers - totalVotes;

    res.json({
      success: true,
      data: {
        total_members: totalMembers,
        total_votes: totalVotes,
        votes_today: votedToday,
        remaining_votes: remainingVotes,
        participation_rate: participationRate
      }
    });
  } catch (error) {
    logger.error('Get poll statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get poll statistics'
    });
  }
};

module.exports = {
  getPollSettings,
  getPollStatus,
  getPollStatistics
};
