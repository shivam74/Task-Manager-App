const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const forbiddenLastAdmin = (res) =>
  res.status(400).json({
    success: false,
    error: 'Cannot remove the last admin — promote another admin first',
  });

// @desc    Get all users
// @route   GET /api/users
// @access  Private / Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Create user (admin)
// @route   POST /api/users
// @access  Private / Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide name, email, and password' });
  }

  const safeRole = role === 'admin' ? 'admin' : 'user';

  const user = await User.create({
    name,
    email,
    password,
    role: safeRole,
  });

  const out = await User.findById(user._id).select('-password');

  res.status(201).json({
    success: true,
    data: out,
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private / Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user (admin)
// @route   PUT /api/users/:id
// @access  Private / Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('+password');

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const { name, email, password, role } = req.body;

  if (role !== undefined) {
    const nextRole = role === 'admin' ? 'admin' : 'user';
    if (user.role === 'admin' && nextRole === 'user') {
      const admins = await User.countDocuments({ role: 'admin' });
      if (admins <= 1) {
        return forbiddenLastAdmin(res);
      }
    }
    user.role = nextRole;
  }

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (password !== undefined && password.length > 0) {
    user.password = password;
  }

  await user.save();

  const out = await User.findById(user._id).select('-password');

  res.status(200).json({
    success: true,
    data: out,
  });
});

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
// @access  Private / Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  if (user._id.toString() === req.user.id.toString()) {
    return res.status(400).json({ success: false, error: 'You cannot delete your own account from this panel' });
  }

  if (user.role === 'admin') {
    const admins = await User.countDocuments({ role: 'admin' });
    if (admins <= 1) {
      return forbiddenLastAdmin(res);
    }
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
