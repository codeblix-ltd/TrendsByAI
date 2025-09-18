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
        // Get YouTube API key from environment
        const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
        
        if (!youtubeApiKey) {
            console.error('YouTube API key not found in environment variables');
            throw new Error('YouTube API key not configured');
        }

        console.log('YouTube API key found, fetching trending AI videos...');

        // AI-focused search terms
        const searchQueries = [
            'artificial intelligence 2025',
            'AI tools tutorial',
            'ChatGPT latest update',
            'machine learning breakthrough',
            'AI news today',
            'OpenAI update',
            'AI automation tools',
            'artificial intelligence trends'
        ];

        const allVideos = [];

        // Search for videos using multiple AI-related queries
        for (const query of searchQueries) {
            try {
                const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(query)}&type=video&order=relevance&publishedAfter=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&key=${youtubeApiKey}`;
                
                const searchResponse = await fetch(searchUrl);
                
                if (!searchResponse.ok) {
                    console.error(`Search API error for query "${query}":`, searchResponse.status);
                    continue;
                }
                
                const searchData = await searchResponse.json();
                
                if (searchData.items && searchData.items.length > 0) {
                    // Get video IDs to fetch detailed stats
                    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
                    
                    // Fetch detailed video statistics
                    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds}&key=${youtubeApiKey}`;
                    
                    const statsResponse = await fetch(statsUrl);
                    
                    if (statsResponse.ok) {
                        const statsData = await statsResponse.json();
                        
                        if (statsData.items) {
                            // Process and format video data
                            const processedVideos = statsData.items.map((video: any) => {
                                const publishedAt = new Date(video.snippet.publishedAt);
                                const ageInHours = Math.floor((Date.now() - publishedAt.getTime()) / (1000 * 60 * 60));
                                
                                // Determine AI category based on title and description
                                const title = video.snippet.title.toLowerCase();
                                const description = (video.snippet.description || '').toLowerCase();
                                let category = 'AI GENERAL';
                                
                                if (title.includes('chatgpt') || title.includes('gpt')) category = 'AI CHATGPT';
                                else if (title.includes('tool') || title.includes('automation')) category = 'AI TOOLS';
                                else if (title.includes('art') || title.includes('image') || title.includes('midjourney')) category = 'AI ART';
                                else if (title.includes('tutorial') || title.includes('how to')) category = 'AI TUTORIAL';
                                else if (title.includes('news') || title.includes('update')) category = 'AI NEWS';
                                else if (title.includes('asmr')) category = 'AI ASMR';
                                else if (title.includes('horror') || title.includes('scary')) category = 'AI HORROR';
                                
                                return {
                                    id: video.id,
                                    title: video.snippet.title,
                                    channelTitle: video.snippet.channelTitle,
                                    publishedAt: video.snippet.publishedAt,
                                    thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
                                    viewCount: parseInt(video.statistics.viewCount || '0'),
                                    likeCount: parseInt(video.statistics.likeCount || '0'),
                                    commentCount: parseInt(video.statistics.commentCount || '0'),
                                    duration: video.contentDetails.duration,
                                    category: category,
                                    url: `https://www.youtube.com/watch?v=${video.id}`,
                                    ageInHours: ageInHours,
                                    platform: 'YouTube'
                                };
                            });
                            
                            allVideos.push(...processedVideos);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error processing query "${query}":`, error.message);
                continue;
            }
        }

        // Remove duplicates and sort by view count
        const uniqueVideos = allVideos.filter((video, index, self) => 
            index === self.findIndex((v) => v.id === video.id)
        );
        
        // Sort by view count (highest first)
        const sortedVideos = uniqueVideos.sort((a, b) => b.viewCount - a.viewCount);
        
        // Get top movers (videos with highest engagement in last 24 hours)
        const recentVideos = sortedVideos.filter(video => video.ageInHours <= 24);
        const topMovers = recentVideos
            .sort((a, b) => (b.likeCount + b.commentCount) - (a.likeCount + a.commentCount))
            .slice(0, 10);

        // Limit main results to top 50
        const mainResults = sortedVideos.slice(0, 50);

        console.log(`Successfully fetched ${mainResults.length} unique AI videos, ${topMovers.length} top movers`);

        const result = {
            data: {
                videos: mainResults,
                topMovers: topMovers,
                totalCount: mainResults.length,
                lastUpdated: new Date().toISOString(),
                categories: [...new Set(mainResults.map(v => v.category))]
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('YouTube trending AI videos fetch error:', error);

        const errorResponse = {
            error: {
                code: 'YOUTUBE_FETCH_FAILED',
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