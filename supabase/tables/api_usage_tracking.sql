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