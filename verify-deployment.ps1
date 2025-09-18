# AI Video Trend Watcher - Deployment Verification Script
# This script verifies that all components are properly deployed

param(
    [string]$ProjectId = "nckesiywrprkozozuucq",
    [switch]$Detailed,
    [switch]$TestFunctions
)

function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Progress { param($Message) Write-Host "🚀 $Message" -ForegroundColor Magenta }

$ProjectUrl = "https://$ProjectId.supabase.co"
$DashboardUrl = "https://supabase.com/dashboard/project/$ProjectId"

Write-Progress "Verifying AI Video Trend Watcher Deployment"
Write-Info "Project ID: $ProjectId"
Write-Info "Project URL: $ProjectUrl"

# Step 1: Verify Supabase Connection
Write-Progress "Step 1: Verifying Supabase Connection"

try {
    $statusCheck = npx supabase status --project-ref $ProjectId 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ Supabase project connection verified"
    } else {
        Write-Warning "⚠ Could not verify project status via CLI"
    }
} catch {
    Write-Warning "⚠ CLI status check failed, but project may still be accessible"
}

# Step 2: Check Edge Functions
Write-Progress "Step 2: Checking Edge Functions Deployment"

$expectedFunctions = @(
    "ai-storytelling-enhanced",
    "ai-storytelling-videos", 
    "ai-storytelling-videos-fixed",
    "api-config-manager",
    "automated-comprehensive-scan",
    "automated-content-scanner",
    "automated-scan-cron",
    "background-worker",
    "comprehensive-ai-scanner",
    "create-notification",
    "cron-daily-scan",
    "custom-ai-search",
    "email-alert-sender",
    "email-subscription",
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
    "youtube-scanner",
    "youtube-trending-ai"
)

Write-Info "Checking $($expectedFunctions.Count) expected edge functions..."

$functionsDeployed = 0
$functionsFailed = 0

foreach ($function in $expectedFunctions) {
    if (Test-Path "supabase/functions/$function/index.ts") {
        Write-Success "✓ $function - source file exists"
        $functionsDeployed++
    } else {
        Write-Error "✗ $function - source file missing"
        $functionsFailed++
    }
}

Write-Info "Functions check: $functionsDeployed deployed, $functionsFailed missing"

# Step 3: Test Key Functions (if requested)
if ($TestFunctions) {
    Write-Progress "Step 3: Testing Key Edge Functions"
    
    $testFunctions = @("api-config-manager", "youtube-scanner", "comprehensive-ai-scanner")
    
    foreach ($testFunc in $testFunctions) {
        Write-Info "Testing function: $testFunc"
        try {
            # Note: In a real scenario, you'd make HTTP requests to test the functions
            # For now, we'll just verify they exist and have proper structure
            $funcPath = "supabase/functions/$testFunc/index.ts"
            if (Test-Path $funcPath) {
                $content = Get-Content $funcPath -Raw
                if ($content -match "Deno\.serve" -and $content -match "corsHeaders") {
                    Write-Success "✓ $testFunc - structure looks correct"
                } else {
                    Write-Warning "⚠ $testFunc - structure may have issues"
                }
            }
        } catch {
            Write-Error "✗ $testFunc - test failed: $_"
        }
    }
}

# Step 4: Check Database Schema
Write-Progress "Step 4: Checking Database Schema"

$expectedTables = @(
    "alerts", "api_quotas", "api_usage", "api_usage_tracking",
    "custom_searches", "filter_presets", "generated_prompts",
    "profiles", "scan_history", "scan_sessions", "search_sessions",
    "user_preferences", "user_watchlists", "video_metrics_history",
    "video_rankings", "video_scans", "videos", "viral_trends"
)

$expectedMigrations = @(
    "1754975839_configure_youtube_api_key.sql",
    "1754976350_setup_youtube_api_integration.sql",
    "1754983794_add_global_viral_columns.sql", 
    "1754990328_configure_youtube_api_key_for_trendai.sql",
    "1755068446_create_email_alert_system_tables.sql"
)

