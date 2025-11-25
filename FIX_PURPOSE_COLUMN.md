# Fix: Purpose Column Missing Error

## Error
```
Error: Failed to save reservation could not find the purpose column of bookings in the schema cache (code: PGRST204)
```

## Problem
The `bookings` table in Supabase is missing the `purpose` column (and possibly other optional columns like `temperature` and `site`).

## Solution

### Step 1: Add Missing Columns

Go to **Supabase Dashboard → SQL Editor** and run this SQL:

```sql
-- Add missing columns to bookings table

-- Add purpose column (optional field for reservation purpose/notes)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS purpose TEXT;

-- Add temperature column (for water baths)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS temperature TEXT;

-- Add site column (if used, optional)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS site TEXT;
```

### Step 2: Verify Columns Were Added

Run this to check:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;
```

You should see:
- `id` (TEXT, PRIMARY KEY)
- `instrument` (TEXT, NOT NULL)
- `name` (TEXT, NOT NULL)
- `date` (TEXT, NOT NULL)
- `startTime` (TEXT, NOT NULL)
- `endTime` (TEXT, NOT NULL)
- `purpose` (TEXT, nullable) ← **This should now exist**
- `temperature` (TEXT, nullable) ← **This should now exist**
- `site` (TEXT, nullable) ← **This should now exist**
- `created_at` (TIMESTAMP, nullable)

### Step 3: Test Again

After adding the columns:
1. Try making a reservation again
2. The error should be gone
3. Optional fields (`purpose`, `temperature`) will now be saved if provided

## What I've Fixed

1. **Updated `storage.js`** - Now only includes optional fields if they have values
2. **Better error handling** - The code will handle missing columns more gracefully
3. **SQL script provided** - `ADD_MISSING_COLUMNS.sql` for easy copy-paste

## Complete Table Schema

If you need to recreate the entire table, here's the complete schema:

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

## Quick Fix

**Just run this in SQL Editor:**

```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS temperature TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS site TEXT;
```

That's it! The error should be resolved.

