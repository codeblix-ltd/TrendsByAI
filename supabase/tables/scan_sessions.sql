CREATE TABLE scan_sessions (
    id VARCHAR(255) PRIMARY KEY,
    scan_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'running',
    total_videos INTEGER DEFAULT 0,
    total_categories INTEGER DEFAULT 0,
    quota_consumed INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);