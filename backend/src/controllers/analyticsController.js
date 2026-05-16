const User = require('../models/User');
const Task = require('../models/Task');
const asyncHandler = require('express-async-handler');

// @desc    Admin workspace analytics
// @route   GET /api/analytics
// @access  Private / Admin
exports.getAnalytics = asyncHandler(async (req, res) => {
  const [usersCount, tasksTotal, pending, inProgress, completed] = await Promise.all([
    User.countDocuments(),
    Task.countDocuments(),
    Task.countDocuments({ status: 'pending' }),
    Task.countDocuments({ status: 'in-progress' }),
    Task.countDocuments({ status: 'completed' }),
  ]);

  const admins = await User.countDocuments({ role: 'admin' });
  const regularUsers = await User.countDocuments({ role: 'user' });

  res.status(200).json({
    success: true,
    data: {
      users: { total: usersCount, admins, users: regularUsers },
      tasks: {
        total: tasksTotal,
        pending,
        inProgress,
        completed,
      },
    },
  });
});
