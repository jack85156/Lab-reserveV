# Supabase Connection Troubleshooting Guide

## Problem: Credentials Verified But Cannot Connect

If your Supabase credentials are verified but you still can't connect, here are the most common causes:

## Common Issues & Solutions

### 1. ❌ Table Doesn't Exist

**Symptoms:**
- Error: `relation "bookings" does not exist`
- Error code: `42P01`
- "Failed to fetch" error

**Solution:**
1. Go to Supabase Dashboard → **SQL Editor**
2. Run this SQL:

```sql
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

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_instrument ON bookings(instrument);
CREATE INDEX IF NOT EXISTS idx_bookings_name ON bookings(name);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON bookings
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

3. Verify in **Table Editor** that `bookings` table exists

### 2. ❌ Row Level Security (RLS) Blocking Access

**Symptoms:**
- Error: `new row violates row-level security policy`
- Error code: `42501`
- Permission denied errors

**Solution:**
1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Find the `bookings` table
3. Check if there's a policy that allows operations
4. If not, run the SQL above (includes a permissive policy)

### 3. ❌ Supabase Library Not Loading

**Symptoms:**
- Console error: "Supabase library not found"
- `window.supabase` is undefined
- Client initialization fails

**Check:**
1. Open browser DevTools (F12) → **Network** tab
2. Look for the Supabase script: `supabase.min.js`
3. Check if it loaded successfully (status 200)
4. Check for CORS errors

**Solution:**
- Make sure the script tag is **before** `storage.js`:
```html
<script src="supabase-config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="storage.js"></script>
```

### 4. ❌ Project is Paused

**Symptoms:**
- Connection timeouts
- "Failed to fetch" errors
- No specific error message

**Solution:**
1. Go to Supabase Dashboard
2. Check if project status shows "Paused"
3. If paused, click to resume it
4. Wait 1-2 minutes for project to activate

### 5. ❌ Network/Firewall Blocking

**Symptoms:**
- "Failed to fetch" error
- Network errors in console
- Works on some networks but not others

**Solution:**
- Try from a different network (mobile data, different WiFi)
- Check if firewall blocks `*.supabase.co`
- Check browser console for specific network errors

### 6. ❌ Wrong Table Name

**Symptoms:**
- Error: `relation "reservations" does not exist`
- But you created `bookings` table

**Check:**
- Your code uses `bookings` table (correct)
- Make sure you created `bookings` table, not `reservations`

### 7. ❌ Client Initialization Timing

**Symptoms:**
- Client initializes but queries fail
- "Supabase client not initialized" errors

**Solution:**
- The code already handles delayed initialization
- If issues persist, check browser console for initialization messages

## Diagnostic Steps

### Step 1: Use Diagnostic Tool

1. Open `diagnose-connection.html` in your browser
2. It will automatically run all checks
3. Review the results for each step

### Step 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for:
   - ✅ `Supabase client initialized successfully`
   - ❌ Any error messages
   - ⚠️ Any warnings

### Step 3: Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try making a reservation
4. Look for requests to `*.supabase.co`
5. Check:
   - Status code (200 = success, 404 = table doesn't exist, 403 = permission denied)
   - Response body for error messages

### Step 4: Verify in Supabase Dashboard

1. Go to Supabase Dashboard
2. Check **Table Editor** → `bookings` table exists
3. Check **Authentication** → **Policies** → policies exist
4. Check **Logs** → look for error messages
5. Check project status (should be "Active")

## Quick Test

Run this in browser console (F12) after page loads:

```javascript
// Check configuration
console.log('URL:', window.SUPABASE_URL);
console.log('Key:', window.SUPABASE_ANON_KEY ? 'Set' : 'NOT SET');

// Check library
console.log('Library:', typeof window.supabase !== 'undefined' ? 'Loaded' : 'NOT LOADED');

// Check client
if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    
    // Test connection
    client.from('bookings').select('count').limit(1)
        .then(({ data, error }) => {
            if (error) {
                console.error('❌ Error:', error.message, error.code);
            } else {
                console.log('✅ Connection works!');
            }
        });
} else {
    console.error('❌ Supabase library not found!');
}
```

## Most Likely Issues (In Order)

1. **Table doesn't exist** (90% of cases) - Create the `bookings` table
2. **RLS blocking** (5% of cases) - Add permissive policy
3. **Project paused** (3% of cases) - Resume project
4. **Library not loading** (2% of cases) - Check script tags

## Still Not Working?

1. Run `diagnose-connection.html` and share the results
2. Check browser console for specific errors
3. Check Supabase Dashboard → Logs for server-side errors
4. Verify credentials in Supabase Dashboard → Settings → API

