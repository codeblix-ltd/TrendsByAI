Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        console.log('=== TrendAI Spike Detection System ===');
        
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        
        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }
        
        // Get current video data from the existing AI storytelling function
        const videosResponse = await fetch(`${supabaseUrl}/functions/v1/ai-storytelling-enhanced`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        
        if (!videosResponse.ok) {
            throw new Error('Failed to fetch current videos');
        }
        
        const videosData = await videosResponse.json();
        const currentVideos = videosData.data?.videos || [];
        
        console.log(`Processing ${currentVideos.length} videos for spike detection`);
        
        const detectedSpikes = [];
        
        for (const video of currentVideos) {
            try {
                // Check if this video already exists in enhanced_videos
                const existingVideoResponse = await fetch(
                    `${supabaseUrl}/rest/v1/enhanced_videos?video_id=eq.${encodeURIComponent(video.id)}&select=*`, 
                    {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    }
                );
                
                const existingVideoData = await existingVideoResponse.json();
                const existingVideo = existingVideoData[0];
                
                // Determine video type based on URL or duration
                const isShort = video.url?.includes('shorts') || (video.duration && video.duration < 60);
                const videoType = isShort ? 'Short' : 'Long';
                
                // Calculate engagement metrics
                const views = video.view_count || 0;
                const likes = video.like_count || 0;
                const comments = video.comment_count || 0;
                const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
                
                // Calculate trend score (0-1 scale)
                const trendScore = Math.min(1.0, (
                    (video.engagement_score || 0) / 100 + 
                    Math.min(engagementRate / 10, 0.3) +
                    Math.min(views / 1000000, 0.4)
                ));
                
                // Upsert video in enhanced_videos table
                const videoData = {
                    video_id: video.id,
                    title: video.title,
                    channel_name: video.channel_name,
                    url: video.url,
                    duration_seconds: video.duration || null,
                    type: videoType,
                    published_at: video.publish_time ? new Date(video.publish_time).toISOString() : null,
                    tags: video.category ? [video.category] : [],
                    current_views: views,
                    current_likes: likes,
                    current_comments: comments,
                    trend_score: trendScore
                };
                
                await fetch(`${supabaseUrl}/rest/v1/enhanced_videos`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates'
                    },
                    body: JSON.stringify(videoData)
                });
                
                // Create snapshot for trend analysis
                const hoursPublished = video.days_since_published ? video.days_since_published * 24 : 24;
                const viewsPerHour = hoursPublished > 0 ? views / hoursPublished : 0;
                
                const snapshotData = {
                    video_uuid: video.id,
                    snapshot_timestamp: new Date().toISOString(),
                    views: views,
                    likes: likes,
                    comments: comments,
                    views_per_hour: viewsPerHour,
                    engagement_percent: engagementRate,
                    trend_score: trendScore,
                    rank_position: currentVideos.indexOf(video) + 1
                };
                
                await fetch(`${supabaseUrl}/rest/v1/video_snapshots`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(snapshotData)
                });
                
                // Spike Detection Algorithm
                let spikeDetected = false;
                let spikeReasons = [];
                
                // 1. Engagement Threshold Check
                const engagementThreshold = videoType === 'Short' ? 2.5 : 1.2;
                if (engagementRate >= engagementThreshold) {
                    spikeDetected = true;
                    spikeReasons.push(`High engagement: ${engagementRate.toFixed(2)}% (threshold: ${engagementThreshold}%)`);
                }
                
                // 2. Trend Score Threshold
                if (trendScore > 0.72) {
                    spikeDetected = true;
                    spikeReasons.push(`High trend score: ${trendScore.toFixed(3)} (threshold: 0.72)`);
                }
                
                // 3. High velocity for recent videos
                if (viewsPerHour > 1000 && video.days_since_published < 1) {
                    spikeDetected = true;
                    spikeReasons.push(`High velocity: ${Math.round(viewsPerHour)} views/hour`);
                }
                
                // 4. Check for existing alerts to prevent spam
                if (spikeDetected) {
                    const recentAlertsResponse = await fetch(
                        `${supabaseUrl}/rest/v1/spike_detections?video_uuid=eq.${video.id}&detection_timestamp=gte.${new Date(Date.now() - 6*60*60*1000).toISOString()}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey
                            }
                        }
                    );
                    
                    const recentAlerts = await recentAlertsResponse.json();
                    
                    if (recentAlerts.length === 0) {
                        // Record spike detection
                        const spikeData = {
                            video_uuid: video.id,
                            detection_timestamp: new Date().toISOString(),
                            spike_type: spikeReasons.join('; '),
                            velocity_increase: viewsPerHour,
                            engagement_threshold_met: engagementRate >= engagementThreshold,
                            score_improvement: trendScore,
                            rank_jump: 0, // Would need historical data for this
                            notification_sent: false
                        };
                        
                        await fetch(`${supabaseUrl}/rest/v1/spike_detections`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(spikeData)
                        });
                        
                        detectedSpikes.push({
                            video: video,
                            reasons: spikeReasons,
                            metrics: {
                                views: views,
                                engagement_rate: engagementRate,
                                trend_score: trendScore,
                                views_per_hour: viewsPerHour
                            }
                        });
                        
                        console.log(`🚨 SPIKE DETECTED: ${video.title} - ${spikeReasons.join(', ')}`);
                    }
                }
                
            } catch (videoError) {
                console.error(`Error processing video ${video.id}:`, videoError);
            }
        }
        
        // Trigger notifications for detected spikes
        if (detectedSpikes.length > 0) {
            console.log(`Triggering notifications for ${detectedSpikes.length} spikes...`);
            
            try {
                const notificationResponse = await fetch(`${supabaseUrl}/functions/v1/notification-system`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ spikes: detectedSpikes })
                });
                
                if (notificationResponse.ok) {
                    const notifData = await notificationResponse.json();
                    console.log(`Notifications created: ${notifData.data?.notifications_created || 0}`);
                } else {
                    console.error('Failed to create notifications');
                }
            } catch (notificationError) {
                console.error('Error creating notifications:', notificationError);
            }
        }
        
        return new Response(JSON.stringify({
            data: {
                spikes_detected: detectedSpikes.length,
                videos_processed: currentVideos.length,
                spikes: detectedSpikes.map(spike => ({
                    video_title: spike.video.title,
                    reasons: spike.reasons,
                    metrics: spike.metrics
                }))
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Spike detection error:', error);
        
        const errorResponse = {
            error: {
                code: 'SPIKE_DETECTION_FAILED',
                message: error.message
            }
        };
        
        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});