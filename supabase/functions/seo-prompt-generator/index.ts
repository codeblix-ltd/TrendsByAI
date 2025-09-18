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
        const { videoData, promptType = 'veo3' } = await req.json();

        if (!videoData || !videoData.title) {
            throw new Error('Video data with title is required');
        }

        console.log(`Generating ${promptType} prompt for video: ${videoData.title}`);

        let generatedPrompts = [];

        if (promptType === 'veo3') {
            // Generate Veo 3 video prompts based on successful AI content
            const veo3Prompts = [
                `Create a cinematic AI demonstration video showing "${videoData.title.replace(/[^a-zA-Z0-9\s]/g, '')}" with professional lighting, smooth camera movements, and tech-focused visuals. Style: Modern tech commercial with clean aesthetics.`,
                
                `Generate a tutorial-style video explaining ${videoData.category.toLowerCase()} concepts, featuring animated graphics, screen recordings, and professional voiceover. Visual style: Clean, educational, with blue and white color scheme.`,
                
                `Create an engaging AI showcase video with dynamic transitions, futuristic UI elements, and data visualization graphics. Theme: ${videoData.category} innovation. Style: Sleek, modern, with neon accents.`,
                
                `Produce a comparison video showing before/after AI transformation, with split-screen effects, progress indicators, and compelling visual storytelling. Focus: ${videoData.category} applications.`,
                
                `Generate a time-lapse style video demonstrating AI workflow automation, featuring fast-paced editing, multiple screen captures, and productivity visualization. Theme: Efficiency and innovation.`
            ];
            
            generatedPrompts = veo3Prompts;
        } else if (promptType === 'seo') {
            // Generate SEO-optimized content packages
            const seoPackage = {
                title: `${videoData.title} - Complete Guide & Tutorial`,
                description: `Comprehensive tutorial on ${videoData.category}. Learn everything about ${videoData.title.substring(0, 100)}... Perfect for beginners and professionals. Step-by-step guide with practical examples.`,
                tags: [
                    videoData.category.toLowerCase().replace(' ', ''),
                    'artificial intelligence',
                    'ai tutorial',
                    'tech guide',
                    'ai tools',
                    'automation',
                    'machine learning',
                    'productivity',
                    'innovation',
                    '2025 trends'
                ],
                hashtags: [
                    '#AI',
                    '#ArtificialIntelligence', 
                    '#TechTutorial',
                    '#Innovation',
                    '#Automation',
                    '#MachineLearning',
                    '#Productivity',
                    '#TechTips',
                    '#FutureTech',
                    '#DigitalTransformation'
                ],
                thumbnail_text: 'ULTIMATE GUIDE',
                category: videoData.category,
                target_keywords: [
                    `${videoData.category} tutorial`,
                    'ai tools guide',
                    'artificial intelligence explained',
                    'tech innovation 2025'
                ]
            };
            
            generatedPrompts = [seoPackage];
        }

        console.log(`Generated ${generatedPrompts.length} prompts for ${promptType}`);

        const result = {
            data: {
                prompts: generatedPrompts,
                promptType: promptType,
                sourceVideo: {
                    title: videoData.title,
                    category: videoData.category,
                    views: videoData.viewCount,
                    engagement: videoData.likeCount + videoData.commentCount
                },
                generatedAt: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('SEO prompt generation error:', error);

        const errorResponse = {
            error: {
                code: 'PROMPT_GENERATION_FAILED',
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