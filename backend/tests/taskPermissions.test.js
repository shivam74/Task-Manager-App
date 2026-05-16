const { canAccessTask, canModifyTask, userId, normalizeId } = require('../src/utils/taskPermissions');

describe('taskPermissions', () => {
  const admin = { id: 'a1', role: 'admin' };
  const user = { id: 'u1', role: 'user' };
  const other = { id: 'u2', role: 'user' };

  test('normalizeId handles ObjectId-like refs', () => {
    expect(normalizeId('abc')).toBe('abc');
    expect(normalizeId({ _id: { toString: () => 'oid' } })).toBe('oid');
  });

  test('userId prefers id then _id', () => {
    expect(userId({ id: 'x' })).toBe('x');
    expect(userId({ _id: { toString: () => 'y' } })).toBe('y');
  });

  test('admin can access any task', () => {
    const task = { createdBy: 'u9', assignedTo: 'u8' };
    expect(canAccessTask(admin, task)).toBe(true);
    expect(canModifyTask(admin, task)).toBe(true);
  });

  test('user can access task they created', () => {
    const task = { createdBy: 'u1', assignedTo: 'u2' };
    expect(canAccessTask(user, task)).toBe(true);
    expect(canModifyTask(user, task)).toBe(true);
  });

  test('user can access task assigned to them', () => {
    const task = { createdBy: 'u2', assignedTo: 'u1' };
    expect(canAccessTask(user, task)).toBe(true);
  });

  test('user cannot access unrelated task', () => {
    const task = { createdBy: 'u9', assignedTo: 'u8' };
    expect(canAccessTask(user, task)).toBe(false);
    expect(canModifyTask(other, task)).toBe(false);
  });
});
