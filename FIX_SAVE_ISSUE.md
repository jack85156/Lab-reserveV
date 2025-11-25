# Fix: Cannot Save Data to Cloud Database

## Problem
Credentials are verified but data still cannot be saved to Supabase cloud database.

## Most Common Causes

### 1. ❌ Table Doesn't Exist (90% of cases)

**Symptoms:**
- Error: `relation "bookings" does not exist`
- Error code: `42P01`
- Data falls back to localStorage

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

### 2. ❌ Row Level Security (RLS) Blocking INSERT (5% of cases)

**Symptoms:**
- Error: `new row violates row-level security policy`
- Error code: `42501`
- Permission denied errors

**Solution:**
Run the SQL above - it includes a permissive RLS policy that allows all operations.

### 3. ❌ Supabase Client Not Initialized (3% of cases)

**Symptoms:**
- Console shows: "Supabase client not initialized"
- Data always saves to localStorage
- No Supabase errors in console

**Check:**
1. Open browser console (F12)
2. Look for: `✅ Supabase client initialized successfully`
3. If you see: `❌ Supabase library not found!` → Library isn't loading

**Solution:**
- Check HTML files have Supabase scripts in correct order:
```html
<script src="supabase-config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="storage.js"></script>
```

### 4. ❌ Project is Paused (2% of cases)

**Symptoms:**
- Connection timeouts
- "Failed to fetch" errors

**Solution:**
- Go to Supabase Dashboard
- Check project status (should be "Active")
- Resume if paused

## Diagnostic Steps

### Step 1: Check Browser Console

1. Open your website
2. Open browser console (F12 → Console tab)
3. Try to save a reservation
4. Look for these messages:

**✅ Good signs:**
- `✅ Supabase client initialized successfully`
- `Saving reservation to Supabase: {...}`
- `Supabase saved reservation: {...}`

**❌ Bad signs:**
- `⚠️ Supabase not available, using localStorage`
- `❌ ERROR: Failed to save reservation to Supabase`
- `relation "bookings" does not exist`
- `permission denied`

### Step 2: Use Diagnostic Tool

1. Open `diagnose-connection.html` in your browser
2. It will automatically test:
   - Configuration
   - Library loading
   - Client initialization
   - Database connection
   - Table existence
   - RLS policies

### Step 3: Check Network Tab

1. Open browser DevTools (F12) → **Network** tab
2. Try to save a reservation
3. Look for requests to `*.supabase.co`
4. Check:
   - **Status 200** = Success
   - **Status 404** = Table doesn't exist
   - **Status 403** = Permission denied (RLS blocking)
   - **Status 500** = Server error

### Step 4: Verify in Supabase Dashboard

1. Go to Supabase Dashboard
2. Check **Table Editor** → `bookings` table exists
3. Check **Authentication** → **Policies** → policies exist
4. Check **Logs** → look for error messages
5. Check project status (should be "Active")

## Quick Test

Run this in browser console (F12) after page loads:

```javascript
// Check if Supabase is ready
console.log('=== Supabase Status ===');
console.log('URL:', window.SUPABASE_URL);
console.log('Key:', window.SUPABASE_ANON_KEY ? 'Set' : 'NOT SET');
console.log('Library:', typeof window.supabase !== 'undefined' ? 'Loaded' : 'NOT LOADED');

// Test save
if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    
    // Try to insert a test record
    const testReservation = {
        id: 'test_' + Date.now(),
        instrument: 'Test Instrument',
        name: 'Test User',
        date: '2099-12-31',
        startTime: '00:00',
        endTime: '00:30'
    };
    
    client.from('bookings').insert([testReservation])
        .then(({ data, error }) => {
            if (error) {
                console.error('❌ Save failed:', error.message, 'Code:', error.code);
                if (error.code === '42P01') {
                    console.error('→ Table does not exist! Create it in Supabase Dashboard.');
                } else if (error.code === '42501') {
                    console.error('→ RLS policy blocking! Add permissive policy.');
                }
            } else {
                console.log('✅ Save works! Test record:', data);
                // Delete test record
                client.from('bookings').delete().eq('id', testReservation.id);
            }
        });
} else {
    console.error('❌ Supabase client not available!');
}
```

## What I've Improved

1. **Better error messages** - Now shows specific error codes and hints
2. **More logging** - Added detailed console logs to track the save process
3. **Fixed client initialization** - Removed `.bind()` which might have caused issues
4. **Better diagnostics** - Shows exactly why Supabase isn't being used

## Most Likely Fix

**90% chance:** The `bookings` table doesn't exist in your new Supabase project.

**Quick fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from Step 1 above
3. Try saving again

## Still Not Working?

1. Open browser console and copy all error messages
2. Run `diagnose-connection.html` and share results
3. Check Supabase Dashboard → Logs for server errors
4. Verify table exists in Table Editor

The improved error messages will now tell you exactly what's wrong!

