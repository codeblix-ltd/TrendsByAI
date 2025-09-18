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
        const { category, maxResults = 20 } = await req.json();
        
        console.log('TrendAI RSS Search Request:', { category, maxResults });

        // Define AI channel collections for each category
        const channelCategories = {
            'AI Horror': [
                'UCZHmQk67mSJgfCCTn7xBfew', // Yannic Kilcher (often covers AI dystopian topics)
                'UCbfYPyITQ-7l4upoX8nvctg', // Two Minute Papers (has AI safety/horror content)
            ],
            'AI ASMR': [
                'UC4a-Gbdw7vOaccHmFo40b9g', // AI ASMR channels
                'UCZHmQk67mSJgfCCTn7xBfew', // Yannic Kilcher (calm explanation style)
            ],
            'AI Beauty': [
                'UC7GeoFYO277cNdRa_k8TWug', // Perfect Corp Beauty Tech AI
                'UCbfYPyITQ-7l4upoX8nvctg', // Two Minute Papers (beauty AI research)
            ],
            'AI Tech': [
                'UCbfYPyITQ-7l4upoX8nvctg', // Two Minute Papers
                'UCZHmQk67mSJgfCCTn7xBfew', // Yannic Kilcher
                'UCNU_lfiiWBdtULKOw6X0Dig', // Krish Naik
            ],
            'AI Art': [
                'UCbfYPyITQ-7l4upoX8nvctg', // Two Minute Papers (AI art research)
                'UCZHmQk67mSJgfCCTn7xBfew', // Yannic Kilcher (AI art papers)
                'UCNU_lfiiWBdtULKOw6X0Dig', // Krish Naik (AI tutorials)
            ]
        };

        // Get channels for the requested category, default to AI Tech
        const channelIds = channelCategories[category] || channelCategories['AI Tech'];
        
        console.log(`Fetching from ${channelIds.length} channels for category: ${category}`);

        // Fetch RSS feeds from multiple channels concurrently
        const rssPromises = channelIds.map(async (channelId) => {
            try {
                const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
                console.log(`Fetching RSS from: ${rssUrl}`);
                
                const response = await fetch(rssUrl);
                if (!response.ok) {
                    console.warn(`Failed to fetch RSS for channel ${channelId}:`, response.status);
                    return [];
                }
                
                const xmlText = await response.text();
                return parseYouTubeRSS(xmlText, category);
            } catch (error) {
                console.error(`Error fetching RSS for channel ${channelId}:`, error.message);
                return [];
            }
        });

        // Wait for all RSS fetches to complete
        const channelResults = await Promise.all(rssPromises);
        
        // Combine and flatten all videos
        const allVideos = channelResults.flat();
        
        console.log(`Total videos fetched: ${allVideos.length}`);

        if (allVideos.length === 0) {
            return new Response(JSON.stringify({
                data: {
                    videos: [],
                    totalResults: 0,
                    searchCategory: category || 'AI Tech'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Sort by publish date (newest first) and limit results
        const sortedVideos = allVideos
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
            .slice(0, Math.min(maxResults, 50));

        const result = {
            data: {
                videos: sortedVideos,
                totalResults: sortedVideos.length,
                searchCategory: category || 'AI Tech'
            }
        };

        console.log(`Returning ${sortedVideos.length} videos successfully`);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('TrendAI RSS Search Error:', error.message);

        const errorResponse = {
            error: {
                code: 'RSS_SEARCH_FAILED',
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

function parseYouTubeRSS(xmlText: string, category: string): any[] {
    try {
        // Use regex to parse RSS XML since DOMParser is unreliable in Deno
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        const entries = [];
        let match;
        
        while ((match = entryRegex.exec(xmlText)) !== null) {
            const entryXml = match[1];
            
            // Extract video data using regex
            const videoId = extractValue(entryXml, '<yt:videoId>([^<]+)<\/yt:videoId>');
            const title = extractValue(entryXml, '<title>([^<]+)<\/title>');
            const channelTitle = extractValue(entryXml, '<name>([^<]+)<\/name>');
            const publishedAt = extractValue(entryXml, '<published>([^<]+)<\/published>');
            const thumbnailMatch = entryXml.match(/<media:thumbnail url="([^"]+)"/)
            const thumbnail = thumbnailMatch ? thumbnailMatch[1] : '';
            
            if (videoId && title) {
                entries.push({
                    id: videoId,
                    title: decodeHTMLEntities(title),
                    channelTitle: decodeHTMLEntities(channelTitle || 'Unknown Channel'),
                    viewCount: '0', // RSS doesn't provide view count
                    likeCount: '0',
                    commentCount: '0',
                    publishedAt: publishedAt || new Date().toISOString(),
                    thumbnail: thumbnail || '',
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    category: category || 'AI Content'
                });
            }
        }
        
        return entries;
    } catch (error) {
        console.error('Error parsing RSS XML:', error.message);
        return [];
    }
}

function extractValue(text: string, regex: string): string {
    const match = text.match(new RegExp(regex));
    return match ? match[1] : '';
}

function decodeHTMLEntities(text: string): string {
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'"
    };
    
    return text.replace(/&[#\w]+;/g, (entity) => {
        return entities[entity] || entity;
    });
}
