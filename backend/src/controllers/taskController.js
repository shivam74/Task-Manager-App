const Task = require('../models/Task');
const asyncHandler = require('express-async-handler');
const { deleteFile } = require('../utils/s3');
const { getIo } = require('../sockets');
const { canAccessTask, canModifyTask } = require('../utils/taskPermissions');

/** Build Mongo filter: users see only tasks they created or are assigned to */
function buildTaskListFilter(reqUser, parsedQuery) {
  if (reqUser.role === 'admin') {
    return { ...parsedQuery };
  }

  const q = { ...parsedQuery };
  delete q.createdBy;
  delete q.assignedTo;

  const scope = {
    $or: [{ createdBy: reqUser.id }, { assignedTo: reqUser.id }],
  };

  if (Object.keys(q).length === 0) {
    return scope;
  }
  return { $and: [scope, q] };
}

// @desc    Get tasks (scoped for non-admins)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  const parsedQuery = JSON.parse(queryStr);

  if (req.query.search) {
    parsedQuery.title = { $regex: req.query.search, $options: 'i' };
  }

  const mongoFilter = buildTaskListFilter(req.user, parsedQuery);

  let query = Task.find(mongoFilter)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Task.countDocuments(mongoFilter);

  query = query.skip(startIndex).limit(limit);

  const tasks = await query;

  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: tasks.length,
    pagination,
    data: tasks,
  });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  if (!canAccessTask(req.user, task)) {
    return res.status(403).json({ success: false, error: 'Forbidden — not allowed to view this task' });
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;

  if (req.user.role !== 'admin') {
    req.body.assignedTo = req.user.id;
  } else if (!req.body.assignedTo) {
    req.body.assignedTo = req.user.id;
  }

  const task = await Task.create(req.body);
  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  getIo().emit('taskCreated', populatedTask);

  res.status(201).json({
    success: true,
    data: populatedTask,
  });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  if (!canModifyTask(req.user, task)) {
    return res.status(403).json({ success: false, error: 'Forbidden — not allowed to update this task' });
  }

  if (req.user.role !== 'admin') {
    delete req.body.assignedTo;
    delete req.body.createdBy;
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  getIo().emit('taskUpdated', task);

  res.status(200).json({
    success: true,
    data: task,
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  if (!canModifyTask(req.user, task)) {
    return res.status(403).json({ success: false, error: 'Forbidden — not allowed to delete this task' });
  }

  if (task.attachedDocuments && task.attachedDocuments.length > 0) {
    for (const doc of task.attachedDocuments) {
      try {
        await deleteFile(doc.s3Key);
      } catch (err) {
        console.error(`Failed to delete file from S3: ${doc.s3Key}`, err);
      }
    }
  }

  await Task.findByIdAndDelete(req.params.id);

  getIo().emit('taskDeleted', req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
