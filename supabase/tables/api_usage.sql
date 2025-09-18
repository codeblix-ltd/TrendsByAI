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