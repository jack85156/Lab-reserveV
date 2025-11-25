# New Supabase Credentials Configured

## ✅ Updated Credentials

Your Supabase configuration has been updated with new credentials:

- **URL:** `https://ermkgvzfehlaaoktxndv.supabase.co`
- **API Key:** Updated in `supabase-config.js`

## Next Steps

### 1. Create the Database Table

**IMPORTANT:** You need to create the `bookings` table in your new Supabase project.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (the one with URL `ermkgvzfehlaaoktxndv`)
3. Go to **SQL Editor**
4. Click **New query**
5. Run this SQL:

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

6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### 2. Verify Table Created

1. Go to **Table Editor** in Supabase Dashboard
2. You should see `bookings` table listed
3. Click on it to verify the columns

### 3. Test the Connection

1. **Open your website** in a browser
2. **Open browser console** (F12 → Console tab)
3. **Look for:** `✅ Supabase client initialized successfully`
4. **Try making a test reservation**
5. **Check Supabase Dashboard** → **Table Editor** → `bookings` table
6. **You should see your reservation!** ✅

### 4. Use Diagnostic Tool

If you still have connection issues:

1. Open `diagnose-connection.html` in your browser
2. It will automatically test the connection
3. Follow the fix instructions for any errors

## Verification

To verify your credentials are correct:

1. Go to Supabase Dashboard → **Settings** → **API**
2. Compare:
   - **Project URL** should match: `https://ermkgvzfehlaaoktxndv.supabase.co`
   - **anon public** key should match your API key

## Important Notes

- ✅ Credentials updated in `supabase-config.js`
- ⚠️ **You MUST create the `bookings` table** (see Step 1 above)
- ⚠️ **Old project data won't transfer** - this is a new project
- ✅ All HTML files will automatically use the new credentials

## Troubleshooting

If connection still fails after creating the table:

1. Check browser console for specific errors
2. Verify table exists in Supabase Dashboard
3. Check RLS policies are set (the SQL above includes this)
4. Make sure project is active (not paused)
5. Use `diagnose-connection.html` for detailed diagnostics

## Summary

1. ✅ Credentials updated
2. ⚠️ **Create `bookings` table** (most important step!)
3. ✅ Test connection
4. ✅ Start using the system

Once you create the table, everything should work! 🎉

