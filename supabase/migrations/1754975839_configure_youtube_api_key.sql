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