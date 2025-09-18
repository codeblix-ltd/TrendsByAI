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