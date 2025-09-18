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
        const { query, apiKey } = await req.json();
        
        console.log('=== YOUTUBE API DEBUG TEST ===');
        console.log('Query:', query);
        console.log('API Key provided:', !!apiKey);
        console.log('API Key first 10 chars:', apiKey ? apiKey.substring(0, 10) : 'none');
        
        if (!apiKey) {
            throw new Error('No API key provided');
        }
        
        // Simple YouTube API test call
        const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query || 'test')}&type=video&maxResults=3&key=${apiKey}`;
        console.log('Making API call to:', testUrl);
        
        const response = await fetch(testUrl);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response:', errorText);
            
            return new Response(JSON.stringify({
                error: {
                    status: response.status,
                    message: errorText,
                    url: testUrl
                }
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        
        const data = await response.json();
        console.log('YouTube API Response:');
        console.log('- Total results:', data.pageInfo?.totalResults);
        console.log('- Items count:', data.items?.length);
        console.log('- First item title:', data.items?.[0]?.snippet?.title);
        console.log('- Full response structure:', JSON.stringify(data, null, 2));
        
        const result = {
            success: true,
            totalResults: data.pageInfo?.totalResults || 0,
            itemsCount: data.items?.length || 0,
            firstTitle: data.items?.[0]?.snippet?.title || 'No title',
            rawResponse: data
        };
        
        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('DEBUG TEST ERROR:', error);
        
        return new Response(JSON.stringify({
            error: {
                message: error.message,
                stack: error.stack
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});