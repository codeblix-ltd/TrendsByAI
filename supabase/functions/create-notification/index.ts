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
        // Extract notification data from request body
        const requestData = await req.json();
        const { video_id, alert_type, title, message, video_title, channel_name, view_count, engagement_rate } = requestData;

        // Create notification record in alerts table
        const notificationData = {
            video_id: video_id || 'unknown',
            alert_type: alert_type || 'spike_detected',
            title: title || 'Trending Video Alert',
            message: message || 'A new trending video has been detected',
            video_title: video_title,
            channel_name: channel_name,
            view_count: view_count || 0,
            engagement_rate: engagement_rate || 0,
            created_at: new Date().toISOString(),
            is_read: false
        };

        // In a real implementation, this would save to database
        // For now, we'll simulate success and return the notification data
        const result = {
            id: Math.floor(Math.random() * 1000000), // Generate random ID
            ...notificationData,
            status: 'created'
        };

        console.log('Notification created:', result);

        // Return success response
        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        
        // Return error response
        const errorResponse = {
            error: {
                code: 'NOTIFICATION_CREATION_ERROR',
                message: error.message || 'Failed to create notification'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});