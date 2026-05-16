import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`appearance-none block w-full px-3 py-2 border rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors
          ${error 
            ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
            : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
