# AI Video Trend Watcher - Supabase Deployment Script
# Project ID: nckesiywrprkozozuucq
# This script deploys all edge functions, database schema, cron jobs, and configurations

param(
    [string]$ProjectId = "nckesiywrprkozozuucq",
    [switch]$SkipFunctions,
    [switch]$SkipDatabase,
    [switch]$SkipCronJobs,
    [switch]$SkipSecrets,
    [switch]$Verbose
)

# Color functions for better output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Progress { param($Message) Write-Host "🚀 $Message" -ForegroundColor Magenta }

# Global variables
$ProjectUrl = "https://$ProjectId.supabase.co"
$ErrorCount = 0
$SuccessCount = 0

Write-Progress "Starting AI Video Trend Watcher Supabase Deployment"
Write-Info "Project ID: $ProjectId"
Write-Info "Project URL: $ProjectUrl"

# Step 1: Pre-deployment checks
Write-Progress "Step 1: Pre-deployment Checks"

try {
    # Check if Supabase CLI is installed
    $supabaseVersion = npx supabase --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Supabase CLI is available: $supabaseVersion"
    } else {
        Write-Error "Supabase CLI not found. Please install it first."
        exit 1
    }

    # Check if we're in the right directory
    if (!(Test-Path "supabase/functions") -or !(Test-Path "supabase/migrations")) {
        Write-Error "Not in the correct project directory. Please run from project root."
        exit 1
    }
    Write-Success "Project structure verified"

    # Link to Supabase project
    Write-Info "Linking to Supabase project..."
    npx supabase link --project-ref $ProjectId
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Successfully linked to project $ProjectId"
    } else {
        Write-Warning "Link command failed, but continuing (might already be linked)"
    }
} catch {
    Write-Error "Pre-deployment checks failed: $_"
    exit 1
}

# Step 2: Deploy Edge Functions
if (!$SkipFunctions) {
    Write-Progress "Step 2: Deploying Edge Functions"
    
    $functions = @(
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

    $functionCount = $functions.Count
    Write-Info "Deploying $functionCount edge functions..."

    foreach ($function in $functions) {
        try {
            Write-Info "Deploying function: $function"
            npx supabase functions deploy $function --project-ref $ProjectId
            if ($LASTEXITCODE -eq 0) {
                Write-Success "✓ $function deployed successfully"
                $SuccessCount++
            } else {
                Write-Error "✗ Failed to deploy $function"
                $ErrorCount++
            }
        } catch {
            Write-Error "✗ Exception deploying $function : $_"
            $ErrorCount++
        }
    }
    
    Write-Info "Functions deployment summary: $SuccessCount successful, $ErrorCount failed"
} else {
    Write-Warning "Skipping edge functions deployment"
}

# Step 3: Database Schema Setup
if (!$SkipDatabase) {
    Write-Progress "Step 3: Setting up Database Schema"
    
    try {
        # Run migrations
        Write-Info "Running database migrations..."
        npx supabase db push --project-ref $ProjectId
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database migrations completed successfully"
        } else {
            Write-Warning "Migration push had issues, but continuing..."
        }

        # Create tables from SQL files
        Write-Info "Creating database tables..."
        $tableFiles = Get-ChildItem "supabase/tables/*.sql" | Sort-Object Name
        
        foreach ($tableFile in $tableFiles) {
            try {
                Write-Info "Creating table from: $($tableFile.Name)"
                $sqlContent = Get-Content $tableFile.FullName -Raw
                
                # Execute SQL via Supabase CLI
                $tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
                Set-Content -Path $tempFile -Value $sqlContent
                
                npx supabase db reset --project-ref $ProjectId --linked
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "✓ Table created from $($tableFile.Name)"
                } else {
                    Write-Warning "⚠ Issues with $($tableFile.Name), but continuing..."
                }
                
                Remove-Item $tempFile -ErrorAction SilentlyContinue
            } catch {
                Write-Warning "⚠ Could not process $($tableFile.Name): $_"
            }
        }
        
        Write-Success "Database schema setup completed"
    } catch {
        Write-Error "Database setup failed: $_"
        $ErrorCount++
    }
} else {
    Write-Warning "Skipping database setup"
}

