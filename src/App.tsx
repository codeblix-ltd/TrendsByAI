import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import NewHeader from './components/ui/NewHeader'
import Dashboard from './components/ui/Dashboard'
import SEOPackModal from './components/SEOPackModal'
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
      <div className="min-h-screen bg-[#0D0F18] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <div className="text-xl font-bold">Loading TrendAI...</div>
          <div className="text-gray-400">Scanning worldwide content...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0F18] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-[#0D0F18] bg-cover bg-center p-4 sm:p-6 lg:p-8"
      style={{ backgroundImage: 'url(https://i.pinimg.com/originals/5d/56/99/5d56993d543ac6735b31ee3e4ac29d95.gif)' }}
    >
      <div className="max-w-[1920px] mx-auto">
        <NewHeader
          onRefresh={handleRefresh}
          onExport={handleExport}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isRefreshing}
        />

        <main className="mt-8">
          <Dashboard
            videos={videos}
            stats={stats}
            searchQuery={searchQuery}
            onRefresh={handleRefresh}
            onGenerateSEO={handleGenerateSEO}
            isRefreshing={isRefreshing}
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center space-x-4 shadow-2xl shadow-black/20">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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