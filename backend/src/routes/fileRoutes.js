const express = require('express');
const { uploadTaskFile, getFileUrl, deleteTaskFile } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

const runUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({
        success: false,
        error: err.message || 'Invalid file upload',
      });
    }
    next();
  });
};

router.use(protect);

router.route('/:taskId').post(runUpload, uploadTaskFile);

router.route('/:taskId/:fileId').delete(deleteTaskFile);

router.route('/download/:taskId/:fileId').get(getFileUrl);

module.exports = router;