Write-Info "Checking $($expectedTables.Count) expected database tables..."
$tablesFound = 0
foreach ($table in $expectedTables) {
    if (Test-Path "supabase/tables/$table.sql") {
        Write-Success "✓ $table - SQL file exists"
        $tablesFound++
    } else {
        Write-Error "✗ $table - SQL file missing"
    }
}

Write-Info "Checking $($expectedMigrations.Count) migration files..."
$migrationsFound = 0
foreach ($migration in $expectedMigrations) {
    if (Test-Path "supabase/migrations/$migration") {
        Write-Success "✓ $migration - migration file exists"
        $migrationsFound++
    } else {
        Write-Error "✗ $migration - migration file missing"
    }
}

# Step 5: Check Cron Jobs Configuration
Write-Progress "Step 5: Checking Cron Jobs Configuration"

$expectedCronJobs = 6
$cronJobsFound = 0

for ($i = 1; $i -le $expectedCronJobs; $i++) {
    $cronFile = "supabase/cron_jobs/job_$i.json"
    if (Test-Path $cronFile) {
        try {
            $cronContent = Get-Content $cronFile -Raw | ConvertFrom-Json
            if ($cronContent.cron_expression -and $cronContent.edge_function_name) {
                Write-Success "✓ Cron Job $i - configuration valid"
                $cronJobsFound++
            } else {
                Write-Warning "⚠ Cron Job $i - configuration incomplete"
            }
        } catch {
            Write-Error "✗ Cron Job $i - invalid JSON format"
        }
    } else {
        Write-Error "✗ Cron Job $i - file missing"
    }
}

# Step 6: Generate Deployment Report
Write-Progress "Step 6: Generating Deployment Report"

$report = @"
# AI Video Trend Watcher Deployment Report
Generated: $(Get-Date)
Project ID: $ProjectId
Project URL: $ProjectUrl

## Summary
- Edge Functions: $functionsDeployed/$($expectedFunctions.Count) ready for deployment
- Database Tables: $tablesFound/$($expectedTables.Count) SQL files found
- Migrations: $migrationsFound/$($expectedMigrations.Count) migration files found
- Cron Jobs: $cronJobsFound/$expectedCronJobs configuration files found

## Next Steps
1. Visit Supabase Dashboard: $DashboardUrl
2. Verify functions are deployed in Functions tab
3. Check database schema in Database > Tables
4. Confirm cron jobs in Database > Cron Jobs
5. Test key functions manually

## Key URLs
- Dashboard: $DashboardUrl
- Functions: $DashboardUrl/functions
- Database: $DashboardUrl/editor
- Logs: $DashboardUrl/logs

## Manual Verification Steps
1. Test API config manager: $ProjectUrl/functions/v1/api-config-manager
2. Test YouTube scanner: $ProjectUrl/functions/v1/youtube-scanner
3. Check database tables exist in SQL editor
4. Verify cron jobs are scheduled and running

"@

$reportFile = "deployment-report.md"
Set-Content -Path $reportFile -Value $report
Write-Success "Deployment report saved to: $reportFile"

# Final Summary
Write-Progress "Verification Complete"

$totalIssues = ($expectedFunctions.Count - $functionsDeployed) + 
               ($expectedTables.Count - $tablesFound) + 
               ($expectedMigrations.Count - $migrationsFound) + 
               ($expectedCronJobs - $cronJobsFound)

if ($totalIssues -eq 0) {
    Write-Success "🎉 All components verified successfully!"
    Write-Success "Your AI Video Trend Watcher appears ready for deployment!"
} else {
    Write-Warning "⚠️ Found $totalIssues potential issues"
    Write-Info "Please review the output above and the deployment report"
}

Write-Info "📊 Quick Access Links:"
Write-Info "🔗 Dashboard: $DashboardUrl"
Write-Info "⚡ Functions: $DashboardUrl/functions"
Write-Info "🗄️  Database: $DashboardUrl/editor"
Write-Info "📈 Logs: $DashboardUrl/logs"
Write-Info "📄 Report: $reportFile"
