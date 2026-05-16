const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeythatshouldbechangedinproduction';

/**
 * Verifies Bearer JWT, loads user from DB, attaches Mongoose user to req.user.
 * JWT payload must include userId (or legacy id) and role — role must match DB.
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const rawId = decoded.userId || decoded.id;
    if (!rawId) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    const user = await User.findById(rawId);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    if (decoded.role != null && decoded.role !== user.role) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
});

/**
 * Require one of the given roles (e.g. authorizeRoles('admin')).
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden — insufficient permissions for this resource',
      });
    }
    next();
  };
};

/** Backwards-compatible names used across routes */
const protect = authMiddleware;
const authorize = authorizeRoles;

module.exports = {
  authMiddleware,
  authorizeRoles,
  protect,
  authorize,
};
