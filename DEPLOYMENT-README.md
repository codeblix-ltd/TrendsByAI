# AI Video Trend Watcher - Supabase Deployment Guide

This guide will help you deploy your complete AI Video Trend Watcher application to Supabase with all edge functions, database schema, cron jobs, and configurations.

## 🚀 Quick Start (Recommended)

For a complete automated deployment, run:

```powershell
.\deploy-all.ps1
```

This will deploy everything in the correct order with verification steps.

## 📋 What Gets Deployed

### Edge Functions (24 total)
- **AI Content Scanners**: `youtube-scanner`, `comprehensive-ai-scanner`, `automated-content-scanner`
- **Cron Jobs**: `automated-scan-cron`, `cron-daily-scan`, `background-worker`
- **Email System**: `email-subscription`, `email-alert-sender`, `unsubscribe-from-notifications`
- **AI Features**: `ai-storytelling-enhanced`, `viral-brief-generator`, `seo-pack-generator`
- **Management**: `api-config-manager`, `notification-system`, `subscription-manager`
- And 11 more specialized functions...

### Database Schema
- **18 Tables**: `video_scans`, `profiles`, `api_usage_tracking`, `subscribers`, etc.
- **5 Migrations**: YouTube API setup, viral detection, email alerts system
- **Indexes and Constraints**: Optimized for performance

### Cron Jobs (6 total)
- **Every 15 minutes**: Background processing, general scanning
- **Every 6 hours**: Comprehensive content scanning, YouTube-specific scans
- **Daily at 8 AM**: Full daily comprehensive scan

### Environment Variables
- YouTube API keys (multiple for redundancy)
- Supabase configuration
- Email service settings

## 🛠️ Individual Scripts

### 1. Complete Deployment
```powershell
# Deploy everything automatically
.\deploy-all.ps1

# Interactive mode (prompts before each step)
.\deploy-all.ps1 -Interactive

# Deploy only specific components
.\deploy-all.ps1 -FunctionsOnly
.\deploy-all.ps1 -DatabaseOnly
.\deploy-all.ps1 -CronJobsOnly
```

### 2. Database Setup
```powershell
# Set up database schema and tables
.\setup-database.ps1

# Force reset database (careful!)
.\setup-database.ps1 -ForceReset
```

### 3. Edge Functions Deployment
```powershell
# Deploy all edge functions
.\deploy-supabase.ps1

# Skip specific components
.\deploy-supabase.ps1 -SkipDatabase -SkipCronJobs
```

### 4. Cron Jobs Setup
```powershell
# Set up all cron jobs with correct URLs
.\setup-cron-jobs.ps1

# Remove existing cron jobs first
.\setup-cron-jobs.ps1 -RemoveExisting
```

### 5. Deployment Verification
```powershell
# Verify deployment
.\verify-deployment.ps1

# Detailed verification with function testing
.\verify-deployment.ps1 -Detailed -TestFunctions
```

## 📁 Generated Files

After running the deployment scripts, you'll have:

- `database-setup-complete.sql` - Complete database schema
- `cron-jobs-setup.sql` - All cron jobs with correct project URLs
- `deployment-report.md` - Detailed deployment status report
- `quick-reference.md` - Quick access links and information
- `supabase/cron_jobs/job_*_updated.json` - Updated cron job configurations

## ⚙️ Manual Steps Required

### 1. Execute Cron Jobs SQL
The cron jobs need to be manually executed in Supabase:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/nckesiywrprkozozuucq/sql)
2. Copy contents of `cron-jobs-setup.sql`
3. Paste and execute in SQL Editor

### 2. Verify Environment Variables
Check that these are set in Project Settings > Edge Functions:
- `YOUTUBE_API_KEY`
- `SUPABASE_URL` (auto-set)
- `SUPABASE_SERVICE_ROLE_KEY` (auto-set)

### 3. Test Key Functions
Visit these URLs to test deployment:
- API Config: `https://nckesiywrprkozozuucq.supabase.co/functions/v1/api-config-manager`
- YouTube Scanner: `https://nckesiywrprkozozuucq.supabase.co/functions/v1/youtube-scanner`

## 🔧 Troubleshooting

### Common Issues

**1. "Supabase CLI not found"**
```powershell
npm install -g @supabase/cli
# or
npx @supabase/cli --version
```

**2. "Project not linked"**
```powershell
npx supabase link --project-ref nckesiywrprkozozuucq
```

**3. "Function deployment failed"**
- Check function syntax in `supabase/functions/[function-name]/index.ts`
- Verify you have deployment permissions
- Check Supabase Dashboard logs

**4. "Database migration failed"**
- Run migrations individually
- Check for conflicting table names
- Verify database permissions

**5. "Cron jobs not running"**
- Manually execute `cron-jobs-setup.sql` in SQL Editor
- Check that `pg_cron` extension is enabled
- Verify function URLs are correct

### Getting Help

1. Check the generated `deployment-report.md`
2. Review Supabase Dashboard logs
3. Verify all files exist in the expected locations
4. Run `.\verify-deployment.ps1 -Detailed` for comprehensive checks

## 📊 Project Structure

```
├── supabase/
│   ├── functions/          # 24 edge functions
│   ├── migrations/         # 5 database migrations
│   ├── tables/            # 18 table definitions
│   └── cron_jobs/         # 6 cron job configurations
├── deploy-all.ps1         # Master deployment script
├── deploy-supabase.ps1    # Edge functions deployment
├── setup-database.ps1     # Database schema setup
├── setup-cron-jobs.ps1    # Cron jobs configuration
└── verify-deployment.ps1  # Deployment verification
```

## 🎯 Success Indicators

Your deployment is successful when:

✅ All 24 edge functions show as "Deployed" in Supabase Dashboard  
✅ All 18 tables exist in Database > Tables  
✅ Cron jobs are listed in Database > Cron Jobs  
✅ API config manager returns valid response  
✅ YouTube scanner can fetch video data  
✅ No errors in Functions > Logs  

## 🔗 Quick Links

- **Dashboard**: https://supabase.com/dashboard/project/nckesiywrprkozozuucq
- **Functions**: https://supabase.com/dashboard/project/nckesiywrprkozozuucq/functions
- **Database**: https://supabase.com/dashboard/project/nckesiywrprkozozuucq/editor
- **Logs**: https://supabase.com/dashboard/project/nckesiywrprkozozuucq/logs

---

🚀 **Ready to deploy?** Run `.\deploy-all.ps1` to get started!
