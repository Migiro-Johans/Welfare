const Member = require('./Member');
const Vote = require('./Vote');
const PollSettings = require('./PollSettings');
const AuditLog = require('./AuditLog');
const Notification = require('./Notification');

// Define associations
Member.hasOne(Vote, { foreignKey: 'member_id', as: 'vote' });
Vote.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

Member.hasMany(AuditLog, { foreignKey: 'member_id', as: 'auditLogs' });
AuditLog.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

Member.hasMany(Notification, { foreignKey: 'member_id', as: 'notifications' });
Notification.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

module.exports = {
  Member,
  Vote,
  PollSettings,
  AuditLog,
  Notification
};
