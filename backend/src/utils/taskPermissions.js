/**
 * RBAC helpers for tasks — keep logic testable without Express.
 * @param {{ id?: string, _id?: string, role?: string }} user - req.user (Mongoose doc or plain)
 * @param {{ createdBy?: unknown, assignedTo?: unknown }} task - task document (may be lean or populated)
 */

function normalizeId(ref) {
  if (ref == null) return null;
  if (typeof ref === 'string') return ref;
  if (ref._id) return ref._id.toString();
  return ref.toString();
}

function userId(user) {
  if (!user) return null;
  return user.id || (user._id && user._id.toString());
}

function canAccessTask(user, task) {
  if (!user || !task) return false;
  if (user.role === 'admin') return true;
  const uid = userId(user);
  const creatorId = normalizeId(task.createdBy);
  const assigneeId = normalizeId(task.assignedTo);
  return uid === creatorId || uid === assigneeId;
}

/** Update/delete/upload files — creator, assignee, or admin */
function canModifyTask(user, task) {
  return canAccessTask(user, task);
}

module.exports = {
  normalizeId,
  userId,
  canAccessTask,
  canModifyTask,
};
