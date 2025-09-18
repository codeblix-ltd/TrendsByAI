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
        console.log('Starting automated 6-hour AI content scan...');
        
        // Get Supabase configuration
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase configuration missing');
        }

        // Check current daily quota usage before starting scan
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
        
        console.log(`Current daily quota used: ${currentQuotaUsed}/10000`);
        
        // Skip scan if quota is too high (leave buffer for manual searches)
        if (currentQuotaUsed >= 8500) {
            console.log('Daily quota nearly exhausted, skipping automated scan');
            return new Response(JSON.stringify({
                success: false,
                message: 'Daily quota nearly exhausted, skipping automated scan',
                quota_used: currentQuotaUsed,
                timestamp: new Date().toISOString()
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Call the enhanced AI scanner with automated scan flag
        const scannerResponse = await fetch(`${supabaseUrl}/functions/v1/enhanced-ai-scanner`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isAutomatedScan: true,
                maxVideosPerCategory: 8 // Reduced for automated scans to conserve quota
            })
        });

        if (!scannerResponse.ok) {
            const errorText = await scannerResponse.text();
            throw new Error(`Enhanced scanner failed: ${errorText}`);
        }

        const scanResult = await scannerResponse.json();
        
        console.log(`Automated scan completed successfully:`, {
            videos_found: scanResult.metadata?.total_unique_videos || 0,
            quota_used: scanResult.metadata?.quota_used || 0,
            categories: scanResult.metadata?.categories_found || []
        });

        const result = {
            success: true,
            scan_type: 'automated_6hour',
            videos_found: scanResult.metadata?.total_unique_videos || 0,
            quota_used: scanResult.metadata?.quota_used || 0,
            categories_found: scanResult.metadata?.categories_found || [],
            scan_session_id: scanResult.metadata?.scan_session_id,
            next_scan_in: '6 hours',
            timestamp: new Date().toISOString()
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Automated scan cron job error:', error);

        const errorResponse = {
            success: false,
            error: {
                code: 'AUTOMATED_SCAN_FAILED',
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