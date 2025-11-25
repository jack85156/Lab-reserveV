-- Add missing columns to bookings table
-- Run this in Supabase Dashboard → SQL Editor

-- Add purpose column (optional field for reservation purpose/notes)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS purpose TEXT;

-- Add temperature column (for water baths)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS temperature TEXT;

-- Add site column (if used, optional)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS site TEXT;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

