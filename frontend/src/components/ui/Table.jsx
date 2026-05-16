import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className={`w-full overflow-x-auto ${className}`}>
    <table className="min-w-full divide-y divide-slate-200">
      {children}
    </table>
  </div>
);

export const Thead = ({ children, className = '' }) => (
  <thead className={`bg-slate-50 ${className}`}>
    {children}
  </thead>
);

export const Tbody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-slate-200 bg-white ${className}`}>
    {children}
  </tbody>
);

export const Tr = ({ children, className = '', onClick }) => (
  <tr
    onClick={onClick}
    className={`${onClick ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''} ${className}`}
  >
    {children}
  </tr>
);

export const Th = ({ children, className = '' }) => (
  <th
    scope="col"
    className={`px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

export const Td = ({ children, className = '', colSpan, ...rest }) => (
  <td
    colSpan={colSpan}
    className={`px-6 py-4 text-sm text-slate-700 ${colSpan ? '' : 'whitespace-nowrap'} ${className}`}
    {...rest}
  >
    {children}
  </td>
);

export default Table;
