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