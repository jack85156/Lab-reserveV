## Supabase Background Cleanup

The app already removes expired reservations whenever a page loads, but to guarantee the cloud data stays tidy even when nobody opens the UI, run the scheduled cleanup job below.

### 1. Run the SQL script once

1. Open the Supabase Dashboard → **SQL Editor**.
2. Paste the entire contents of `supabase-cleanup.sql`.
3. Run the script.

What it does:

- Creates (or reuses) `pg_cron`.
- Adds a helper table `reservation_cleanup_log` to record how many rows are deleted each run (purely for auditing—safe to remove if you don't want it).
- Defines `cleanup_expired_reservations()` which safely converts each row's `date` + `endTime` into Central Time and deletes **only** rows whose end time has already passed (expired reservations). The function includes validation to ensure it never deletes active or future reservations.
- Unschedules any previous job called `cleanup-expired-reservations` to avoid duplicates.
- Schedules a new cron job (`0 */4 * * *`) so the cleanup runs every 4 hours.
- Executes the cleanup immediately once so you see results right away.

### 2. Adjust schedule or logging (optional)

If you want a different cadence, edit the crontab string inside `supabase-cleanup.sql` (e.g., `'0 */2 * * *'` for every 2 hours, or `'0 0 * * *'` for once daily at midnight).

To stop logging, remove the `reservation_cleanup_log` table and related insert in the SQL file before running it.

### 3. Monitoring

- You can query `reservation_cleanup_log` to see when the job last ran:

  ```sql
  select * from public.reservation_cleanup_log order by ran_at desc limit 20;
  ```

- Supabase’s SQL Editor or Logs panel will also show any errors thrown by the cron job.

With this scheduled job in place, expired time slots are purged from Supabase automatically—even if no one is actively using the site. The existing front-end/local cleanup continues to work as an extra safety net.

### 4. Troubleshooting: "Cannot connect to bookings table"

If you get errors like "permission denied" or "relation does not exist" when running the cleanup function:

**Common causes:**
1. **Row Level Security (RLS) is blocking access** - The function uses `SECURITY DEFINER` to bypass RLS, but sometimes explicit permissions are needed.
2. **Function ownership** - The function must be owned by a user with proper permissions (usually `postgres`).
3. **Table doesn't exist** - The `bookings` table must exist in the `public` schema.

**Diagnostic steps:**
1. Run the diagnostic queries in `supabase-diagnose-cleanup.sql` to identify the issue.
2. Check if the `bookings` table exists and has the correct structure.
3. Verify RLS policies aren't blocking the function.
4. Ensure the function is owned by `postgres` (the script sets this automatically).

**Quick fixes:**
- If RLS is the issue, you can temporarily disable it for testing:
  ```sql
  ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
  ```
  (Re-enable with: `ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;`)
- Re-run the full `supabase-cleanup.sql` script to ensure proper setup.
- Test the function manually:
  ```sql
  SELECT public.cleanup_expired_reservations();
  ```

**Note:** The cleanup function uses `SECURITY DEFINER`, which means it runs with the privileges of the function owner (typically `postgres`), allowing it to bypass RLS policies. This is the correct approach for background cleanup jobs.



