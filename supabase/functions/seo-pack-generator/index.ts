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
        const { videoData, targetKeywords = [], platform = 'youtube' } = await req.json();

        if (!videoData || !videoData.title) {
            throw new Error('Video data with title is required');
        }

        console.log('Generating SEO pack for video:', videoData.title);

        // Analyze current content
        const currentTitle = videoData.title;
        const currentDescription = videoData.description || '';
        const currentTags = videoData.tags || [];
        
        // Extract keywords from existing content
        const extractedKeywords = extractKeywords(currentTitle + ' ' + currentDescription);
        
        // Combine with target keywords
        const allKeywords = [...new Set([...extractedKeywords, ...targetKeywords])];
        
        // Generate optimized title variations
        const titleVariations = generateTitleVariations(currentTitle, allKeywords);
        
        // Generate optimized description
        const optimizedDescription = generateOptimizedDescription(currentDescription, allKeywords, videoData);
        
        // Generate hashtags
        const hashtags = generateHashtags(allKeywords, platform);
        
        // Generate thumbnail suggestions
        const thumbnailSuggestions = generateThumbnailSuggestions(videoData);
        
        // Generate posting schedule recommendations
        const postingSchedule = generatePostingSchedule(platform);
        
        // Generate engagement hooks
        const engagementHooks = generateEngagementHooks(currentTitle, allKeywords);
        
        // Calculate SEO scores
        const currentSEOScore = calculateSEOScore(videoData);
        const optimizedSEOScore = calculateOptimizedSEOScore(titleVariations[0], optimizedDescription, hashtags);
        
        const seoPack = {
            data: {
                analysis: {
                    currentSEOScore,
                    optimizedSEOScore,
                    improvementPotential: optimizedSEOScore - currentSEOScore,
                    extractedKeywords,
                    competitorAnalysis: generateCompetitorInsights(allKeywords)
                },
                optimizations: {
                    titleVariations,
                    optimizedDescription,
                    hashtags,
                    suggestedTags: generateSuggestedTags(allKeywords),
                    thumbnailSuggestions,
                    engagementHooks
                },
                strategy: {
                    postingSchedule,
                    contentPillars: generateContentPillars(allKeywords),
                    viralityFactors: analyzeViralityFactors(videoData),
                    audienceTargeting: generateAudienceTargeting(allKeywords)
                },
                actionPlan: {
                    immediate: generateImmediateActions(videoData),
                    shortTerm: generateShortTermActions(allKeywords),
                    longTerm: generateLongTermStrategy(allKeywords)
                }
            }
        };

        console.log('SEO pack generated successfully');

        return new Response(JSON.stringify(seoPack), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('SEO pack generator error:', error);

        const errorResponse = {
            error: {
                code: 'SEO_PACK_GENERATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper functions
function extractKeywords(text: string): string[] {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'];
    const words = text.toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.includes(word));
    
    const wordFreq = {};
    words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    return Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([word]) => word);
}

function generateTitleVariations(currentTitle: string, keywords: string[]): string[] {
    const variations = [];
    
    // Keyword-optimized version
    const primaryKeyword = keywords[0] || 'AI';
    variations.push(`${primaryKeyword.toUpperCase()}: ${currentTitle}`);
    
    // Question format
    variations.push(`How ${currentTitle.toLowerCase()}?`);
    
    // List format
    variations.push(`5 Ways ${currentTitle}`);
    
    // Emotional hook
    variations.push(`You Won't Believe ${currentTitle}`);
    
    // Year/Current
    const currentYear = new Date().getFullYear();
    variations.push(`${currentTitle} (${currentYear} Guide)`);
    
    return variations.slice(0, 5);
}

function generateOptimizedDescription(currentDesc: string, keywords: string[], videoData: any): string {
    const keywordPhrase = keywords.slice(0, 3).join(', ');
    
    let optimized = '';
    
    // Hook
    optimized += `🚀 ${currentDesc.split('.')[0] || 'Discover the latest in ' + keywordPhrase}\n\n`;
    
    // Main content
    if (currentDesc.length > 50) {
        optimized += currentDesc + '\n\n';
    } else {
        optimized += `In this video, we explore ${keywordPhrase} and its impact on the future. ` +
                    `Learn about the latest developments, trends, and what this means for you.\n\n`;
    }
    
    // Timestamps (placeholder)
    optimized += `📋 TIMESTAMPS:\n`;
    optimized += `0:00 - Introduction\n`;
    optimized += `1:30 - Main Topic\n`;
    optimized += `3:45 - Key Insights\n`;
    optimized += `6:20 - Conclusion\n\n`;
    
    // Keywords naturally integrated
    optimized += `🔍 KEYWORDS: ${keywords.slice(0, 8).join(' • ')}\n\n`;
    
    // Call to action
    optimized += `👍 Like this video if you found it helpful!\n`;
    optimized += `🔔 Subscribe for more ${keywords[0]} content\n`;
    optimized += `💬 Share your thoughts in the comments below`;
    
    return optimized;
}

function generateHashtags(keywords: string[], platform: string): string[] {
    const hashtags = [];
    
    // Platform-specific popular hashtags
    if (platform === 'youtube') {
        hashtags.push('#AI', '#Technology', '#Innovation', '#Future', '#TechNews');
    }
    
    // Keyword-based hashtags
    keywords.slice(0, 10).forEach(keyword => {
        const hashtag = '#' + keyword.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
        if (hashtag.length > 1 && hashtag.length <= 30) {
            hashtags.push(hashtag);
        }
    });
    
    // Trending hashtags
    hashtags.push('#Viral', '#Trending', '#MustWatch', '#GameChanger', '#Breakthrough');
    
    return [...new Set(hashtags)].slice(0, 20);
}

function generateThumbnailSuggestions(videoData: any): any[] {
    return [
        {
            type: 'Text Overlay',
            suggestion: 'Large, bold text with the main keyword prominently displayed',
            colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
            elements: ['Main keyword in large font', 'Contrasting background', 'Emotional expression']
        },
        {
            type: 'Split Screen',
            suggestion: 'Before/after or comparison layout',
            colors: ['#96CEB4', '#FFEAA7', '#DDA0DD'],
            elements: ['Clear visual contrast', 'Arrow or vs symbol', 'Descriptive labels']
        },
        {
            type: 'Question Format',
            suggestion: 'Pose a question that the video answers',
            colors: ['#74B9FF', '#FD79A8', '#FDCB6E'],
            elements: ['Question mark', 'Curious expression', 'Question text']
        }
    ];
}

function generatePostingSchedule(platform: string): any {
    const baseSchedule = {
        youtube: {
            bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
            bestTimes: ['2:00 PM', '3:00 PM', '4:00 PM'],
            timezone: 'EST'
        }
    };
    
    return {
        ...baseSchedule[platform],
        frequency: 'Daily for maximum growth',
        seasonality: 'Tech content performs better on weekdays',
        competitorAnalysis: 'Most competitors post in the morning, consider afternoon slots'
    };
}

function generateEngagementHooks(title: string, keywords: string[]): string[] {
    return [
        `What if I told you that ${keywords[0]} could change everything?`,
        `The one thing nobody tells you about ${keywords[0]}...`,
        `This ${keywords[0]} discovery will blow your mind`,
        `Everyone is talking about ${keywords[0]}, but here's what they're missing`,
        `The secret behind ${title.toLowerCase()} revealed`
    ];
}

function calculateSEOScore(videoData: any): number {
    let score = 0;
    
    // Title optimization
    if (videoData.title && videoData.title.length >= 40 && videoData.title.length <= 60) score += 20;
    if (videoData.title && /\d/.test(videoData.title)) score += 10;
    
    // Description
    if (videoData.description && videoData.description.length > 100) score += 20;
    
    // Tags
    if (videoData.tags && videoData.tags.length > 5) score += 15;
    
    // Engagement metrics
    if (videoData.engagement_rate > 5) score += 20;
    if (videoData.view_count > 1000) score += 15;
    
    return Math.min(100, score);
}

function calculateOptimizedSEOScore(title: string, description: string, hashtags: string[]): number {
    return 85; // Simulated optimized score
}

function generateCompetitorInsights(keywords: string[]): any {
    return {
        topCompetitors: ['TechCrunch', 'Wired', 'The Verge'],
        averageViews: '2.5M',
        commonTactics: ['Clickbait titles', 'Emotional thumbnails', 'Trending topics'],
        gapOpportunities: ['More technical depth', 'Beginner-friendly content', 'Case studies']
    };
}

function generateSuggestedTags(keywords: string[]): string[] {
    return keywords.concat(['technology', 'innovation', 'future', 'digital', 'trending']).slice(0, 15);
}

function generateContentPillars(keywords: string[]): string[] {
    return [
        'Educational Content',
        'Industry News & Updates',
        'Tutorials & How-tos',
        'Opinion & Analysis',
        'Product Reviews'
    ];
}

function analyzeViralityFactors(videoData: any): any {
    return {
        emotionalTriggers: ['Curiosity', 'Surprise', 'FOMO'],
        shareabilityScore: 75,
        trendingPotential: 'High',
        recommendations: [
            'Add emotional hooks in first 15 seconds',
            'Include surprising statistics',
            'End with strong call-to-action'
        ]
    };
}

function generateAudienceTargeting(keywords: string[]): any {
    return {
        primaryAudience: 'Tech enthusiasts aged 25-45',
        secondaryAudience: 'Professionals in tech industry',
        interests: keywords.concat(['startups', 'innovation', 'programming']),
        platforms: ['YouTube', 'LinkedIn', 'Twitter', 'Reddit'],
        contentStyle: 'Educational yet entertaining'
    };
}

function generateImmediateActions(videoData: any): string[] {
    return [
        'Optimize title with primary keyword',
        'Add timestamps to description',
        'Create 3 thumbnail variations',
        'Add end screen and cards',
        'Share on relevant social platforms'
    ];
}

function generateShortTermActions(keywords: string[]): string[] {
    return [
        `Create content series around ${keywords[0]}`,
        'Collaborate with influencers in the space',
        'Analyze competitor strategies',
        'Build email list for promotion',
        'Optimize posting schedule'
    ];
}

function generateLongTermStrategy(keywords: string[]): string[] {
    return [
        'Establish thought leadership in AI space',
        'Build community around content',
        'Develop signature content formats',
        'Create comprehensive content calendar',
        'Invest in professional production quality'
    ];
}