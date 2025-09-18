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
        // Extract unsubscribe data from request body
        const requestData = await req.json();
        const { email, subscription_id } = requestData;

        // In a real implementation, this would remove from database
        // For now, we'll simulate success
        const result = {
            email: email,
            subscription_id: subscription_id,
            status: 'unsubscribed',
            unsubscribed_at: new Date().toISOString()
        };

        console.log('User unsubscribed:', result);

        // Return success response
        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error unsubscribing user:', error);
        
        // Return error response
        const errorResponse = {
            error: {
                code: 'UNSUBSCRIBE_ERROR',
                message: error.message || 'Failed to unsubscribe'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});