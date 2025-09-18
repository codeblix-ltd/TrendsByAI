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
        const { video, reasons, metrics } = await req.json();
        
        console.log('Generating smart template brief for:', video.title);
        
        // Calculate additional metrics for template generation
        const hoursPublished = video.days_since_published ? video.days_since_published * 24 : 1;
        const viewsPerHour = metrics.views_per_hour || (metrics.views / hoursPublished);
        const engagementPercent = metrics.engagement_rate || 0;
        const isShort = video.url?.includes('shorts') || (video.duration && video.duration < 60);
        const videoType = isShort ? 'Short' : 'Long';
        
        // Determine content category based on title and channel
        const titleLower = video.title.toLowerCase();
        const channelLower = video.channel_name.toLowerCase();
        
        let contentCategory = 'General AI';
        if (titleLower.includes('story') || titleLower.includes('narrative')) {
            contentCategory = 'AI Storytelling';
        } else if (titleLower.includes('tutorial') || titleLower.includes('how to')) {
            contentCategory = 'AI Tutorial';
        } else if (titleLower.includes('news') || titleLower.includes('update')) {
            contentCategory = 'AI News';
        } else if (titleLower.includes('review') || titleLower.includes('analysis')) {
            contentCategory = 'AI Analysis';
        }
        
        // Generate performance insights
        const performanceInsights = [];
        if (viewsPerHour > 5000) {
            performanceInsights.push('Exceptional velocity - trending algorithm pickup');
        } else if (viewsPerHour > 1000) {
            performanceInsights.push('Strong velocity - gaining momentum');
        }
        
        if (engagementPercent > 5) {
            performanceInsights.push('High audience engagement - strong hook effectiveness');
        } else if (engagementPercent > 2) {
            performanceInsights.push('Good engagement - audience resonance confirmed');
        }
        
        if (metrics.trend_score > 0.8) {
            performanceInsights.push('Viral potential - multiple success indicators');
        }
        
        // Template-based viral brief generation
        const viralBrief = {
            analysis: {
                content_type: videoType,
                category: contentCategory,
                performance_tier: viewsPerHour > 5000 ? 'Viral' : viewsPerHour > 1000 ? 'Trending' : 'Rising',
                hook_effectiveness: engagementPercent > 4 ? 'High' : engagementPercent > 2 ? 'Medium' : 'Standard'
            },
            reasons: performanceInsights.length > 0 ? performanceInsights : [
                `${contentCategory} content gaining traction`,
                `${Math.round(viewsPerHour)} views/hour velocity`,
                `${engagementPercent.toFixed(1)}% engagement rate`
            ],
            mechanics: {
                hook_pattern: generateHookPattern(titleLower, contentCategory),
                content_structure: videoType === 'Short' ? 'Hook → Demo → Reveal → CTA' : 'Setup → Problem → Solution → Deep dive → Results → Next steps',
                engagement_drivers: generateEngagementDrivers(contentCategory, engagementPercent),
                optimal_timing: videoType === 'Short' ? '0-3s hook, 10-15s demo, 25-30s reveal' : '0-10s hook, 30s problem, 2min solution, 1min results'
            },
            content_brief: {
                titles: generateTitleSuggestions(video.title, contentCategory, videoType),
                script_structure: generateScriptStructure(contentCategory, videoType),
                visual_elements: generateVisualElements(contentCategory, videoType),
                call_to_action: generateCTA(contentCategory, videoType),
                hashtags: generateHashtags(contentCategory, videoType)
            },
            adaptation_strategies: {
                shorts_version: videoType === 'Long' ? generateShortsAdaptation(video.title, contentCategory) : null,
                long_version: videoType === 'Short' ? generateLongFormAdaptation(video.title, contentCategory) : null,
                remix_angles: generateRemixAngles(contentCategory, video.title)
            },
            optimization_tips: {
                timing: getBestPostingTimes(contentCategory),
                thumbnail_strategy: getThumbnailStrategy(contentCategory, videoType),
                engagement_tactics: getEngagementTactics(contentCategory),
                growth_hacks: getGrowthHacks(contentCategory, videoType)
            },
            competitive_intel: {
                trending_topics: getTrendingTopics(contentCategory),
                content_gaps: getContentGaps(contentCategory),
                creator_opportunities: getCreatorOpportunities(engagementPercent, viewsPerHour)
            }
        };
        
        console.log('Smart template brief generated successfully');
        
        return new Response(JSON.stringify({
            data: {
                brief: viralBrief,
                video_info: {
                    title: video.title,
                    channel: video.channel_name,
                    type: videoType,
                    category: contentCategory,
                    metrics: {
                        views: metrics.views,
                        views_per_hour: Math.round(viewsPerHour),
                        engagement_rate: engagementPercent,
                        trend_score: metrics.trend_score
                    }
                },
                spike_context: {
                    reasons: reasons,
                    detection_time: new Date().toISOString(),
                    performance_tier: viralBrief.analysis.performance_tier
                },
                generated_at: new Date().toISOString(),
                template_version: '2.0'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Smart template brief generation error:', error);
        
        const errorResponse = {
            error: {
                code: 'TEMPLATE_BRIEF_FAILED',
                message: error.message
            }
        };
        
        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper functions for template generation
function generateHookPattern(title, category) {
    const patterns = {
        'AI Storytelling': 'AI just created a story that will change everything...',
        'AI Tutorial': 'This AI technique will save you hours of work...',
        'AI News': 'Breaking: AI just achieved something incredible...',
        'AI Analysis': 'I analyzed AI trends and found something shocking...',
        'General AI': 'AI is about to disrupt everything you know...'
    };
    return patterns[category] || patterns['General AI'];
}

function generateEngagementDrivers(category, engagement) {
    const drivers = ['Curiosity gap', 'Problem-solution fit', 'Visual demonstration', 'Emotional connection'];
    if (engagement > 4) drivers.push('Strong call-to-action', 'Community engagement');
    return drivers;
}

function generateTitleSuggestions(originalTitle, category, videoType) {
    const templates = {
        'AI Storytelling': [
            'AI Created a Story That Made Me Cry',
            'The AI Story That Broke the Internet',
            'I Asked AI to Write a Story... This Happened'
        ],
        'AI Tutorial': [
            'AI Tutorial That Changes Everything',
            'Learn This AI Trick in 60 Seconds',
            'AI Made This in Minutes (Tutorial)'
        ],
        'General AI': [
            'AI Just Did Something Impossible',
            'This AI Will Change Your Life',
            'AI vs Human: The Results Will Shock You'
        ]
    };
    return templates[category] || templates['General AI'];
}

function generateScriptStructure(category, videoType) {
    if (videoType === 'Short') {
        return 'Hook (0-3s) → Problem/Question (3-8s) → Solution/Demo (8-25s) → Reveal/Result (25-35s) → CTA (35-40s)';
    } else {
        return 'Hook (0-15s) → Context/Problem (15-60s) → Deep Dive/Tutorial (1-5min) → Results/Demo (5-7min) → Wrap-up/CTA (7-8min)';
    }
}

function generateVisualElements(category, videoType) {
    const elements = ['Screen recording', 'Close-up shots', 'Dynamic text overlays', 'Progress indicators'];
    if (videoType === 'Short') {
        elements.push('Quick cuts', 'Zoom effects', 'Color highlights');
    } else {
        elements.push('Chapter markers', 'Detailed explanations', 'Before/after comparisons');
    }
    return elements;
}

function generateCTA(category, videoType) {
    const ctas = {
        'Short': 'Follow for daily AI updates that will blow your mind!',
        'Long': 'Subscribe for weekly deep-dives into the AI revolution'
    };
    return ctas[videoType] || ctas['Short'];
}

function generateHashtags(category, videoType) {
    const base = ['#AI', '#Viral', '#Trending', '#MindBlowing', '#Tech'];
    if (category.includes('Story')) base.push('#AIStory', '#Creative', '#Writing');
    if (category.includes('Tutorial')) base.push('#Tutorial', '#HowTo', '#Learn');
    if (videoType === 'Short') base.push('#Shorts', '#QuickTips');
    return base;
}

function generateShortsAdaptation(title, category) {
    return {
        hook: 'Turn the main insight into a 3-second visual hook',
        structure: 'Problem → Solution → Result in 30 seconds',
        focus: 'Single strongest point from the long-form content'
    };
}

function generateLongFormAdaptation(title, category) {
    return {
        expansion: 'Deep dive into the process and methodology',
        structure: 'Tutorial format with step-by-step breakdown',
        value_adds: 'Behind-the-scenes, troubleshooting, advanced tips'
    };
}

function generateRemixAngles(category, title) {
    return [
        'Business perspective: How this affects your industry',
        'Beginner angle: Explain it like they\'re 5',
        'Personal story: Your experience using this AI'
    ];
}

function getBestPostingTimes(category) {
    return 'Peak engagement: 2-4 PM EST weekdays, 10 AM-12 PM weekends';
}

function getThumbnailStrategy(category, videoType) {
    return {
        elements: ['Bright colors', 'Large text', 'Surprised expression', 'AI visual elements'],
        style: videoType === 'Short' ? 'High contrast, minimal text' : 'Detailed, informative preview',
        colors: 'Orange/yellow gradient matching brand, high contrast backgrounds'
    };
}

function getEngagementTactics(category) {
    return [
        'Ask questions in first 10 seconds',
        'Use cliffhangers mid-content',
        'Include interactive elements',
        'Respond to comments quickly'
    ];
}

function getGrowthHacks(category, videoType) {
    return [
        'Cross-post on multiple platforms',
        'Create complementary content series',
        'Collaborate with AI content creators',
        'Use trending audio/music'
    ];
}

function getTrendingTopics(category) {
    return ['ChatGPT updates', 'AI art generation', 'Automation tools', 'AI writing assistants'];
}

function getContentGaps(category) {
    return ['AI for specific industries', 'Beginner-friendly tutorials', 'AI ethics discussions'];
}

function getCreatorOpportunities(engagement, velocity) {
    const opportunities = ['High engagement potential in AI niche'];
    if (velocity > 3000) opportunities.push('Trending algorithm pickup likely');
    if (engagement > 3) opportunities.push('Strong community building opportunity');
    return opportunities;
}