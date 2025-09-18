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
        // Parse request parameters
        const requestData = await req.json().catch(() => ({}));
        const { category = 'AI Horror', maxResults = 12, userApiKey, customQuery } = requestData;

        // YouTube API configuration - prioritize user-provided key
        const YOUTUBE_API_KEY = userApiKey || 'AIzaSyB_KlEaUYdEPTKqrC6jl5DHy5DftcVq_1k';
        const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
        
        console.log(`Using API key: ${userApiKey ? 'User-provided key' : 'Default platform key'}`);
        console.log(`Search type: ${customQuery ? 'Custom query' : 'Category search'}`);
        
        // Focus on recent content (last 48 hours)
        const now = new Date();
        const publishedAfter = new Date(now.getTime() - (48 * 60 * 60 * 1000)).toISOString();
        
        // Supabase configuration
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }
        
        // Define search terms for expanded AI categories (25+ categories)
        const searchTerms = {
            'AI Horror': [
                'AI horror stories',
                'AI creepypasta', 
                'artificial intelligence horror',
                'AI scary stories',
                'machine learning horror',
                'robot horror stories',
                'AI thriller',
                'dystopian AI'
            ],
            'AI ASMR': [
                'AI ASMR',
                'artificial intelligence ASMR',
                'AI relaxation sounds',
                'AI whisper videos',
                'AI tingles',
                'AI sleep sounds'
            ],
            'AI Analog Horror': [
                'AI analog horror',
                'AI found footage',
                'AI retro horror',
                'AI VHS horror',
                'AI liminal horror',
                'AI vintage creepy'
            ],
            'AI Liminal Spaces': [
                'AI liminal spaces',
                'AI backrooms',
                'AI empty spaces',
                'AI uncanny places',
                'AI eerie locations',
                'AI abandoned places'
            ],
            'AI True Crime Narration': [
                'AI true crime',
                'AI crime stories',
                'AI mystery narration',
                'AI detective stories',
                'AI criminal cases',
                'AI forensics'
            ],
            'AI Dark Fantasy': [
                'AI dark fantasy',
                'AI gothic stories',
                'AI dark magic',
                'AI fantasy horror',
                'AI medieval dark',
                'AI vampire stories'
            ],
            'AI Surreal/Weird Core': [
                'AI surreal',
                'AI weird core',
                'AI strange videos',
                'AI bizarre content',
                'AI abstract art',
                'AI dreamlike'
            ],
            'AI Backrooms': [
                'AI backrooms',
                'AI level 0',
                'AI infinite offices',
                'AI yellow rooms',
                'AI liminal backrooms',
                'AI endless maze'
            ],
            'AI Storytelling Shorts': [
                'AI storytelling',
                'AI short stories',
                'AI narrative',
                'AI plot twists',
                'AI story generator',
                'AI tale'
            ],
            'AI Music/AI Phonk': [
                'AI music',
                'AI phonk',
                'AI beats',
                'AI generated music',
                'AI hip hop',
                'AI electronic'
            ],
            'AI Lo-fi/Study Ambience': [
                'AI lo-fi',
                'AI study music',
                'AI ambient',
                'AI chill beats',
                'AI relaxing music',
                'AI focus sounds'
            ],
            'AI Nature Ambience': [
                'AI nature sounds',
                'AI forest ambience',
                'AI rain sounds',
                'AI ocean waves',
                'AI bird sounds',
                'AI nature ASMR'
            ],
            'AI Kinetic Typography': [
                'AI kinetic typography',
                'AI text animation',
                'AI moving text',
                'AI typography art',
                'AI word animation',
                'AI text effects'
            ],
            'AI Satisfying Visuals': [
                'AI satisfying',
                'AI oddly satisfying',
                'AI mesmerizing',
                'AI hypnotic',
                'AI smooth animations',
                'AI visual satisfaction'
            ],
            'AI Miniature Worlds': [
                'AI miniature',
                'AI tiny worlds',
                'AI dioramas',
                'AI small scale',
                'AI micro worlds',
                'AI miniature scenes'
            ],
            'AI Cooking/Hyper-Real Food': [
                'AI cooking',
                'AI food',
                'AI recipes',
                'AI hyper realistic food',
                'AI food art',
                'AI culinary'
            ],
            'AI Fashion Try-ons': [
                'AI fashion',
                'AI try on',
                'AI outfit',
                'AI clothing',
                'AI style',
                'AI fashion show'
            ],
            'AI VTubers/Virtual Influencers': [
                'AI VTuber',
                'AI virtual influencer',
                'AI avatar',
                'AI virtual personality',
                'AI digital human',
                'AI virtual streamer'
            ],
            'AI Anime Scenes': [
                'AI anime',
                'AI manga',
                'AI animation',
                'AI anime art',
                'AI anime scenes',
                'AI Japanese animation'
            ],
            'AI Meme Generators': [
                'AI memes',
                'AI meme generator',
                'AI funny',
                'AI humor',
                'AI comedy',
                'AI viral memes'
            ],
            'AI Tech Tutorials': [
                'AI tutorials',
                'AI technology',
                'AI how to',
                'AI coding',
                'AI programming',
                'AI tech guide'
            ],
            'AI Productivity Hacks': [
                'AI productivity',
                'AI life hacks',
                'AI efficiency',
                'AI automation',
                'AI workflow',
                'AI time management'
            ],
            'AI News/Trends': [
                'AI news',
                'AI trends',
                'AI updates',
                'artificial intelligence news',
                'AI developments',
                'AI breakthrough'
            ],
            'AI Photo Restoration/Enhance': [
                'AI photo restoration',
                'AI enhance',
                'AI upscale',
                'AI photo repair',
                'AI image enhancement',
                'AI colorization'
            ],
            'AI Lego/Stop-motion Hybrids': [
                'AI lego',
                'AI stop motion',
                'AI brick animation',
                'AI toy animation',
                'AI claymation',
                'AI puppetry'
            ],
            // Legacy categories for backward compatibility
            'Tech': [
                'technology news',
                'tech review',
                'programming',
                'software development'
            ],
            'Gaming': [
                'gaming news',
                'game review',
                'esports',
                'indie games'
            ],
            'Science': [
                'science news',
                'space exploration',
                'physics',
                'biology'
            ]
        };

        // Get search terms for the requested category or use custom query
        let searchQuery;
        if (customQuery && customQuery.trim()) {
            // Use custom query directly
            searchQuery = customQuery.trim();
        } else {
            // Use predefined category terms
            const categoryTerms = searchTerms[category] || searchTerms['AI Horror'];
            searchQuery = categoryTerms[Math.floor(Math.random() * categoryTerms.length)];
        }

        console.log(`Searching for: "${searchQuery}" in category: ${category}`);

        // Make YouTube API call with recent video prioritization
        const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`);
        searchUrl.searchParams.append('part', 'snippet');
        searchUrl.searchParams.append('q', searchQuery);
        searchUrl.searchParams.append('type', 'video');
        searchUrl.searchParams.append('order', 'date'); // Sort by upload date (newest first)
        searchUrl.searchParams.append('publishedAfter', publishedAfter); // Focus on recent content
        searchUrl.searchParams.append('maxResults', maxResults.toString());
        searchUrl.searchParams.append('key', YOUTUBE_API_KEY);
        searchUrl.searchParams.append('safeSearch', 'moderate');
        
        const response = await fetch(searchUrl.toString());
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('YouTube API error:', errorData);
            throw new Error(`YouTube API error: ${response.status} - ${errorData}`);
        }
        
        const data = await response.json();
        
        // Process and structure the video data
        const videos = data.items?.map((item: any) => {
            const videoId = item.id?.videoId;
            const snippet = item.snippet || {};
            
            return {
                id: videoId,
                title: snippet.title || 'Untitled',
                description: snippet.description || '',
                thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
                channelTitle: snippet.channelTitle || 'Unknown Channel',
                publishedAt: snippet.publishedAt || new Date().toISOString(),
                category: category,
                searchQuery: searchQuery,
                youtubeUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
                scannedAt: new Date().toISOString()
            };
        }) || [];
        
        console.log(`Found ${videos.length} videos for category: ${category}`);
        
        // Store videos in database if any found
        let savedVideos = [];
        if (videos.length > 0) {
            try {
                // Prepare video records for database insertion
                const videoRecords = videos.map(video => ({
                    video_id: video.id,
                    title: video.title,
                    channel: video.channelTitle,
                    thumbnail: video.thumbnail,
                    url: video.youtubeUrl,
                    published_at: video.publishedAt,
                    category: video.category,
                    scan_session_id: crypto.randomUUID(),
                    region_code: 'GLOBAL',
                    country_name: 'Worldwide'
                }));
                
                // Insert videos into database
                const dbResponse = await fetch(`${supabaseUrl}/rest/v1/video_scans`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(videoRecords)
                });
                
                if (dbResponse.ok) {
                    savedVideos = await dbResponse.json();
                    console.log(`Successfully saved ${savedVideos.length} videos to database`);
                } else {
                    const errorText = await dbResponse.text();
                    console.error('Database save error:', errorText);
                }
            } catch (dbError) {
                console.error('Database operation failed:', dbError);
                // Continue execution even if database save fails
            }
        }
        
        // Update API usage tracking
        try {
            await fetch(`${supabaseUrl}/rest/v1/api_usage_tracking`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    scan_date: new Date().toISOString().split('T')[0],
                    quota_used: 1,
                    search_queries: 1,
                    scan_sessions: 1
                })
            });
        } catch (apiTrackingError) {
            console.error('API tracking update failed:', apiTrackingError);
        }
        
        // Return structured response
        const result = {
            success: true,
            category: category,
            searchQuery: searchQuery,
            customQuery: customQuery || null,
            videoCount: videos.length,
            savedToDatabase: savedVideos.length,
            videos: videos,
            scannedAt: new Date().toISOString(),
            publishedAfter: publishedAfter,
            searchType: customQuery ? 'custom' : 'category',
            apiQuotaUsed: 1, // Each search uses 1 quota unit
            usingUserApiKey: !!userApiKey,
            apiKeySource: userApiKey ? 'user-provided' : 'default-platform'
        };

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('YouTube scanner error:', error);
        
        const errorResponse = {
            error: {
                code: 'YOUTUBE_SCAN_FAILED',
                message: error.message,
                category: 'AI Horror',
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});