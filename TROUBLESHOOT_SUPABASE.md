# Troubleshooting Supabase Connection Issues

## Error Message
**"Warning: Could not connect to cloud database. Reservation saved locally only - it will NOT be visible on other devices. Please check Supabase configuration."**

## Quick Diagnosis

Open your browser console (F12 → Console tab) and look for these messages:

### ✅ If you see: "✅ Supabase client initialized successfully"
- Supabase is connected! The error might be from a different issue.
- Check for other error messages in the console.

### ❌ If you see: "⚠️ Supabase credentials are still placeholders!"
**Problem:** Your `supabase-config.js` still has placeholder values.

**Solution:**
1. Open `supabase-config.js`
2. Replace:
   ```javascript
   window.SUPABASE_URL = 'https://your-project-id.supabase.co';  // ← Still placeholder!
   window.SUPABASE_ANON_KEY = 'your-anon-key-here';  // ← Still placeholder!
   ```
3. With your actual credentials from Supabase Dashboard → Settings → API

### ❌ If you see: "❌ Supabase library not found!"
**Problem:** The Supabase JavaScript library isn't loading.

**Solution:**
1. Check your HTML files include the Supabase script **before** `storage.js`:
   ```html
   <script src="supabase-config.js"></script>
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
   <script src="storage.js"></script>
   ```
2. Check browser Network tab (F12 → Network) to see if the Supabase script loads
3. Check for CORS or network errors

### ❌ If you see: "Failed to fetch reservations from Supabase"
**Problem:** Connection to Supabase is failing.

**Possible causes:**
1. **Wrong credentials** - Double-check your URL and anon key
2. **Table doesn't exist** - Run the SQL to create the `reservations` table
3. **Row Level Security (RLS) blocking** - Check RLS policies in Supabase Dashboard
4. **Network/firewall issues** - Check if your network allows connections to Supabase

## Step-by-Step Fix

### Step 1: Verify Supabase Project is Set Up

1. Go to https://supabase.com/dashboard
2. Make sure your project is **active** (not paused)
3. Check **Settings → API** for your credentials:
   - **Project URL** should look like: `https://xxxxx.supabase.co`
   - **anon public** key should be a long string

### Step 2: Verify Database Table Exists

1. In Supabase Dashboard, go to **Table Editor**
2. Look for `reservations` table
3. If it doesn't exist, go to **SQL Editor** and run:
   ```sql
   CREATE TABLE IF NOT EXISTS reservations (
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
   
   ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Allow all operations" ON reservations
     FOR ALL
     USING (true)
     WITH CHECK (true);
   ```

### Step 3: Update supabase-config.js

1. Open `supabase-config.js` in your project
2. Make sure it has your **actual** credentials (not placeholders):
   ```javascript
   window.SUPABASE_URL = 'https://your-actual-project-id.supabase.co';
   window.SUPABASE_ANON_KEY = 'your-actual-anon-key-here';
   ```
3. Save the file

### Step 4: Verify Script Loading Order

Check that your HTML files load scripts in this order:

```html
<!-- 1. Supabase Configuration (sets credentials) -->
<script src="supabase-config.js"></script>

<!-- 2. Supabase Client Library -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>

<!-- 3. Storage abstraction (uses Supabase) -->
<script src="storage.js"></script>
```

### Step 5: Test Connection

1. Open your website
2. Open browser console (F12)
3. Look for: `✅ Supabase client initialized successfully`
4. Try making a reservation
5. Check Supabase Dashboard → **Table Editor** → `reservations` table
6. You should see your reservation!

## Common Issues

### Issue: "Storage Configuration: storageType: 'LOCAL (localStorage)'"

**Meaning:** Supabase is not being used, falling back to localStorage.

**Check:**
- Browser console for initialization messages
- `supabase-config.js` has real credentials (not placeholders)
- Supabase script is loaded before `storage.js`

### Issue: "Failed to save reservation: relation 'reservations' does not exist"

**Meaning:** The database table doesn't exist.

**Fix:** Run the SQL from Step 2 above to create the table.

### Issue: "Failed to save reservation: new row violates row-level security policy"

**Meaning:** Row Level Security (RLS) is blocking the insert.

**Fix:** 
1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Find the `reservations` table
3. Make sure there's a policy that allows INSERT operations
4. Or run the SQL from Step 2 which includes a permissive policy

### Issue: Network errors or CORS errors

**Possible causes:**
- Firewall blocking Supabase
- Network connectivity issues
- Supabase project is paused

**Fix:**
- Check Supabase Dashboard to ensure project is active
- Try from a different network
- Check browser console for specific error messages

## Still Not Working?

1. **Check browser console** for specific error messages
2. **Check Supabase Dashboard** → **Logs** for server-side errors
3. **Verify credentials** are correct (copy-paste from Supabase Dashboard)
4. **Test with a simple query** in Supabase Dashboard → SQL Editor:
   ```sql
   SELECT * FROM reservations LIMIT 5;
   ```

## Quick Test

Run this in your browser console (F12) after the page loads:

```javascript
// Check if Supabase is configured
console.log('SUPABASE_URL:', window.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', window.SUPABASE_ANON_KEY ? 'Set (hidden)' : 'NOT SET');

// Check if Supabase library is loaded
console.log('Supabase library:', typeof window.supabase !== 'undefined' ? 'Loaded' : 'NOT LOADED');

// Check if client is initialized
// (This will be in storage.js, but you can check Storage object)
console.log('Storage type:', Storage ? 'Available' : 'NOT AVAILABLE');
```

If any of these show "NOT SET" or "NOT LOADED", that's your issue!

