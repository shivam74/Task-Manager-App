import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 className={`animate-spin text-indigo-600 ${sizes[size]}`} />
    </div>
  );
};

export const FullPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <Loader size="lg" />
  </div>
);

export default Loader;
