-- =========================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor
-- =========================================================

-- Step 1: Enable Realtime for ALL required tables
-- (This is what makes the live dashboard updates work)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_activity;

-- Step 2: Add missing columns if they don't exist yet
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS employee_number TEXT;

-- Step 3: Reload schema cache (fixes "column not found" errors)
NOTIFY pgrst, 'reload schema';

-- Step 4: Verify Realtime is enabled (should show your tables)
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
