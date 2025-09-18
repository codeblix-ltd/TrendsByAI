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
        // Get configuration from request body
        const { isAutomatedScan = false, customSearchTerms = [], maxVideosPerCategory = 10 } = await req.json() || {};
        
        // Get API keys and Supabase config
        const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!youtubeApiKey || !supabaseUrl || !supabaseServiceKey) {
            throw new Error('Required environment variables not configured');
        }

        console.log('Starting enhanced AI content discovery scan...');
        
        // Create scan session
        const scanSessionId = `scan_${Date.now()}`;
        const scanStartTime = new Date();
        
        // Initialize scan session in database
        await fetch(`${supabaseUrl}/rest/v1/scan_sessions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: scanSessionId,
                scan_type: isAutomatedScan ? 'automated' : 'manual',
                status: 'running',
                started_at: scanStartTime.toISOString()
            })
        });

        // Enhanced AI content categories with optimized search terms
        const aiCategories = {
            'AI_STORYTELLING': {
                terms: ['AI storytelling', 'AI generated story', 'AI script writing', 'AI narrative'],
                category: 'AI STORYTELLING'
            },
            'AI_ASMR': {
                terms: ['AI ASMR', 'artificial intelligence relaxation', 'AI generated sounds', 'AI ambient'],
                category: 'AI ASMR'
            },
            'AI_BEAUTY': {
                terms: ['AI makeup tutorial', 'AI beauty tips', 'AI skincare', 'AI beauty transformation'],
                category: 'AI BEAUTY'
            },
            'AI_MUSIC_ART': {
                terms: ['AI generated music', 'AI art creation', 'AI music production', 'AI digital art'],
                category: 'AI MUSIC & ART'
            },
            'AI_GAMING_TECH': {
                terms: ['AI gaming', 'AI tech review', 'AI in games', 'AI technology 2025'],
                category: 'AI GAMING & TECH'
            },
            'AI_TOOLS': {
                terms: ['AI tools 2025', 'best AI software', 'AI productivity', 'AI automation'],
                category: 'AI TOOLS'
            },
            'AI_NEWS': {
                terms: ['AI news', 'artificial intelligence breakthrough', 'AI update', 'AI development'],
                category: 'AI NEWS'
            },
            'AI_CHATGPT': {
                terms: ['ChatGPT tutorial', 'GPT-4 guide', 'OpenAI update', 'ChatGPT tips'],
                category: 'AI CHATGPT'
            }
        };

        // Include custom search terms if provided
        if (customSearchTerms.length > 0) {
            aiCategories['CUSTOM_SEARCH'] = {
                terms: customSearchTerms,
                category: 'CUSTOM AI'
            };
        }

        let totalQuotaUsed = 0;
        let allVideos = [];
        let categorySummary = {};

        // Process each category with quota management
        for (const [categoryKey, categoryData] of Object.entries(aiCategories)) {
            console.log(`Processing category: ${categoryKey}`);
            
            // Limit search terms to manage quota (100 units per search)
            const searchTermsToUse = categoryData.terms.slice(0, isAutomatedScan ? 1 : 2);
            
            for (const searchTerm of searchTermsToUse) {
                try {
                    // Check remaining quota (rough estimate)
                    if (totalQuotaUsed >= 8000) { // Leave buffer for video details
                        console.log('Approaching quota limit, stopping search');
                        break;
                    }

                    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxVideosPerCategory}&q=${encodeURIComponent(searchTerm)}&type=video&order=relevance&publishedAfter=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&key=${youtubeApiKey}`;
                    
                    const searchResponse = await fetch(searchUrl);
                    totalQuotaUsed += 100; // Search API costs 100 units
                    
                    if (!searchResponse.ok) {
                        console.error(`Search failed for "${searchTerm}":`, searchResponse.status);
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
                                    
                                    return {
                                        id: video.id,
                                        title: video.snippet.title,
                                        channel: video.snippet.channelTitle,
                                        publishedAt: video.snippet.publishedAt,
                                        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
                                        views: views,
                                        likes: likes,
                                        comments: comments,
                                        category: categoryData.category,
                                        url: `https://www.youtube.com/watch?v=${video.id}`,
                                        ageInHours: ageInHours,
                                        engagementRate: parseFloat(engagementRate.toFixed(2)),
                                        searchTerm: searchTerm,
                                        scanSessionId: scanSessionId
                                    };
                                });
                                
                                allVideos.push(...processedVideos);
                                
                                // Update category summary
                                if (!categorySummary[categoryData.category]) {
                                    categorySummary[categoryData.category] = {
                                        videos: 0,
                                        totalViews: 0,
                                        totalEngagement: 0
                                    };
                                }
                                
                                processedVideos.forEach(video => {
                                    categorySummary[categoryData.category].videos++;
                                    categorySummary[categoryData.category].totalViews += video.views;
                                    categorySummary[categoryData.category].totalEngagement += (video.likes + video.comments);
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error processing search term "${searchTerm}":`, error.message);
                    continue;
                }
            }
        }

        // Remove duplicates and sort by engagement
        const uniqueVideos = allVideos.filter((video, index, self) => 
            index === self.findIndex(v => v.id === video.id)
        );
        
        const sortedVideos = uniqueVideos
            .sort((a, b) => b.views - a.views) // Sort by views first
            .slice(0, 50); // Limit results

        console.log(`Scan completed: ${sortedVideos.length} unique videos, quota used: ${totalQuotaUsed}`);

        // Store results in database if this is an automated scan
        if (isAutomatedScan && sortedVideos.length > 0) {
            try {
                // Store video results
                const videoRecords = sortedVideos.map(video => ({
                    video_id: video.id,
                    title: video.title,
                    channel: video.channel,
                    views: video.views,
                    likes: video.likes,
                    comments: video.comments,
                    thumbnail: video.thumbnail,
                    url: video.url,
                    published_at: video.publishedAt,
                    category: video.category,
                    scan_session_id: video.scanSessionId,
                    age_hours: video.ageInHours,
                    engagement_rate: video.engagementRate
                }));

                await fetch(`${supabaseUrl}/rest/v1/video_scans`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${supabaseServiceKey}`,
                        'apikey': supabaseServiceKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(videoRecords)
                });

                // Update API usage tracking
                const today = new Date().toISOString().split('T')[0];
                await fetch(`${supabaseUrl}/rest/v1/api_usage_tracking?scan_date=eq.${today}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${supabaseServiceKey}`,
                        'apikey': supabaseServiceKey
                    }
                }).then(async (response) => {
                    const existingData = await response.json();
                    
                    if (existingData.length > 0) {
                        // Update existing record
                        await fetch(`${supabaseUrl}/rest/v1/api_usage_tracking?id=eq.${existingData[0].id}`, {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `Bearer ${supabaseServiceKey}`,
                                'apikey': supabaseServiceKey,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                quota_used: (existingData[0].quota_used || 0) + totalQuotaUsed,
                                scan_sessions: (existingData[0].scan_sessions || 0) + 1,
                                updated_at: new Date().toISOString()
                            })
                        });
                    } else {
                        // Create new record
                        await fetch(`${supabaseUrl}/rest/v1/api_usage_tracking`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${supabaseServiceKey}`,
                                'apikey': supabaseServiceKey,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                scan_date: today,
                                quota_used: totalQuotaUsed,
                                scan_sessions: 1
                            })
                        });
                    }
                });
            } catch (dbError) {
                console.error('Database storage error:', dbError.message);
            }
        }

        // Update scan session as completed
        await fetch(`${supabaseUrl}/rest/v1/scan_sessions?id=eq.${scanSessionId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'completed',
                total_videos: sortedVideos.length,
                total_categories: Object.keys(categorySummary).length,
                quota_consumed: totalQuotaUsed,
                completed_at: new Date().toISOString()
            })
        });

        const result = {
            data: sortedVideos,
            metadata: {
                source: 'youtube_api_enhanced',
                quota_used: totalQuotaUsed,
                scan_session_id: scanSessionId,
                categories_found: Object.keys(categorySummary),
                category_summary: categorySummary,
                last_updated: new Date().toISOString(),
                is_automated_scan: isAutomatedScan,
                total_unique_videos: sortedVideos.length
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Enhanced YouTube scanner error:', error);

        const errorResponse = {
            error: {
                code: 'ENHANCED_SCAN_FAILED',
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