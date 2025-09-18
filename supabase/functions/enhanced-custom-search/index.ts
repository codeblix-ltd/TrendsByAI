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
        const { searchTerms, maxResults = 25, saveSearch = false, includeShorts = true } = await req.json();
        
        if (!searchTerms || !Array.isArray(searchTerms) || searchTerms.length === 0) {
            throw new Error('Search terms are required and must be a non-empty array');
        }

        if (searchTerms.length > 10) {
            throw new Error('Maximum 10 search terms allowed per request');
        }

        // Use provided API key directly
        const youtubeApiKey = 'AIzaSyByB9I3Sw_HCM9M9fGx4joxdu3mVAEWf8Y';
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        console.log(`Starting custom search for: ${searchTerms.join(', ')}`);
        console.log(`Configuration: maxResults=${maxResults}, saveSearch=${saveSearch}, includeShorts=${includeShorts}`);
        
        let totalQuotaUsed = 0;
        let allVideos = [];
        let searchResults = {};
        let searchErrors = [];

        // Process each custom search term
        for (const searchTerm of searchTerms) {
            try {
                // Conservative quota check for custom searches
                if (totalQuotaUsed >= 2500) {
                    console.log('Custom search quota limit reached to preserve daily budget');
                    searchErrors.push(`Quota limit reached, skipping remaining terms`);
                    break;
                }

                // Enhanced search query with flexible parameters
                const publishedAfter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                const videoDuration = includeShorts ? 'any' : 'medium';
                const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${Math.min(maxResults, 25)}&q=${encodeURIComponent(searchTerm)}&type=video&order=relevance&publishedAfter=${publishedAfter}&videoDuration=${videoDuration}&key=${youtubeApiKey}`;
                
                console.log(`Searching for: "${searchTerm}"`);
                const searchResponse = await fetch(searchUrl);
                totalQuotaUsed += 100; // Search API costs 100 units
                
                if (!searchResponse.ok) {
                    const errorText = await searchResponse.text();
                    console.error(`Search failed for "${searchTerm}":`, searchResponse.status, errorText);
                    searchResults[searchTerm] = {
                        error: `Search failed: HTTP ${searchResponse.status}`,
                        videos: [],
                        quotaUsed: 100
                    };
                    searchErrors.push(`Search failed for "${searchTerm}": ${searchResponse.status}`);
                    continue;
                }
                
                const searchData = await searchResponse.json();
                
                if (searchData.items && searchData.items.length > 0) {
                    console.log(`Found ${searchData.items.length} videos for "${searchTerm}"`);
                    
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
                                
                                // Smart categorization based on search term and content
                                let category = 'CUSTOM SEARCH';
                                const title = video.snippet.title.toLowerCase();
                                const searchLower = searchTerm.toLowerCase();
                                
                                if (searchLower.includes('ai') || title.includes('ai') || title.includes('artificial intelligence')) {
                                    if (title.includes('tutorial') || title.includes('how to')) category = 'AI TUTORIAL';
                                    else if (title.includes('tool') || title.includes('software')) category = 'AI TOOLS';
                                    else if (title.includes('art') || title.includes('music') || title.includes('creative')) category = 'AI ART';
                                    else if (title.includes('news') || title.includes('update') || title.includes('breakthrough')) category = 'AI NEWS';
                                    else if (title.includes('chatgpt') || title.includes('gpt') || title.includes('openai')) category = 'AI CHATGPT';
                                    else if (title.includes('asmr')) category = 'AI ASMR';
                                    else if (title.includes('beauty') || title.includes('makeup')) category = 'AI BEAUTY';
                                    else if (title.includes('story') || title.includes('narrative')) category = 'AI STORYTELLING';
                                    else if (title.includes('game') || title.includes('gaming')) category = 'AI GAMING';
                                    else category = 'AI GENERAL';
                                } else {
                                    category = `CUSTOM: ${searchTerm.toUpperCase().substring(0, 20)}`;
                                }
                                
                                // Detect if video is a Short
                                const isShorts = video.contentDetails?.duration?.includes('PT') && 
                                    parseInt(video.contentDetails.duration.match(/PT(\d+)M/)?.[1] || '0') <= 1;
                                
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
                                    isCustomSearch: true,
                                    platform: 'YouTube',
                                    duration: video.contentDetails.duration,
                                    isShorts: isShorts
                                };
                            });
                            
                            allVideos.push(...processedVideos);
                            
                            searchResults[searchTerm] = {
                                videos: processedVideos,
                                totalResults: processedVideos.length,
                                quotaUsed: 100 + processedVideos.length,
                                avgEngagementRate: processedVideos.length > 0 
                                    ? (processedVideos.reduce((sum, v) => sum + v.engagementRate, 0) / processedVideos.length).toFixed(2)
                                    : 0,
                                totalViews: processedVideos.reduce((sum, v) => sum + v.views, 0),
                                shortsCount: processedVideos.filter(v => v.isShorts).length
                            };
                        }
                    } else {
                        const errorText = await statsResponse.text();
                        console.error(`Stats fetch failed for "${searchTerm}":`, statsResponse.status, errorText);
                        searchResults[searchTerm] = {
                            error: `Stats fetch failed: HTTP ${statsResponse.status}`,
                            videos: [],
                            quotaUsed: 100 + searchData.items.length
                        };
                        searchErrors.push(`Stats fetch failed for "${searchTerm}"`);
                    }
                } else {
                    console.log(`No videos found for "${searchTerm}"`);
                    searchResults[searchTerm] = {
                        videos: [],
                        totalResults: 0,
                        quotaUsed: 100,
                        message: 'No videos found for this search term'
                    };
                }
            } catch (error) {
                console.error(`Error processing custom search "${searchTerm}":`, error.message);
                searchResults[searchTerm] = {
                    error: `Processing error: ${error.message}`,
                    videos: [],
                    quotaUsed: 100
                };
                searchErrors.push(`Processing error for "${searchTerm}": ${error.message}`);
            }
        }

        // Remove duplicates and apply intelligent sorting
        const uniqueVideos = allVideos.filter((video, index, self) => 
            index === self.findIndex(v => v.id === video.id)
        );
        
        // Multi-criteria sorting for custom search results
        const sortedVideos = uniqueVideos.sort((a, b) => {
            // Prioritize high engagement rate
            if (a.engagementRate > 1.5 && b.engagementRate <= 1.5) return -1;
            if (b.engagementRate > 1.5 && a.engagementRate <= 1.5) return 1;
            
            // Then sort by views for similar engagement rates
            if (Math.abs(a.engagementRate - b.engagementRate) < 0.3) {
                return b.views - a.views;
            }
            
            // Finally by engagement rate
            return b.engagementRate - a.engagementRate;
        });

        console.log(`Custom search completed: ${sortedVideos.length} unique videos found, ${totalQuotaUsed} quota units used`);
        console.log(`Search efficiency: ${totalQuotaUsed > 0 ? (sortedVideos.length / totalQuotaUsed * 100).toFixed(2) : 0}% videos per quota unit`);

        // Save search results to database if requested
        if (saveSearch && supabaseUrl && supabaseServiceKey && sortedVideos.length > 0) {
            try {
                for (const searchTerm of searchTerms) {
                    const termResults = searchResults[searchTerm];
                    if (termResults && termResults.videos && termResults.videos.length > 0) {
                        const totalViews = termResults.totalViews || 0;
                        const totalEngagement = termResults.videos.reduce((sum, v) => sum + v.likes + v.comments, 0);
                        
                        // Insert or update custom search record
                        await fetch(`${supabaseUrl}/rest/v1/custom_searches`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${supabaseServiceKey}`,
                                'apikey': supabaseServiceKey,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                search_term: searchTerm,
                                category: 'CUSTOM',
                                results_count: termResults.videos.length,
                                total_views: totalViews,
                                total_engagement: totalEngagement,
                                last_scanned: new Date().toISOString(),
                                is_active: true
                            })
                        });
                    }
                }
                console.log('Custom search results saved to database');
            } catch (dbError) {
                console.error('Database storage error for custom search:', dbError.message);
                searchErrors.push(`Database storage error: ${dbError.message}`);
            }
        }

        const result = {
            data: sortedVideos,
            metadata: {
                source: 'custom_search_enhanced',
                search_terms: searchTerms,
                quota_used: totalQuotaUsed,
                total_unique_videos: sortedVideos.length,
                search_results: searchResults,
                timestamp: new Date().toISOString(),
                saved_to_database: saveSearch,
                errors: searchErrors,
                search_efficiency: totalQuotaUsed > 0 ? (sortedVideos.length / totalQuotaUsed * 100).toFixed(2) : '0',
                high_engagement_videos: sortedVideos.filter(v => v.engagementRate > 1.5).length,
                shorts_count: sortedVideos.filter(v => v.isShorts).length,
                avg_views: sortedVideos.length > 0 ? Math.round(sortedVideos.reduce((sum, v) => sum + v.views, 0) / sortedVideos.length) : 0,
                categories_found: [...new Set(sortedVideos.map(v => v.category))]
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Enhanced custom search error:', error);

        const errorResponse = {
            error: {
                code: 'CUSTOM_SEARCH_ENHANCED_FAILED',
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