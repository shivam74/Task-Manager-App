import React from 'react';

const Card = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      {!noPadding && <div className="p-6">{children}</div>}
      {noPadding && children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 ${className}`}>
    <div>
      <h3 className="text-lg font-semibold leading-6 text-slate-900">{title}</h3>
      {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-5 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 ${className}`}>
    {children}
  </div>
);

export default Card;
