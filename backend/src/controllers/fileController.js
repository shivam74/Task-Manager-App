const asyncHandler = require('express-async-handler');
const { uploadFile, getObjectSignedUrl, deleteFile, mapAwsError } = require('../utils/s3');
const Task = require('../models/Task');
const crypto = require('crypto');
const path = require('path');
const { canModifyTask, canAccessTask } = require('../utils/taskPermissions');

function documentCount(task) {
  return (task.attachedDocuments && task.attachedDocuments.length) || 0;
}

exports.uploadTaskFile = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Please upload a file' });
  }

  const task = await Task.findById(req.params.taskId);

  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  if (!canModifyTask(req.user, task)) {
    return res.status(403).json({ success: false, error: 'Forbidden — not allowed to upload to this task' });
  }

  if (documentCount(task) >= 3) {
    return res.status(400).json({ success: false, error: 'Maximum of 3 files allowed per task' });
  }

  const file = req.file;
  const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
  const ext = path.extname(file.originalname || '') || '.pdf';
  const fileName = generateFileName() + ext;
  const s3Key = `tasks/${req.params.taskId}/${fileName}`;

  try {
    await uploadFile(file.buffer, s3Key, file.mimetype);
    const url = await getObjectSignedUrl(s3Key);

    const newDoc = {
      name: file.originalname,
      s3Key,
      url,
    };

    if (!task.attachedDocuments) {
      task.attachedDocuments = [];
    }
    task.attachedDocuments.push(newDoc);
    await task.save();

    res.status(200).json({
      success: true,
      data: newDoc,
    });
  } catch (err) {
    console.error('S3 upload error:', err);
    return res.status(500).json({
      success: false,
      error: mapAwsError(err),
    });
  }
});

exports.getFileUrl = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.taskId);

  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  if (!canAccessTask(req.user, task)) {
    return res.status(403).json({ success: false, error: 'Forbidden — not allowed to access this file' });
  }

  const file = task.attachedDocuments.id(req.params.fileId);

  if (!file) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }

  try {
    const url = await getObjectSignedUrl(file.s3Key);

    file.url = url;
    await task.save();

    res.status(200).json({
      success: true,
      data: url,
    });
  } catch (err) {
    console.error('S3 signed URL error:', err);
    return res.status(500).json({ success: false, error: mapAwsError(err) });
  }
});

exports.deleteTaskFile = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.taskId);

  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  if (!canModifyTask(req.user, task)) {
    return res.status(403).json({ success: false, error: 'Forbidden — not allowed to delete this file' });
  }

  const file = task.attachedDocuments.id(req.params.fileId);

  if (!file) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }

  try {
    await deleteFile(file.s3Key);
    task.attachedDocuments.pull({ _id: req.params.fileId });
    await task.save();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error('S3 delete error:', err);
    return res.status(500).json({ success: false, error: mapAwsError(err) });
  }
});
