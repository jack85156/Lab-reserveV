# Quick Start: Enable Cross-Device Booking Visibility

## The Question
**Can people use different phones to book the system and see booking status online?**

**Answer: YES!** But you need to set up Supabase first.

## What You Need to Do

### Step 1: Create Supabase Account & Project (5 minutes)

1. Go to https://supabase.com
2. Sign up (free account is fine)
3. Click "New Project"
4. Fill in:
   - Name: `dr-v-lab-reservations` (or any name)
   - Database Password: Choose a strong password (save it!)
   - Region: Choose closest to you
5. Click "Create new project"
6. Wait 1-2 minutes for setup

### Step 2: Create the Database Table (2 minutes)

1. In Supabase Dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy and paste this SQL:

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

4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

### Step 3: Get Your Credentials (1 minute)

1. In Supabase Dashboard, click **Settings** (gear icon, bottom left)
2. Click **API**
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string under "Project API keys")

### Step 4: Configure Your App (2 minutes)

1. Open `supabase-config.js` in your project
2. Replace the placeholder values:

```javascript
window.SUPABASE_URL = 'https://your-project-id.supabase.co';  // ← Paste your Project URL here
window.SUPABASE_ANON_KEY = 'your-anon-key-here';  // ← Paste your anon key here
```

3. Save the file

### Step 5: Test It! (2 minutes)

1. Open your website in a browser
2. Open browser console (F12 → Console tab)
3. Look for: `✅ Supabase client initialized`
4. Make a test reservation
5. Check Supabase Dashboard → **Table Editor** → `bookings` table
6. You should see your reservation! ✅

### Step 6: Test Cross-Device (5 minutes)

1. **On Phone 1:**
   - Open your website
   - Make a reservation with your name
   - Check "My Reservations" - should see it

2. **On Phone 2 (or laptop):**
   - Open the **same** website
   - Go to "Check Availability" for the same instrument
   - You should see the booking from Phone 1! ✅

## Troubleshooting

### "Supabase client not initialized"

**Check:**
- Did you update `supabase-config.js` with your credentials?
- Are the credentials correct?
- Open browser console (F12) and check for errors

**Fix:**
- Verify your Project URL and anon key in Supabase Dashboard → Settings → API
- Make sure `supabase-config.js` is loaded before `storage.js` in HTML files

### "Failed to fetch reservations from Supabase"

**Check:**
- Did you create the `bookings` table? (Step 2)
- Check Supabase Dashboard → Table Editor → see if table exists

**Fix:**
- Run the SQL from Step 2 again
- Check browser console for specific error messages

### Reservations not appearing across devices

**Check:**
1. Browser console shows `storageType: 'CLOUD (Supabase)'` (not `LOCAL`)
2. Supabase Dashboard → Table Editor → see if bookings are being saved
3. Both devices are using the same website URL

**Fix:**
- Make sure both devices are accessing the same website
- Verify Supabase credentials are correct
- Check browser console on both devices

## What Happens Now?

✅ **With Supabase configured:**
- Bookings are stored in the cloud
- Everyone sees the same bookings in real-time
- Works across phones, laptops, tablets - any device!

❌ **Without Supabase (localStorage only):**
- Each device has its own separate bookings
- Bookings on Phone 1 won't appear on Phone 2
- Not suitable for shared lab use

## Need More Help?

See `SUPABASE_SETUP.md` for detailed instructions.

## Summary

1. ✅ Create Supabase project
2. ✅ Create bookings table (SQL)
3. ✅ Get credentials (URL + anon key)
4. ✅ Update `supabase-config.js`
5. ✅ Test locally
6. ✅ Test across devices

**Once done, people can use different phones to book and see booking status online!** 🎉

