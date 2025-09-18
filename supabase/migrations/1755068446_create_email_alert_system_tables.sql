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