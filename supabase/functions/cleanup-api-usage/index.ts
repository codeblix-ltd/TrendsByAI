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
    console.log('Starting API usage cleanup...');

    // Get environment variables
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Supabase configuration missing');
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Get all API usage records for today
    const usageResponse = await fetch(`${supabaseUrl}/rest/v1/api_usage?date=eq.${today}&service=eq.youtube&order=created_at.asc`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    });

    if (!usageResponse.ok) {
      throw new Error('Failed to fetch API usage records');
    }

    const usageRecords = await usageResponse.json();
    console.log(`Found ${usageRecords.length} API usage records for today`);

    if (usageRecords.length <= 1) {
      console.log('No cleanup needed - only one or no records found');
      return new Response(JSON.stringify({
        data: { 
          status: 'no_cleanup_needed',
          recordsFound: usageRecords.length
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Calculate totals from all records
    const totalQuotaUsed = usageRecords.reduce((sum: number, record: any) => sum + (record.quota_used || 0), 0);
    const totalRequestsCount = usageRecords.reduce((sum: number, record: any) => sum + (record.requests_count || 0), 0);
    const totalErrorsCount = usageRecords.reduce((sum: number, record: any) => sum + (record.errors_count || 0), 0);
    const avgResponseTime = usageRecords.reduce((sum: number, record: any) => sum + (record.response_time_avg || 0), 0) / usageRecords.length;

    // Keep the first record and update it with consolidated data
    const firstRecord = usageRecords[0];
    await fetch(`${supabaseUrl}/rest/v1/api_usage?id=eq.${firstRecord.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quota_used: totalQuotaUsed,
        quota_limit: 10000,
        requests_count: totalRequestsCount,
        errors_count: totalErrorsCount,
        response_time_avg: avgResponseTime,
        updated_at: new Date().toISOString()
      })
    });

    // Delete all other records for today
    const recordsToDelete = usageRecords.slice(1).map((record: any) => record.id);
    if (recordsToDelete.length > 0) {
      await fetch(`${supabaseUrl}/rest/v1/api_usage?id=in.(${recordsToDelete.map(id => `"${id}"`).join(',')})`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        }
      });
    }

    console.log(`Cleanup completed: consolidated ${usageRecords.length} records into 1`);
    console.log(`Total quota used: ${totalQuotaUsed}, Total requests: ${totalRequestsCount}, Total errors: ${totalErrorsCount}`);

    return new Response(JSON.stringify({
      data: {
        status: 'cleanup_completed',
        recordsConsolidated: usageRecords.length,
        totalQuotaUsed,
        totalRequestsCount,
        totalErrorsCount,
        avgResponseTime
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
