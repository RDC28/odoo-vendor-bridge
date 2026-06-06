const ActivityLog = require('../models/ActivityLog');

exports.getActivityLogs = async (req, res) => {
  try {
    const { entityType, limit } = req.query;
    const query = {};
    if (entityType) query.entityType = entityType;
    const logs = await ActivityLog.find(query)
      .populate('user', 'name role')
      .sort('-createdAt')
      .limit(parseInt(limit) || 50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
