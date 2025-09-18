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
        const { isAutomatedScan = false, customSearchTerms = [], maxVideosPerCategory = 15 } = await req.json() || {};
        
        // Use provided API key directly for immediate functionality
        const youtubeApiKey = 'AIzaSyByB9I3Sw_HCM9M9fGx4joxdu3mVAEWf8Y';
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        console.log('Starting comprehensive AI content discovery scan...');
        console.log(`Configuration: automated=${isAutomatedScan}, maxPerCategory=${maxVideosPerCategory}`);
        
        // Create scan session ID
        const scanSessionId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const scanStartTime = new Date();

        // Enhanced AI content categories with strategic keywords for maximum engagement discovery
        const aiCategories = {
            'AI_STORYTELLING': {
                terms: ['AI storytelling 2025', 'AI generated story', 'AI script writing', 'AI narrative creation'],
                category: 'AI STORYTELLING',
                priority: 'high'
            },
            'AI_ASMR': {
                terms: ['AI ASMR', 'AI generated ASMR', 'artificial intelligence relaxation', 'AI ambient sounds'],
                category: 'AI ASMR',
                priority: 'medium'
            },
            'AI_BEAUTY': {
                terms: ['AI makeup tutorial', 'AI beauty transformation', 'AI skincare tips', 'AI beauty filter'],
                category: 'AI BEAUTY',
                priority: 'high'
            },
            'AI_MUSIC_ART': {
                terms: ['AI generated music', 'AI music production', 'AI art creation', 'AI digital art 2025'],
                category: 'AI MUSIC & ART',
                priority: 'high'
            },
            'AI_GAMING': {
                terms: ['AI gaming', 'AI in video games', 'AI game development', 'AI entertainment'],
                category: 'AI GAMING',
                priority: 'medium'
            },
            'AI_EDUCATION': {
                terms: ['AI tutorial', 'AI education', 'learn AI', 'AI course'],
                category: 'AI EDUCATION',
                priority: 'high'
            },
            'AI_TOOLS': {
                terms: ['AI tools 2025', 'best AI software', 'AI productivity tools', 'AI automation tools'],
                category: 'AI TOOLS',
                priority: 'high'
            },
            'AI_NEWS': {
                terms: ['AI news', 'artificial intelligence breakthrough', 'AI update 2025', 'AI development'],
                category: 'AI NEWS',
                priority: 'medium'
            },
            'AI_CHATGPT': {
                terms: ['ChatGPT tutorial', 'GPT-5', 'OpenAI update', 'ChatGPT tips 2025'],
                category: 'AI CHATGPT',
                priority: 'high'
            },
            'EMERGING_AI': {
                terms: ['AI trends 2025', 'future of AI', 'AI innovation', 'artificial general intelligence'],
                category: 'EMERGING AI',
                priority: 'medium'
            }
        };

        // Include custom search terms if provided
        if (customSearchTerms.length > 0) {
            aiCategories['CUSTOM_SEARCH'] = {
                terms: customSearchTerms,
                category: 'CUSTOM AI',
                priority: 'high'
            };
        }

        let totalQuotaUsed = 0;
        let allVideos = [];
        let categorySummary = {};
        let scanErrors = [];

        console.log(`Processing ${Object.keys(aiCategories).length} AI content categories...`);

        // Process categories in priority order for optimal quota usage
        const prioritizedCategories = Object.entries(aiCategories)
            .sort(([,a], [,b]) => {
                const priority = { 'high': 3, 'medium': 2, 'low': 1 };
                return priority[b.priority] - priority[a.priority];
            });

        for (const [categoryKey, categoryData] of prioritizedCategories) {
            console.log(`Processing category: ${categoryKey} (${categoryData.priority} priority)`);
            
            // Dynamic quota management based on remaining budget and category priority
            const remainingCategories = prioritizedCategories.length - prioritizedCategories.findIndex(([k]) => k === categoryKey);
            const quotaBudget = Math.min(1500, (9000 - totalQuotaUsed) / remainingCategories);
            
            if (totalQuotaUsed >= 8500) {
                console.log('Approaching daily quota limit, stopping scan');
                break;
            }

            // Limit search terms based on quota budget and scan type
            const termsToUse = isAutomatedScan 
                ? categoryData.terms.slice(0, 1) // Conservative for automated scans
                : categoryData.terms.slice(0, Math.min(2, Math.floor(quotaBudget / 150)));
            
            for (const searchTerm of termsToUse) {
                try {
                    if (totalQuotaUsed >= quotaBudget) {
                        console.log(`Category ${categoryKey} quota budget exceeded`);
                        break;
                    }

                    // Enhanced search query with recent content filter
                    const publishedAfter = new Date(Date.now() - (isAutomatedScan ? 7 : 14) * 24 * 60 * 60 * 1000).toISOString();
                    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxVideosPerCategory}&q=${encodeURIComponent(searchTerm)}&type=video&order=relevance&publishedAfter=${publishedAfter}&videoDuration=${isAutomatedScan ? 'any' : 'medium'}&key=${youtubeApiKey}`;
                    
                    console.log(`Searching for: "${searchTerm}"`);
                    const searchResponse = await fetch(searchUrl);
                    totalQuotaUsed += 100; // Search API costs 100 units
                    
                    if (!searchResponse.ok) {
                        const errorText = await searchResponse.text();
                        console.error(`Search failed for "${searchTerm}":`, searchResponse.status, errorText);
                        scanErrors.push(`Search failed for "${searchTerm}": ${searchResponse.status}`);
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
                                    
                                    // Enhanced content classification
                                    const title = video.snippet.title.toLowerCase();
                                    const description = (video.snippet.description || '').toLowerCase();
                                    let finalCategory = categoryData.category;
                                    
                                    // Smart category refinement based on content analysis
                                    if (title.includes('tutorial') || title.includes('how to')) {
                                        finalCategory = finalCategory.includes('EDUCATION') ? finalCategory : finalCategory + ' TUTORIAL';
                                    }
                                    if (title.includes('shorts') || video.contentDetails?.duration?.includes('PT') && 
                                        parseInt(video.contentDetails.duration.match(/PT(\d+)M/)?.[1] || '0') <= 1) {
                                        finalCategory += ' SHORTS';
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
                                        category: finalCategory,
                                        url: `https://www.youtube.com/watch?v=${video.id}`,
                                        ageInHours: ageInHours,
                                        engagementRate: parseFloat(engagementRate.toFixed(2)),
                                        searchTerm: searchTerm,
                                        scanSessionId: scanSessionId,
                                        platform: 'YouTube',
                                        duration: video.contentDetails.duration,
                                        isShorts: video.contentDetails?.duration?.includes('PT') && 
                                                parseInt(video.contentDetails.duration.match(/PT(\d+)M/)?.[1] || '0') <= 1
                                    };
                                });
                                
                                allVideos.push(...processedVideos);
                                
                                // Update category summary
                                if (!categorySummary[categoryData.category]) {
                                    categorySummary[categoryData.category] = {
                                        videos: 0,
                                        totalViews: 0,
                                        totalEngagement: 0,
                                        avgEngagementRate: 0
                                    };
                                }
                                
                                processedVideos.forEach(video => {
                                    categorySummary[categoryData.category].videos++;
                                    categorySummary[categoryData.category].totalViews += video.views;
                                    categorySummary[categoryData.category].totalEngagement += (video.likes + video.comments);
                                });
                            }
                        } else {
                            console.error(`Stats fetch failed for "${searchTerm}":`, statsResponse.status);
                            scanErrors.push(`Stats fetch failed for "${searchTerm}"`);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing search term "${searchTerm}":`, error.message);
                    scanErrors.push(`Error processing "${searchTerm}": ${error.message}`);
                    continue;
                }
            }
        }

        // Calculate average engagement rates for categories
        Object.keys(categorySummary).forEach(category => {
            if (categorySummary[category].videos > 0) {
                categorySummary[category].avgEngagementRate = 
                    ((categorySummary[category].totalEngagement / categorySummary[category].totalViews) * 100) || 0;
            }
        });

        // Remove duplicates and apply intelligent sorting
        const uniqueVideos = allVideos.filter((video, index, self) => 
            index === self.findIndex(v => v.id === video.id)
        );
        
        // Multi-factor sorting: engagement rate, views, and recency
        const sortedVideos = uniqueVideos.sort((a, b) => {
            // Primary: Engagement rate (videos with >1% engagement rate get priority)
            if (a.engagementRate > 1 && b.engagementRate <= 1) return -1;
            if (b.engagementRate > 1 && a.engagementRate <= 1) return 1;
            
            // Secondary: View count for high-engagement videos
            if (Math.abs(a.engagementRate - b.engagementRate) < 0.5) {
                return b.views - a.views;
            }
            
            // Tertiary: Engagement rate difference
            return b.engagementRate - a.engagementRate;
        }).slice(0, 100); // Limit to top 100 results

        console.log(`Scan completed: ${sortedVideos.length} unique videos discovered, ${totalQuotaUsed} quota units used`);
        console.log(`Categories processed: ${Object.keys(categorySummary).length}`);
        if (scanErrors.length > 0) {
            console.log(`Scan errors: ${scanErrors.length}`);
        }

        // Store results in database if this is an automated scan
        if (isAutomatedScan && supabaseUrl && supabaseServiceKey && sortedVideos.length > 0) {
            try {
                // Store scan session info
                await fetch(`${supabaseUrl}/rest/v1/scan_sessions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${supabaseServiceKey}`,
                        'apikey': supabaseServiceKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: scanSessionId,
                        scan_type: 'automated_comprehensive',
                        status: 'completed',
                        total_videos: sortedVideos.length,
                        total_categories: Object.keys(categorySummary).length,
                        quota_consumed: totalQuotaUsed,
                        started_at: scanStartTime.toISOString(),
                        completed_at: new Date().toISOString(),
                        error_message: scanErrors.length > 0 ? scanErrors.join('; ') : null
                    })
                });

                // Update daily API usage tracking
                const today = new Date().toISOString().split('T')[0];
                const usageResponse = await fetch(`${supabaseUrl}/rest/v1/api_usage_tracking?scan_date=eq.${today}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${supabaseServiceKey}`,
                        'apikey': supabaseServiceKey
                    }
                });
                
                const existingUsage = await usageResponse.json();
                
                if (existingUsage.length > 0) {
                    // Update existing record
                    await fetch(`${supabaseUrl}/rest/v1/api_usage_tracking?id=eq.${existingUsage[0].id}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${supabaseServiceKey}`,
                            'apikey': supabaseServiceKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            quota_used: (existingUsage[0].quota_used || 0) + totalQuotaUsed,
                            scan_sessions: (existingUsage[0].scan_sessions || 0) + 1,
                            updated_at: new Date().toISOString()
                        })
                    });
                } else {
                    // Create new usage record
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
                
                console.log('Results successfully stored in database');
            } catch (dbError) {
                console.error('Database storage error:', dbError.message);
                scanErrors.push(`Database error: ${dbError.message}`);
            }
        }

        // Prepare comprehensive response
        const result = {
            data: sortedVideos,
            metadata: {
                source: 'comprehensive_ai_discovery',
                scan_session_id: scanSessionId,
                quota_used: totalQuotaUsed,
                categories_found: Object.keys(categorySummary),
                category_summary: categorySummary,
                last_updated: new Date().toISOString(),
                is_automated_scan: isAutomatedScan,
                total_unique_videos: sortedVideos.length,
                scan_duration_ms: Date.now() - scanStartTime.getTime(),
                errors: scanErrors,
                quota_efficiency: sortedVideos.length > 0 ? (sortedVideos.length / totalQuotaUsed * 100).toFixed(2) : 0,
                high_engagement_videos: sortedVideos.filter(v => v.engagementRate > 1).length,
                shorts_count: sortedVideos.filter(v => v.isShorts).length,
                categories_processed: Object.keys(aiCategories).length
            }
        };

        console.log(`Final results: ${result.data.length} videos, ${result.metadata.quota_efficiency}% efficiency`);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Comprehensive AI scanner error:', error);

        const errorResponse = {
            error: {
                code: 'COMPREHENSIVE_SCAN_FAILED',
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