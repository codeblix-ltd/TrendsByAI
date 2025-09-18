# AI Video Trend Watcher - Master Deployment Script
# This script orchestrates the complete deployment process

param(
    [string]$ProjectId = "nckesiywrprkozozuucq",
    [switch]$DatabaseOnly,
    [switch]$FunctionsOnly,
    [switch]$CronJobsOnly,
    [switch]$SkipVerification,
    [switch]$Interactive,
    [switch]$Verbose
)

function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Progress { param($Message) Write-Host "🚀 $Message" -ForegroundColor Magenta }
function Write-Header { param($Message) Write-Host "`n🎯 $Message" -ForegroundColor Yellow -BackgroundColor DarkBlue }

$ProjectUrl = "https://$ProjectId.supabase.co"
$StartTime = Get-Date

Write-Header "AI VIDEO TREND WATCHER - COMPLETE DEPLOYMENT"
Write-Info "Project ID: $ProjectId"
Write-Info "Project URL: $ProjectUrl"
Write-Info "Started: $StartTime"

if ($Interactive) {
    Write-Warning "Interactive mode enabled - you will be prompted before each major step"
}

# Step 1: Pre-deployment verification
Write-Header "STEP 1: PRE-DEPLOYMENT VERIFICATION"

if ($Interactive) {
    $continue = Read-Host "Run pre-deployment verification? (y/n)"
    if ($continue -ne 'y') {
        Write-Warning "Skipping verification"
    } else {
        try {
            Write-Info "Running pre-deployment checks..."
            .\verify-deployment.ps1 -ProjectId $ProjectId
            Write-Success "Pre-deployment verification completed"
        } catch {
            Write-Error "Pre-deployment verification failed: $_"
            if ($Interactive) {
                $continue = Read-Host "Continue anyway? (y/n)"
                if ($continue -ne 'y') { exit 1 }
            }
        }
    }
} else {
    try {
        Write-Info "Running pre-deployment checks..."
        .\verify-deployment.ps1 -ProjectId $ProjectId
        Write-Success "Pre-deployment verification completed"
    } catch {
        Write-Error "Pre-deployment verification failed: $_"
    }
}

# Step 2: Database Setup
if (!$FunctionsOnly -and !$CronJobsOnly) {
    Write-Header "STEP 2: DATABASE SETUP"

    if ($Interactive) {
        $continue = Read-Host "Set up database schema and tables? (y/n)"
        if ($continue -ne 'y') {
            Write-Warning "Skipping database setup"
        } else {
            try {
                Write-Info "Setting up database schema..."
                .\setup-database.ps1 -ProjectId $ProjectId
                Write-Success "Database setup completed"
            } catch {
                Write-Error "Database setup failed: $_"
                if ($Interactive) {
                    $continue = Read-Host "Continue with deployment? (y/n)"
                    if ($continue -ne 'y') { exit 1 }
                }
            }
        }
    } else {
        try {
            Write-Info "Setting up database schema..."
            .\setup-database.ps1 -ProjectId $ProjectId
            Write-Success "Database setup completed"
        } catch {
            Write-Error "Database setup failed: $_"
        }
    }
}

# Step 3: Edge Functions Deployment
if (!$DatabaseOnly -and !$CronJobsOnly) {
    Write-Header "STEP 3: EDGE FUNCTIONS DEPLOYMENT"

    if ($Interactive) {
        $continue = Read-Host "Deploy all edge functions? This may take several minutes. (y/n)"
        if ($continue -ne 'y') {
            Write-Warning "Skipping functions deployment"
        } else {
            try {
                Write-Info "Deploying edge functions..."
                .\deploy-supabase.ps1 -ProjectId $ProjectId -SkipDatabase -SkipCronJobs
                Write-Success "Edge functions deployment completed"
            } catch {
                Write-Error "Edge functions deployment failed: $_"
                if ($Interactive) {
                    $continue = Read-Host "Continue with deployment? (y/n)"
                    if ($continue -ne 'y') { exit 1 }
                }
            }
        }
    } else {
        try {
            Write-Info "Deploying edge functions..."
            .\deploy-supabase.ps1 -ProjectId $ProjectId -SkipDatabase -SkipCronJobs
            Write-Success "Edge functions deployment completed"
        } catch {
            Write-Error "Edge functions deployment failed: $_"
        }
    }
}

# Step 4: Cron Jobs Setup
if (!$DatabaseOnly -and !$FunctionsOnly) {
    Write-Header "STEP 4: CRON JOBS SETUP"

    if ($Interactive) {
        $continue = Read-Host "Set up automated cron jobs? (y/n)"
        if ($continue -ne 'y') {
            Write-Warning "Skipping cron jobs setup"
        } else {
            try {
                Write-Info "Setting up cron jobs..."
                .\setup-cron-jobs.ps1 -ProjectId $ProjectId
                Write-Success "Cron jobs setup completed"
            } catch {
                Write-Error "Cron jobs setup failed: $_"
                Write-Warning "You may need to manually execute the generated SQL scripts"
            }
        }
    } else {
        try {
            Write-Info "Setting up cron jobs..."
            .\setup-cron-jobs.ps1 -ProjectId $ProjectId
            Write-Success "Cron jobs setup completed"
        } catch {
            Write-Error "Cron jobs setup failed: $_"
            Write-Warning "You may need to manually execute the generated SQL scripts"
        }
    }
}

