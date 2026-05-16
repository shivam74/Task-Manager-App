import React, { useContext, useState, useEffect } from 'react';
import { TaskContext } from '../context/TaskContext';
import { AuthContext } from '../context/AuthContext';
import TaskForm from '../components/tasks/TaskForm';
import { Search, Filter, Edit2, Trash2, Paperclip, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table, { Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import Loader from '../components/ui/Loader';

const PAGE_SIZE = 10;

const Tasks = () => {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, uploadFile, loading, pagination } =
    useContext(TaskContext);
  const { user, isAdmin } = useContext(AuthContext);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus, filterPriority, sort]);

  useEffect(() => {
    let query = `?sort=${sort}&page=${page}&limit=${PAGE_SIZE}`;
    if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`;
    if (filterStatus) query += `&status=${filterStatus}`;
    if (filterPriority) query += `&priority=${filterPriority}`;

    const timeoutId = setTimeout(() => {
      fetchTasks(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStatus, filterPriority, sort, page]);

  const openEdit = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleEdit = (task, e) => {
    e.stopPropagation();
    openEdit(task);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        toast.success('Task deleted successfully');
      } catch (err) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleFormSubmit = async (data) => {
    if (editingTask) {
      return await updateTask(editingTask._id, data);
    }
    return await createTask(data);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'slate';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in-progress':
        return 'blue';
      case 'pending':
        return 'slate';
      default:
        return 'slate';
    }
  };

  const canModify = (task) => {
    return user?.role === 'admin' || task.createdBy?._id === user?._id || task.assignedTo?._id === user?._id;
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          {isAdmin
            ? 'Search, filter, and page through all workspace tasks. Click a row to edit when you have access.'
            : 'Search and filter tasks you created or that are assigned to you.'}
        </p>
        <Button to="/tasks/new" className="w-full shrink-0 sm:w-auto">
          Create task
        </Button>
      </div>

      <Card noPadding className="overflow-hidden border-slate-200/90 shadow-sm">
        <CardContent className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-5">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="min-w-[8rem] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:flex-none"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="min-w-[8rem] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:flex-none"
            >
              <option value="">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="min-w-[10rem] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:flex-none"
            >
              <option value="-createdAt">Newest first</option>
              <option value="createdAt">Oldest first</option>
              <option value="dueDate">Due date</option>
              <option value="-priority">Priority</option>
            </select>
          </div>
        </CardContent>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            <Table>
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>Status</Th>
                  <Th>Priority</Th>
                  <Th>Due date</Th>
                  <Th>Assigned</Th>
                  <Th className="text-right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <Tr
                      key={task._id}
                      onClick={canModify(task) ? () => openEdit(task) : undefined}
                      className={canModify(task) ? 'cursor-pointer' : ''}
                    >
                      <Td>
                        <div className="max-w-xs">
                          <p className="font-medium text-slate-900">{task.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {task.description && (
                              <span className="line-clamp-1 text-xs text-slate-500">{task.description}</span>
                            )}
                            {task.attachedDocuments?.length > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                <Paperclip className="h-3 w-3" aria-hidden />
                                {task.attachedDocuments.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <Badge color={getStatusColor(task.status)} className="capitalize">
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge color={getPriorityColor(task.priority)} className="capitalize">
                          {task.priority}
                        </Badge>
                      </Td>
                      <Td className="text-slate-600">{format(new Date(task.dueDate), 'MMM d, yyyy')}</Td>
                      <Td>
                        {task.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                              {task.assignedTo.name.charAt(0)}
                            </span>
                            <span className="text-slate-700">{task.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </Td>
                      <Td className="text-right">
                        {canModify(task) && (
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleEdit(task, e)}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            {task.attachedDocuments?.length > 0 && (
                              <a
                                href={task.attachedDocuments[0].url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={stop}
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleDelete(task._id, e)}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={6} className="py-14 text-center">
                      <Filter className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden />
                      <p className="font-medium text-slate-900">No tasks match</p>
                      <p className="mt-1 text-sm text-slate-500">Try adjusting filters or create a new task.</p>
                      <Button to="/tasks/new" variant="secondary" className="mt-5 inline-flex">
                        Create task
                      </Button>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-slate-500">
                Page {page}
                {tasks.length > 0 ? ` · Showing ${tasks.length} task${tasks.length === 1 ? '' : 's'}` : ''}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!pagination?.prev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!pagination?.next}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        onUpload={uploadFile}
        initialData={editingTask}
      />
    </div>
  );
};

export default Tasks;