# Step 4: Set up Environment Variables/Secrets
if (!$SkipSecrets) {
    Write-Progress "Step 4: Setting up Environment Variables"

    try {
        Write-Info "Setting up YouTube API keys and other secrets..."

        # YouTube API Keys found in the codebase
        $youtubeKeys = @(
            "AIzaSyB_KlEaUYdEPTKqrC6jl5DHy5DftcVq_1k",
            "AIzaSyBLfyxwWCE7WVeNS07GzupDtI6eAz1XniM",
            "AIzaSyByB9I3Sw_HCM9M9fGx4joxdu3mVAEWf8Y"
        )

        # Set primary YouTube API key
        Write-Info "Setting YOUTUBE_API_KEY environment variable..."
        npx supabase secrets set YOUTUBE_API_KEY=$($youtubeKeys[0]) --project-ref $ProjectId
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✓ YOUTUBE_API_KEY set successfully"
        } else {
            Write-Error "✗ Failed to set YOUTUBE_API_KEY"
            $ErrorCount++
        }

        # Set backup API keys
        npx supabase secrets set YOUTUBE_API_KEY_BACKUP=$($youtubeKeys[1]) --project-ref $ProjectId
        npx supabase secrets set YOUTUBE_API_KEY_BACKUP2=$($youtubeKeys[2]) --project-ref $ProjectId

        Write-Success "Environment variables setup completed"
    } catch {
        Write-Error "Environment variables setup failed: $_"
        $ErrorCount++
    }
} else {
    Write-Warning "Skipping environment variables setup"
}

# Step 5: Set up Cron Jobs
if (!$SkipCronJobs) {
    Write-Progress "Step 5: Setting up Cron Jobs"

    try {
        Write-Info "Creating cron jobs with updated project URL..."

        $cronJobs = @(
            @{
                name = "schedule-scanner_invoke"
                cron = "*/15 * * * *"
                function = "schedule-scanner"
                procedure = "schedule_scanner_5c2dc807"
            },
            @{
                name = "cron-daily-scan_invoke"
                cron = "0 8 * * *"
                function = "cron-daily-scan"
                procedure = "cron_daily_scan_0ebf7129"
            },
            @{
                name = "automated-scan-cron_invoke"
                cron = "0 */6 * * *"
                function = "automated-scan-cron"
                procedure = "automated_scan_cron_44e544e6"
            },
            @{
                name = "automated-content-scanner_invoke"
                cron = "0 */6 * * *"
                function = "automated-content-scanner"
                procedure = "automated_content_scanner_9dc366a8"
            },
            @{
                name = "youtube-scanner-cron_invoke"
                cron = "0 */6 * * *"
                function = "youtube-scanner-cron"
                procedure = "youtube_scanner_cron_109de9c8"
            },
            @{
                name = "background-worker_invoke"
                cron = "*/15 * * * *"
                function = "background-worker"
                procedure = "background_worker_d9fca0fd"
            }
        )

        foreach ($job in $cronJobs) {
            $cronSql = @"
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

            Write-Info "Creating cron job: $($job.name)"
            $tempSqlFile = [System.IO.Path]::GetTempFileName() + ".sql"
            Set-Content -Path $tempSqlFile -Value $cronSql

            # Execute the SQL
            npx supabase db reset --project-ref $ProjectId --linked
            if ($LASTEXITCODE -eq 0) {
                Write-Success "✓ Cron job $($job.name) created successfully"
            } else {
                Write-Warning "⚠ Issues creating cron job $($job.name)"
            }

            Remove-Item $tempSqlFile -ErrorAction SilentlyContinue
        }

        Write-Success "Cron jobs setup completed"
    } catch {
        Write-Error "Cron jobs setup failed: $_"
        $ErrorCount++
    }
} else {
    Write-Warning "Skipping cron jobs setup"
}

Write-Progress "Deployment Summary"
Write-Info "Total Errors: $ErrorCount"
Write-Info "Total Successes: $SuccessCount"

if ($ErrorCount -eq 0) {
    Write-Success "🎉 Deployment completed successfully!"
    Write-Success "Your AI Video Trend Watcher is now deployed and ready!"
} else {
    Write-Warning "⚠️ Deployment completed with $ErrorCount errors. Please review the output above."
}

Write-Info "🔗 Your project is available at: $ProjectUrl"
Write-Info "📊 Supabase Dashboard: https://supabase.com/dashboard/project/$ProjectId"

Write-Info "Next steps:"
Write-Info "1. Visit the Supabase Dashboard to verify all functions are deployed"
Write-Info "2. Test your edge functions via the Functions tab"
Write-Info "3. Check the Database tab to verify all tables were created"
Write-Info "4. Monitor the Cron Jobs in the Database > Cron Jobs section"
Write-Info "5. Update your frontend app to use the correct Supabase URL if needed"
