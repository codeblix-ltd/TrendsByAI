import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting daily quota reset...');

    // Get environment variables
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Supabase configuration missing');
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Check if there's already a record for today
    const todayUsageResponse = await fetch(`${supabaseUrl}/rest/v1/api_usage?date=eq.${today}&service=eq.youtube`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    });

    let todayRecords = [];
    if (todayUsageResponse.ok) {
      todayRecords = await todayUsageResponse.json();
    }

    // If no record exists for today, create a fresh one
    if (todayRecords.length === 0) {
      await fetch(`${supabaseUrl}/rest/v1/api_usage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: today,
          service: 'youtube',
          quota_used: 0,
          quota_limit: 10000,
          requests_count: 0,
          errors_count: 0,
          response_time_avg: 0,
          updated_at: new Date().toISOString()
        })
      });

      console.log('Created fresh quota record for today');
    } else {
      // Reset existing record for today
      await fetch(`${supabaseUrl}/rest/v1/api_usage?date=eq.${today}&service=eq.youtube`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quota_used: 0,
          quota_limit: 10000,
          requests_count: 0,
          errors_count: 0,
          response_time_avg: 0,
          updated_at: new Date().toISOString()
        })
      });

      console.log(`Reset ${todayRecords.length} existing quota records for today`);
    }

    // Archive old records (older than 7 days) by moving them to an archive table or deleting them
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const deleteOldResponse = await fetch(`${supabaseUrl}/rest/v1/api_usage?date=lt.${sevenDaysAgo}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    });

    let deletedCount = 0;
    if (deleteOldResponse.ok) {
      const deleteResult = await deleteOldResponse.text();
      console.log('Deleted old records:', deleteResult);
    }

    return new Response(JSON.stringify({
      data: {
        status: 'quota_reset_completed',
        date: today,
        quotaLimit: 10000,
        quotaUsed: 0,
        oldRecordsDeleted: deletedCount,
        message: 'Daily quota has been reset to 0/10000'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Quota reset error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
