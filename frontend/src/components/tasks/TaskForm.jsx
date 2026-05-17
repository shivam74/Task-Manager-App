import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Upload, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Card, { CardContent, CardFooter, CardHeader } from '../ui/Card';
import { AuthContext } from '../../context/AuthContext';

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  status: z.enum(['pending', 'in-progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().min(1, 'Due date is required'),
  assignedTo: z.string().optional().nullable(),
});

const inputClass =
  'appearance-none block w-full px-3 py-2 border rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors';

const TaskForm = ({
  variant = 'modal',
  isOpen = true,
  onClose,
  onCancel,
  onSuccess,
  onSubmit,
  onUpload,
  initialData = null,
}) => {
  const { user, isAdmin } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [file, setFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'pending',
      priority: 'medium',
    },
  });

  useEffect(() => {
    if (!(variant === 'page' || isOpen)) return;

    if (isAdmin) {
      const fetchUsers = async () => {
        try {
          const res = await api.get('/users');
          setUsers(res.data.data || []);
        } catch (err) {
          console.error(err);
        }
      };
      fetchUsers();
      return;
    }

    if (user) {
      setUsers([{ _id: user._id, name: `${user.name} (you)` }]);
    } else {
      setUsers([]);
    }
  }, [isOpen, variant, isAdmin, user]);

  useEffect(() => {
    if (initialData && (variant === 'page' || isOpen)) {
      setValue('title', initialData.title);
      setValue('description', initialData.description);
      setValue('status', initialData.status);
      setValue('priority', initialData.priority);
      setValue('dueDate', new Date(initialData.dueDate).toISOString().split('T')[0]);
      if (initialData.assignedTo) {
        setValue('assignedTo', initialData.assignedTo._id);
      }
    } else if ((variant === 'page' || isOpen) && !initialData) {
      reset({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
        assignedTo: user && !isAdmin ? user._id : '',
      });
    }
    setFile(null);
  }, [initialData, isOpen, variant, reset, setValue, user, isAdmin]);

  const finishSuccess = () => {
    if (onSuccess) onSuccess();
    if (onClose) onClose();
  };

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data };
      if (!payload.assignedTo) delete payload.assignedTo;

      const createdTask = await onSubmit(payload);
      const taskId = createdTask?._id || initialData?._id;

      if (file && taskId) {
        try {
          await onUpload(taskId, file);
        } catch (uploadErr) {
          toast.error(uploadErr.response?.data?.error || 'PDF upload to S3 failed');
          setLoading(false);
          return;
        }
      }

      toast.success(`Task ${initialData ? 'updated' : 'created'} successfully`);
      finishSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'An error occurred');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  const formBody = (
    <form id="task-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <Input
        label="Title"
        placeholder="e.g., Update onboarding checklist"
        {...register('title')}
        error={errors.title?.message}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="What needs to be done?"
          className={`${inputClass} ${errors.description ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Select label="Status" {...register('status')} error={errors.status?.message}>
          <option value="pending">Pending</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </Select>

        <Select label="Priority" {...register('priority')} error={errors.priority?.message}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input type="date" label="Due date" {...register('dueDate')} error={errors.dueDate?.message} />

        <Select label={isAdmin ? 'Assign to' : 'Assigned'} {...register('assignedTo')} disabled={!isAdmin}>
          {isAdmin && <option value="">Unassigned</option>}
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Attachment (PDF, max 5MB)
        </label>
        <button
          type="button"
          onClick={() => document.getElementById('task-file-upload')?.click()}
          className="mt-1 w-full flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-colors text-left"
        >
          <div className="space-y-2 text-center">
            {file ? (
              <FileText className="mx-auto h-10 w-10 text-indigo-600" aria-hidden />
            ) : (
              <Upload className="mx-auto h-10 w-10 text-slate-400" aria-hidden />
            )}
            <p className="text-sm text-slate-600">
              <span className="font-medium text-indigo-600">{file ? 'Change file' : 'Upload PDF'}</span>
            </p>
            <p className="text-xs text-slate-500">{file ? file.name : 'Optional — PDF only'}</p>
          </div>
          <input
            id="task-file-upload"
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </button>
      </div>
    </form>
  );

  const actions = (
    <>
      <Button type="button" variant="secondary" onClick={handleCancel}>
        Cancel
      </Button>
      <Button type="submit" form="task-form" isLoading={loading}>
        {initialData ? 'Save changes' : 'Create task'}
      </Button>
    </>
  );

  if (variant === 'page') {
    return (
      <Card noPadding className="shadow-sm border-slate-200/80">
        <CardHeader title={initialData ? 'Edit task' : 'New task'} subtitle="Fill in the fields below." />
        <CardContent className="sm:px-8">{formBody}</CardContent>
        <CardFooter>{actions}</CardFooter>
      </Card>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/30" onClick={handleCancel} aria-hidden />

      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-lg border border-slate-200 z-50 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <h3 className="text-lg font-semibold text-slate-900">
            {initialData ? 'Edit task' : 'New task'}
          </h3>
          <button
            type="button"
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">{formBody}</div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3">{actions}</div>
      </div>
    </div>
  );
};

export default TaskForm;
