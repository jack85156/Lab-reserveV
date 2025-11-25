# Fix "Failed to fetch" Error

## The Error
```
❌ Connection failed!
Error: TypeError: Failed to fetch
```

## What This Means
"Failed to fetch" is a **network-level error**. The browser cannot reach the Supabase server. This is usually NOT a credentials issue.

## Most Common Cause: Table Doesn't Exist

The most likely cause is that the `reservations` table hasn't been created in your Supabase database yet.

### Quick Fix (5 minutes)

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project (`zgpitqqdhbsfzvktmqpyw`)

2. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New query**

3. **Run This SQL:**
   ```sql
   -- Create bookings table
   CREATE TABLE IF NOT EXISTS bookings (
     id TEXT PRIMARY KEY,
     instrument TEXT NOT NULL,
     name TEXT NOT NULL,
     date TEXT NOT NULL,
     startTime TEXT NOT NULL,
     endTime TEXT NOT NULL,
     purpose TEXT,
     temperature TEXT,
     site TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create indexes for faster queries
   CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
   CREATE INDEX IF NOT EXISTS idx_bookings_instrument ON bookings(instrument);
   CREATE INDEX IF NOT EXISTS idx_bookings_name ON bookings(name);

   -- Enable Row Level Security
   ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

   -- Allow all operations (for public access)
   CREATE POLICY "Allow all operations" ON bookings
     FOR ALL
     USING (true)
     WITH CHECK (true);
   ```

4. **Click "Run"** (or press Ctrl+Enter)

5. **Verify Table Created:**
   - Go to **Table Editor** in left sidebar
   - You should see `bookings` table listed
   - Click on it to see the columns

6. **Test Again:**
   - Refresh your website
   - Try making a reservation
   - The error should be gone! ✅

## Other Possible Causes

### 1. Supabase Project is Paused

**Check:**
- Go to Supabase Dashboard
- Look at your project status
- If it says "Paused", click to resume it

**Fix:**
- Free tier projects can pause after inactivity
- Resume the project in the dashboard

### 2. Network/Firewall Blocking

**Check:**
- Try from a different network (mobile data, different WiFi)
- Check if your firewall blocks `*.supabase.co`
- Try from a different device

**Fix:**
- Allow connections to `*.supabase.co` in firewall
- Use a different network if blocked

### 3. Wrong Supabase URL

**Check:**
- Open `supabase-config.js`
- Verify URL is: `https://zgpitqqdhbsfzvktmqpyw.supabase.co`
- Make sure there are no typos

**Fix:**
- Double-check the URL in Supabase Dashboard → Settings → API
- Update `supabase-config.js` if needed

### 4. CORS Issues

**Check:**
- Open browser console (F12)
- Look for CORS errors in red
- Check Network tab for failed requests

**Fix:**
- Supabase should handle CORS automatically
- If CORS errors persist, check Supabase project settings
- Make sure you're using the correct anon key (not service role key)

## Step-by-Step Diagnosis

### Step 1: Verify Table Exists

1. Go to Supabase Dashboard → **Table Editor**
2. Look for `bookings` table
3. If it doesn't exist → **This is your problem!** Run the SQL above.

### Step 2: Verify Project is Active

1. Go to Supabase Dashboard
2. Check project status (should be "Active", not "Paused")
3. If paused → Resume it

### Step 3: Test Connection Manually

1. Open browser console (F12)
2. Run this code:
   ```javascript
   // Check if Supabase is configured
   console.log('URL:', window.SUPABASE_URL);
   console.log('Key:', window.SUPABASE_ANON_KEY ? 'Set' : 'NOT SET');
   
   // Check if client is initialized
   console.log('Supabase client:', typeof window.supabase !== 'undefined' ? 'Loaded' : 'NOT LOADED');
   ```

### Step 4: Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try making a reservation
4. Look for requests to `*.supabase.co`
5. Check if they:
   - **Succeed (200)** → Table might not exist
   - **Fail (404)** → Wrong URL or table doesn't exist
   - **Fail (CORS)** → CORS issue
   - **Fail (Network)** → Network/firewall blocking

## Quick Test

After creating the table, test it:

1. **In Supabase Dashboard → SQL Editor:**
   ```sql
   SELECT * FROM bookings LIMIT 1;
   ```
   Should return empty result (no error)

2. **In your browser:**
   - Open `test-supabase-connection.html`
   - Click "Test Connection"
   - Should show ✅ success

3. **Make a test reservation:**
   - Go to "Make Reservation"
   - Fill out the form
   - Submit
   - Should save without errors

## Still Not Working?

1. **Check browser console** for the exact error message
2. **Check Supabase Dashboard → Logs** for server errors
3. **Verify credentials** are correct (copy from Dashboard)
4. **Try the diagnostic tool:** Open `test-supabase-connection.html`

## Summary

**Most likely fix:** Create the `reservations` table using the SQL above.

**If that doesn't work:**
- Check project is active (not paused)
- Try different network
- Verify URL is correct
- Check browser console for specific errors

Once the table exists, the "Failed to fetch" error should be resolved! 🎉

