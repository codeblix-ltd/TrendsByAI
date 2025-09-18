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
        const { email, preferences } = await req.json();
        
        console.log('Email subscription request:', { email, preferences });
        
        if (!email || !email.includes('@')) {
            throw new Error('Valid email address is required');
        }
        
        // Generate verification token
        const verificationToken = crypto.randomUUID();
        
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        
        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }
        
        // Insert or update subscriber
        const upsertResponse = await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
                email: email.toLowerCase(),
                preferences: preferences || {
                    content_type: 'both',
                    frequency: 'realtime', 
                    threshold: 'moderate'
                },
                verification_token: verificationToken,
                verified: false,
                created_at: new Date().toISOString()
            })
        });
        
        if (!upsertResponse.ok) {
            const errorText = await upsertResponse.text();
            console.error('Failed to save subscriber:', errorText);
            throw new Error('Failed to save subscription');
        }
        
        console.log('Subscriber saved successfully');
        
        // TODO: Send verification email (implement in production)
        // For now, auto-verify for demo purposes
        const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/subscribers?email=eq.${email.toLowerCase()}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                verified: true
            })
        });
        
        return new Response(JSON.stringify({
            data: {
                success: true,
                message: 'Successfully subscribed to TrendAI alerts!',
                email: email.toLowerCase(),
                preferences: preferences
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Email subscription error:', error);
        
        const errorResponse = {
            error: {
                code: 'SUBSCRIPTION_FAILED',
                message: error.message
            }
        };
        
        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});