const ActivityLog = require('../models/ActivityLog');

const log = async ({ user, action, entityType, entityId, description }) => {
  try {
    await ActivityLog.create({
      user: user?._id || user,
      userName: user?.name || 'System',
      action,
      entityType,
      entityId,
      description,
    });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

module.exports = { log };
