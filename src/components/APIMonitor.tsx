import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  RefreshCw, 
  TrendingUp, 
  Zap,
  XCircle
} from 'lucide-react'
import { supabase, ApiUsage } from '../lib/supabase'

interface APIMonitorProps {
  onRefresh?: () => void
  onForceScan?: () => void
}

const APIMonitor: React.FC<APIMonitorProps> = ({ onRefresh, onForceScan }) => {
  const [apiUsage, setApiUsage] = useState<ApiUsage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchAPIUsage = async () => {
    try {
      setIsLoading(true)
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('api_usage')
        .select('*')
        .eq('date', today)
        .eq('service', 'youtube')
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setApiUsage(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching API usage:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAPIUsage()
    // Refresh every 5 minutes
    const interval = setInterval(fetchAPIUsage, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const quotaUsed = apiUsage?.quota_used || 0
  const quotaLimit = apiUsage?.quota_limit || 10000
  const quotaPercentage = (quotaUsed / quotaLimit) * 100
  const requestsCount = apiUsage?.requests_count || 0
  const errorsCount = apiUsage?.errors_count || 0
  const responseTime = apiUsage?.response_time_avg || 0

  const getQuotaStatus = () => {
    if (quotaPercentage >= 90) return { color: 'text-red-400', bg: 'bg-red-500', status: 'Critical' }
    if (quotaPercentage >= 75) return { color: 'text-yellow-400', bg: 'bg-yellow-500', status: 'Warning' }
    if (quotaPercentage >= 50) return { color: 'text-orange-400', bg: 'bg-orange-500', status: 'Moderate' }
    return { color: 'text-green-400', bg: 'bg-green-500', status: 'Good' }
  }

  const quotaStatus = getQuotaStatus()

  const handleRefresh = () => {
    fetchAPIUsage()
    onRefresh?.()
  }

  const handleForceScan = async () => {
    if (isScanning) return

    try {
      setIsScanning(true)
      await onForceScan?.()
      // Refresh API usage after scan
      await fetchAPIUsage()
    } catch (error) {
      console.error('Force scan failed:', error)
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">API Monitor</h3>
            <p className="text-sm text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="w-10 h-10 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg flex items-center justify-center transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Quota Usage */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-300">Quota Usage</h4>
            <div className={`w-3 h-3 rounded-full ${quotaStatus.bg}`}></div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {quotaUsed.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            of {quotaLimit.toLocaleString()} ({quotaPercentage.toFixed(1)}%)
          </div>
          <div className="mt-2 bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${quotaStatus.bg} transition-all duration-300`}
              style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Requests */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-300">Requests</h4>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {requestsCount}
          </div>
          <div className="text-xs text-gray-400">Today</div>
        </div>

        {/* Errors */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-300">Errors</h4>
            {errorsCount > 0 ? (
              <XCircle className="w-4 h-4 text-red-400" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
          </div>
          <div className={`text-2xl font-bold mb-1 ${
            errorsCount > 0 ? 'text-red-400' : 'text-green-400'
          }`}>
            {errorsCount}
          </div>
          <div className="text-xs text-gray-400">
            {errorsCount === 0 ? 'No errors' : 'Error count'}
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-300">Avg Response</h4>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {responseTime.toFixed(0)}ms
          </div>
          <div className="text-xs text-gray-400">Average time</div>
        </div>
      </div>

      {/* Status Alerts */}
      <div className="space-y-3">
        {quotaPercentage >= 90 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <h4 className="text-red-300 font-medium">Critical: Quota Nearly Exhausted</h4>
              <p className="text-red-400 text-sm">
                API quota is at {quotaPercentage.toFixed(1)}%. Consider reducing scan frequency.
              </p>
            </div>
          </motion.div>
        )}

        {quotaPercentage >= 75 && quotaPercentage < 90 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <h4 className="text-yellow-300 font-medium">Warning: High Quota Usage</h4>
              <p className="text-yellow-400 text-sm">
                API quota is at {quotaPercentage.toFixed(1)}%. Monitor usage carefully.
              </p>
            </div>
          </motion.div>
        )}

        {errorsCount > 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
          >
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <h4 className="text-red-300 font-medium">High Error Rate Detected</h4>
              <p className="text-red-400 text-sm">
                {errorsCount} errors occurred today. Check API configuration and network connectivity.
              </p>
            </div>
          </motion.div>
        )}

        {quotaPercentage < 50 && errorsCount === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
          >
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <h4 className="text-green-300 font-medium">All Systems Operational</h4>
              <p className="text-green-400 text-sm">
                API is running smoothly with no errors and healthy quota usage.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-300">Quick Actions</h4>
          <div className="flex space-x-2">
            <button className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded transition-colors">
              View Logs
            </button>
            <button
              onClick={handleForceScan}
              disabled={isScanning}
              className="text-xs bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded transition-colors"
            >
              {isScanning ? 'Scanning...' : 'Force Scan'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default APIMonitor