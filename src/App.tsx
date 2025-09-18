import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import StatsDashboard from './components/StatsDashboard'
import VideoTable from './components/VideoTable'
import TrendingVideos from './components/TrendingVideos'
import SEOPackModal from './components/SEOPackModal'
import APIMonitor from './components/APIMonitor'
import { useVideos, useStats, useSEOGenerator } from './hooks/useData'
import { Video } from './lib/supabase'
import { AlertCircle, Loader2 } from 'lucide-react'

// Create a client
const queryClient = new QueryClient()

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [seoModalOpen, setSeoModalOpen] = useState(false)
  const [seoData, setSeoData] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { videos, loading, error, refreshData, refetch } = useVideos()
  const stats = useStats(videos)
  const { generateSEOPack, loading: seoLoading } = useSEOGenerator()

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await refreshData()
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExport = () => {
    // Export functionality
    const dataStr = JSON.stringify(videos, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ai-video-trends-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleGenerateSEO = async (video: Video) => {
    try {
      setSelectedVideo(video)
      setSeoModalOpen(true)
      setSeoData(null)
      
      const result = await generateSEOPack(video)
      setSeoData(result)
    } catch (error) {
      console.error('SEO generation failed:', error)
    }
  }

  const closeSEOModal = () => {
    setSeoModalOpen(false)
    setSelectedVideo(null)
    setSeoData(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading AI Video Trends</h2>
          <p className="text-gray-400">Analyzing the latest data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-cyan-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Header
          onRefresh={handleRefresh}
          onExport={handleExport}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isRefreshing}
        />

        <main className="p-6 space-y-8">
          {/* Stats Dashboard */}
          <StatsDashboard stats={stats} />

          {/* Trending Videos Section */}
          <TrendingVideos videos={videos} />

          {/* API Monitor */}
          <APIMonitor onRefresh={refetch} />

          {/* Video Table */}
          <VideoTable
            videos={videos}
            onGenerateSEO={handleGenerateSEO}
            searchQuery={searchQuery}
          />
        </main>
      </div>

      {/* SEO Pack Modal */}
      <SEOPackModal
        isOpen={seoModalOpen}
        onClose={closeSEOModal}
        video={selectedVideo}
        seoData={seoData}
        isLoading={seoLoading}
      />

      {/* Refresh Loading Overlay */}
      {isRefreshing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center"
        >
          <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-xl p-6 flex items-center space-x-4">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            <div>
              <h3 className="text-white font-semibold">Refreshing Data</h3>
              <p className="text-gray-400 text-sm">Fetching latest trending videos...</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App