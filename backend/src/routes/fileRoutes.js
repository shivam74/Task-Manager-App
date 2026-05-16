const express = require('express');
const { uploadTaskFile, getFileUrl, deleteTaskFile } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.route('/:taskId')
    .post(upload.single('file'), uploadTaskFile);

router.route('/:taskId/:fileId')
    .delete(deleteTaskFile);

router.route('/download/:taskId/:fileId')
    .get(getFileUrl);

module.exports = router;
