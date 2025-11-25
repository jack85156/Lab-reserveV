# Supabase Setup Guide

This guide will help you set up cloud storage for the Dr. V's Lab Reservation System using Supabase.

## Prerequisites

1. A Supabase account (free tier is sufficient)
2. Basic knowledge of SQL (for creating the table)

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in:
   - **Name**: Your project name (e.g., "dr-v-lab-reservations")
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **Create new project**
5. Wait for the project to be created (takes 1-2 minutes)

## Step 2: Create the Bookings Table

1. In your Supabase project, go to **SQL Editor**
2. Click **New query**
3. Paste this SQL and click **Run**:

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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_instrument ON bookings(instrument);
CREATE INDEX IF NOT EXISTS idx_bookings_name ON bookings(name);

-- Enable Row Level Security (RLS) - we'll make it permissive for now
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for public access)
-- In production, you may want to restrict this
CREATE POLICY "Allow all operations" ON bookings
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

4. Verify the table was created:
   - Go to **Table Editor**
   - You should see the `bookings` table

## Step 3: Get Your Supabase Credentials

1. In your Supabase project, go to **Settings** (gear icon)
2. Click **API**
3. You'll need:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

## Step 4: Configure Your HTML Files

You need to add Supabase configuration to each HTML file that uses `storage.js`. 

### Option A: Add to Each HTML File (Recommended for Production)

Add this code **before** the `storage.js` script tag in each HTML file:

```html
<!-- Supabase Configuration -->
<script>
  // Replace these with your actual Supabase credentials
  window.SUPABASE_URL = 'https://your-project-id.supabase.co';
  window.SUPABASE_ANON_KEY = 'your-anon-key-here';
</script>

<!-- Supabase Client Library (UMD build) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>

<!-- Storage abstraction (must come after Supabase config) -->
<script src="storage.js"></script>
```

### Option B: Create a Config File (Easier to Maintain)

1. Create a file `supabase-config.js`:

```javascript
// Supabase Configuration
// Replace these with your actual Supabase credentials
window.SUPABASE_URL = 'https://your-project-id.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key-here';
```

2. Add to each HTML file **before** `storage.js`:

```html
<!-- Supabase Configuration -->
<script src="supabase-config.js"></script>

<!-- Supabase Client Library (UMD build) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>

<!-- Storage abstraction -->
<script src="storage.js"></script>
```

**Important:** Make sure the order is:
1. Supabase config (sets `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY`)
2. Supabase client library
3. `storage.js`

## Step 5: Update HTML Files

You need to update these files:
- `index.html`
- `make-reservation.html`
- `view-reservations.html`
- `check-availability.html`
- `reservation-details.html`
- `instruments.html`

Add the Supabase scripts **before** any existing `storage.js` script tag.

## Step 6: Test the Setup

1. Open your site in a browser
2. Open browser console (F12)
3. Look for: `✅ Supabase client initialized`
4. Make a test reservation
5. Check Supabase Dashboard → Table Editor → `bookings` table
6. You should see your reservation!

## Step 7: Verify Cross-Device Functionality

1. **Device 1** (e.g., your phone):
   - Open your site
   - Make a reservation with your name
   - Check "My Reservations" - should see your booking

2. **Device 2** (e.g., your laptop):
   - Open the **same** site
   - Go to "Check Availability" for the same instrument
   - You should see the booking from Device 1! ✅

## Troubleshooting

### Issue: "Supabase credentials found but Supabase library not loaded"

**Solution:**
- Make sure you include the Supabase CDN script **before** `storage.js`
- Check the script order in your HTML

### Issue: "Failed to fetch reservations from Supabase"

**Possible causes:**
1. Wrong Supabase URL or key
2. Table doesn't exist
3. Row Level Security (RLS) blocking access

**Solution:**
1. Verify credentials in browser console:
   ```javascript
   console.log(window.SUPABASE_URL);
   console.log(window.SUPABASE_ANON_KEY);
   ```
2. Check Supabase Dashboard → Table Editor → verify `bookings` table exists
3. Check Supabase Dashboard → Authentication → Policies → verify RLS policy allows access

### Issue: "Failed to save reservation"

**Solution:**
1. Check browser console for specific error
2. Verify table structure matches expected schema
3. Check RLS policies allow INSERT operations

### Issue: Reservations not appearing across devices

**Check:**
1. Browser console shows `storageType: 'CLOUD (Supabase)'`
2. Supabase Dashboard → Table Editor → see if bookings are being saved
3. Check for JavaScript errors in console

**Fix:**
- Verify Supabase credentials are correct
- Check that Supabase client is initialized (console should show ✅ message)

## Security Notes

⚠️ **Important:** The current setup uses the `anon` key which is public. For production:

1. **Enable Row Level Security (RLS)** with proper policies
2. **Consider using Supabase Auth** for user authentication
3. **Restrict API access** based on user roles
4. **Use environment variables** for sensitive credentials (if using a build process)

For now, the permissive policy allows all operations. This is fine for a lab reservation system, but consider tightening security for production use.

## Migration from localStorage

If you have existing reservations in localStorage:

1. Open browser console on your site
2. Run:
   ```javascript
   const localReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
   console.log(JSON.stringify(localReservations, null, 2));
   ```
3. Copy the output
4. In Supabase Dashboard → SQL Editor, run:
   ```sql
   INSERT INTO reservations (id, instrument, name, date, startTime, endTime, purpose, temperature, site)
   VALUES 
   -- Paste your reservations here, one per line
   -- Example:
   ('1234567890', 'Mastersizer', 'John Doe', '2025-11-25', '09:00', '10:00', 'Testing', NULL, NULL);
   ```

## Cost

- **Supabase Free Tier:** 
  - 500 MB database space
  - 2 GB bandwidth
  - 50,000 monthly active users
  - This should be sufficient for most lab reservation systems
- Upgrade if you exceed these limits

## Support

For issues with:
- **Supabase setup:** Check [Supabase Documentation](https://supabase.com/docs)
- **This application:** Check the code comments or browser console

## Next Steps

1. ✅ Create Supabase project
2. ✅ Create reservations table
3. ✅ Get credentials
4. ✅ Add Supabase config to HTML files
5. ✅ Test locally
6. ✅ Deploy and test across devices

Once complete, your reservation system will work across all devices! 🎉

