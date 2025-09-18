import React from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Clock, 
  Star,
  BarChart3,
  Zap,
  Target,
  Award
} from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
  color: string
  trend?: 'up' | 'down' | 'neutral'
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon, color, trend }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:border-gray-700/50 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        {change && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-gray-400 text-sm">{title}</p>
      </div>
    </motion.div>
  )
}

interface StatsDashboardProps {
  stats: {
    totalVideos: number
    totalViews: number
    avgEngagement: number
    trendingCount: number
    topVelocity: number
    avgScore: number
  }
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const statsCards = [
    {
      title: 'Total Videos Tracked',
      value: formatNumber(stats.totalVideos),
      change: '+12%',
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      trend: 'up' as const
    },
    {
      title: 'Total Views',
      value: formatNumber(stats.totalViews),
      change: '+8.2%',
      icon: <Eye className="w-6 h-6 text-white" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      trend: 'up' as const
    },
    {
      title: 'Avg Engagement Rate',
      value: `${stats.avgEngagement.toFixed(1)}%`,
      change: '+5.1%',
      icon: <Heart className="w-6 h-6 text-white" />,
      color: 'bg-gradient-to-r from-red-500 to-orange-500',
      trend: 'up' as const
    },
    {
      title: 'Trending Videos',
      value: stats.trendingCount,
      change: '+15%',
      icon: <Zap className="w-6 h-6 text-white" />,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      trend: 'up' as const
    },
    {
      title: 'Top Velocity',
      value: `${stats.topVelocity.toFixed(1)}/min`,
      change: '+22%',
      icon: <Target className="w-6 h-6 text-white" />,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      trend: 'up' as const
    },
    {
      title: 'Average Score',
      value: stats.avgScore.toFixed(1),
      change: '+3.4%',
      icon: <Award className="w-6 h-6 text-white" />,
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      trend: 'up' as const
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {statsCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatsCard {...card} />
        </motion.div>
      ))}
    </div>
  )
}

export default StatsDashboard