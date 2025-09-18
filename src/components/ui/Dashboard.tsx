import React from 'react';
import { Video } from '../../lib/supabase';

// Import dashboard card components (we'll create these)
import AIAssistantCard from './dashboard/AIAssistantCard';
import StatsOverviewCard from './dashboard/StatsOverviewCard';
import VideoContentCard from './dashboard/VideoContentCard';
import SystemStatusCard from './dashboard/SystemStatusCard';
import TopPerformerCard from './dashboard/TopPerformerCard';

interface DashboardProps {
  videos: Video[];
  stats: {
    totalVideos: number;
    totalViews: number;
    avgEngagement: number;
    trendingCount: number;
    topVelocity: number;
    avgScore: number;
  };
  searchQuery: string;
  onRefresh: () => void;
  onGenerateSEO: (video: Video) => void;
  isRefreshing: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  videos,
  stats,
  searchQuery,
  onRefresh,
  onGenerateSEO,
  isRefreshing
}) => {
  // Filter videos based on search query
  const filteredVideos = videos.filter(video => 
    video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.channel_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get top performer
  const topPerformer = videos.length > 0 
    ? videos.reduce((prev, current) => 
        (current.viral_score || 0) > (prev.viral_score || 0) ? current : prev
      )
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Left Column */}
      <div className="flex flex-col gap-6 xl:col-span-1">
        <AIAssistantCard 
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        <SystemStatusCard 
          isConnected={true}
          lastScanTime={new Date().toISOString()}
          totalVideos={stats.totalVideos}
        />
      </div>

      {/* Middle Column */}
      <div className="flex flex-col gap-6 lg:col-span-2 xl:col-span-2">
        <StatsOverviewCard stats={stats} />
        <VideoContentCard 
          videos={filteredVideos}
          onGenerateSEO={onGenerateSEO}
        />
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-6 lg:col-span-1 xl:col-span-1">
        <TopPerformerCard video={topPerformer} />
      </div>
    </div>
  );
};

export default Dashboard;
