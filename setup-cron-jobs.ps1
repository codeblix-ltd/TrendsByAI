# AI Video Trend Watcher - Cron Jobs Setup Script
# This script creates all cron jobs with the correct project URL

param(
    [string]$ProjectId = "nckesiywrprkozozuucq",
    [switch]$RemoveExisting,
    [switch]$Verbose
)

function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Progress { param($Message) Write-Host "🚀 $Message" -ForegroundColor Magenta }

$ProjectUrl = "https://$ProjectId.supabase.co"

Write-Progress "Setting up AI Video Trend Watcher Cron Jobs"
Write-Info "Project ID: $ProjectId"
Write-Info "Project URL: $ProjectUrl"

# Define all cron jobs with correct configuration
$cronJobs = @(
    @{
        id = 1
        name = "schedule-scanner_invoke"
        cron = "*/15 * * * *"
        function = "schedule-scanner"
        procedure = "schedule_scanner_5c2dc807"
        description = "Runs every 15 minutes - General content scanning"
    },
    @{
        id = 2
        name = "cron-daily-scan_invoke"
        cron = "0 8 * * *"
        function = "cron-daily-scan"
        procedure = "cron_daily_scan_0ebf7129"
        description = "Runs daily at 8 AM - Daily comprehensive scan"
    },
    @{
        id = 3
        name = "automated-scan-cron_invoke"
        cron = "0 */6 * * *"
        function = "automated-scan-cron"
        procedure = "automated_scan_cron_44e544e6"
        description = "Runs every 6 hours - Automated scanning"
    },
    @{
        id = 4
        name = "automated-content-scanner_invoke"
        cron = "0 */6 * * *"
        function = "automated-content-scanner"
        procedure = "automated_content_scanner_9dc366a8"
        description = "Runs every 6 hours - Enhanced global content scanning"
    },
    @{
        id = 5
        name = "youtube-scanner-cron_invoke"
        cron = "0 */6 * * *"
        function = "youtube-scanner-cron"
        procedure = "youtube_scanner_cron_109de9c8"
        description = "Runs every 6 hours - YouTube specific scanning"
    },
    @{
        id = 6
        name = "background-worker_invoke"
        cron = "*/15 * * * *"
        function = "background-worker"
        procedure = "background_worker_d9fca0fd"
        description = "Runs every 15 minutes - Background processing tasks"
    }
)

Write-Info "Configured $($cronJobs.Count) cron jobs for deployment"

# Step 1: Remove existing cron jobs if requested
if ($RemoveExisting) {
    Write-Progress "Step 1: Removing Existing Cron Jobs"
    
    $removeSql = @"
-- Remove existing cron jobs
SELECT cron.unschedule('schedule-scanner_invoke');
SELECT cron.unschedule('cron-daily-scan_invoke');
SELECT cron.unschedule('automated-scan-cron_invoke');
SELECT cron.unschedule('automated-content-scanner_invoke');
SELECT cron.unschedule('youtube-scanner-cron_invoke');
SELECT cron.unschedule('background-worker_invoke');

-- Drop existing procedures
DROP PROCEDURE IF EXISTS schedule_scanner_5c2dc807();
DROP PROCEDURE IF EXISTS cron_daily_scan_0ebf7129();
DROP PROCEDURE IF EXISTS automated_scan_cron_44e544e6();
DROP PROCEDURE IF EXISTS automated_content_scanner_9dc366a8();
DROP PROCEDURE IF EXISTS youtube_scanner_cron_109de9c8();
DROP PROCEDURE IF EXISTS background_worker_d9fca0fd();
"@
    
    $cleanupFile = "cleanup-cron-jobs.sql"
    Set-Content -Path $cleanupFile -Value $removeSql
    Write-Info "Cleanup script saved to: $cleanupFile"
    Write-Warning "Please execute the cleanup script manually in your Supabase SQL editor if needed"
}

# Step 2: Create new cron jobs
Write-Progress "Step 2: Creating Cron Jobs with Updated URLs"

$allCronSql = @"
-- AI Video Trend Watcher Cron Jobs Setup
-- Generated on $(Get-Date)
-- Project ID: $ProjectId
-- Project URL: $ProjectUrl

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

"@

foreach ($job in $cronJobs) {
    Write-Info "Preparing cron job: $($job.name) ($($job.description))"
    
    $jobSql = @"
-- Cron Job $($job.id): $($job.name)
-- $($job.description)
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
    
    $allCronSql += $jobSql
    Write-Success "✓ Prepared cron job: $($job.name)"
}

# Step 3: Save complete cron jobs script
$cronJobsFile = "cron-jobs-setup.sql"
Set-Content -Path $cronJobsFile -Value $allCronSql
Write-Success "Complete cron jobs script saved to: $cronJobsFile"

# Step 4: Create individual job files (updated versions)
Write-Progress "Step 3: Creating Updated Individual Job Files"

foreach ($job in $cronJobs) {
    $jobJson = @{
        cron_job_id = $job.id
        cron_expression = $job.cron
        edge_function_name = $job.function
        cron_job_name = $job.name
        raw_sql = @"
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
    } | ConvertTo-Json -Compress

    $jobFileName = "supabase/cron_jobs/job_$($job.id)_updated.json"
    Set-Content -Path $jobFileName -Value $jobJson
    Write-Success "✓ Updated job file: $jobFileName"
}

# Step 5: Instructions
Write-Progress "Setup Complete - Next Steps"

Write-Success "🎉 Cron jobs setup completed!"
Write-Info "Files created:"
Write-Info "  📄 $cronJobsFile - Complete SQL script for all cron jobs"
Write-Info "  📄 supabase/cron_jobs/job_*_updated.json - Updated individual job files"

Write-Warning "⚠️  IMPORTANT: Manual execution required!"
Write-Info "To activate the cron jobs:"
Write-Info "1. Go to: https://supabase.com/dashboard/project/$ProjectId/sql"
Write-Info "2. Copy and paste the contents of '$cronJobsFile'"
Write-Info "3. Click 'Run' to execute the SQL"
Write-Info ""
Write-Info "Or use Supabase CLI:"
Write-Info "npx supabase db reset --project-ref $ProjectId --linked"

Write-Info "📊 Cron Job Schedule Summary:"
foreach ($job in $cronJobs) {
    Write-Info "  🕒 $($job.name): $($job.cron) - $($job.description)"
}

Write-Info "🔍 To verify cron jobs are running:"
Write-Info "1. Check the Functions logs in Supabase Dashboard"
Write-Info "2. Monitor the scan_history table for new entries"
Write-Info "3. Use: SELECT * FROM cron.job; to see active cron jobs"
