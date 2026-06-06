const Notification = require('../models/Notification');
const User = require('../models/User');

exports.notify = async ({ userId, userIds, roles, title, message, link }) => {
  try {
    let targetUserIds = [];

    // Add specific userId
    if (userId) {
      targetUserIds.push(userId.toString());
    }

    // Add array of userIds
    if (userIds && Array.isArray(userIds)) {
      targetUserIds = [...targetUserIds, ...userIds.map(id => id.toString())];
    }

    // Add users by role
    if (roles && Array.isArray(roles)) {
      const usersByRole = await User.find({ role: { $in: roles } }).select('_id');
      targetUserIds = [...targetUserIds, ...usersByRole.map(u => u._id.toString())];
    }

    // Remove duplicates
    targetUserIds = [...new Set(targetUserIds)];

    // Create notifications in bulk
    if (targetUserIds.length > 0) {
      const notifications = targetUserIds.map(id => ({
        user: id,
        title,
        message,
        link: link || ''
      }));
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error('Failed to create notifications:', err);
  }
};
