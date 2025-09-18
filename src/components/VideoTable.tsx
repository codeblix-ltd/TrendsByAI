import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ExternalLink, 
  Play, 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Clock,
  Award,
  Zap,
  Target,
  Star,
  Sparkles,
  ChevronDown,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { Video } from '../lib/supabase'
import { formatNumber, formatDuration, formatTimeAgo, getScoreColor, getScoreBadgeColor } from '../lib/utils'

interface VideoTableProps {
  videos: Video[]
  onGenerateSEO: (video: Video) => void
  searchQuery: string
}

interface SortConfig {
  key: keyof Video
  direction: 'asc' | 'desc'
}

const VideoTable: React.FC<VideoTableProps> = ({ videos, onGenerateSEO, searchQuery }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'overall_score', direction: 'desc' })
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Filter videos based on search query and filters
  const filteredVideos = videos.filter(video => {
    const matchesSearch = searchQuery === '' || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.channel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.category && video.category.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = filterCategory === 'all' || video.category === filterCategory
    const matchesPlatform = filterPlatform === 'all' || video.platform === filterPlatform
    
    return matchesSearch && matchesCategory && matchesPlatform
  })

  // Sort videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    const aValue = a[sortConfig.key] as any
    const bValue = b[sortConfig.key] as any
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const handleSort = (key: keyof Video) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc'
    })
  }

  const getSortIcon = (key: keyof Video) => {
    if (sortConfig.key !== key) {
      return <SortAsc className="w-4 h-4 text-gray-500 opacity-50" />
    }
    return sortConfig.direction === 'desc' ? 
      <SortDesc className="w-4 h-4 text-cyan-400" /> : 
      <SortAsc className="w-4 h-4 text-cyan-400" />
  }

  const categories = [...new Set(videos.map(v => v.category).filter(Boolean))]
  const platforms = [...new Set(videos.map(v => v.platform))]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl overflow-hidden"
    >
      {/* Table Header with Filters */}
      <div className="px-6 py-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">Video Analytics</h2>
            <div className="text-sm text-gray-400">
              {sortedVideos.length} videos • {videos.filter(v => v.is_trending).length} trending
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">Filters</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {/* Filter Controls */}
        <motion.div 
          initial={false}
          animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center space-x-4 pt-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Platform</label>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Platforms</option>
                {platforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <span>Video</span>
                  {getSortIcon('title')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('overall_score')}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <span>Overall Score</span>
                  {getSortIcon('overall_score')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('view_count')}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <span>Performance</span>
                  {getSortIcon('view_count')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('velocity_score')}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <span>Velocity</span>
                  {getSortIcon('velocity_score')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('publish_time')}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <span>Published</span>
                  {getSortIcon('publish_time')}
                </button>
              </th>
              <th className="px-6 py-4 text-center text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedVideos.map((video, index) => (
              <motion.tr
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-800/30 hover:bg-gray-800/30 transition-colors"
              >
                {/* Video Info */}
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img
                        src={video.thumbnail_url || '/api/placeholder/120/90'}
                        alt={video.title}
                        className="w-20 h-14 object-cover rounded-lg"
                      />
                      {video.is_trending && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start space-x-2 hover:text-cyan-400 transition-colors"
                      >
                        <h3 className="font-medium text-white group-hover:text-cyan-400 line-clamp-2 transition-colors">
                          {video.title}
                        </h3>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 flex-shrink-0 mt-0.5" />
                      </a>
                      <p className="text-sm text-gray-400 mt-1">{video.channel_name}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        {video.category && (
                          <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                            {video.category}
                          </span>
                        )}
                        {video.duration_seconds && (
                          <span className="text-xs text-gray-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(video.duration_seconds)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Overall Score */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className={`text-2xl font-bold ${getScoreColor(video.overall_score)}`}>
                      {video.overall_score.toFixed(1)}
                    </div>
                    <div className="space-y-1">
                      <div className={`text-xs px-2 py-1 rounded-full border ${getScoreBadgeColor(video.overall_score)}`}>
                        {video.overall_score >= 80 ? 'Excellent' : 
                         video.overall_score >= 60 ? 'Good' : 
                         video.overall_score >= 40 ? 'Average' : 'Poor'}
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${star <= Math.round(video.overall_score / 20) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Performance Metrics */}
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-white font-medium">{formatNumber(video.view_count)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-gray-300">{formatNumber(video.like_count)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MessageCircle className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">{formatNumber(video.comment_count)}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {video.engagement_rate.toFixed(2)}% engagement
                    </div>
                  </div>
                </td>

                {/* Velocity */}
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className={`font-medium ${getScoreColor(video.velocity_score)}`}>
                        {video.velocity_score.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {video.views_per_minute.toFixed(1)} views/min
                    </div>
                    <div className="text-xs text-gray-400">
                      {video.age_minutes < 60 
                        ? `${video.age_minutes}m old`
                        : `${Math.floor(video.age_minutes / 60)}h old`
                      }
                    </div>
                  </div>
                </td>

                {/* Published */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-300">
                    {formatTimeAgo(video.publish_time)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(video.publish_time).toLocaleDateString()}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center transition-colors"
                      title="Watch Video"
                    >
                      <Play className="w-4 h-4 text-white" />
                    </motion.a>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onGenerateSEO(video)}
                      className="w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center transition-colors"
                      title="Generate SEO Pack"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedVideos.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No videos found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </motion.div>
  )
}

export default VideoTable