import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, PlusSquare, LogOut, BarChart3 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userTasksHref = '/tasks';
  const tasksLabel = isAdmin ? 'Tasks' : 'My tasks';

  const baseNav = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: tasksLabel, href: userTasksHref, icon: CheckSquare },
    { name: 'Create task', href: '/tasks/new', icon: PlusSquare },
  ];

  const adminOnlyNav = isAdmin
    ? [
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Users', href: '/users', icon: Users },
      ]
    : [];

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-100 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <CheckSquare className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Task Manager</p>
            <p className="text-xs text-slate-500">{isAdmin ? 'Admin workspace' : 'My workspace'}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {baseNav.map((item) => (
            <NavLink key={item.name} to={item.href} className={linkClass} onClick={() => setIsOpen(false)}>
              <item.icon className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-600" aria-hidden />
              {item.name}
            </NavLink>
          ))}
          {adminOnlyNav.map((item) => (
            <NavLink key={item.name} to={item.href} className={linkClass} onClick={() => setIsOpen(false)}>
              <item.icon className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-600" aria-hidden />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <div className="mb-2 px-3 text-xs text-slate-500 truncate" title={user?.email}>
            {user?.name}
            {user?.role === 'admin' ? (
              <span className="ml-1 rounded-md bg-indigo-50 px-1.5 py-0.5 font-medium text-indigo-700">Admin</span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
