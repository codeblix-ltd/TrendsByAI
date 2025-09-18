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