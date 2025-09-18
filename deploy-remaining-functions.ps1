# Deploy remaining edge functions quickly
$functions = @(
    "ai-storytelling-enhanced",
    "ai-storytelling-videos", 
    "ai-storytelling-videos-fixed",
    "api-config-manager",
    "automated-comprehensive-scan",
    "cron-daily-scan",
    "custom-ai-search",
    "email-alert-sender",
    "enhanced-ai-scanner",
    "enhanced-custom-search",
    "notification-inbox",
    "notification-system",
    "seo-pack-generator",
    "seo-prompt-generator",
    "smart-template-brief",
    "spike-detection",
    "subscription-manager",
    "trendai-advanced-tracker",
    "trendai-rss-search",
    "trendai-search",
    "unsubscribe-from-notifications",
    "viral-brief-generator",
    "youtube-data-fetcher",
    "youtube-debug-test",
    "youtube-trending-ai"
)

Write-Host "🚀 Deploying $($functions.Count) remaining edge functions..." -ForegroundColor Magenta

$deployed = 0
$failed = 0

foreach ($function in $functions) {
    Write-Host "Deploying: $function" -ForegroundColor Cyan
    try {
        npx supabase functions deploy $function
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $function deployed successfully" -ForegroundColor Green
            $deployed++
        } else {
            Write-Host "❌ Failed to deploy $function" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host "❌ Exception deploying $function : $_" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n🎉 Deployment Summary:" -ForegroundColor Yellow
Write-Host "✅ Successfully deployed: $deployed functions" -ForegroundColor Green
Write-Host "❌ Failed: $failed functions" -ForegroundColor Red
Write-Host "🔗 Dashboard: https://supabase.com/dashboard/project/nckesiywrprkozozuucq/functions" -ForegroundColor Cyan
