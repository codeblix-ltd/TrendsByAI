import React from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  ExternalLink, 
  Play, 
  Eye, 
  Heart, 
  MessageCircle, 
  Clock,
  Hash,
  Calendar,
  Award,
  Zap
} from 'lucide-react'
import { Video } from '../lib/supabase'
import { formatNumber, formatDuration, formatTimeAgo, getScoreColor } from '../lib/utils'

interface TrendingVideosProps {
  videos: Video[]
}

const TrendingVideos: React.FC<TrendingVideosProps> = ({ videos }) => {
  // Get top trending videos (highest overall score and is_trending = true)
  const trendingVideos = videos
    .filter(video => video.is_trending)
    .sort((a, b) => b.overall_score - a.overall_score)
    .slice(0, 6)

  if (trendingVideos.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Trending Videos</h3>
          <p className="text-gray-400">Check back later for the latest trending AI videos</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800/50 bg-gradient-to-r from-red-500/20 to-pink-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">🔥 Latest Trending AI Videos</h2>
            <p className="text-sm text-gray-300">Hottest AI content right now • {trendingVideos.length} videos trending</p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center space-x-2 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-300 text-sm font-medium">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Videos Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group"
            >
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={video.thumbnail_url || '/api/placeholder/320/180'}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                
                {/* Trending Badge */}
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>#{index + 1}</span>
                </div>
                
                {/* Duration */}
                {video.duration_seconds && (
                  <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration_seconds)}
                  </div>
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Title */}
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link"
                >
                  <h3 className="font-semibold text-white line-clamp-2 mb-2 group-hover/link:text-red-400 transition-colors">
                    {video.title}
                    <ExternalLink className="inline-block w-4 h-4 ml-1 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </h3>
                </a>

                {/* Channel */}
                <p className="text-sm text-gray-400 mb-3">{video.channel_name}</p>

                {/* Metrics Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Eye className="w-4 h-4" />
                      <span>{formatNumber(video.view_count)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-red-400">
                      <Heart className="w-4 h-4" />
                      <span>{formatNumber(video.like_count)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-blue-400">
                      <MessageCircle className="w-4 h-4" />
                      <span>{formatNumber(video.comment_count)}</span>
                    </div>
                  </div>
                  
                  {/* Score */}
                  <div className={`text-lg font-bold ${getScoreColor(video.overall_score)}`}>
                    {video.overall_score.toFixed(1)}
                  </div>
                </div>

                {/* Hashtags */}
                {video.hashtags && video.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {video.hashtags.slice(0, 3).map((hashtag, hashIndex) => (
                      <span
                        key={hashIndex}
                        className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full border border-cyan-500/30"
                      >
                        {hashtag}
                      </span>
                    ))}
                    {video.hashtags.length > 3 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{video.hashtags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Performance Indicators */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-700/50 rounded-lg p-2">
                    <div className="flex items-center space-x-1 mb-1">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-gray-400">Velocity</span>
                    </div>
                    <div className={`text-sm font-semibold ${getScoreColor(video.velocity_score)}`}>
                      {video.velocity_score.toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/50 rounded-lg p-2">
                    <div className="flex items-center space-x-1 mb-1">
                      <Award className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-gray-400">Engagement</span>
                    </div>
                    <div className="text-sm font-semibold text-purple-400">
                      {video.engagement_rate.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Upload Time */}
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatTimeAgo(video.publish_time)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 pb-4">
                <div className="flex space-x-2">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Watch Now</span>
                  </a>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors">
                    <Hash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800/50 bg-gray-800/30">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Updated {formatTimeAgo(new Date().toISOString())} • Trending algorithms detect viral potential
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live tracking</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default TrendingVideos