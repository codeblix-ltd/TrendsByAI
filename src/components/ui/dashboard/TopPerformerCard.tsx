import React from 'react';
import DashboardCard from '../DashboardCard';
import { TrophyIcon, EyeIcon, ThumbsUpIcon, StarIcon } from '../icons';
import { Video } from '../../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';

interface TopPerformerCardProps {
  video: Video | null;
}

const TopPerformerCard: React.FC<TopPerformerCardProps> = ({ video }) => {
  if (!video) {
    return (
      <DashboardCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/5 rounded-full">
            <TrophyIcon className="w-6 h-6 text-yellow-400"/>
          </div>
          <h2 className="text-lg font-semibold text-white">Top Performer</h2>
        </div>
        <div className="text-center py-12 text-gray-400">
          <TrophyIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No performance data available</p>
        </div>
      </DashboardCard>
    );
  }

  const viralScore = video.viral_score || 0;
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'VIRAL';
    if (score >= 60) return 'HOT';
    if (score >= 40) return 'TRENDING';
    return 'GROWING';
  };

  return (
    <DashboardCard>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white/5 rounded-full">
          <TrophyIcon className="w-6 h-6 text-yellow-400"/>
        </div>
        <h2 className="text-lg font-semibold text-white">Top Performer</h2>
      </div>

      <div className="space-y-4">
        {/* Video thumbnail and basic info */}
        <div className="relative">
          <img 
            src={video.thumbnail_url || 'https://via.placeholder.com/300x200?text=No+Image'} 
            alt={video.title} 
            className="w-full h-32 object-cover rounded-2xl"
          />
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-bold text-white bg-black/50 backdrop-blur-sm ${getScoreColor(viralScore)}`}>
              {getScoreLabel(viralScore)}
            </span>
          </div>
        </div>

        {/* Video details */}
        <div>
          <a 
            href={video.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-white hover:text-blue-400 transition-colors line-clamp-2 block mb-2"
          >
            {video.title}
          </a>
          <p className="text-sm text-gray-400 mb-3">{video.channel_name}</p>
          
          {/* Performance metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <EyeIcon className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Views</span>
              </div>
              <div className="text-lg font-bold text-white">
                {video.view_count?.toLocaleString() || 'N/A'}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <ThumbsUpIcon className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Likes</span>
              </div>
              <div className="text-lg font-bold text-white">
                {video.like_count?.toLocaleString() || 'N/A'}
              </div>
            </div>
          </div>

          {/* Viral score */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Viral Score</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon 
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(viralScore / 20) ? 'text-yellow-400' : 'text-gray-600'}`}
                    fill={i < Math.floor(viralScore / 20) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(viralScore)}`}>
              {viralScore.toFixed(1)}
            </div>
          </div>

          {/* Additional info */}
          <div className="text-xs text-gray-400 mb-4">
            Published {formatDistanceToNow(new Date(video.publish_time), { addSuffix: true })}
          </div>

          {/* Action button */}
          <a 
            href={video.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Watch Video</span>
          </a>
        </div>
      </div>
    </DashboardCard>
  );
};

export default TopPerformerCard;
