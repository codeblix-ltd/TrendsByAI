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