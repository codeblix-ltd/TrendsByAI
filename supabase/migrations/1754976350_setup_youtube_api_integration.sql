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
VALUES ('youtube', 'configured', 'YouTube API key configured: AIzaSyBLfyxwWCE7WVeNS07GzupDtI6eAz1XniM')
ON CONFLICT (service) DO UPDATE SET
  status = 'configured',
  last_configured = NOW(),
  notes = 'YouTube API key configured: AIzaSyBLfyxwWCE7WVeNS07GzupDtI6eAz1XniM';

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