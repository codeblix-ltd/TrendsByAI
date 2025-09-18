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
        console.log('API Configuration Manager called');
        
        // Set the YouTube API key directly in the function environment
        // This is a workaround since we can't directly access Supabase environment variables setup
        const YOUTUBE_API_KEY = 'AIzaSyA1NEXLmZzYIR_N7t-W8SHUq1DLe8WjJYE';
        
        // Test the YouTube API key
        const testUrl = new URL('https://www.googleapis.com/youtube/v3/search');
        testUrl.searchParams.set('part', 'snippet');
        testUrl.searchParams.set('q', 'AI artificial intelligence');
        testUrl.searchParams.set('type', 'video');
        testUrl.searchParams.set('maxResults', '1');
        testUrl.searchParams.set('key', YOUTUBE_API_KEY);

        console.log('Testing YouTube API key...');
        const testResponse = await fetch(testUrl.toString());
        
        let apiStatus = 'unknown';
        let errorMessage = null;
        
        if (testResponse.ok) {
            apiStatus = 'working';
            console.log('YouTube API key test successful');
        } else {
            const errorData = await testResponse.text();
            apiStatus = 'error';
            errorMessage = `API Error: ${testResponse.status} - ${errorData}`;
            console.error('YouTube API key test failed:', errorMessage);
        }

        // Get environment variables for debugging
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const envYoutubeKey = Deno.env.get('YOUTUBE_API_KEY');

        // Update configuration in database
        if (serviceRoleKey && supabaseUrl) {
            try {
                await fetch(`${supabaseUrl}/rest/v1/api_configuration`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates'
                    },
                    body: JSON.stringify({
                        service: 'youtube',
                        status: apiStatus,
                        last_configured: new Date().toISOString(),
                        notes: errorMessage || `API key tested successfully. Environment key available: ${!!envYoutubeKey}`
                    })
                });
                console.log('Updated API configuration in database');
            } catch (dbError) {
                console.error('Failed to update database:', dbError);
            }
        }

        // Return configuration status
        const result = {
            data: {
                youtube_api: {
                    status: apiStatus,
                    error: errorMessage,
                    env_key_available: !!envYoutubeKey,
                    hardcoded_key_available: !!YOUTUBE_API_KEY,
                    test_endpoint: testUrl.toString().replace(YOUTUBE_API_KEY, '[REDACTED]')
                },
                environment: {
                    supabase_configured: !!(serviceRoleKey && supabaseUrl),
                    deno_env_available: Object.keys(Deno.env.toObject()).length
                },
                timestamp: new Date().toISOString()
            }
        };

        console.log('Configuration check completed:', result.data);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('API Configuration Manager error:', error);

        const errorResponse = {
            error: {
                code: 'API_CONFIG_FAILED',
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