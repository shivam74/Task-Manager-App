import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table, { Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import Loader from '../components/ui/Loader';
import { X, Pencil, Trash2, UserPlus } from 'lucide-react';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'user',
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not load users');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreate = () => {
    setForm({ ...emptyForm, password: '' });
    setModal('create');
  };

  const openEdit = (u) => {
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role || 'user',
      _id: u._id,
    });
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setForm(emptyForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await api.post('/users', {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        toast.success('User created');
      } else if (modal === 'edit' && form._id) {
        const payload = {
          name: form.name,
          email: form.email,
          role: form.role,
        };
        if (form.password && form.password.length > 0) {
          payload.password = form.password;
        }
        await api.put(`/users/${form._id}`, payload);
        toast.success('User updated');
      }
      closeModal();
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Request failed');
    }
    setSaving(false);
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      toast.success('User deleted');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Create, edit roles, or remove accounts. Only admins can access this area — enforced on the API too.
        </p>
        <Button type="button" onClick={openCreate} className="w-full shrink-0 sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Add user
        </Button>
      </div>

      <Card noPadding>
        <CardHeader title="Team directory" subtitle="Manage workspace accounts and roles" />
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16">
              <Loader />
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th className="text-right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.length === 0 ? (
                  <Tr>
                    <Td colSpan={4} className="py-12 text-center text-slate-500">
                      No users found.
                    </Td>
                  </Tr>
                ) : (
                  users.map((u) => (
                    <Tr key={u._id}>
                      <Td className="font-medium text-slate-900">{u.name}</Td>
                      <Td className="text-slate-600">{u.email}</Td>
                      <Td>
                        <Badge color={u.role === 'admin' ? 'indigo' : 'slate'} className="capitalize">
                          {u.role || 'user'}
                        </Badge>
                      </Td>
                      <Td className="text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title="Edit"
                            className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                            onClick={() => openEdit(u)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDelete(u)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          )}
        </CardContent>
      </Card>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Close" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {modal === 'create' ? 'Add user' : 'Edit user'}
              </h3>
              <button type="button" onClick={closeModal} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSave}>
              <Input
                label="Full name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
              <Input
                label={modal === 'create' ? 'Password' : 'New password (optional)'}
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required={modal === 'create'}
                placeholder={modal === 'edit' ? 'Leave blank to keep current' : ''}
              />
              <Select
                label="Role"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Select>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving}>
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
