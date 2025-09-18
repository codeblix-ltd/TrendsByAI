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
        console.log('Starting automated 6-hour comprehensive AI content scan...');
        
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase configuration missing for automated scan');
        }

        // Check current daily quota usage to ensure we don't exceed limits
        const today = new Date().toISOString().split('T')[0];
        const quotaCheckResponse = await fetch(`${supabaseUrl}/rest/v1/api_usage_tracking?scan_date=eq.${today}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey
            }
        });
        
        const quotaData = await quotaCheckResponse.json();
        const currentQuotaUsed = quotaData.length > 0 ? quotaData[0].quota_used || 0 : 0;
        
        console.log(`Current daily quota usage: ${currentQuotaUsed}/10,000 units`);
        
        // Skip scan if quota is too high (leave buffer for manual operations)
        if (currentQuotaUsed >= 8500) {
            console.log('Daily quota nearly exhausted, skipping automated scan');
            return new Response(JSON.stringify({
                success: false,
                reason: 'quota_limit_reached',
                message: 'Daily quota nearly exhausted, skipping automated scan to preserve quota for manual searches',
                quota_used: currentQuotaUsed,
                quota_limit: 10000,
                timestamp: new Date().toISOString()
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Calculate optimal scan configuration based on remaining quota
        const remainingQuota = 10000 - currentQuotaUsed;
        const conservativeQuota = Math.min(1500, remainingQuota - 1000); // Leave 1000 units buffer
        const maxVideosPerCategory = Math.max(5, Math.min(12, Math.floor(conservativeQuota / 200)));
        
        console.log(`Automated scan budget: ${conservativeQuota} units, max ${maxVideosPerCategory} videos per category`);

        // Call the comprehensive AI scanner with automated settings
        const scannerResponse = await fetch(`${supabaseUrl}/functions/v1/comprehensive-ai-scanner`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isAutomatedScan: true,
                maxVideosPerCategory: maxVideosPerCategory
            })
        });

        if (!scannerResponse.ok) {
            const errorText = await scannerResponse.text();
            throw new Error(`Comprehensive scanner failed: ${scannerResponse.status} - ${errorText}`);
        }

        const scanResult = await scannerResponse.json();
        
        if (scanResult.error) {
            throw new Error(`Scanner returned error: ${scanResult.error.message}`);
        }
        
        console.log('Automated comprehensive scan completed successfully:', {
            videos_discovered: scanResult.metadata?.total_unique_videos || 0,
            quota_used: scanResult.metadata?.quota_used || 0,
            categories_processed: scanResult.metadata?.categories_processed || 0,
            high_engagement_videos: scanResult.metadata?.high_engagement_videos || 0,
            scan_efficiency: scanResult.metadata?.quota_efficiency || '0%'
        });

        // Calculate next scan time
        const now = new Date();
        const nextScan = new Date(now);
        nextScan.setHours(Math.ceil(now.getHours() / 6) * 6, 0, 0, 0);
        if (nextScan.getTime() <= now.getTime()) {
            nextScan.setHours(nextScan.getHours() + 6);
        }

        const result = {
            success: true,
            scan_type: 'automated_comprehensive_6hour',
            scan_session_id: scanResult.metadata?.scan_session_id,
            videos_discovered: scanResult.metadata?.total_unique_videos || 0,
            categories_processed: scanResult.metadata?.categories_processed || 0,
            quota_used: scanResult.metadata?.quota_used || 0,
            quota_efficiency: scanResult.metadata?.quota_efficiency || '0%',
            high_engagement_videos: scanResult.metadata?.high_engagement_videos || 0,
            shorts_discovered: scanResult.metadata?.shorts_count || 0,
            scan_duration_ms: scanResult.metadata?.scan_duration_ms || 0,
            errors_encountered: (scanResult.metadata?.errors || []).length,
            next_scan_time: nextScan.toISOString(),
            timestamp: new Date().toISOString()
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Automated comprehensive scan cron job error:', error);

        const errorResponse = {
            success: false,
            error: {
                code: 'AUTOMATED_COMPREHENSIVE_SCAN_FAILED',
                message: error.message,
                timestamp: new Date().toISOString(),
                stack: error.stack
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});