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
        const { action, email, token, preferences } = await req.json();
        
        console.log('Subscription management request:', { action, email });
        
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        
        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        if (action === 'subscribe') {
            // Handle subscription
            if (!email || !email.includes('@')) {
                throw new Error('Valid email address is required');
            }
            
            // Generate unsubscribe token
            const unsubscribeToken = crypto.randomUUID();
            
            const subscriberData = {
                email: email.toLowerCase().trim(),
                preferences: preferences || {
                    content_type: 'both',
                    frequency: 'realtime',
                    threshold: 'moderate',
                    notifications_enabled: true,
                    push_notifications: true
                },
                verification_token: unsubscribeToken,
                verified: true, // Auto-verify for no-API version
                created_at: new Date().toISOString()
            };
            
            // Upsert subscriber
            const upsertResponse = await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates,return=representation'
                },
                body: JSON.stringify(subscriberData)
            });
            
            if (!upsertResponse.ok) {
                const errorText = await upsertResponse.text();
                console.error('Failed to save subscriber:', errorText);
                throw new Error('Failed to save subscription');
            }
            
            const result = await upsertResponse.json();
            
            return new Response(JSON.stringify({
                data: {
                    success: true,
                    message: 'Successfully subscribed to TrendAI alerts!',
                    email: email.toLowerCase(),
                    preferences: subscriberData.preferences,
                    unsubscribe_token: unsubscribeToken
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
            
        } else if (action === 'unsubscribe') {
            // Handle unsubscribe
            if (!token && !email) {
                throw new Error('Unsubscribe token or email required');
            }
            
            const query = token 
                ? `verification_token=eq.${token}` 
                : `email=eq.${email.toLowerCase()}`;
            
            const unsubscribeResponse = await fetch(
                `${supabaseUrl}/rest/v1/subscribers?${query}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        verified: false,
                        preferences: {
                            notifications_enabled: false,
                            push_notifications: false
                        },
                        last_alert_sent: null
                    })
                }
            );
            
            if (!unsubscribeResponse.ok) {
                throw new Error('Failed to unsubscribe');
            }
            
            return new Response(JSON.stringify({
                data: {
                    success: true,
                    message: 'Successfully unsubscribed from TrendAI alerts.',
                    action: 'unsubscribed'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
            
        } else if (action === 'update_preferences') {
            // Handle preference updates
            if (!email) {
                throw new Error('Email required for preference updates');
            }
            
            const updateResponse = await fetch(
                `${supabaseUrl}/rest/v1/subscribers?email=eq.${email.toLowerCase()}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        preferences: preferences
                    })
                }
            );
            
            if (!updateResponse.ok) {
                throw new Error('Failed to update preferences');
            }
            
            return new Response(JSON.stringify({
                data: {
                    success: true,
                    message: 'Preferences updated successfully!',
                    preferences: preferences
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        
        throw new Error('Invalid action specified');
        
    } catch (error) {
        console.error('Subscription management error:', error);
        
        const errorResponse = {
            error: {
                code: 'SUBSCRIPTION_MANAGEMENT_FAILED',
                message: error.message
            }
        };
        
        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});