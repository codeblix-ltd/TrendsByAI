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
        const { spikes } = await req.json();
        
        console.log('Processing email alerts for', spikes?.length || 0, 'spikes');
        
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        
        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }
        
        // Get all verified subscribers
        const subscribersResponse = await fetch(`${supabaseUrl}/rest/v1/subscribers?verified=eq.true&select=*`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });
        
        if (!subscribersResponse.ok) {
            throw new Error('Failed to fetch subscribers');
        }
        
        const subscribers = await subscribersResponse.json();
        console.log(`Found ${subscribers.length} verified subscribers`);
        
        let emailsSent = 0;
        
        for (const spike of spikes) {
            const video = spike.video;
            const reasons = spike.reasons;
            const metrics = spike.metrics;
            
            // Generate viral brief for this video
            const briefResponse = await fetch(`${supabaseUrl}/functions/v1/viral-brief-generator`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ video, reasons, metrics })
            });
            
            let viralBrief = null;
            if (briefResponse.ok) {
                const briefData = await briefResponse.json();
                viralBrief = briefData.data?.brief;
            }
            
            // Filter subscribers based on preferences
            for (const subscriber of subscribers) {
                const preferences = subscriber.preferences || {};
                
                // Check content type preference
                const videoType = video.url?.includes('shorts') ? 'short' : 'long';
                if (preferences.content_type === 'shorts' && videoType !== 'short') continue;
                if (preferences.content_type === 'long' && videoType !== 'long') continue;
                
                // Check threshold preference
                const threshold = preferences.threshold || 'moderate';
                const scoreThreshold = {
                    'conservative': 0.8,
                    'moderate': 0.72,
                    'aggressive': 0.6
                }[threshold] || 0.72;
                
                if (metrics.trend_score < scoreThreshold) continue;
                
                // Generate email content using the specified prompt template
                const emailContent = generateEmailContent({
                    subscriber_email: subscriber.email,
                    video,
                    metrics,
                    reasons,
                    viralBrief
                });
                
                // In production, this would send actual emails via SMTP/SendGrid/etc
                // For demo, we'll log the email content and save to database
                console.log(`📧 EMAIL ALERT for ${subscriber.email}:`);
                console.log(`Subject: ${emailContent.subject}`);
                console.log(`Preview: ${emailContent.preheader}`);
                console.log('---');
                
                // Save alert to database
                const alertData = {
                    subscriber_id: subscriber.id,
                    video_uuid: video.id,
                    alert_type: 'spike_detection',
                    sent_at: new Date().toISOString(),
                    brief_generated: {
                        email_content: emailContent,
                        viral_brief: viralBrief,
                        spike_metrics: metrics,
                        spike_reasons: reasons
                    }
                };
                
                await fetch(`${supabaseUrl}/rest/v1/email_alerts`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(alertData)
                });
                
                emailsSent++;
            }
        }
        
        return new Response(JSON.stringify({
            data: {
                emails_sent: emailsSent,
                subscribers_count: subscribers.length,
                spikes_processed: spikes.length
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Email alert sender error:', error);
        
        const errorResponse = {
            error: {
                code: 'EMAIL_ALERT_FAILED',
                message: error.message
            }
        };
        
        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

function generateEmailContent({ subscriber_email, video, metrics, reasons, viralBrief }) {
    const hoursPublished = video.days_since_published ? video.days_since_published * 24 : 1;
    const viewsPerHour = Math.round(metrics.views_per_hour || (metrics.views / hoursPublished));
    const engagementPercent = metrics.engagement_rate || 0;
    
    // Email composition following the specified prompt template
    const subject = `🚨 VIRAL SPIKE: ${video.title.substring(0, 50)}...`;
    const preheader = `${Math.round(metrics.views/1000)}K views, ${engagementPercent.toFixed(1)}% engagement, ${viewsPerHour} views/hr`;
    
    const briefSnippet = viralBrief ? 
        `Quick Brief: ${viralBrief.mechanics?.hook_pattern || 'High-engagement AI content pattern detected'}` :
        'AI storytelling trend identified - high creator opportunity';
    
    const bodyText = `Hi Creator,

📨 TRENDING NOW: "${video.title}" is spiking!

📈 PERFORMANCE METRICS:
• Views: ${metrics.views.toLocaleString()}
• Engagement: ${engagementPercent.toFixed(2)}%
• Velocity: ${viewsPerHour} views/hour
• Trend Score: ${(metrics.trend_score * 100).toFixed(1)}%

🔥 WHY IT'S SPIKING:
${reasons.map(reason => `• ${reason}`).join('\n')}

🎬 CREATOR BRIEF:
${briefSnippet}

🔗 WATCH NOW: ${video.url}

This trend is moving fast - create similar content while it's hot!

Best,
TrendAI Team`;
    
    const footer = `🔕 Unsubscribe: [link]
⚙️ Manage preferences: [link]

© 2025 TrendAI - AI Video Intelligence Platform
Copyright: Aadhaar Rathore / Flextor`;
    
    return {
        subject,
        preheader, 
        body_text: bodyText,
        footer
    };
}