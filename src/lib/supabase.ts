import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nckesiywrprkozozuucq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ja2VzaXl3cnBya296b3p1dWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTgxMDcsImV4cCI6MjA3Mzc3NDEwN30.mbEKgNeD3F1YqLixgenuBjlegHj-UcBIS5h-JRAU860'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Video {
  id: string
  video_id: string
  title: string
  description?: string
  channel_title: string
  channel_name?: string
  thumbnail_url?: string
  video_url: string
  url?: string
  published_at: string
  publish_time?: string
  category?: string
  region_code?: string
  country_name?: string
  view_count: number
  like_count: number
  comment_count: number
  engagement_rate: number
  viral_score: number
  view_velocity: number
  velocity_score?: number
  views_per_minute?: number
  age_minutes?: number
  duration_seconds?: number
  overall_score: number
  is_trending: boolean
  is_viral: boolean
  trending_rank?: number
  age_hours?: number
  search_query?: string
  platform?: string
  hashtags?: string[]
  tags?: string[]
  created_at: string
  updated_at: string
  last_updated?: string
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