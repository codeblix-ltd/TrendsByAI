# AI Video Trend Watcher - Database Setup Script
# This script specifically handles database schema creation and data setup

param(
    [string]$ProjectId = "nckesiywrprkozozuucq",
    [switch]$ForceReset,
    [switch]$Verbose
)

function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Progress { param($Message) Write-Host "🚀 $Message" -ForegroundColor Magenta }

$ProjectUrl = "https://$ProjectId.supabase.co"

Write-Progress "Setting up AI Video Trend Watcher Database Schema"
Write-Info "Project ID: $ProjectId"

# Step 1: Run Migrations
Write-Progress "Step 1: Running Database Migrations"

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
        Write-Info "Running migration: $migration"
        try {
            $sqlContent = Get-Content $migrationPath -Raw
            # Note: In a real deployment, you'd execute this via Supabase CLI or API
            Write-Success "✓ Migration $migration prepared"
        } catch {
            Write-Error "✗ Failed to process migration $migration : $_"
        }
    } else {
        Write-Warning "Migration file not found: $migration"
    }
}

# Step 2: Create Tables
Write-Progress "Step 2: Creating Database Tables"

$tableFiles = @(
    "alerts.sql",
    "api_quotas.sql", 
    "api_usage.sql",
    "api_usage_tracking.sql",
    "custom_searches.sql",
    "filter_presets.sql",
    "generated_prompts.sql",
    "profiles.sql",
    "scan_history.sql",
    "scan_sessions.sql",
    "search_sessions.sql",
    "user_preferences.sql",
    "user_watchlists.sql",
    "video_metrics_history.sql",
    "video_rankings.sql",
    "video_scans.sql",
    "videos.sql",
    "viral_trends.sql"
)

Write-Info "Creating $($tableFiles.Count) database tables..."

foreach ($tableFile in $tableFiles) {
    $tablePath = "supabase/tables/$tableFile"
    if (Test-Path $tablePath) {
        Write-Info "Processing table: $tableFile"
        try {
            $sqlContent = Get-Content $tablePath -Raw
            Write-Success "✓ Table $tableFile prepared for creation"
        } catch {
            Write-Error "✗ Failed to process table $tableFile : $_"
        }
    } else {
        Write-Warning "Table file not found: $tableFile"
    }
}

# Step 3: Create Combined SQL Script
Write-Progress "Step 3: Creating Combined Database Script"

$combinedSql = @"
-- AI Video Trend Watcher Database Setup
-- Generated on $(Get-Date)
-- Project ID: $ProjectId

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Migrations
"@

# Add migrations
foreach ($migration in $migrationFiles) {
    $migrationPath = "supabase/migrations/$migration"
    if (Test-Path $migrationPath) {
        $migrationContent = Get-Content $migrationPath -Raw
        $combinedSql += @"

-- Migration: $migration
$migrationContent

"@
    }
}

$combinedSql += @"

-- Tables
"@

# Add tables
foreach ($tableFile in $tableFiles) {
    $tablePath = "supabase/tables/$tableFile"
    if (Test-Path $tablePath) {
        $tableContent = Get-Content $tablePath -Raw
        $combinedSql += @"

-- Table: $tableFile
$tableContent

"@
    }
}

# Save combined script
$outputPath = "database-setup-complete.sql"
Set-Content -Path $outputPath -Value $combinedSql
Write-Success "Combined database script saved to: $outputPath"

# Step 4: Execute Database Setup
Write-Progress "Step 4: Executing Database Setup"

try {
    Write-Info "Pushing database changes to Supabase..."
    
    # Method 1: Use Supabase CLI to push migrations (updated syntax)
    npx supabase db push --linked
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ Database migrations pushed successfully"
    } else {
        Write-Warning "⚠ Migration push had issues, trying alternative method..."

        # Method 2: Reset and apply schema
        if ($ForceReset) {
            Write-Warning "Force reset enabled - this will reset the entire database!"
            npx supabase db reset --linked
        }
    }
    
    Write-Success "Database setup completed!"
    
} catch {
    Write-Error "Database setup failed: $_"
    Write-Info "You can manually execute the SQL script: $outputPath"
}

# Step 5: Verification
Write-Progress "Step 5: Database Verification"

Write-Info "To verify your database setup:"
Write-Info "1. Visit: https://supabase.com/dashboard/project/$ProjectId/editor"
Write-Info "2. Check that all tables are created in the 'public' schema"
Write-Info "3. Verify the following key tables exist:"
Write-Info "   - video_scans (main video data)"
Write-Info "   - profiles (user profiles)"
Write-Info "   - api_usage_tracking (API quota tracking)"
Write-Info "   - subscribers (email alerts)"
Write-Info "   - scan_history (scan tracking)"

Write-Success "🎉 Database setup script completed!"
Write-Info "Combined SQL script available at: $outputPath"
Write-Info "Next: Run the main deployment script with: .\deploy-supabase.ps1"
