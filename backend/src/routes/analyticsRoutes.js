const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/', getAnalytics);

module.exports = router;
