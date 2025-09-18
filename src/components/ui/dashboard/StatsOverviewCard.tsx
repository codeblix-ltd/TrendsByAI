import React from 'react';
import DashboardCard from '../DashboardCard';
import { ChartIcon, EyeIcon, ZapIcon, TrophyIcon } from '../icons';
import { TrendingUp } from 'lucide-react';

interface StatsOverviewCardProps {
  stats: {
    totalVideos: number;
    totalViews: number;
    avgEngagement: number;
    trendingCount: number;
    topVelocity: number;
    avgScore: number;
  };
}

const StatsOverviewCard: React.FC<StatsOverviewCardProps> = ({ stats }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  };

  const statItems = [
    {
      label: 'Total Videos',
      value: formatNumber(stats.totalVideos),
      icon: <ChartIcon className="w-5 h-5 text-blue-400" />,
      change: '+12%',
      color: 'text-blue-400'
    },
    {
      label: 'Total Views',
      value: formatNumber(stats.totalViews),
      icon: <EyeIcon className="w-5 h-5 text-purple-400" />,
      change: '+8.2%',
      color: 'text-purple-400'
    },
    {
      label: 'Trending Videos',
      value: stats.trendingCount.toString(),
      icon: <ZapIcon className="w-5 h-5 text-yellow-400" />,
      change: '+15%',
      color: 'text-yellow-400'
    },
    {
      label: 'Avg Score',
      value: stats.avgScore.toFixed(1),
      icon: <TrophyIcon className="w-5 h-5 text-green-400" />,
      change: '+3.4%',
      color: 'text-green-400'
    }
  ];

  return (
    <DashboardCard>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-full">
            <ChartIcon className="w-6 h-6 text-white"/>
          </div>
          <h2 className="text-lg font-semibold text-white">Analytics Overview</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <div key={index} className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              {item.icon}
              <div className="flex items-center gap-1 text-green-400 text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>{item.change}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className={`text-2xl font-bold ${item.color}`}>
                {item.value}
              </div>
              <div className="text-xs text-gray-400">
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Engagement Rate</div>
            <div className="text-xl font-bold text-white">{stats.avgEngagement.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Top Velocity</div>
            <div className="text-xl font-bold text-white">{stats.topVelocity.toFixed(1)}/min</div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default StatsOverviewCard;
