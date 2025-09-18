export interface Video {
  id: string;
  video_id: string;
  title: string;
  channel_name: string;
  thumbnail_url: string;
  url: string;
  publish_time: string;
  category: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  viral_score?: number;
  view_velocity?: number;
  region?: string;
  country_name?: string;
  is_viral?: boolean;
  is_trending?: boolean;
  trending_rank?: number;
  created_at: string;
  age_minutes: number;
  views_per_minute: number;
  niche: string;
}

export interface ApiUsage {
  quota_used: number;
  quota_limit: number;
  search_queries: number;
  scan_sessions: number;
}
