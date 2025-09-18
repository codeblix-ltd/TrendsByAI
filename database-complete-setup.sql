-- AI Video Trend Watcher - Complete Database Setup
-- Generated: 09/18/2025 19:54:06
-- Project ID: nckesiywrprkozozuucq
-- 
-- INSTRUCTIONS:
-- 1. Go to https://supabase.com/dashboard/project/nckesiywrprkozozuucq/sql
-- 2. Copy and paste this entire script
-- 3. Click "Run" to execute
-- 4. Verify all tables are created in the Tables tab

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- =============================================================================
-- MIGRATIONS
-- =============================================================================

-- Migration: 1754975839_configure_youtube_api_key.sql
-- Migration: configure_youtube_api_key
-- Created at: 1754975839

-- Configure YouTube API key in edge function secrets
-- This will set the environment variable for edge functions
DO $$
BEGIN
  -- Note: This is a placeholder query since we can't directly set secrets via SQL
  -- The actual YouTube API key needs to be configured in Supabase dashboard
  RAISE NOTICE 'YouTube API Key needs to be configured in Supabase Project Settings > Edge Functions';
END $$;;

-- Migration: 1754976350_setup_youtube_api_integration.sql
-- Migration: setup_youtube_api_integration
-- Created at: 1754976350

-- Setup YouTube API integration with environment configuration
-- Note: The actual YouTube API key needs to be set in Supabase Project Settings > Edge Functions
-- This migration creates a configuration table to track API setup status

CREATE TABLE IF NOT EXISTS api_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  last_configured TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert YouTube API configuration record
INSERT INTO api_configuration (service, status, notes) 
VALUES ('youtube', 'configured', 'YouTube API key configured: AIzaSyA1NEXLmZzYIR_N7t-W8SHUq1DLe8WjJYE')
ON CONFLICT (service) DO UPDATE SET
  status = 'configured',
  last_configured = NOW(),
  notes = 'YouTube API key configured: AIzaSyA1NEXLmZzYIR_N7t-W8SHUq1DLe8WjJYE';

-- Create a function to check API configuration
CREATE OR REPLACE FUNCTION get_api_configuration(service_name TEXT)
RETURNS TABLE(service TEXT, status TEXT, last_configured TIMESTAMP WITH TIME ZONE, notes TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    api_configuration.service::TEXT,
    api_configuration.status::TEXT,
    api_configuration.last_configured,
    api_configuration.notes::TEXT
  FROM api_configuration 
  WHERE api_configuration.service = service_name;
END;
$$;;

-- Migration: 1754983794_add_global_viral_columns.sql
-- Migration: add_global_viral_columns
-- Created at: 1754983794

-- Add columns for global search and viral detection
ALTER TABLE video_scans ADD COLUMN IF NOT EXISTS region_code VARCHAR(5) DEFAULT 'US';
ALTER TABLE video_scans ADD COLUMN IF NOT EXISTS country_name VARCHAR(100);
ALTER TABLE video_scans ADD COLUMN IF NOT EXISTS viral_score NUMERIC DEFAULT 0;
ALTER TABLE video_scans ADD COLUMN IF NOT EXISTS view_velocity NUMERIC DEFAULT 0;
ALTER TABLE video_scans ADD COLUMN IF NOT EXISTS trending_rank INTEGER DEFAULT 0;
ALTER TABLE video_scans ADD COLUMN IF NOT EXISTS is_viral BOOLEAN DEFAULT FALSE;

-- Add index for better query performance on new columns
CREATE INDEX IF NOT EXISTS idx_video_scans_viral_score ON video_scans(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_video_scans_region ON video_scans(region_code);
CREATE INDEX IF NOT EXISTS idx_video_scans_trending ON video_scans(is_viral, trending_rank);;

-- Migration: 1754990328_configure_youtube_api_key_for_trendai.sql
-- Migration: configure_youtube_api_key_for_trendai
-- Created at: 1754990328

-- Set the YouTube API key for TrendAI backend
-- This enables the edge function to access YouTube Data API v3
-- Key: AIzaSyB_KlEaUYdEPTKqrC6jl5DHy5DftcVq_1k

-- Create a settings table to store configuration
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key_name TEXT UNIQUE NOT NULL,
    key_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the YouTube API key
INSERT INTO app_settings (key_name, key_value, description) 
VALUES ('youtube_api_key', 'AIzaSyB_KlEaUYdEPTKqrC6jl5DHy5DftcVq_1k', 'YouTube Data API v3 key for TrendAI video fetching')
ON CONFLICT (key_name) 
DO UPDATE SET 
    key_value = EXCLUDED.key_value,
    updated_at = NOW();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key_name ON app_settings(key_name);;

-- Migration: 1755068446_create_email_alert_system_tables.sql
-- Migration: create_email_alert_system_tables
-- Created at: 1755068446

-- Subscribers table for email alerts
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  preferences JSONB DEFAULT '{"content_type": "both", "frequency": "realtime", "threshold": "moderate"}',
  verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_alert_sent TIMESTAMP
);

-- Enhanced videos table for trend analysis
CREATE TABLE IF NOT EXISTS enhanced_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  url TEXT NOT NULL,
  duration_seconds INTEGER,
  type TEXT CHECK (type IN ('Short', 'Long')),
  published_at TIMESTAMP,
  tags TEXT[],
  current_views INTEGER DEFAULT 0,
  current_likes INTEGER DEFAULT 0,
  current_comments INTEGER DEFAULT 0,
  trend_score DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Video snapshots for time-series analysis
CREATE TABLE IF NOT EXISTS video_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_uuid UUID NOT NULL,
  snapshot_timestamp TIMESTAMP DEFAULT NOW(),
  views INTEGER,
  likes INTEGER,
  comments INTEGER,
  views_per_hour DECIMAL,
  engagement_percent DECIMAL,
  trend_score DECIMAL,
  rank_position INTEGER
);

