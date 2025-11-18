const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const Vote = sequelize.define('Vote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'members',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  vote_option: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[1, 2]]
    }
  },
  voted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vote_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  previous_vote: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isIn: [[1, 2]]
    }
  }
}, {
  tableName: 'votes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['member_id']
    },
    {
      fields: ['vote_option']
    },
    {
      fields: ['voted_at']
    }
  ]
});

// Static method to generate vote hash
Vote.generateVoteHash = function(memberId, voteOption, timestamp) {
  const data = `${memberId}-${voteOption}-${timestamp}-${process.env.VOTE_SECRET}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = Vote;