# Step 5: Post-deployment verification
if (!$SkipVerification) {
    Write-Header "STEP 5: POST-DEPLOYMENT VERIFICATION"

    if ($Interactive) {
        $continue = Read-Host "Run post-deployment verification? (y/n)"
        if ($continue -ne 'y') {
            Write-Warning "Skipping post-deployment verification"
        } else {
            try {
                Write-Info "Running post-deployment verification..."
                .\verify-deployment.ps1 -ProjectId $ProjectId -Detailed -TestFunctions
                Write-Success "Post-deployment verification completed"
            } catch {
                Write-Warning "Post-deployment verification had issues: $_"
            }
        }
    } else {
        try {
            Write-Info "Running post-deployment verification..."
            .\verify-deployment.ps1 -ProjectId $ProjectId -Detailed -TestFunctions
            Write-Success "Post-deployment verification completed"
        } catch {
            Write-Warning "Post-deployment verification had issues: $_"
        }
    }
}

# Step 6: Final Summary and Next Steps
Write-Header "DEPLOYMENT COMPLETE"

$EndTime = Get-Date
$Duration = $EndTime - $StartTime

Write-Success "🎉 AI Video Trend Watcher deployment completed!"
Write-Info "⏱️  Total deployment time: $($Duration.ToString('mm\:ss'))"
Write-Info "🔗 Project URL: $ProjectUrl"
Write-Info "📊 Dashboard: https://supabase.com/dashboard/project/$ProjectId"

Write-Header "NEXT STEPS"

Write-Info "1. 🔍 VERIFY DEPLOYMENT:"
Write-Info "   • Visit your Supabase Dashboard"
Write-Info "   • Check Functions tab - should show 24+ deployed functions"
Write-Info "   • Check Database tab - should show all tables created"
Write-Info "   • Check Logs tab for any errors"

Write-Info "2. 🔑 CONFIGURE SECRETS (if not done automatically):"
Write-Info "   • Go to Project Settings > Edge Functions"
Write-Info "   • Add YOUTUBE_API_KEY environment variable"
Write-Info "   • Add any other required API keys"

Write-Info "3. 🕒 ACTIVATE CRON JOBS:"
Write-Info "   • Go to Database > SQL Editor"
Write-Info "   • Execute the generated cron-jobs-setup.sql file"
Write-Info "   • Verify jobs are scheduled: SELECT * FROM cron.job;"

Write-Info "4. 🧪 TEST KEY FUNCTIONS:"
Write-Info "   • Test API config: $ProjectUrl/functions/v1/api-config-manager"
Write-Info "   • Test YouTube scanner: $ProjectUrl/functions/v1/youtube-scanner"
Write-Info "   • Test comprehensive scanner: $ProjectUrl/functions/v1/comprehensive-ai-scanner"

Write-Info "5. 🔄 UPDATE FRONTEND (if needed):"
Write-Info "   • Verify src/lib/supabase.ts has correct project URL"
Write-Info "   • Update any hardcoded URLs in your React app"
Write-Info "   • Redeploy your frontend application"

Write-Header "GENERATED FILES"
Write-Info "📄 database-setup-complete.sql - Complete database schema"
Write-Info "📄 cron-jobs-setup.sql - All cron jobs with correct URLs"
Write-Info "📄 deployment-report.md - Detailed deployment report"
Write-Info "📄 supabase/cron_jobs/job_*_updated.json - Updated cron job configs"

Write-Header "TROUBLESHOOTING"
Write-Info "If you encounter issues:"
Write-Info "• Check the Supabase Dashboard logs"
Write-Info "• Verify your project ID is correct: $ProjectId"
Write-Info "• Ensure you have proper permissions on the Supabase project"
Write-Info "• Run individual scripts manually if needed"
Write-Info "• Check that all required environment variables are set"

Write-Success "🚀 Your AI Video Trend Watcher is now deployed and ready to discover viral content!"

# Create a quick reference file
$quickRef = @"
# AI Video Trend Watcher - Quick Reference

## Project Details
- Project ID: $ProjectId
- Project URL: $ProjectUrl
- Dashboard: https://supabase.com/dashboard/project/$ProjectId

## Key Functions
- API Config Manager: $ProjectUrl/functions/v1/api-config-manager
- YouTube Scanner: $ProjectUrl/functions/v1/youtube-scanner
- Comprehensive Scanner: $ProjectUrl/functions/v1/comprehensive-ai-scanner
- Email Subscription: $ProjectUrl/functions/v1/email-subscription

## Cron Jobs Schedule
- Background Worker: Every 15 minutes
- Content Scanner: Every 6 hours
- Daily Scan: Daily at 8 AM
- Automated Scan: Every 6 hours

## Important Files
- database-setup-complete.sql
- cron-jobs-setup.sql
- deployment-report.md

Deployed on: $EndTime
"@

Set-Content -Path "quick-reference.md" -Value $quickRef
Write-Info "📋 Quick reference saved to: quick-reference.md"