-- Email alerts log
CREATE TABLE IF NOT EXISTS email_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL,
  video_uuid UUID NOT NULL,
  alert_type TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  brief_generated JSONB
);

-- Spike detections tracking
CREATE TABLE IF NOT EXISTS spike_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_uuid UUID NOT NULL,
  detection_timestamp TIMESTAMP DEFAULT NOW(),
  spike_type TEXT,
  velocity_increase DECIMAL,
  engagement_threshold_met BOOLEAN,
  score_improvement DECIMAL,
  rank_jump INTEGER,
  notification_sent BOOLEAN DEFAULT false
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_enhanced_videos_video_id ON enhanced_videos(video_id);
CREATE INDEX IF NOT EXISTS idx_video_snapshots_video_uuid ON video_snapshots(video_uuid);
CREATE INDEX IF NOT EXISTS idx_video_snapshots_timestamp ON video_snapshots(snapshot_timestamp);
CREATE INDEX IF NOT EXISTS idx_email_alerts_subscriber_id ON email_alerts(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_spike_detections_video_uuid ON spike_detections(video_uuid);
CREATE INDEX IF NOT EXISTS idx_spike_detections_timestamp ON spike_detections(detection_timestamp);;

-- =============================================================================
-- TABLES
-- =============================================================================

-- Table: alerts.sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    video_id UUID,
    triggered_by JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: api_quotas.sql
CREATE TABLE api_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_name VARCHAR(50) NOT NULL,
    quota_limit INTEGER NOT NULL,
    quota_used INTEGER DEFAULT 0,
    quota_remaining INTEGER DEFAULT 0,
    reset_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active',
    last_error TEXT,
    rate_limit_info JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: api_usage.sql
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    service VARCHAR(100) NOT NULL,
    quota_used INTEGER DEFAULT 0,
    quota_limit INTEGER DEFAULT 10000,
    requests_count INTEGER DEFAULT 0,
    cached_responses INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    response_time_avg DECIMAL(8,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: api_usage_tracking.sql
CREATE TABLE api_usage_tracking (
    id SERIAL PRIMARY KEY,
    api_name VARCHAR(100) NOT NULL,
    quota_used INTEGER DEFAULT 0,
    quota_limit INTEGER DEFAULT 10000,
    reset_date DATE,
    last_request_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    requests_count INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0
);

-- Table: custom_searches.sql
CREATE TABLE custom_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    search_term VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'custom',
    user_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_scanned_at TIMESTAMP WITH TIME ZONE,
    scan_frequency_hours INTEGER DEFAULT 6
);

-- Table: filter_presets.sql
CREATE TABLE filter_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    filters JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: generated_prompts.sql
CREATE TABLE generated_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    video_id UUID NOT NULL,
    prompt_text TEXT NOT NULL,
    prompt_type VARCHAR(50) NOT NULL,
    niche VARCHAR(100),
    style_elements JSONB DEFAULT '{}',
    seo_pack JSONB DEFAULT '{}',
    generation_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: profiles.sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    scan_interval INTEGER DEFAULT 15,
    notification_preferences JSONB DEFAULT '{}',
    ui_preferences JSONB DEFAULT '{}',
    api_quotas JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: scan_history.sql
CREATE TABLE scan_history (
    id SERIAL PRIMARY KEY,
    scan_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    categories_scanned TEXT[],
    total_videos_found INTEGER DEFAULT 0,
    api_quota_used INTEGER DEFAULT 0,
    scan_duration_seconds INTEGER,
    success_rate DECIMAL(5,2) DEFAULT 100.0,
    errors_encountered TEXT[],
    scan_type VARCHAR(50) DEFAULT 'scheduled'
);

-- Table: scan_sessions.sql
CREATE TABLE scan_sessions (
    id VARCHAR(255) PRIMARY KEY,
    scan_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'running',
    total_videos INTEGER DEFAULT 0,
    total_categories INTEGER DEFAULT 0,
    quota_consumed INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: search_sessions.sql
CREATE TABLE search_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_type TEXT NOT NULL,
    search_category TEXT,
    custom_query TEXT,
    api_key_used TEXT,
    videos_found INTEGER DEFAULT 0,
    api_quota_used INTEGER DEFAULT 0,
    region_searched TEXT,
    search_status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Table: user_preferences.sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    preferred_categories TEXT[],
    notification_keywords TEXT[],
    scan_frequency VARCHAR(50) DEFAULT 'daily',
    email_notifications BOOLEAN DEFAULT TRUE,
    dashboard_layout JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: user_watchlists.sql
CREATE TABLE user_watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    video_ids UUID[],
    filters JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: video_metrics_history.sql
CREATE TABLE video_metrics_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id VARCHAR(255) NOT NULL,
    views BIGINT NOT NULL,
    likes BIGINT NOT NULL,
    comments BIGINT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    velocity DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: video_rankings.sql
CREATE TABLE video_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL,
    scan_session_id UUID NOT NULL,
    rank_position INTEGER,
    section VARCHAR(50),
    view_count BIGINT,
    like_count BIGINT,
    comment_count BIGINT,
    overall_score DECIMAL(5,4),
    velocity_score DECIMAL(5,4),
    engagement_rate DECIMAL(5,4),
    age_minutes INTEGER,
    snapshot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: video_scans.sql
CREATE TABLE video_scans (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(255) UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    channel_title VARCHAR(255),
    published_at TIMESTAMP,
    category VARCHAR(100) DEFAULT 'AI Horror',
    search_query TEXT,
    youtube_url TEXT,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    viral_score DECIMAL(10,2) DEFAULT 0.0,
    view_velocity DECIMAL(10,2) DEFAULT 0.0,
    region_code VARCHAR(10),
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: videos.sql
CREATE TABLE videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    channel_title TEXT,
    thumbnail_url TEXT,
    video_url TEXT,
    published_at TIMESTAMPTZ,
    category TEXT,
    region_code TEXT,
    country_name TEXT,
    view_count BIGINT DEFAULT 0,
    like_count BIGINT DEFAULT 0,
    comment_count BIGINT DEFAULT 0,
    viral_score NUMERIC DEFAULT 0,
    view_velocity NUMERIC DEFAULT 0,
    is_viral BOOLEAN DEFAULT FALSE,
    trending_rank INTEGER,
    age_hours INTEGER,
    search_query TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: viral_trends.sql
CREATE TABLE viral_trends (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(255),
    trend_score DECIMAL(10,2) NOT NULL,
    trend_velocity DECIMAL(10,2),
    trend_category VARCHAR(100),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    peak_views INTEGER,
    growth_rate DECIMAL(10,4),
    is_trending BOOLEAN DEFAULT FALSE,
    trend_rank INTEGER
);

-- =============================================================================
-- FINAL SETUP
-- =============================================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_scans_video_id ON video_scans(video_id);
CREATE INDEX IF NOT EXISTS idx_video_scans_category ON video_scans(category);
CREATE INDEX IF NOT EXISTS idx_video_scans_scanned_at ON video_scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_scan_timestamp ON scan_history(scan_timestamp);

-- Insert initial configuration data
INSERT INTO api_configuration (service, status, notes) 
VALUES ('youtube', 'configured', 'YouTube API integration ready')
ON CONFLICT (service) DO UPDATE SET
  status = 'configured',
  last_configured = NOW(),
  notes = 'YouTube API integration ready';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 AI Video Trend Watcher database setup completed successfully!';
  RAISE NOTICE '📊 Tables created, indexes added, and initial data inserted.';
  RAISE NOTICE '🔗 Visit the Tables tab to verify all tables are present.';
END $$;

