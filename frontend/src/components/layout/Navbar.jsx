import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import Badge from '../ui/Badge';

const titles = {
  '/': 'Dashboard',
  '/tasks': 'Tasks',
  '/tasks/new': 'Create task',
  '/users': 'Users',
  '/analytics': 'Analytics',
};

const Navbar = ({ onMenuClick }) => {
  const { user } = useContext(AuthContext);
  const { pathname } = useLocation();
  const tasksTitle = pathname === '/tasks' && user?.role !== 'admin' ? 'My tasks' : titles[pathname];
  const title = tasksTitle || 'Task Manager';

  const firstName = user?.name?.split(' ')?.[0] || 'there';

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-slate-900">{title}</h1>
          <p className="hidden text-sm text-slate-500 sm:block">
            Hi {firstName} — here&apos;s your overview.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {user?.role === 'admin' && <Badge color="indigo">Admin</Badge>}
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
            title={user?.name}
          >
            {user?.name ? (
              <span aria-hidden>{user.name.charAt(0).toUpperCase()}</span>
            ) : (
              <User className="h-4 w-4 text-slate-400" aria-hidden />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
