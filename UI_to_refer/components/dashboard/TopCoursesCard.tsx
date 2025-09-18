import React from 'react';
import DashboardCard from './DashboardCard';
import { GraduationCapIcon, StarIcon, EyeIcon, ThumbsUpIcon, ClockIcon } from '../icons';
import type { Video } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

const getViralBadge = (video: Video) => {
    if (video.viral_score && video.viral_score > 80) return { icon: '🔥', label: 'VIRAL', color: 'bg-red-500' };
    if (video.view_velocity && video.view_velocity > 1000) return { icon: '⚡', label: 'TRENDING', color: 'bg-orange-500' };
    return null;
};

const getRecentBadge = (video: Video) => {
    const publishDate = new Date(video.publish_time);
    const now = new Date();
    const diffHours = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 2) return { label: 'NEW', color: 'bg-green-500' };
    if (diffHours <= 24) return { label: 'TODAY', color: 'bg-blue-500' };
    return null;
};

const VideoItem: React.FC<{ video: Video }> = ({ video }) => {
    const viralBadge = getViralBadge(video);
    const recentBadge = getRecentBadge(video);

    return (
        <div className="flex items-center gap-4 py-3 border-b border-white/10 last:border-b-0">
            <div className="relative w-24 h-24 flex-shrink-0">
                 <img src={video.thumbnail_url} alt={video.title} className="w-full h-full rounded-xl object-cover"/>
                 <div className="absolute top-1.5 left-1.5 flex flex-col items-start gap-1">
                    {recentBadge && <span className={clsx("text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg", recentBadge.color)}>{recentBadge.label}</span>}
                    {viralBadge && <span className={clsx("text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-0.5", viralBadge.color)}>{viralBadge.icon} {viralBadge.label}</span>}
                 </div>
            </div>
            <div className="flex-grow">
                <a href={video.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:text-blue-400 transition-colors line-clamp-2">{video.title}</a>
                <p className="text-sm text-gray-400 mt-1">{video.channel_name}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <div className="flex items-center gap-1"><EyeIcon className="w-4 h-4"/> {video.view_count?.toLocaleString() ?? 'N/A'}</div>
                    <div className="flex items-center gap-1"><ThumbsUpIcon className="w-4 h-4"/> {video.like_count?.toLocaleString() ?? 'N/A'}</div>
                    <div className="flex items-center gap-1"><ClockIcon className="w-4 h-4"/> {formatDistanceToNow(new Date(video.publish_time), { addSuffix: true })}</div>
                </div>
            </div>
            <div className="text-right">
                <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors">
                    Watch
                </a>
            </div>
        </div>
    );
};

interface TopCoursesCardProps {
    videos: Video[];
    sortBy: string;
    setSortBy: (sort: string) => void;
}

const TopCoursesCard: React.FC<TopCoursesCardProps> = ({ videos, sortBy, setSortBy }) => {
  return (
    <DashboardCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-white/5 rounded-full">
                <GraduationCapIcon className="w-6 h-6 text-white"/>
            </div>
            <h2 className="text-lg font-semibold text-white">Discovered Content ({videos.length})</h2>
        </div>
        <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none"
            >
              <option value="recent">Most Recent</option>
              <option value="viral">Viral Score</option>
              <option value="trending">Trending Velocity</option>
              <option value="views">View Count</option>
            </select>
        </div>
      </div>
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {videos.length > 0 ? (
            videos.map(video => <VideoItem key={video.id} video={video} />)
        ) : (
            <div className="text-center py-12 text-gray-400">
                <p>No videos found for the selected criteria.</p>
            </div>
        )}
      </div>
    </DashboardCard>
  );
};

export default TopCoursesCard;
