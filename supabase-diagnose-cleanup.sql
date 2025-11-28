-- -----------------------------------------------------------------------------
-- Diagnostic queries to troubleshoot cleanup function connection issues
-- Run these in Supabase Dashboard → SQL Editor to diagnose the problem
-- -----------------------------------------------------------------------------

-- 1. Check if bookings table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookings'
ORDER BY ordinal_position;

-- 2. Check if RLS is enabled on bookings table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'bookings';

-- 3. Check RLS policies on bookings table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'bookings';

-- 4. Check if cleanup function exists and its properties
SELECT 
    p.proname as function_name,
    pg_get_userbyid(p.proowner) as owner,
    p.prosecdef as security_definer,
    p.proconfig as settings
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'cleanup_expired_reservations';

-- 5. Test direct access to bookings table (should work if you're postgres/service_role)
SELECT COUNT(*) as total_reservations FROM public.bookings;

-- 6. Test if we can read expired reservations
SELECT 
    "name",
    "instrument",
    "date",
    "startTime",
    "endTime",
    timezone(
        'America/Chicago',
        ("date" || ' ' || "endTime")::timestamp without time zone
    ) as end_time_central,
    timezone('America/Chicago', now()) as current_central_time
FROM public.bookings
WHERE 
    "date" is not null 
    AND "endTime" is not null
    AND "endTime" != ''
    AND (
        timezone(
            'America/Chicago',
            ("date" || ' ' || "endTime")::timestamp without time zone
        )
    ) < timezone('America/Chicago', now())
LIMIT 10;

-- 7. Check pg_cron jobs
SELECT 
    jobid,
    jobname,
    schedule,
    command,
    nodename,
    nodeport,
    database,
    username,
    active
FROM cron.job
WHERE jobname = 'cleanup-expired-reservations';

-- 8. Check recent cleanup log entries
SELECT 
    id,
    deleted_count,
    ran_at
FROM public.reservation_cleanup_log
ORDER BY ran_at DESC
LIMIT 10;

-- 9. Check cleanup details (if any)
SELECT 
    d.id,
    d.cleanup_log_id,
    d.reservation_name,
    d.instrument_name,
    d.reservation_date,
    d.start_time,
    d.end_time,
    d.deleted_at,
    l.ran_at
FROM public.reservation_cleanup_details d
JOIN public.reservation_cleanup_log l ON d.cleanup_log_id = l.id
ORDER BY d.deleted_at DESC
LIMIT 20;

-- -----------------------------------------------------------------------------
-- FIXES: Run these if you find issues
-- -----------------------------------------------------------------------------

-- Fix 1: If RLS is blocking the function, disable it temporarily (NOT RECOMMENDED for production)
-- ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;

-- Fix 2: Ensure function is owned by postgres
-- ALTER FUNCTION public.cleanup_expired_reservations() OWNER TO postgres;

-- Fix 3: Grant explicit permissions (if needed)
-- GRANT SELECT, DELETE ON public.bookings TO postgres;
-- GRANT INSERT, SELECT ON public.reservation_cleanup_log TO postgres;
-- GRANT INSERT, SELECT ON public.reservation_cleanup_details TO postgres;

-- Fix 4: Recreate the function with proper permissions
-- (Run the full supabase-cleanup.sql script again)

-- Fix 5: Test the function manually
-- SELECT public.cleanup_expired_reservations();

