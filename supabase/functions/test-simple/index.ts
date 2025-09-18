Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        console.log('🚀 Test function started');
        
        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        
        console.log('🔑 Environment check:', {
            hasServiceKey: !!serviceRoleKey,
            hasSupabaseUrl: !!supabaseUrl,
            supabaseUrl: supabaseUrl
        });

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Test database connection
        const testResponse = await fetch(`${supabaseUrl}/rest/v1/videos?limit=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Database test response:', testResponse.status);

        if (!testResponse.ok) {
            const errorText = await testResponse.text();
            console.error('❌ Database test failed:', errorText);
            throw new Error(`Database test failed: ${errorText}`);
        }

        const testData = await testResponse.json();
        console.log('✅ Database test successful, found videos:', testData.length);

        // Test YouTube API
        const youtubeApiKey = 'AIzaSyA1NEXLmZzYIR_N7t-W8SHUq1DLe8WjJYE';
        const youtubeTestUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=AI&type=video&maxResults=1&key=${youtubeApiKey}`;
        
        console.log('🎥 Testing YouTube API...');
        const youtubeResponse = await fetch(youtubeTestUrl);
        console.log('🎥 YouTube API response:', youtubeResponse.status);

        if (!youtubeResponse.ok) {
            const errorText = await youtubeResponse.text();
            console.error('❌ YouTube API test failed:', errorText);
            throw new Error(`YouTube API test failed: ${errorText}`);
        }

        const youtubeData = await youtubeResponse.json();
        console.log('✅ YouTube API test successful, found videos:', youtubeData.items?.length || 0);

        const result = {
            success: true,
            message: 'All tests passed',
            data: {
                databaseVideos: testData.length,
                youtubeVideos: youtubeData.items?.length || 0,
                timestamp: new Date().toISOString()
            }
        };

        console.log('🎉 Test completed successfully:', result);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('💥 Test function error:', error);

        const errorResponse = {
            success: false,
            error: {
                code: 'TEST_FAILED',
                message: error.message,
                stack: error.stack
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
