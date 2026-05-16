import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TaskContext } from '../context/TaskContext';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Clock, AlertCircle, ListTodo, ArrowRight } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';

const Dashboard = () => {
  const { tasks, fetchTasks, loading } = useContext(TaskContext);
  const { user, isAdmin } = useContext(AuthContext);

  useEffect(() => {
    fetchTasks('?limit=500');
  }, []);

  const firstName = user?.name?.split(' ')?.[0] ?? 'there';

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const stats = [
    {
      name: 'Total tasks',
      value: tasks.length,
      icon: ListTodo,
      wrap: 'bg-indigo-50 text-indigo-600 border-indigo-100/80',
      hover: 'hover:border-indigo-200 hover:shadow-md',
    },
    {
      name: 'Pending',
      value: pendingCount,
      icon: AlertCircle,
      wrap: 'bg-slate-100 text-slate-700 border-slate-200/80',
      hover: 'hover:border-slate-300 hover:shadow-md',
    },
    {
      name: 'In progress',
      value: inProgressCount,
      icon: Clock,
      wrap: 'bg-blue-50 text-blue-600 border-blue-100/80',
      hover: 'hover:border-blue-200 hover:shadow-md',
    },
    {
      name: 'Completed',
      value: completedCount,
      icon: CheckCircle,
      wrap: 'bg-emerald-50 text-emerald-600 border-emerald-100/80',
      hover: 'hover:border-emerald-200 hover:shadow-md',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in-progress':
        return 'blue';
      default:
        return 'slate';
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Overview</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900 tracking-tight">
            Welcome back, {firstName}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Track workload at a glance and jump into tasks when you are ready.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button to="/tasks" variant="secondary" className="w-full shrink-0 sm:w-auto">
            {isAdmin ? 'View all tasks' : 'My tasks'}
          </Button>
          {isAdmin && (
            <Button to="/analytics" className="w-full shrink-0 sm:w-auto">
              Analytics
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card
            key={item.name}
            noPadding
            className={`border bg-white shadow-sm transition-shadow duration-150 ${item.hover}`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.name}</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{item.value}</p>
                </div>
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${item.wrap}`}
                >
                  <item.icon className="h-5 w-5" aria-hidden />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card noPadding className="shadow-sm border-slate-200/90">
        <CardHeader
          title="Recent tasks"
          subtitle="Latest updates from your queue"
          action={
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Open tasks
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />
        <div className="divide-y divide-slate-100">
          {tasks.slice(0, 5).map((task) => (
            <div
              key={task._id}
              className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{task.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Due {new Date(task.dueDate).toLocaleDateString()}
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="capitalize">{task.priority} priority</span>
                </p>
              </div>
              <Badge color={getStatusColor(task.status)} className="w-fit capitalize shrink-0">
                {task.status.replace('-', ' ')}
              </Badge>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="px-6 py-14 text-center">
              <CheckCircle className="mx-auto mb-3 h-11 w-11 text-slate-300" aria-hidden />
              <p className="font-medium text-slate-900">You are all caught up</p>
              <p className="mt-1 text-sm text-slate-500">Create a task to see it listed here.</p>
              <Button to="/tasks/new" className="mt-5">
                Create task
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
