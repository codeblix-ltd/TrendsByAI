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
        console.log('Starting daily YouTube scan...');

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Check API quota before starting
        const today = new Date().toISOString().split('T')[0];
        const usageResponse = await fetch(`${supabaseUrl}/rest/v1/api_usage?date=eq.${today}&service=eq.youtube`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        let currentUsage = 0;
        if (usageResponse.ok) {
            const usageData = await usageResponse.json();
            currentUsage = usageData[0]?.quota_used || 0;
        }

        const quotaLimit = 10000;
        const remainingQuota = quotaLimit - currentUsage;
        
        console.log(`Current API usage: ${currentUsage}/${quotaLimit}, Remaining: ${remainingQuota}`);

        if (remainingQuota < 500) {
            console.log('Insufficient quota for daily scan, skipping...');
            return new Response(JSON.stringify({
                data: { 
                    status: 'skipped', 
                    reason: 'insufficient_quota',
                    remainingQuota 
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Define trending keywords to scan
        const trendingKeywords = [
            'AI News',
            'Machine Learning',
            'ChatGPT',
            'AI Tools',
            'Artificial Intelligence',
            'Deep Learning',
            'AI Tutorial',
            'AI Technology',
            'AI Innovation',
            'AI Breakthrough'
        ];

        // Invoke the YouTube data fetcher
        const fetchResponse = await fetch(`${supabaseUrl}/functions/v1/youtube-data-fetcher`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                keywords: trendingKeywords,
                maxResults: 15,
                scanType: 'daily_automated'
            })
        });

        if (!fetchResponse.ok) {
            const errorText = await fetchResponse.text();
            throw new Error(`YouTube data fetch failed: ${errorText}`);
        }

        const fetchResult = await fetchResponse.json();
        
        console.log('Daily scan completed:', fetchResult.data);

        // Clean up old data (keep last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        
        await fetch(`${supabaseUrl}/rest/v1/videos?created_at=lt.${thirtyDaysAgo}&is_trending=eq.false`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        await fetch(`${supabaseUrl}/rest/v1/video_metrics_history?recorded_at=lt.${thirtyDaysAgo}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const result = {
            data: {
                status: 'completed',
                timestamp: new Date().toISOString(),
                keywordsScanned: trendingKeywords.length,
                videosFound: fetchResult.data?.videosFound || 0,
                videosProcessed: fetchResult.data?.videosProcessed || 0,
                apiCallsUsed: fetchResult.data?.apiCallsUsed || 0,
                quotaRemaining: fetchResult.data?.quotaRemaining || remainingQuota,
                cleanupPerformed: true
            }
        };

        console.log('Daily cron job completed successfully:', result.data);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Daily scan cron job error:', error);

        const errorResponse = {
            error: {
                code: 'DAILY_SCAN_FAILED',
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