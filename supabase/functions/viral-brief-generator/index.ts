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
        
        console.log('Generating viral brief for:', video.title);
        
        // Calculate additional metrics
        const hoursPublished = video.days_since_published ? video.days_since_published * 24 : 1;
        const viewsPerHour = metrics.views_per_hour || (metrics.views / hoursPublished);
        const engagementPercent = metrics.engagement_rate || 0;
        
        // Determine tags based on video content
        const tags = [
            video.category || 'AI Content',
            video.channel_name.includes('AI') ? 'AI Storytelling' : 'Tech Education',
            metrics.views > 100000 ? 'Viral' : 'Trending',
            video.url?.includes('shorts') ? 'YouTube Shorts' : 'Long-form'
        ];
        
        // Create the viral brief generation prompt
        const viralBriefPrompt = `System: You are TrendAI's Viral Content Strategist. Analyze trending YouTube videos in the AI storytelling niche (Shorts and long-form) and output creator-ready briefs that can be executed fast. Be specific, concise, and data-driven. Never copy lines verbatim; abstract patterns into reusable mechanics. Keep outputs JSON-valid.

User: Context
Video title: ${video.title}
Channel: ${video.channel_name}
URL: ${video.url}
Duration: ${video.duration || 'Unknown'}s
Type: ${video.url?.includes('shorts') ? 'Shorts' : 'Long'}
Published: ${video.publish_time || 'Recent'} (${hoursPublished.toFixed(1)}h ago)
Metrics now: views=${metrics.views}, likes=${metrics.likes || video.like_count}, comments=${metrics.comments || video.comment_count}
Rates: views/hr=${Math.round(viewsPerHour)}, engagement%=${engagementPercent.toFixed(2)}%
Topic tags: ${tags.join(', ')}
Reason selected: ${reasons.join('; ')}

Task
reason: 2–3 bullets on why it's performing now (hook novelty, pacing, payoff, emotions).
mechanics: {hook_pattern, beats, visual_grammar, emotions}
shorts_brief (≤60s): {titles[], script, visuals, cta, hashtags[]}
long_brief (3–8 min): {titles[], outline_6_beat, scenes[], cta, chapters[]}
remixes: 3 variations shifting setting/theme/POV but keeping the working mechanic
risks: {originality_guardrails, brand_safety}
assets: {tools[], prompt_seeds[]}

Output: Return strict JSON with all keys.`;
        
        // For demo purposes, generate a structured brief without external LLM
        // In production, this would call OpenAI, Anthropic, or other LLM service
        const viralBrief = {
            reason: [
                `High engagement hook: ${video.title} captures attention with AI storytelling appeal`,
                `Performance velocity: ${Math.round(viewsPerHour)} views/hour indicates strong algorithm pickup`,
                `Trend alignment: ${engagementPercent.toFixed(1)}% engagement suggests audience resonance`
            ],
            mechanics: {
                hook_pattern: "AI reveals surprising truth about [topic]",
                beats: "Setup → Demonstration → Revelation → Call to action",
                visual_grammar: "Close-ups, screen recordings, dynamic text overlays",
                emotions: "Curiosity, amazement, FOMO, empowerment"
            },
            shorts_brief: {
                titles: [
                    `AI Just Changed ${video.category || 'Everything'} Forever`,
                    `What AI Can Do That Humans Can't`,
                    `The AI Revolution is HERE`
                ],
                script: "Hook: 'AI just did something impossible...' → Show the capability → Explain the impact → CTA: 'Follow for more AI updates'",
                visuals: "Screen recording of AI in action, reaction shots, text highlights",
                cta: "Follow for daily AI updates that will blow your mind",
                hashtags: ["#AI", "#TechTrends", "#Viral", "#MindBlowing", "#Future"]
            },
            long_brief: {
                titles: [
                    `How AI is Revolutionizing ${video.category || 'Content Creation'}`,
                    `The Complete Guide to AI ${video.category || 'Technology'}`,
                    `Why Everyone is Talking About This AI Breakthrough`
                ],
                outline_6_beat: "1. Hook/Problem → 2. Background → 3. Demonstration → 4. Analysis → 5. Implications → 6. Next steps",
                scenes: [
                    "Attention-grabbing opener",
                    "Context and setup", 
                    "Live demonstration",
                    "Expert analysis",
                    "Future implications",
                    "Call to action"
                ],
                cta: "Subscribe for weekly AI insights and tutorials",
                chapters: ["Introduction", "The Technology", "Real Examples", "Impact Analysis", "What's Next"]
            },
            remixes: [
                "Business perspective: 'How AI will change your industry'",
                "Educational angle: 'AI explained for beginners'",
                "Personal story: 'How AI changed my workflow'"
            ],
            risks: {
                originality_guardrails: "Avoid copying exact phrases, focus on unique insights and personal take",
                brand_safety: "Ensure factual accuracy, avoid overhyping, include disclaimers about AI limitations"
            },
            assets: {
                tools: ["Screen recording software", "Video editor", "Thumbnail creator", "AI tools mentioned"],
                prompt_seeds: [
                    "Create AI-powered [specific use case]",
                    "Generate [content type] using AI",
                    "Automate [process] with artificial intelligence"
                ]
            }
        };
        
        console.log('Viral brief generated successfully');
        
        return new Response(JSON.stringify({
            data: {
                brief: viralBrief,
                video_info: {
                    title: video.title,
                    channel: video.channel_name,
                    metrics: metrics,
                    spike_reasons: reasons
                },
                generated_at: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Viral brief generation error:', error);
        
        const errorResponse = {
            error: {
                code: 'VIRAL_BRIEF_FAILED',
                message: error.message
            }
        };
        
        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});