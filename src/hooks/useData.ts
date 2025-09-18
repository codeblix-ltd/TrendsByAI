import { useState, useEffect } from 'react'
import { supabase, Video } from '../lib/supabase'

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('videos')
        .select('*')
        .order('overall_score', { ascending: false })
        .limit(100)

      if (fetchError) {
        throw fetchError
      }

      setVideos(data || [])
    } catch (err) {
      console.error('Error fetching videos:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch videos')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    try {
      setError(null)
      
      // Call the YouTube data fetcher
      const { data, error } = await supabase.functions.invoke('youtube-data-fetcher', {
        body: {
          keywords: ['AI News', 'ChatGPT', 'Machine Learning', 'AI Tools', 'Artificial Intelligence'],
          maxResults: 25,
          scanType: 'manual_refresh'
        }
      })

      if (error) {
        console.warn('Edge function error:', error)
        // Don't throw error here, just log it and continue with existing data
        setError('API refresh had issues, showing cached data')
      }

      // Always refresh the local data after API call (successful or not)
      await fetchVideos()
      
      return data
    } catch (err) {
      console.error('Error refreshing data:', err)
      // Try to fetch existing data instead of failing completely
      await fetchVideos()
      setError('Using cached data - API temporarily unavailable')
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  return {
    videos,
    loading,
    error,
    refreshData,
    refetch: fetchVideos
  }
}

export const useStats = (videos: Video[]) => {
  const stats = {
    totalVideos: videos.length,
    totalViews: videos.reduce((sum, video) => sum + video.view_count, 0),
    avgEngagement: videos.length > 0 
      ? videos.reduce((sum, video) => sum + video.engagement_rate, 0) / videos.length 
      : 0,
    trendingCount: videos.filter(video => video.is_trending).length,
    topVelocity: videos.length > 0 
      ? Math.max(...videos.map(video => video.views_per_minute))
      : 0,
    avgScore: videos.length > 0
      ? videos.reduce((sum, video) => sum + video.overall_score, 0) / videos.length
      : 0
  }

  return stats
}

export const useSEOGenerator = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSEOPack = async (video: Video, targetKeywords: string[] = []) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: generateError } = await supabase.functions.invoke('seo-pack-generator', {
        body: {
          videoData: {
            title: video.title,
            description: video.description,
            tags: [], // Add tags if available
            channel: video.channel_name,
            views: video.view_count,
            likes: video.like_count,
            comments: video.comment_count,
            engagement_rate: video.engagement_rate
          },
          targetKeywords,
          platform: video.platform
        }
      })

      if (generateError) {
        throw new Error(generateError.message || 'Failed to generate SEO pack')
      }

      return data
    } catch (err) {
      console.error('Error generating SEO pack:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate SEO pack'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    generateSEOPack,
    loading,
    error
  }
}