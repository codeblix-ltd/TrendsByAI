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
        const { user_email } = await req.json();
        
        console.log('Fetching notifications for user:', user_email);
        
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        
        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }
        
        // Get subscriber ID from email
        const subscriberResponse = await fetch(
            `${supabaseUrl}/rest/v1/subscribers?email=eq.${user_email.toLowerCase()}&select=id`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );
        
        if (!subscriberResponse.ok) {
            throw new Error('Failed to find subscriber');
        }
        
        const subscriberData = await subscriberResponse.json();
        if (subscriberData.length === 0) {
            return new Response(JSON.stringify({
                data: {
                    notifications: [],
                    total: 0,
                    unread: 0
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        
        const subscriberId = subscriberData[0].id;
        
        // Get notifications for this subscriber (last 50)
        const notificationsResponse = await fetch(
            `${supabaseUrl}/rest/v1/email_alerts?subscriber_id=eq.${subscriberId}&select=*&order=sent_at.desc&limit=50`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );
        
        if (!notificationsResponse.ok) {
            throw new Error('Failed to fetch notifications');
        }
        
        const notifications = await notificationsResponse.json();
        
        // Process notifications for frontend display
        const processedNotifications = notifications.map(notification => {
            const briefData = notification.brief_generated || {};
            const notificationContent = briefData.notification_content || {};
            const videoInfo = briefData.video_info || {};
            
            return {
                id: notification.id,
                title: notificationContent.title || 'Video Alert',
                message: notificationContent.message || 'A video is trending',
                brief_summary: notificationContent.briefSummary || 'Check out this trending content',
                urgency_level: notificationContent.urgencyLevel || 'medium',
                icon: notificationContent.icon || '📈',
                video: {
                    title: videoInfo.title || 'Unknown Video',
                    channel: videoInfo.channel || 'Unknown Channel',
                    url: videoInfo.url || '#',
                    type: videoInfo.type || 'Unknown'
                },
                performance: notificationContent.performance || {},
                reasons: notificationContent.reasons || [],
                viral_brief: briefData.viral_brief || null,
                sent_at: notification.sent_at,
                alert_type: notification.alert_type,
                read: false // For future implementation
            };
        });
        
        // Calculate stats
        const total = processedNotifications.length;
        const unread = processedNotifications.filter(n => !n.read).length;
        const today = new Date().toISOString().split('T')[0];
        const todayCount = processedNotifications.filter(n => 
            n.sent_at.startsWith(today)
        ).length;
        
        return new Response(JSON.stringify({
            data: {
                notifications: processedNotifications,
                stats: {
                    total,
                    unread,
                    today: todayCount,
                    last_24h: processedNotifications.filter(n => {
                        const sentDate = new Date(n.sent_at);
                        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
                        return sentDate > yesterday;
                    }).length
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Notification inbox error:', error);
        
        const errorResponse = {
            error: {
                code: 'NOTIFICATION_INBOX_FAILED',
                message: error.message
            }
        };
        
        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});