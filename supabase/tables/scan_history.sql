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