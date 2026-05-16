import React, { forwardRef } from 'react';

const Select = forwardRef(({ label, error, className = '', children, ...props }, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`block w-full px-3 py-2 border rounded-xl shadow-sm text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 transition-colors
          ${error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
