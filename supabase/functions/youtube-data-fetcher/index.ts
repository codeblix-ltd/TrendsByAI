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
        const { keywords, maxResults = 25, scanType = 'trending' } = await req.json();

        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
            throw new Error('Keywords array is required');
        }

        // Get environment variables
        let youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
        
        // Fallback to hardcoded key if environment variable not available
        if (!youtubeApiKey) {
            console.log('Environment YouTube API key not found, using hardcoded fallback');
            youtubeApiKey = 'AIzaSyBLfyxwWCE7WVeNS07GzupDtI6eAz1XniM';
        }
        
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // If YouTube API key is not available, return fallback data
        if (!youtubeApiKey) {
            console.log('No YouTube API key available, returning fallback data');
            
            const fallbackData = await generateFallbackData(serviceRoleKey, supabaseUrl);
            
            return new Response(JSON.stringify({
                data: {
                    sessionId: 'fallback-session',
                    videosFound: fallbackData.length,
                    videosProcessed: fallbackData.length,
                    apiCallsUsed: 0,
                    quotaRemaining: 10000,
                    errors: ['YouTube API key not available - using sample data'],
                    status: 'completed_with_fallback'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        
        console.log('Using YouTube API key for live data fetch...');

        console.log('Starting YouTube data fetch for keywords:', keywords);

        // Create scan session
        const sessionId = `youtube_${scanType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sessionData = {
            id: sessionId,
            scan_type: scanType,
            status: 'running',
            started_at: new Date().toISOString()
        };

        const sessionResponse = await fetch(`${supabaseUrl}/rest/v1/scan_sessions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(sessionData)
        });

        if (!sessionResponse.ok) {
            const errorText = await sessionResponse.text();
            console.error('Failed to create scan session:', errorText);
            throw new Error(`Failed to create scan session: ${errorText}`);
        }

        const session = await sessionResponse.json();
        console.log('Scan session created successfully:', sessionId);

        let totalVideosFound = 0;
        let totalVideosProcessed = 0;
        let totalApiCalls = 0;
        const errors = [];

        // Check daily API usage
        const today = new Date().toISOString().split('T')[0];
        const usageResponse = await fetch(`${supabaseUrl}/rest/v1/api_usage?date=eq.${today}&service=eq.youtube`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        let currentUsage = 0;
        if (usageResponse.ok) {
            const usageData = await usageResponse.json();
            currentUsage = usageData[0]?.quota_used || 0;
        }

        const quotaLimit = 10000;
        const remainingQuota = quotaLimit - currentUsage;
        
        console.log(`Current API usage: ${currentUsage}/${quotaLimit}, Remaining: ${remainingQuota}`);

        if (remainingQuota < 100) {
            throw new Error('API quota nearly exhausted. Aborting scan.');
        }

        // Process each keyword
        for (const keyword of keywords) {
            try {
                console.log(`Processing keyword: ${keyword}`);

                // Search for videos
                const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
                searchUrl.searchParams.set('part', 'snippet');
                searchUrl.searchParams.set('q', `${keyword} AI`);
                searchUrl.searchParams.set('type', 'video');
                searchUrl.searchParams.set('order', 'relevance');
                searchUrl.searchParams.set('publishedAfter', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
                searchUrl.searchParams.set('maxResults', Math.min(maxResults, 50).toString());
                searchUrl.searchParams.set('key', youtubeApiKey);

                const searchResponse = await fetch(searchUrl.toString());
                totalApiCalls += 100; // search.list costs 100 units

                if (!searchResponse.ok) {
                    const errorData = await searchResponse.text();
                    errors.push(`Search API error for ${keyword}: ${errorData}`);
                    console.error(`Search API error for ${keyword}:`, errorData);
                    
                    // If this is a permission/configuration error, use fallback data
                    if (searchResponse.status === 403 && errorData.includes('accessNotConfigured')) {
                        console.log('API not configured, using fallback data for', keyword);
                        
                        // Generate fallback data and return immediately
                        const fallbackData = await generateFallbackData(serviceRoleKey, supabaseUrl);
                        
                        // Update scan session with fallback status
                        await fetch(`${supabaseUrl}/rest/v1/scan_sessions?id=eq.${sessionId}`, {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                status: 'completed_with_fallback',
                                videos_found: fallbackData.length,
                                videos_processed: fallbackData.length,
                                api_calls_used: 0,
                                errors_count: 1,
                                completed_at: new Date().toISOString()
                            })
                        });
                        
                        return new Response(JSON.stringify({
                            data: {
                                sessionId,
                                videosFound: fallbackData.length,
                                videosProcessed: fallbackData.length,
                                apiCallsUsed: 0,
                                quotaRemaining: remainingQuota,
                                errors: ['YouTube Data API v3 not enabled - using sample data. Please enable the API in Google Console.'],
                                status: 'completed_with_fallback'
                            }
                        }), {
                            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                        });
                    }
                    
                    continue;
                }

                const searchData = await searchResponse.json();
                const videoIds = searchData.items?.map((item: any) => item.id.videoId).filter(Boolean) || [];
                
                totalVideosFound += videoIds.length;
                console.log(`Found ${videoIds.length} videos for keyword: ${keyword}`);

                if (videoIds.length === 0) continue;

                // Get detailed video statistics
                const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
                detailsUrl.searchParams.set('part', 'snippet,statistics,contentDetails');
                detailsUrl.searchParams.set('id', videoIds.join(','));
                detailsUrl.searchParams.set('key', youtubeApiKey);

                const detailsResponse = await fetch(detailsUrl.toString());
                totalApiCalls += 1; // videos.list costs 1 unit

                if (!detailsResponse.ok) {
                    const errorData = await detailsResponse.text();
                    errors.push(`Details API error for ${keyword}: ${errorData}`);
                    console.error(`Details API error for ${keyword}:`, errorData);
                    continue;
                }

                const detailsData = await detailsResponse.json();
                
                // Process and store videos
                for (const video of detailsData.items || []) {
                    try {
                        const publishedAt = new Date(video.snippet.publishedAt);
                        const ageMinutes = Math.floor((Date.now() - publishedAt.getTime()) / (1000 * 60));
                        const views = parseInt(video.statistics.viewCount || '0');
                        const likes = parseInt(video.statistics.likeCount || '0');
                        const comments = parseInt(video.statistics.commentCount || '0');
                        
                        // Calculate metrics
                        const viewsPerMinute = ageMinutes > 0 ? views / ageMinutes : 0;
                        const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
                        
                        // Component-based scoring
                        const velocityScore = Math.min(100, viewsPerMinute * 10);
                        const noveltyScore = Math.max(0, 100 - (ageMinutes / 60)); // Decreases with age
                        const titleQualityScore = calculateTitleQuality(video.snippet.title);
                        const seoScore = calculateSEOScore(video.snippet);
                        
                        const overallScore = (
                            velocityScore * 0.3 +
                            engagementRate * 0.25 +
                            noveltyScore * 0.2 +
                            titleQualityScore * 0.15 +
                            seoScore * 0.1
                        );

                        // Parse duration
                        const durationSeconds = parseDuration(video.contentDetails.duration);

                        // Extract hashtags from description
                        const hashtags = extractHashtags(video.snippet.description || '');
                        const tags = video.snippet.tags || [];

                        const videoData = {
                            video_id: video.id,
                            platform: 'youtube',
                            title: video.snippet.title,
                            description: video.snippet.description || '',
                            channel_name: video.snippet.channelTitle,
                            channel_id: video.snippet.channelId,
                            publish_time: publishedAt.toISOString(),
                            duration_seconds: durationSeconds,
                            view_count: views,
                            like_count: likes,
                            comment_count: comments,
                            engagement_rate: parseFloat(engagementRate.toFixed(2)),
                            hashtags: hashtags,
                            tags: tags,
                            thumbnail_url: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
                            url: `https://www.youtube.com/watch?v=${video.id}`,
                            language: video.snippet.defaultLanguage || 'en',
                            category: keyword,
                            niche: keyword,
                            age_minutes: ageMinutes,
                            views_per_minute: parseFloat(viewsPerMinute.toFixed(2)),
                            velocity_score: parseFloat(velocityScore.toFixed(2)),
                            novelty_score: parseFloat(noveltyScore.toFixed(2)),
                            title_quality_score: parseFloat(titleQualityScore.toFixed(2)),
                            seo_score: parseFloat(seoScore.toFixed(2)),
                            overall_score: parseFloat(overallScore.toFixed(2)),
                            is_trending: overallScore > 60,
                            data_source: 'api',
                            last_updated: new Date().toISOString()
                        };

                        // Upsert video data
                        const upsertResponse = await fetch(`${supabaseUrl}/rest/v1/videos`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey,
                                'Content-Type': 'application/json',
                                'Prefer': 'resolution=merge-duplicates'
                            },
                            body: JSON.stringify(videoData)
                        });

                        if (upsertResponse.ok) {
                            totalVideosProcessed++;
                            
                            // Store metrics history
                            const historyData = {
                                video_id: video.id,
                                views: views,
                                likes: likes,
                                comments: comments,
                                velocity: viewsPerMinute,
                                recorded_at: new Date().toISOString()
                            };

                            await fetch(`${supabaseUrl}/rest/v1/video_metrics_history`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${serviceRoleKey}`,
                                    'apikey': serviceRoleKey,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(historyData)
                            });
                        }
                    } catch (videoError) {
                        console.error('Error processing video:', videoError);
                        errors.push(`Video processing error: ${videoError.message}`);
                    }
                }
            } catch (keywordError) {
                console.error(`Error processing keyword ${keyword}:`, keywordError);
                errors.push(`Keyword ${keyword} error: ${keywordError.message}`);
            }
        }

        // Update API usage
        const newUsage = currentUsage + totalApiCalls;
        await fetch(`${supabaseUrl}/rest/v1/api_usage`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
                date: today,
                service: 'youtube',
                quota_used: newUsage,
                requests_count: keywords.length * 2,
                errors_count: errors.length,
                updated_at: new Date().toISOString()
            })
        });

        // Update scan session
        await fetch(`${supabaseUrl}/rest/v1/scan_sessions?id=eq.${sessionId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'completed',
                videos_found: totalVideosFound,
                videos_processed: totalVideosProcessed,
                api_calls_used: totalApiCalls,
                errors_count: errors.length,
                completed_at: new Date().toISOString()
            })
        });

        const result = {
            data: {
                sessionId,
                videosFound: totalVideosFound,
                videosProcessed: totalVideosProcessed,
                apiCallsUsed: totalApiCalls,
                quotaRemaining: quotaLimit - newUsage,
                errors: errors.slice(0, 10), // Limit error details
                status: 'completed'
            }
        };

        console.log('YouTube data fetch completed:', result.data);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('YouTube data fetcher error:', error);

        const errorResponse = {
            error: {
                code: 'YOUTUBE_FETCH_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper function to generate fallback data
async function generateFallbackData(serviceRoleKey: string, supabaseUrl: string) {
    const fallbackVideos = [
        {
            video_id: 'dQw4w9WgXcQ',
            platform: 'youtube',
            title: 'Revolutionary AI Tool Changes Everything in 2025',
            description: 'Discover the latest breakthrough in artificial intelligence that\'s transforming industries worldwide.',
            channel_name: 'TechVision AI',
            channel_id: 'UCexample1',
            publish_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            duration_seconds: 720,
            view_count: 125000,
            like_count: 8500,
            comment_count: 1200,
            engagement_rate: 7.76,
            hashtags: ['#AI', '#Technology', '#Innovation', '#Future', '#2025'],
            tags: ['artificial intelligence', 'AI tools', 'technology', '2025', 'innovation'],
            thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            language: 'en',
            category: 'AI News',
            niche: 'AI News',
            age_minutes: 120,
            views_per_minute: 1041.67,
            velocity_score: 85.2,
            novelty_score: 98.0,
            title_quality_score: 82.5,
            seo_score: 78.3,
            overall_score: 83.1,
            is_trending: true,
            data_source: 'fallback',
            last_updated: new Date().toISOString()
        },
        {
            video_id: 'ScMzIvxBSi4',
            platform: 'youtube',
            title: 'ChatGPT vs Claude vs Gemini: AI Battle 2025',
            description: 'Comprehensive comparison of the top AI models in 2025. Which one wins?',
            channel_name: 'AI Comparisons',
            channel_id: 'UCexample2',
            publish_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            duration_seconds: 890,
            view_count: 89000,
            like_count: 6200,
            comment_count: 890,
            engagement_rate: 7.97,
            hashtags: ['#ChatGPT', '#Claude', '#Gemini', '#AIComparison', '#2025'],
            tags: ['ChatGPT', 'Claude', 'Gemini', 'AI comparison', 'language models'],
            thumbnail_url: 'https://i.ytimg.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
            url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
            language: 'en',
            category: 'ChatGPT',
            niche: 'ChatGPT',
            age_minutes: 240,
            views_per_minute: 370.83,
            velocity_score: 75.8,
            novelty_score: 96.0,
            title_quality_score: 88.2,
            seo_score: 85.1,
            overall_score: 81.3,
            is_trending: true,
            data_source: 'fallback',
            last_updated: new Date().toISOString()
        },
        {
            video_id: 'jNQXAC9IVRw',
            platform: 'youtube',
            title: 'Machine Learning Breakthrough: Neural Networks 2025',
            description: 'Latest advances in neural network architectures that are pushing the boundaries of what\'s possible.',
            channel_name: 'Deep Learning Hub',
            channel_id: 'UCexample3',
            publish_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            duration_seconds: 1320,
            view_count: 67000,
            like_count: 4100,
            comment_count: 520,
            engagement_rate: 6.90,
            hashtags: ['#MachineLearning', '#NeuralNetworks', '#DeepLearning', '#AI', '#Research'],
            tags: ['machine learning', 'neural networks', 'deep learning', 'AI research'],
            thumbnail_url: 'https://i.ytimg.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
            url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
            language: 'en',
            category: 'Machine Learning',
            niche: 'Machine Learning',
            age_minutes: 360,
            views_per_minute: 186.11,
            velocity_score: 68.4,
            novelty_score: 94.0,
            title_quality_score: 76.8,
            seo_score: 82.5,
            overall_score: 78.9,
            is_trending: true,
            data_source: 'fallback',
            last_updated: new Date().toISOString()
        }
    ];

    // Insert fallback data into database
    for (const video of fallbackVideos) {
        await fetch(`${supabaseUrl}/rest/v1/videos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(video)
        });
    }

    return fallbackVideos;
}

// Helper functions
function calculateTitleQuality(title: string): number {
    let score = 0;
    
    // Length optimization (40-60 chars ideal)
    const length = title.length;
    if (length >= 40 && length <= 60) score += 30;
    else if (length >= 30 && length <= 70) score += 20;
    else score += 10;
    
    // Emotional triggers
    const emotionalWords = ['amazing', 'incredible', 'shocking', 'unbelievable', 'revolutionary', 'breakthrough'];
    const hasEmotionalTrigger = emotionalWords.some(word => title.toLowerCase().includes(word));
    if (hasEmotionalTrigger) score += 25;
    
    // Numbers and specificity
    if (/\d/.test(title)) score += 20;
    
    // Capital letters (but not all caps)
    const capsWords = title.split(' ').filter(word => word === word.toUpperCase() && word.length > 1);
    if (capsWords.length > 0 && capsWords.length < 3) score += 15;
    
    // Question marks
    if (title.includes('?')) score += 10;
    
    return Math.min(100, score);
}

function calculateSEOScore(snippet: any): number {
    let score = 0;
    
    const title = snippet.title.toLowerCase();
    const description = (snippet.description || '').toLowerCase();
    
    // Title contains target keywords
    const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'neural', 'deep learning'];
    const titleHasAI = aiKeywords.some(keyword => title.includes(keyword));
    if (titleHasAI) score += 30;
    
    // Description length and quality
    if (description.length > 100) score += 20;
    if (description.length > 200) score += 10;
    
    // Keywords in description
    const descHasAI = aiKeywords.some(keyword => description.includes(keyword));
    if (descHasAI) score += 20;
    
    // Hashtags or tags presence
    if (snippet.tags && snippet.tags.length > 0) score += 20;
    
    return Math.min(100, score);
}

function parseDuration(duration: string): number {
    // Parse ISO 8601 duration format (PT15M33S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
}

function extractHashtags(text: string): string[] {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? [...new Set(matches)] : [];
}