import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nckesiywrprkozozuucq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ja2VzaXl3cnBya296b3p1dWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTgxMDcsImV4cCI6MjA3Mzc3NDEwN30.mbEKgNeD3F1YqLixgenuBjlegHj-UcBIS5h-JRAU860'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Video {
  id: string
  video_id: string
  platform: string
  title: string
  description?: string
  channel_name: string
  channel_id?: string
  url: string
  view_count: number
  like_count: number
  comment_count: number
  engagement_rate: number
  thumbnail_url?: string
  publish_time: string
  duration_seconds?: number
  language?: string
  category?: string
  niche?: string
  age_minutes: number
  views_per_minute: number
  velocity_score: number
  novelty_score: number
  title_quality_score: number
  seo_score: number
  overall_score: number
  is_trending: boolean
  hashtags?: string[]
  tags?: string[]
  created_at: string
  last_updated: string
}

export interface ApiUsage {
  id: string
  date: string
  service: string
  quota_used: number
  quota_limit: number
  requests_count: number
  cached_responses: number
  errors_count: number
  response_time_avg: number
  created_at: string
  updated_at: string
}

export interface ScanSession {
  id: string
  platform: string
  scan_type: string
  status: string
  videos_found: number
  videos_processed: number
  api_calls_used: number
  errors_count: number
  started_at: string
  completed_at?: string
}