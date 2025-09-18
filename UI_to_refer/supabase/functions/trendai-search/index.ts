// supabase/functions/trendai-search/index.ts

import { createClient } from 'npm:@supabase/supabase-js@2';
// FIX: Import `serve` from Deno's standard library instead of using the global `Deno.serve`.
// This is a more stable and explicit approach for Supabase Edge Functions.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Define the structure for a video object to be inserted into Supabase
interface VideoInsert {
  video_id: string;
  title: string;
  channel_name: string;
  thumbnail_url: string;
  url: string;
  publish_time: string;
  category: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  age_minutes: number;
  views_per_minute: number;
  viral_score: number;
}

// Main function handler
// FIX: Use the imported `serve` function to start the HTTP server.
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    } });
  }

  try {
    const { category, maxResults = 10, userApiKey, customQuery } = await req.json();

    if (!userApiKey) {
      return new Response(JSON.stringify({ error: 'YouTube API key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Initialize Supabase client
    // FIX: Cast `Deno` to `any` to work around TypeScript errors caused by a misconfigured
    // environment that doesn't correctly load Deno's global types. `Deno.env.get` is the
    // correct API to use at runtime in Supabase Edge Functions.
    const supabaseAdmin = createClient(
      (Deno as any).env.get('SUPABASE_URL') ?? '',
      (Deno as any).env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // --- Step 1: Search for recent videos ---
    const publishedAfter = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const searchQuery = customQuery || `"${category}"`;
    
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: searchQuery,
      type: 'video',
      order: 'date',
      maxResults: maxResults.toString(),
      publishedAfter: publishedAfter,
      key: userApiKey,
    });

    const searchRes = await fetch(`${YOUTUBE_API_URL}/search?${searchParams}`);
    if (!searchRes.ok) {
        const errorData = await searchRes.json();
        const errorMessage = errorData.error?.message || 'Failed to fetch from YouTube Search API';
        if (errorMessage.includes('quotaExceeded')) {
             return new Response(JSON.stringify({ error: 'QUOTA_EXCEEDED' }), { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }
        throw new Error(`YouTube Search API error: ${errorMessage}`);
    }
    const searchData = await searchRes.json();
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    if (!videoIds) {
      return new Response(JSON.stringify({ data: { message: 'No new videos found', videoCount: 0 } }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // --- Step 2: Fetch detailed statistics for the found videos ---
    const statsParams = new URLSearchParams({
      part: 'snippet,statistics',
      id: videoIds,
      key: userApiKey,
    });

    const statsRes = await fetch(`${YOUTUBE_API_URL}/videos?${statsParams}`);
    if (!statsRes.ok) throw new Error('Failed to fetch video statistics from YouTube');
    const statsData = await statsRes.json();

    // --- Step 3: Process videos and calculate metrics ---
    const videosToInsert: VideoInsert[] = statsData.items.map((item: any) => {
      const { id, snippet, statistics } = item;
      const viewCount = parseInt(statistics.viewCount || '0', 10);
      const likeCount = parseInt(statistics.likeCount || '0', 10);
      const commentCount = parseInt(statistics.commentCount || '0', 10);
      const publishDate = new Date(snippet.publishedAt);
      const ageMinutes = (Date.now() - publishDate.getTime()) / (1000 * 60);
      const viewsPerMinute = ageMinutes > 0 ? viewCount / ageMinutes : 0;
      
      // Simple Viral Score Calculation: Emphasizes early views and engagement
      const engagementRate = viewCount > 0 ? (likeCount + commentCount) / viewCount : 0;
      const viralScore = (Math.log(viewCount + 1) * Math.log(viewsPerMinute + 1) * (engagementRate * 100));

      return {
        video_id: id,
        title: snippet.title,
        channel_name: snippet.channelTitle,
        thumbnail_url: snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
        url: `https://www.youtube.com/watch?v=${id}`,
        publish_time: publishDate.toISOString(),
        category: category,
        view_count: viewCount,
        like_count: likeCount,
        comment_count: commentCount,
        age_minutes: ageMinutes,
        views_per_minute: viewsPerMinute,
        viral_score: isNaN(viralScore) ? 0 : viralScore,
      };
    });

    // --- Step 4: Upsert data into Supabase ---
    if (videosToInsert.length > 0) {
      const { error } = await supabaseAdmin
        .from('videos')
        .upsert(videosToInsert, { onConflict: 'video_id' });

      if (error) throw error;
    }
    
    // --- Step 5: Log the scan ---
    await supabaseAdmin.from('scan_history').insert({
        videos_found: videosToInsert.length,
        status: 'completed',
        category_scanned: category,
    });

    return new Response(JSON.stringify({ data: { message: 'Scan complete', videoCount: videosToInsert.length } }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Error in trendai-search function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
