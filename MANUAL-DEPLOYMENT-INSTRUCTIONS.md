# Manual Database Deployment Instructions

## 🎯 Quick Setup (2 Steps)

### Step 1: Database Schema
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/nckesiywrprkozozuucq/sql)
2. Copy the entire contents of database-complete-setup.sql
3. Paste into the SQL editor
4. Click **"Run"**
5. Wait for completion (should see success message)

### Step 2: Cron Jobs
1. In the same SQL Editor
2. Copy the entire contents of cron-jobs-complete-setup.sql
3. Paste into the SQL editor
4. Click **"Run"**
5. Verify with: SELECT * FROM cron.job;

## 🔍 Verification

### Check Tables
Go to [Database Tables](https://supabase.com/dashboard/project/nckesiywrprkozozuucq/editor) and verify these tables exist:
- ✅ video_scans
- ✅ profiles  
- ✅ api_usage_tracking
- ✅ subscribers
- ✅ scan_history
- ✅ And 13 more tables...

### Check Cron Jobs
Run this query to see active cron jobs:
`sql
SELECT jobname, schedule, active FROM cron.job ORDER BY jobname;
`

Should show 6 active jobs:
- ✅ automated-content-scanner_invoke (every 6 hours)
- ✅ automated-scan-cron_invoke (every 6 hours)  
- ✅ background-worker_invoke (every 15 minutes)
- ✅ cron-daily-scan_invoke (daily at 8 AM)
- ✅ schedule-scanner_invoke (every 15 minutes)
- ✅ youtube-scanner-cron_invoke (every 6 hours)

## 🚀 Next Steps

After database setup is complete:
1. Deploy edge functions: .\deploy-supabase.ps1 -SkipDatabase -SkipCronJobs
2. Set environment variables in Supabase Dashboard
3. Test your functions

## 🔗 Quick Links
- **SQL Editor**: https://supabase.com/dashboard/project/nckesiywrprkozozuucq/sql
- **Tables**: https://supabase.com/dashboard/project/nckesiywrprkozozuucq/editor
- **Functions**: https://supabase.com/dashboard/project/nckesiywrprkozozuucq/functions

