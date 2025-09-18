CREATE TABLE video_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL,
    scan_session_id UUID NOT NULL,
    rank_position INTEGER,
    section VARCHAR(50),
    view_count BIGINT,
    like_count BIGINT,
    comment_count BIGINT,
    overall_score DECIMAL(5,4),
    velocity_score DECIMAL(5,4),
    engagement_rate DECIMAL(5,4),
    age_minutes INTEGER,
    snapshot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);