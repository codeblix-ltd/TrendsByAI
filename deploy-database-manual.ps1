# AI Video Trend Watcher - Manual Database Deployment
# This script creates SQL files that you can execute manually in Supabase Dashboard

param(
    [string]$ProjectId = "nckesiywrprkozozuucq"
)

function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Progress { param($Message) Write-Host "🚀 $Message" -ForegroundColor Magenta }

$ProjectUrl = "https://$ProjectId.supabase.co"

Write-Progress "Creating Manual Database Deployment Scripts"
Write-Info "Project ID: $ProjectId"

# Step 1: Create complete database setup script
Write-Progress "Step 1: Creating Complete Database Setup Script"

$completeSql = @"
-- AI Video Trend Watcher - Complete Database Setup
-- Generated: $(Get-Date)
-- Project ID: $ProjectId
-- 
-- INSTRUCTIONS:
-- 1. Go to https://supabase.com/dashboard/project/$ProjectId/sql
-- 2. Copy and paste this entire script
-- 3. Click "Run" to execute
-- 4. Verify all tables are created in the Tables tab

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- =============================================================================
-- MIGRATIONS
-- =============================================================================

"@

# Add migrations
$migrationFiles = @(
    "1754975839_configure_youtube_api_key.sql",
    "1754976350_setup_youtube_api_integration.sql",
    "1754983794_add_global_viral_columns.sql",
    "1754990328_configure_youtube_api_key_for_trendai.sql",
    "1755068446_create_email_alert_system_tables.sql"
)

foreach ($migration in $migrationFiles) {
    $migrationPath = "supabase/migrations/$migration"
    if (Test-Path $migrationPath) {
        $migrationContent = Get-Content $migrationPath -Raw
        $completeSql += @"

-- Migration: $migration
$migrationContent

"@
        Write-Success "✓ Added migration: $migration"
    } else {
        Write-Warning "⚠ Migration not found: $migration"
    }
}

$completeSql += @"

-- =============================================================================
-- TABLES
-- =============================================================================

"@

# Add tables
$tableFiles = @(
    "alerts.sql", "api_quotas.sql", "api_usage.sql", "api_usage_tracking.sql",
    "custom_searches.sql", "filter_presets.sql", "generated_prompts.sql",
    "profiles.sql", "scan_history.sql", "scan_sessions.sql", "search_sessions.sql",
    "user_preferences.sql", "user_watchlists.sql", "video_metrics_history.sql",
    "video_rankings.sql", "video_scans.sql", "videos.sql", "viral_trends.sql"
)

foreach ($tableFile in $tableFiles) {
    $tablePath = "supabase/tables/$tableFile"
    if (Test-Path $tablePath) {
        $tableContent = Get-Content $tablePath -Raw
        $completeSql += @"

-- Table: $tableFile
$tableContent

"@
        Write-Success "✓ Added table: $tableFile"
    } else {
        Write-Warning "⚠ Table not found: $tableFile"
    }
}

# Add final setup
$completeSql += @"

-- =============================================================================
-- FINAL SETUP
-- =============================================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_scans_video_id ON video_scans(video_id);
CREATE INDEX IF NOT EXISTS idx_video_scans_category ON video_scans(category);
CREATE INDEX IF NOT EXISTS idx_video_scans_scanned_at ON video_scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_scan_timestamp ON scan_history(scan_timestamp);

-- Insert initial configuration data
INSERT INTO api_configuration (service, status, notes) 
VALUES ('youtube', 'configured', 'YouTube API integration ready')
ON CONFLICT (service) DO UPDATE SET
  status = 'configured',
  last_configured = NOW(),
  notes = 'YouTube API integration ready';

-- Success message
DO `$`$
BEGIN
  RAISE NOTICE '🎉 AI Video Trend Watcher database setup completed successfully!';
  RAISE NOTICE '📊 Tables created, indexes added, and initial data inserted.';
  RAISE NOTICE '🔗 Visit the Tables tab to verify all tables are present.';
END `$`$;

"@

# Save complete script
$completeScriptPath = "database-complete-setup.sql"
Set-Content -Path $completeScriptPath -Value $completeSql
Write-Success "Complete database script saved to: $completeScriptPath"

# Step 2: Create cron jobs script
Write-Progress "Step 2: Creating Cron Jobs Setup Script"

$cronJobsSql = @"
-- AI Video Trend Watcher - Cron Jobs Setup
-- Generated: $(Get-Date)
-- Project ID: $ProjectId
-- Project URL: $ProjectUrl
--
-- INSTRUCTIONS:
-- 1. Go to https://supabase.com/dashboard/project/$ProjectId/sql
-- 2. Copy and paste this script
-- 3. Click "Run" to execute
-- 4. Verify cron jobs with: SELECT * FROM cron.job;

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove any existing cron jobs (cleanup)
SELECT cron.unschedule('schedule-scanner_invoke');
SELECT cron.unschedule('cron-daily-scan_invoke');
SELECT cron.unschedule('automated-scan-cron_invoke');
SELECT cron.unschedule('automated-content-scanner_invoke');
SELECT cron.unschedule('youtube-scanner-cron_invoke');
SELECT cron.unschedule('background-worker_invoke');

"@

