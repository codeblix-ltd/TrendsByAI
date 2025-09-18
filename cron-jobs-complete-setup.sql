-- AI Video Trend Watcher - Cron Jobs Setup
-- Generated: 09/18/2025 19:54:07
-- Project ID: nckesiywrprkozozuucq
-- Project URL: https://nckesiywrprkozozuucq.supabase.co
--
-- INSTRUCTIONS:
-- 1. Go to https://supabase.com/dashboard/project/nckesiywrprkozozuucq/sql
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

-- Cron Job: schedule-scanner_invoke
-- General content scanning every 15 minutes
-- Schedule: */15 * * * *
CREATE OR REPLACE PROCEDURE schedule_scanner_5c2dc807()
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM net.http_post(
        url:='https://nckesiywrprkozozuucq.supabase.co/functions/v1/schedule-scanner',
        headers:=jsonb_build_object('Content-Type', 'application/json'),
        body:='{"edge_function_name":"schedule-scanner"}',
        timeout_milliseconds:=10000
    );
    COMMIT;
END;
$$;

SELECT cron.schedule('schedule-scanner_invoke', '*/15 * * * *', 'CALL schedule_scanner_5c2dc807()');

-- Cron Job: cron-daily-scan_invoke
-- Daily comprehensive scan at 8 AM
-- Schedule: 0 8 * * *
CREATE OR REPLACE PROCEDURE cron_daily_scan_0ebf7129()
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM net.http_post(
        url:='https://nckesiywrprkozozuucq.supabase.co/functions/v1/cron-daily-scan',
        headers:=jsonb_build_object('Content-Type', 'application/json'),
        body:='{"edge_function_name":"cron-daily-scan"}',
        timeout_milliseconds:=10000
    );
    COMMIT;
END;
$$;

SELECT cron.schedule('cron-daily-scan_invoke', '0 8 * * *', 'CALL cron_daily_scan_0ebf7129()');

-- Cron Job: automated-scan-cron_invoke
-- Automated scanning every 6 hours
-- Schedule: 0 */6 * * *
CREATE OR REPLACE PROCEDURE automated_scan_cron_44e544e6()
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM net.http_post(
        url:='https://nckesiywrprkozozuucq.supabase.co/functions/v1/automated-scan-cron',
        headers:=jsonb_build_object('Content-Type', 'application/json'),
        body:='{"edge_function_name":"automated-scan-cron"}',
        timeout_milliseconds:=10000
    );
    COMMIT;
END;
$$;

SELECT cron.schedule('automated-scan-cron_invoke', '0 */6 * * *', 'CALL automated_scan_cron_44e544e6()');

-- Cron Job: automated-content-scanner_invoke
-- Enhanced global content scanning every 6 hours
-- Schedule: 0 */6 * * *
CREATE OR REPLACE PROCEDURE automated_content_scanner_9dc366a8()
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM net.http_post(
        url:='https://nckesiywrprkozozuucq.supabase.co/functions/v1/automated-content-scanner',
        headers:=jsonb_build_object('Content-Type', 'application/json'),
        body:='{"edge_function_name":"automated-content-scanner"}',
        timeout_milliseconds:=10000
    );
    COMMIT;
END;
$$;

SELECT cron.schedule('automated-content-scanner_invoke', '0 */6 * * *', 'CALL automated_content_scanner_9dc366a8()');

-- Cron Job: youtube-scanner-cron_invoke
-- YouTube specific scanning every 6 hours
-- Schedule: 0 */6 * * *
CREATE OR REPLACE PROCEDURE youtube_scanner_cron_109de9c8()
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM net.http_post(
        url:='https://nckesiywrprkozozuucq.supabase.co/functions/v1/youtube-scanner-cron',
        headers:=jsonb_build_object('Content-Type', 'application/json'),
        body:='{"edge_function_name":"youtube-scanner-cron"}',
        timeout_milliseconds:=10000
    );
    COMMIT;
END;
$$;

SELECT cron.schedule('youtube-scanner-cron_invoke', '0 */6 * * *', 'CALL youtube_scanner_cron_109de9c8()');

-- Cron Job: background-worker_invoke
-- Background processing every 15 minutes
-- Schedule: */15 * * * *
CREATE OR REPLACE PROCEDURE background_worker_d9fca0fd()
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM net.http_post(
        url:='https://nckesiywrprkozozuucq.supabase.co/functions/v1/background-worker',
        headers:=jsonb_build_object('Content-Type', 'application/json'),
        body:='{"edge_function_name":"background-worker"}',
        timeout_milliseconds:=10000
    );
    COMMIT;
END;
$$;

SELECT cron.schedule('background-worker_invoke', '*/15 * * * *', 'CALL background_worker_d9fca0fd()');

-- Verify cron jobs were created
SELECT 
    jobname,
    schedule,
    command,
    active
FROM cron.job 
ORDER BY jobname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 All cron jobs have been set up successfully!';
  RAISE NOTICE '⏰ 6 automated jobs are now scheduled';
  RAISE NOTICE '🔍 Use SELECT * FROM cron.job; to verify';
END $$;

