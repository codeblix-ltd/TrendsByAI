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
        const { searchTerms, maxResults = 20, saveSearch = false } = await req.json();
        
        if (!searchTerms || !Array.isArray(searchTerms) || searchTerms.length === 0) {
            throw new Error('Search terms are required and must be a non-empty array');
        }

        // Get API keys and Supabase config
        const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!youtubeApiKey || !supabaseUrl || !supabaseServiceKey) {
            throw new Error('Required environment variables not configured');
        }

        console.log(`Starting custom search for: ${searchTerms.join(', ')}`);
        
        let totalQuotaUsed = 0;
        let allVideos = [];
        let searchResults = {};

        // Process each custom search term
        for (const searchTerm of searchTerms) {
            try {
                // Check quota limit
                if (totalQuotaUsed >= 2000) { // Conservative limit for custom searches
                    console.log('Custom search quota limit reached');
                    break;
                }

                const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${Math.min(maxResults, 25)}&q=${encodeURIComponent(searchTerm)}&type=video&order=relevance&publishedAfter=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}&key=${youtubeApiKey}`;
                
                const searchResponse = await fetch(searchUrl);
                totalQuotaUsed += 100; // Search API costs 100 units
                
                if (!searchResponse.ok) {
                    console.error(`Search failed for "${searchTerm}":`, searchResponse.status);
                    searchResults[searchTerm] = {
                        error: `Search failed with status ${searchResponse.status}`,
                        videos: []
                    };
                    continue;
                }
                
                const searchData = await searchResponse.json();
                
                if (searchData.items && searchData.items.length > 0) {
                    // Get video IDs for detailed statistics
                    const videoIds = searchData.items.map(item => item.id.videoId).join(',');
                    
                    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds}&key=${youtubeApiKey}`;
                    
                    const statsResponse = await fetch(statsUrl);
                    totalQuotaUsed += searchData.items.length; // Video details cost 1 unit each
                    
                    if (statsResponse.ok) {
                        const statsData = await statsResponse.json();
                        
                        if (statsData.items) {
                            const processedVideos = statsData.items.map(video => {
                                const publishedAt = new Date(video.snippet.publishedAt);
                                const ageInHours = Math.floor((Date.now() - publishedAt.getTime()) / (1000 * 60 * 60));
                                const views = parseInt(video.statistics.viewCount || '0');
                                const likes = parseInt(video.statistics.likeCount || '0');
                                const comments = parseInt(video.statistics.commentCount || '0');
                                const engagement = likes + comments;
                                const engagementRate = views > 0 ? ((engagement / views) * 100) : 0;
                                
                                // Categorize based on search term and content
                                let category = 'CUSTOM SEARCH';
                                const title = video.snippet.title.toLowerCase();
                                
                                if (title.includes('ai') || title.includes('artificial intelligence')) {
                                    if (title.includes('tutorial') || title.includes('how to')) category = 'AI TUTORIAL';
                                    else if (title.includes('tool') || title.includes('software')) category = 'AI TOOLS';
                                    else if (title.includes('art') || title.includes('music')) category = 'AI ART';
                                    else if (title.includes('news') || title.includes('update')) category = 'AI NEWS';
                                    else if (title.includes('chatgpt') || title.includes('gpt')) category = 'AI CHATGPT';
                                    else category = 'AI GENERAL';
                                }
                                
                                return {
                                    id: video.id,
                                    title: video.snippet.title,
                                    channel: video.snippet.channelTitle,
                                    publishedAt: video.snippet.publishedAt,
                                    thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
                                    views: views,
                                    likes: likes,
                                    comments: comments,
                                    category: category,
                                    url: `https://www.youtube.com/watch?v=${video.id}`,
                                    ageInHours: ageInHours,
                                    engagementRate: parseFloat(engagementRate.toFixed(2)),
                                    searchTerm: searchTerm,
                                    isCustomSearch: true
                                };
                            });
                            
                            allVideos.push(...processedVideos);
                            
                            searchResults[searchTerm] = {
                                videos: processedVideos,
                                totalResults: processedVideos.length,
                                quotaUsed: 100 + processedVideos.length
                            };
                        }
                    } else {
                        searchResults[searchTerm] = {
                            error: 'Failed to fetch video statistics',
                            videos: []
                        };
                    }
                } else {
                    searchResults[searchTerm] = {
                        videos: [],
                        totalResults: 0,
                        message: 'No videos found for this search term'
                    };
                }
            } catch (error) {
                console.error(`Error processing custom search "${searchTerm}":`, error.message);
                searchResults[searchTerm] = {
                    error: error.message,
                    videos: []
                };
            }
        }

        // Remove duplicates and sort by relevance/engagement
        const uniqueVideos = allVideos.filter((video, index, self) => 
            index === self.findIndex(v => v.id === video.id)
        );
        
        const sortedVideos = uniqueVideos.sort((a, b) => {
            // Sort by engagement rate first, then by views
            if (Math.abs(a.engagementRate - b.engagementRate) < 0.1) {
                return b.views - a.views;
            }
            return b.engagementRate - a.engagementRate;
        });

        console.log(`Custom search completed: ${sortedVideos.length} unique videos, quota used: ${totalQuotaUsed}`);

        // Save search results to database if requested
        if (saveSearch && sortedVideos.length > 0) {
            try {
                for (const searchTerm of searchTerms) {
                    const termVideos = sortedVideos.filter(v => v.searchTerm === searchTerm);
                    if (termVideos.length > 0) {
                        const totalViews = termVideos.reduce((sum, v) => sum + v.views, 0);
                        const totalEngagement = termVideos.reduce((sum, v) => sum + v.likes + v.comments, 0);
                        
                        // Insert or update custom search record
                        const searchRecord = {
                            search_term: searchTerm,
                            category: 'CUSTOM',
                            results_count: termVideos.length,
                            total_views: totalViews,
                            total_engagement: totalEngagement,
                            last_scanned: new Date().toISOString()
                        };

                        await fetch(`${supabaseUrl}/rest/v1/custom_searches`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${supabaseServiceKey}`,
                                'apikey': supabaseServiceKey,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(searchRecord)
                        });
                    }
                }
            } catch (dbError) {
                console.error('Database storage error for custom search:', dbError.message);
            }
        }

        const result = {
            data: sortedVideos,
            metadata: {
                source: 'custom_search',
                search_terms: searchTerms,
                quota_used: totalQuotaUsed,
                total_unique_videos: sortedVideos.length,
                search_results: searchResults,
                timestamp: new Date().toISOString(),
                saved_to_database: saveSearch
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Custom search error:', error);

        const errorResponse = {
            error: {
                code: 'CUSTOM_SEARCH_FAILED',
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