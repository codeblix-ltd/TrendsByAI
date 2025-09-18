-- AI Video Trend Watcher Cron Jobs Setup
-- Generated on 09/18/2025 21:00:38
-- Project ID: nckesiywrprkozozuucq
-- Project URL: https://nckesiywrprkozozuucq.supabase.co

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;
-- Cron Job 1: schedule-scanner_invoke
-- Runs every 15 minutes - General content scanning
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
-- Cron Job 2: cron-daily-scan_invoke
-- Runs daily at 8 AM - Daily comprehensive scan
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
-- Cron Job 3: automated-scan-cron_invoke
-- Runs every 6 hours - Automated scanning
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
-- Cron Job 4: automated-content-scanner_invoke
-- Runs every 6 hours - Enhanced global content scanning
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
-- Cron Job 5: youtube-scanner-cron_invoke
-- Runs every 6 hours - YouTube specific scanning
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
-- Cron Job 6: background-worker_invoke
-- Runs every 15 minutes - Background processing tasks
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

