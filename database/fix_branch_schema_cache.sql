-- ============================================
-- FIX BRANCH SCHEMA CACHE (is_active)
-- ============================================

-- 1. Ensure the column exists
ALTER TABLE public.branches 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Ensure other standard columns exist
ALTER TABLE public.branches 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. FORCE PostgREST CACHE REFRESH
-- This is a trick to force Supabase to reload the schema cache
-- by performing a non-destructive change on the table comment.
COMMENT ON TABLE public.branches IS 'Main table for garage branches. Updated with is_active.';

-- 4. Check if it worked
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'branches' 
AND column_name = 'is_active';
