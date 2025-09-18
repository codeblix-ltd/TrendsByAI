import React from 'react';
import DashboardCard from './DashboardCard';
// FIX: Removed unused UsersIcon import.
import { StarIcon, TrophyIcon, EyeIcon, ZapIcon, ThumbsUpIcon } from '../icons';
import type { Video } from '../../types';

const BestPerformerCard: React.FC<{ author: Video | null }> = ({ author }) => {
  if (!author) {
    return (
      <DashboardCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/5 rounded-full"><TrophyIcon className="w-6 h-6 text-white"/></div>
          <h2 className="text-lg font-semibold text-white">Today's Best Performer</h2>
        </div>
        <div className="text-center py-8 text-gray-400">
            <p>No high-performing video found yet.</p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-white/5 rounded-full">
                <TrophyIcon className="w-6 h-6 text-white"/>
            </div>
            <h2 className="text-lg font-semibold text-white">Best Performer</h2>
        </div>
        <a href={author.url} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors">
            Watch
        </a>
      </div>

      <div className="mt-4 space-y-4">
        <img src={author.thumbnail_url} alt={author.title} className="w-full h-40 rounded-xl object-cover"/>
        <div>
            <p className="font-semibold text-white line-clamp-2">{author.title}</p>
            <p className="text-sm text-gray-400">{author.channel_name}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white/5 p-2 rounded-lg">
                <EyeIcon className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                <p className="font-bold text-white">{(author.view_count || 0).toLocaleString()}</p>
                <p className="text-gray-400">Views</p>
            </div>
            <div className="bg-white/5 p-2 rounded-lg">
                <ZapIcon className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
                <p className="font-bold text-white">{Math.round(author.views_per_minute || 0)}</p>
                <p className="text-gray-400">VPM</p>
            </div>
             <div className="bg-white/5 p-2 rounded-lg">
                <ThumbsUpIcon className="w-5 h-5 mx-auto text-green-400 mb-1" />
                <p className="font-bold text-white">{(author.like_count || 0).toLocaleString()}</p>
                <p className="text-gray-400">Likes</p>
            </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default BestPerformerCard;