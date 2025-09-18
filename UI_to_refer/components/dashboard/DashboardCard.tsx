import React from 'react';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/20 ${className}`}>
      {children}
    </div>
  );
};

export default DashboardCard;
