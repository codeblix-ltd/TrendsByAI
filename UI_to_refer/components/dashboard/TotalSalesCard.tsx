import React from 'react';
import DashboardCard from './DashboardCard';
// FIX: Removed unused ShoppingCartIcon import.
import { DatabaseIcon, GlobeIcon, HashIcon, ZapIcon } from '../icons';

interface StatsCardProps {
  stats: {
    totalVideos?: number;
    countries?: number;
    categories?: number;
    scan_sessions?: number;
  }
}

const StatItem: React.FC<{ icon: React.ReactNode, label: string, value: string | number | undefined }> = ({ icon, label, value }) => (
    <div className="bg-white/5 p-4 rounded-2xl text-center">
        <div className="w-8 h-8 mx-auto flex items-center justify-center mb-2">{icon}</div>
        <p className="text-xl font-bold text-white">{value?.toLocaleString() ?? 'N/A'}</p>
        <p className="text-xs text-gray-400">{label}</p>
    </div>
);

const TotalSalesCard: React.FC<StatsCardProps> = ({ stats }) => {
  return (
    <DashboardCard>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-white/5 rounded-full">
                <DatabaseIcon className="w-6 h-6 text-white"/>
            </div>
            <div>
                <h2 className="text-lg font-semibold text-white">Platform Stats</h2>
                <p className="text-sm text-gray-400">Live data from the last scan</p>
            </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatItem icon={<DatabaseIcon className="text-blue-400 w-6 h-6" />} label="Total Videos" value={stats.totalVideos} />
        <StatItem icon={<GlobeIcon className="text-green-400 w-6 h-6" />} label="Countries" value={stats.countries} />
        <StatItem icon={<HashIcon className="text-purple-400 w-6 h-6" />} label="Categories" value={stats.categories} />
        <StatItem icon={<ZapIcon className="text-yellow-400 w-6 h-6" />} label="Scan Sessions" value={stats.scan_sessions} />
      </div>
    </DashboardCard>
  );
};

export default TotalSalesCard;