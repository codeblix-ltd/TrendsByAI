CREATE TABLE viral_trends (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(255),
    trend_score DECIMAL(10,2) NOT NULL,
    trend_velocity DECIMAL(10,2),
    trend_category VARCHAR(100),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    peak_views INTEGER,
    growth_rate DECIMAL(10,4),
    is_trending BOOLEAN DEFAULT FALSE,
    trend_rank INTEGER
);