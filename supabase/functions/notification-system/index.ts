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
        const { spikes } = await req.json();
        
        console.log('Processing notifications for', spikes?.length || 0, 'spikes');
        
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        
        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }
        
        // Get all verified subscribers with notifications enabled
        const subscribersResponse = await fetch(
            `${supabaseUrl}/rest/v1/subscribers?verified=eq.true&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );
        
        if (!subscribersResponse.ok) {
            throw new Error('Failed to fetch subscribers');
        }
        
        const subscribers = await subscribersResponse.json();
        const activeSubscribers = subscribers.filter(sub => 
            sub.preferences?.notifications_enabled !== false
        );
        
        console.log(`Found ${activeSubscribers.length} active subscribers`);
        
        let notificationsCreated = 0;
        
        for (const spike of spikes) {
            const video = spike.video;
            const reasons = spike.reasons;
            const metrics = spike.metrics;
            
            // Generate smart template brief for this video
            let viralBrief = null;
            try {
                const briefResponse = await fetch(`${supabaseUrl}/functions/v1/smart-template-brief`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ video, reasons, metrics })
                });
                
                if (briefResponse.ok) {
                    const briefData = await briefResponse.json();
                    viralBrief = briefData.data;
                }
            } catch (briefError) {
                console.error('Brief generation failed:', briefError);
            }
            
            // Create notifications for matching subscribers
            for (const subscriber of activeSubscribers) {
                const preferences = subscriber.preferences || {};
                
                // Check content type preference
                const videoType = video.url?.includes('shorts') ? 'shorts' : 'long';
                if (preferences.content_type === 'shorts' && videoType !== 'shorts') continue;
                if (preferences.content_type === 'long' && videoType !== 'long') continue;
                
                // Check threshold preference
                const threshold = preferences.threshold || 'moderate';
                const scoreThreshold = {
                    'conservative': 0.85,
                    'moderate': 0.72,
                    'aggressive': 0.6
                }[threshold] || 0.72;
                
                if (metrics.trend_score < scoreThreshold) continue;
                
                // Check frequency (for rate limiting)
                const frequency = preferences.frequency || 'realtime';
                const now = new Date();
                const lastAlert = subscriber.last_alert_sent ? new Date(subscriber.last_alert_sent) : null;
                
                let shouldSend = true;
                if (frequency === 'hourly' && lastAlert) {
                    const hoursSince = (now.getTime() - lastAlert.getTime()) / (1000 * 60 * 60);
                    shouldSend = hoursSince >= 1;
                } else if (frequency === 'daily' && lastAlert) {
                    const daysSince = (now.getTime() - lastAlert.getTime()) / (1000 * 60 * 60 * 24);
                    shouldSend = daysSince >= 1;
                }
                
                if (!shouldSend) continue;
                
                // Generate notification content
                const notificationData = generateNotificationContent({
                    subscriber,
                    video,
                    metrics,
                    reasons,
                    viralBrief
                });
                
                // Save notification to database (acts as inbox for user)
                const alertRecord = {
                    subscriber_id: subscriber.id,
                    video_uuid: video.id,
                    alert_type: 'viral_spike',
                    sent_at: new Date().toISOString(),
                    brief_generated: {
                        notification_content: notificationData,
                        viral_brief: viralBrief,
                        spike_metrics: metrics,
                        spike_reasons: reasons,
                        video_info: {
                            title: video.title,
                            channel: video.channel_name,
                            url: video.url,
                            type: videoType
                        }
                    }
                };
                
                const saveResponse = await fetch(`${supabaseUrl}/rest/v1/email_alerts`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(alertRecord)
                });
                
                if (saveResponse.ok) {
                    notificationsCreated++;
                    
                    // Update subscriber's last alert timestamp
                    await fetch(
                        `${supabaseUrl}/rest/v1/subscribers?id=eq.${subscriber.id}`,
                        {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                last_alert_sent: new Date().toISOString()
                            })
                        }
                    );
                    
                    console.log(`🔔 NOTIFICATION CREATED for ${subscriber.email}:`);
                    console.log(`Title: ${notificationData.title}`);
                    console.log(`Message: ${notificationData.message}`);
                    console.log('---');
                }
            }
        }
        
        return new Response(JSON.stringify({
            data: {
                notifications_created: notificationsCreated,
                subscribers_count: activeSubscribers.length,
                spikes_processed: spikes.length,
                delivery_method: 'in_app_notifications',
                timestamp: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Notification system error:', error);
        
        const errorResponse = {
            error: {
                code: 'NOTIFICATION_SYSTEM_FAILED',
                message: error.message
            }
        };
        
        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

function generateNotificationContent({ subscriber, video, metrics, reasons, viralBrief }) {
    const hoursPublished = video.days_since_published ? video.days_since_published * 24 : 1;
    const viewsPerHour = Math.round(metrics.views_per_hour || (metrics.views / hoursPublished));
    const engagementPercent = metrics.engagement_rate || 0;
    const videoType = video.url?.includes('shorts') ? 'Short' : 'Long';
    
    // Generate dynamic notification based on performance
    let urgencyLevel = 'medium';
    let icon = '📈';
    
    if (metrics.trend_score > 0.9 || viewsPerHour > 10000) {
        urgencyLevel = 'high';
        icon = '🔥';
    } else if (metrics.trend_score > 0.8 || viewsPerHour > 5000) {
        urgencyLevel = 'medium';
        icon = '🚀';
    } else {
        urgencyLevel = 'low';
        icon = '⚡';
    }
    
    const title = `${icon} VIRAL SPIKE: ${video.title.substring(0, 50)}...`;
    
    const message = `${videoType} is spiking! ${Math.round(metrics.views/1000)}K views, ${engagementPercent.toFixed(1)}% engagement, ${viewsPerHour} views/hr`;
    
    const briefSummary = viralBrief ? 
        `Brief: ${viralBrief.brief?.mechanics?.hook_pattern?.substring(0, 100) || 'AI content pattern detected'}...` :
        'High-engagement AI content trending now';
    
    return {
        title,
        message,
        briefSummary,
        urgencyLevel,
        icon,
        actionUrl: video.url,
        createdAt: new Date().toISOString(),
        performance: {
            views: metrics.views,
            engagement: engagementPercent,
            velocity: viewsPerHour,
            trend_score: metrics.trend_score
        },
        reasons: reasons
    };
}