$cronJobs = @(
    @{ name = "schedule-scanner_invoke"; cron = "*/15 * * * *"; function = "schedule-scanner"; procedure = "schedule_scanner_5c2dc807"; desc = "General content scanning every 15 minutes" },
    @{ name = "cron-daily-scan_invoke"; cron = "0 8 * * *"; function = "cron-daily-scan"; procedure = "cron_daily_scan_0ebf7129"; desc = "Daily comprehensive scan at 8 AM" },
    @{ name = "automated-scan-cron_invoke"; cron = "0 */6 * * *"; function = "automated-scan-cron"; procedure = "automated_scan_cron_44e544e6"; desc = "Automated scanning every 6 hours" },
    @{ name = "automated-content-scanner_invoke"; cron = "0 */6 * * *"; function = "automated-content-scanner"; procedure = "automated_content_scanner_9dc366a8"; desc = "Enhanced global content scanning every 6 hours" },
    @{ name = "youtube-scanner-cron_invoke"; cron = "0 */6 * * *"; function = "youtube-scanner-cron"; procedure = "youtube_scanner_cron_109de9c8"; desc = "YouTube specific scanning every 6 hours" },
    @{ name = "background-worker_invoke"; cron = "*/15 * * * *"; function = "background-worker"; procedure = "background_worker_d9fca0fd"; desc = "Background processing every 15 minutes" }
)

foreach ($job in $cronJobs) {
    $cronJobsSql += @"

-- Cron Job: $($job.name)
-- $($job.desc)
-- Schedule: $($job.cron)
CREATE OR REPLACE PROCEDURE $($job.procedure)()
LANGUAGE plpgsql
AS `$`$
BEGIN
    PERFORM net.http_post(
        url:='$ProjectUrl/functions/v1/$($job.function)',
        headers:=jsonb_build_object('Content-Type', 'application/json'),
        body:='{"edge_function_name":"$($job.function)"}',
        timeout_milliseconds:=10000
    );
    COMMIT;
END;
`$`$;

SELECT cron.schedule('$($job.name)', '$($job.cron)', 'CALL $($job.procedure)()');

"@
    Write-Success "✓ Added cron job: $($job.name)"
}

$cronJobsSql += @"

-- Verify cron jobs were created
SELECT 
    jobname,
    schedule,
    command,
    active
FROM cron.job 
ORDER BY jobname;

-- Success message
DO `$`$
BEGIN
  RAISE NOTICE '🎉 All cron jobs have been set up successfully!';
  RAISE NOTICE '⏰ 6 automated jobs are now scheduled';
  RAISE NOTICE '🔍 Use SELECT * FROM cron.job; to verify';
END `$`$;

"@

$cronJobsScriptPath = "cron-jobs-complete-setup.sql"
Set-Content -Path $cronJobsScriptPath -Value $cronJobsSql
Write-Success "Cron jobs script saved to: $cronJobsScriptPath"

# Step 3: Create instructions file
$instructionsPath = "MANUAL-DEPLOYMENT-INSTRUCTIONS.md"
$instructions = @"
# Manual Database Deployment Instructions

## 🎯 Quick Setup (2 Steps)

### Step 1: Database Schema
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/$ProjectId/sql)
2. Copy the entire contents of `database-complete-setup.sql`
3. Paste into the SQL editor
4. Click **"Run"**
5. Wait for completion (should see success message)

### Step 2: Cron Jobs
1. In the same SQL Editor
2. Copy the entire contents of `cron-jobs-complete-setup.sql`
3. Paste into the SQL editor
4. Click **"Run"**
5. Verify with: `SELECT * FROM cron.job;`

## 🔍 Verification

### Check Tables
Go to [Database Tables](https://supabase.com/dashboard/project/$ProjectId/editor) and verify these tables exist:
- ✅ video_scans
- ✅ profiles  
- ✅ api_usage_tracking
- ✅ subscribers
- ✅ scan_history
- ✅ And 13 more tables...

### Check Cron Jobs
Run this query to see active cron jobs:
```sql
SELECT jobname, schedule, active FROM cron.job ORDER BY jobname;
```

Should show 6 active jobs:
- ✅ automated-content-scanner_invoke (every 6 hours)
- ✅ automated-scan-cron_invoke (every 6 hours)  
- ✅ background-worker_invoke (every 15 minutes)
- ✅ cron-daily-scan_invoke (daily at 8 AM)
- ✅ schedule-scanner_invoke (every 15 minutes)
- ✅ youtube-scanner-cron_invoke (every 6 hours)

## 🚀 Next Steps

After database setup is complete:
1. Deploy edge functions: `.\deploy-supabase.ps1 -SkipDatabase -SkipCronJobs`
2. Set environment variables in Supabase Dashboard
3. Test your functions

## 🔗 Quick Links
- **SQL Editor**: https://supabase.com/dashboard/project/$ProjectId/sql
- **Tables**: https://supabase.com/dashboard/project/$ProjectId/editor
- **Functions**: https://supabase.com/dashboard/project/$ProjectId/functions

"@

Set-Content -Path $instructionsPath -Value $instructions
Write-Success "Instructions saved to: $instructionsPath"

# Final summary
Write-Progress "Manual Deployment Scripts Created Successfully!"

Write-Info "📄 Files created:"
Write-Info "  🗄️  $completeScriptPath - Complete database setup"
Write-Info "  ⏰ $cronJobsScriptPath - All cron jobs setup"  
Write-Info "  📋 $instructionsPath - Step-by-step instructions"

Write-Success "🎉 Ready for manual deployment!"
Write-Info "👉 Follow the instructions in: $instructionsPath"
