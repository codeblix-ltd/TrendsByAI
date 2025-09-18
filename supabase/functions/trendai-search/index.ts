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
        const { category, customQuery, userApiKey, maxResults = 15, regionCode = 'US' } = await req.json();
        
        console.log('TrendAI Search Request:', { category, customQuery, maxResults, regionCode, hasUserKey: !!userApiKey });

        // Use user's API key (required)
        if (!userApiKey || !userApiKey.startsWith('AIza')) {
            throw new Error('Valid YouTube API key is required');
        }

        // Build search query
        let searchQuery = '';
        if (customQuery) {
            searchQuery = customQuery;
        } else {
            // Map categories to search terms
            const categoryQueries = {
                'AI Horror': 'AI horror scary artificial intelligence creepy',
                'AI ASMR': 'AI ASMR artificial intelligence whisper relaxing',
                'AI Beauty': 'AI beauty makeup transformation artificial intelligence',
                'AI Tech': 'AI technology artificial intelligence machine learning',
                'AI Art': 'AI art artificial intelligence digital art creation'
            };
            searchQuery = categoryQueries[category] || `AI ${category} artificial intelligence`;
        }

        console.log('YouTube API search query:', searchQuery);

        // Call YouTube Data API v3
        const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
        searchUrl.searchParams.set('part', 'snippet');
        searchUrl.searchParams.set('q', searchQuery);
        searchUrl.searchParams.set('type', 'video');
        searchUrl.searchParams.set('order', 'relevance');
        searchUrl.searchParams.set('maxResults', Math.min(maxResults, 25).toString());
        searchUrl.searchParams.set('regionCode', regionCode);
        searchUrl.searchParams.set('relevanceLanguage', 'en');
        searchUrl.searchParams.set('key', userApiKey);

        console.log('Calling YouTube API:', searchUrl.toString().replace(userApiKey, '[API_KEY]'));
        
        const searchResponse = await fetch(searchUrl.toString());
        
        if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            console.error('YouTube API error:', errorText);
            
            let errorMessage = 'YouTube API request failed';
            
            try {
                const errorData = JSON.parse(errorText);
                if (errorData?.error?.code === 403) {
                    const message = errorData.error.message;
                    if (message.includes('quota')) {
                        errorMessage = 'YouTube API quota exceeded. Please check your API usage or try again later.';
                    } else if (message.includes('API key')) {
                        errorMessage = 'Invalid YouTube API key. Please check your API key.';
                    } else {
                        errorMessage = `YouTube API access denied: ${message}`;
                    }
                } else if (errorData?.error?.code === 400) {
                    errorMessage = `Invalid request: ${errorData.error.message}`;
                } else {
                    errorMessage = errorData?.error?.message || errorText;
                }
            } catch (parseError) {
                errorMessage = errorText;
            }
            
            throw new Error(errorMessage);
        }

        const searchData = await searchResponse.json();
        console.log(`Found ${searchData.items?.length || 0} videos`);

        if (!searchData.items || searchData.items.length === 0) {
            return new Response(JSON.stringify({
                data: {
                    videos: [],
                    totalResults: 0,
                    searchCategory: category || 'Unknown'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Get video statistics for better data
        const videoIds = searchData.items.map(item => item.id.videoId).join(',');
        const statsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
        statsUrl.searchParams.set('part', 'statistics,contentDetails');
        statsUrl.searchParams.set('id', videoIds);
        statsUrl.searchParams.set('key', userApiKey);

        let statsData = null;
        try {
            const statsResponse = await fetch(statsUrl.toString());
            if (statsResponse.ok) {
                statsData = await statsResponse.json();
                console.log('Got video statistics successfully');
            }
        } catch (error) {
            console.warn('Failed to get video statistics:', error.message);
        }

        // Format videos to match frontend expectations
        const videos = searchData.items.map((item) => {
            const stats = statsData?.items?.find(s => s.id === item.id.videoId);
            const publishedAt = new Date(item.snippet.publishedAt);
            
            return {
                id: item.id.videoId,
                title: item.snippet.title,
                channelTitle: item.snippet.channelTitle,
                viewCount: stats?.statistics?.viewCount || '0',
                likeCount: stats?.statistics?.likeCount || '0',
                commentCount: stats?.statistics?.commentCount || '0',
                publishedAt: item.snippet.publishedAt,
                thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                category: category || 'AI Content'
            };
        });

        const result = {
            data: {
                videos: videos,
                totalResults: searchData.pageInfo?.totalResults || videos.length,
                searchCategory: category || 'AI Content'
            }
        };

        console.log(`Returning ${videos.length} videos successfully`);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('TrendAI Search Error:', error.message);

        const errorResponse = {
            error: {
                code: 'SEARCH_FAILED',
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