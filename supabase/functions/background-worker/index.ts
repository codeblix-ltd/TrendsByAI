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
        console.log('=== TrendAI Background Worker Pipeline ===');
        console.log('Starting comprehensive monitoring cycle...');
        
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        
        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }
        
        const results = {
            rss_ingest: { status: 'pending', videos_processed: 0 },
            spike_detection: { status: 'pending', spikes_found: 0 },
            email_alerts: { status: 'pending', emails_sent: 0 },
            cleanup: { status: 'pending', records_cleaned: 0 }
        };
        
        // Step 1: RSS Ingest and Data Enrichment
        console.log('Step 1: RSS Ingest and Data Enrichment');
        try {
            const rssResponse = await fetch(`${supabaseUrl}/functions/v1/ai-storytelling-enhanced`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            
            if (rssResponse.ok) {
                const rssData = await rssResponse.json();
                results.rss_ingest.status = 'completed';
                results.rss_ingest.videos_processed = rssData.data?.videos?.length || 0;
                console.log(`✅ RSS Ingest: ${results.rss_ingest.videos_processed} videos processed`);
            } else {
                throw new Error('RSS ingest failed');
            }
        } catch (error) {
            results.rss_ingest.status = 'failed';
            results.rss_ingest.error = error.message;
            console.error('❌ RSS Ingest failed:', error);
        }
        
        // Step 2: Spike Detection Algorithm
        console.log('Step 2: Spike Detection Algorithm');
        try {
            const spikeResponse = await fetch(`${supabaseUrl}/functions/v1/spike-detection`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            
            if (spikeResponse.ok) {
                const spikeData = await spikeResponse.json();
                results.spike_detection.status = 'completed';
                results.spike_detection.spikes_found = spikeData.data?.spikes_detected || 0;
                console.log(`✅ Spike Detection: ${results.spike_detection.spikes_found} spikes found`);
            } else {
                throw new Error('Spike detection failed');
            }
        } catch (error) {
            results.spike_detection.status = 'failed';
            results.spike_detection.error = error.message;
            console.error('❌ Spike Detection failed:', error);
        }
        
        // Step 3: Data Cleanup and Archiving
        console.log('Step 3: Data Cleanup and Archiving');
        try {
            // Clean up old snapshots (keep last 30 days)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            
            const cleanupResponse = await fetch(
                `${supabaseUrl}/rest/v1/video_snapshots?snapshot_timestamp=lt.${thirtyDaysAgo}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                }
            );
            
            results.cleanup.status = 'completed';
            console.log('✅ Data Cleanup: Old snapshots removed');
        } catch (error) {
            results.cleanup.status = 'failed';
            results.cleanup.error = error.message;
            console.error('❌ Data Cleanup failed:', error);
        }
        
        // Step 4: Health Check and Monitoring
        console.log('Step 4: Health Check and Monitoring');
        const healthCheck = {
            timestamp: new Date().toISOString(),
            pipeline_status: 'healthy',
            total_subscribers: 0,
            total_videos: 0,
            recent_alerts: 0
        };
        
        try {
            // Count subscribers
            const subscribersResponse = await fetch(`${supabaseUrl}/rest/v1/subscribers?select=count`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Prefer': 'count=exact'
                }
            });
            
            if (subscribersResponse.ok) {
                const count = subscribersResponse.headers.get('content-range');
                healthCheck.total_subscribers = count ? parseInt(count.split('/')[1]) : 0;
            }
            
            // Count videos
            const videosResponse = await fetch(`${supabaseUrl}/rest/v1/enhanced_videos?select=count`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Prefer': 'count=exact'
                }
            });
            
            if (videosResponse.ok) {
                const count = videosResponse.headers.get('content-range');
                healthCheck.total_videos = count ? parseInt(count.split('/')[1]) : 0;
            }
            
            // Count recent alerts (last 24 hours)
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const alertsResponse = await fetch(
                `${supabaseUrl}/rest/v1/email_alerts?sent_at=gte.${twentyFourHoursAgo}&select=count`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Prefer': 'count=exact'
                    }
                }
            );
            
            if (alertsResponse.ok) {
                const count = alertsResponse.headers.get('content-range');
                healthCheck.recent_alerts = count ? parseInt(count.split('/')[1]) : 0;
            }
            
        } catch (healthError) {
            console.error('Health check error:', healthError);
            healthCheck.pipeline_status = 'degraded';
        }
        
        console.log('=== Pipeline Cycle Complete ===');
        console.log('Results:', results);
        console.log('Health:', healthCheck);
        
        return new Response(JSON.stringify({
            data: {
                pipeline_results: results,
                health_check: healthCheck,
                execution_time: new Date().toISOString(),
                next_execution: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Background worker error:', error);
        
        const errorResponse = {
            error: {
                code: 'BACKGROUND_WORKER_FAILED',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        };
        
        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});