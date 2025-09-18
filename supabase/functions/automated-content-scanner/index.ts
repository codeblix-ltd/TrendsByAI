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
        console.log('🌍🔥👹 Starting automated GLOBAL viral content discovery with AI Horror & enhanced features...');
        
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // Enhanced comprehensive global search categories with AI Horror focus
        const enhancedGlobalCategories = [
            // Enhanced existing categories with viral keywords
            'AI ASMR trending viral worldwide 2025',
            'AI storytelling viral stories global',
            'AI beauty tutorial viral trends international',
            'AI music production viral hits worldwide',
            'AI art creation viral content global',
            
            // COMPREHENSIVE AI Horror category with multiple variations
            'AI horror stories viral scary worldwide',
            'AI horror creepypasta trending global',
            'AI scary stories viral content international', 
            'AI horror thriller viral videos worldwide',
            'AI creepy stories trending horror global',
            'AI ghost stories viral scary content',
            'AI horror games scary viral worldwide',
            'AI horror animation creepy viral',
            'AI dark stories horror viral trending',
            'AI paranormal horror viral content',
            
            // Tech and educational viral content
            'machine learning tutorial viral worldwide',
            'artificial intelligence news viral global',
            'AI breakthrough viral discovery international',
            'AI coding tutorial viral programming',
            
            // Entertainment and global viral trends
            'AI animation viral shorts trending worldwide',
            'AI voice generation viral memes global',
            'AI deepfake viral content international',
            'AI generated viral videos 2025 worldwide',
            'AI funny viral moments global trending',
            
            // Productivity and creative viral trends
            'AI productivity viral tools worldwide',
            'AI creative viral projects global',
            'AI business viral solutions international',
            'AI lifestyle viral content worldwide',
            
            // Emerging trends
            'AI fashion viral trends global',
            'AI cooking viral recipes worldwide',
            'AI fitness viral workouts international'
        ];

        // Get active custom searches from database
        const customSearchResponse = await fetch(`${supabaseUrl}/rest/v1/custom_searches?select=*&is_active=eq.true`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        let customSearchTerms = [];
        if (customSearchResponse.ok) {
            const customSearches = await customSearchResponse.json();
            customSearchTerms = customSearches.map((search: any) => search.search_term);
            console.log(`📝 Found ${customSearchTerms.length} active custom searches`);
        }

        // Call the enhanced global youtube-scanner function with fresh API key
        const scannerResponse = await fetch(`${supabaseUrl}/functions/v1/youtube-scanner`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                searchCategories: enhancedGlobalCategories,
                customSearchTerms: customSearchTerms,
                maxResultsPerCategory: 12, // Optimized for comprehensive global coverage
                scanType: 'automated_global_enhanced',
                enableGlobalSearch: true // Enable worldwide search across all regions
            })
        });

        if (!scannerResponse.ok) {
            const errorText = await scannerResponse.text();
            throw new Error(`Enhanced global scanner function failed: ${errorText}`);
        }

        const scannerResult = await scannerResponse.json();
        
        console.log(`✅ Automated ENHANCED GLOBAL scan completed:`);
        console.log(`   🌍 Videos found globally: ${scannerResult.data.totalVideosFound}`);
        console.log(`   🔥 Viral videos detected: ${scannerResult.data.viralVideosDetected}`);
        console.log(`   👹 Horror videos found: ${scannerResult.data.horrorVideosFound}`);
        console.log(`   🔌 API units used: ${scannerResult.data.totalApiUnitsUsed}`);
        console.log(`   ⚡ Remaining quota: ${scannerResult.data.remainingQuota}`);
        console.log(`   🎯 Categories scanned: ${scannerResult.data.searchTermsProcessed}`);
        console.log(`   🌐 Regions scanned: ${scannerResult.data.globalRegionsScanned}`);
        console.log(`   🔑 API keys used: ${scannerResult.data.apiKeysUsed}`);

        // Enhanced logging for scan results
        const isQuotaExhausted = scannerResult.data.quotaExhausted;
        const hasErrors = scannerResult.data.errors && scannerResult.data.errors.length > 0;

        // Log successful enhanced global cron execution
        await fetch(`${supabaseUrl}/rest/v1/scan_history`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                scan_type: 'automated_global_viral_horror_enhanced',
                category: 'multi_category_global_with_horror',
                search_terms: [...enhancedGlobalCategories, ...customSearchTerms],
                videos_found: scannerResult.data.totalVideosFound,
                api_units_used: scannerResult.data.totalApiUnitsUsed,
                scan_completed_at: new Date().toISOString(),
                status: isQuotaExhausted ? 'quota_exhausted' : (hasErrors ? 'completed_with_errors' : 'completed'),
                error_message: hasErrors ? JSON.stringify(scannerResult.data.errors.slice(0, 5)) : null
            })
        });

        return new Response(JSON.stringify({
            data: {
                success: true,
                cronExecutionTime: new Date().toISOString(),
                enhancedGlobalScanResults: {
                    videosFoundGlobally: scannerResult.data.totalVideosFound,
                    viralVideosDetected: scannerResult.data.viralVideosDetected,
                    horrorVideosFound: scannerResult.data.horrorVideosFound,
                    apiUnitsUsed: scannerResult.data.totalApiUnitsUsed,
                    remainingQuota: scannerResult.data.remainingQuota,
                    categoriesScanned: scannerResult.data.searchTermsProcessed,
                    regionsScanned: scannerResult.data.globalRegionsScanned,
                    customSearches: customSearchTerms.length,
                    apiKeysUsed: scannerResult.data.apiKeysUsed,
                    quotaStatus: isQuotaExhausted ? 'exhausted' : 'healthy'
                },
                topViralVideos: scannerResult.data.viralVideos || [],
                topHorrorVideos: scannerResult.data.horrorVideos || [],
                scanStatus: {
                    quotaExhausted: isQuotaExhausted,
                    hasErrors: hasErrors,
                    errorCount: scannerResult.data.errors ? scannerResult.data.errors.length : 0
                },
                message: isQuotaExhausted ? 
                    `⚠️ Global scan partially completed due to quota limits. Found ${scannerResult.data.totalVideosFound} videos (${scannerResult.data.viralVideosDetected} viral, ${scannerResult.data.horrorVideosFound} horror) across ${scannerResult.data.globalRegionsScanned} regions!` :
                    `🌍🔥👹 ENHANCED global scan completed! Found ${scannerResult.data.totalVideosFound} videos across ${scannerResult.data.globalRegionsScanned} regions with ${scannerResult.data.viralVideosDetected} viral videos and ${scannerResult.data.horrorVideosFound} AI Horror videos!`,
                nextScheduledRun: '6 hours from now',
                enhancedFeatures: {
                    globalSearch: true,
                    viralDetection: true,
                    aiHorrorCategory: true,
                    multiRegion: true,
                    apiKeyRotation: true,
                    quotaManagement: true
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Automated enhanced global viral scan failed:', error);
        
        // Log failed enhanced global cron execution
        try {
            const supabaseUrl = Deno.env.get('SUPABASE_URL');
            const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
            
            if (supabaseUrl && serviceRoleKey) {
                await fetch(`${supabaseUrl}/rest/v1/scan_history`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        scan_type: 'automated_global_viral_horror_enhanced',
                        status: 'failed',
                        error_message: error.message,
                        scan_completed_at: new Date().toISOString()
                    })
                });
            }
        } catch (logError) {
            console.error('Failed to log enhanced global cron error:', logError);
        }

        const errorResponse = {
            error: {
                code: 'AUTOMATED_GLOBAL_VIRAL_HORROR_SCAN_FAILED',
                message: error.message,
                timestamp: new Date().toISOString(),
                nextRetryIn: '6 hours',
                isQuotaError: error.message.includes('quota') || error.message.includes('exceeded')
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
