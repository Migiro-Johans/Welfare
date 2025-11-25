const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PollSettings = sequelize.define('PollSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  is_open: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  minimum_votes_option2: {
    type: DataTypes.INTEGER,
    defaultValue: 150
  },
  poll_title: {
    type: DataTypes.STRING(500),
    defaultValue: 'WELFARE MEMBERS POLL'
  },
  poll_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_expected_members: {
    type: DataTypes.INTEGER,
    defaultValue: 300,
    allowNull: false
  }
}, {
  tableName: 'poll_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PollSettings;
