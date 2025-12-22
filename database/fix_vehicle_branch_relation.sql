-- ============================================
-- FIX VEHICLE-BRANCH RELATIONSHIP
-- ============================================
-- This script ensures the foreign key relationship is explicitly recognized
-- by PostgREST/Supabase to fix "Could not find a relationship" errors.

-- 1. Safely drop existing constraint if it exists (prevents duplicates)
ALTER TABLE public.vehicles 
  DROP CONSTRAINT IF EXISTS vehicles_branch_id_fkey;

-- 2. Re-add the foreign key constraint with an explicit name
-- This ensures the relationship is registered in the meta-data
ALTER TABLE public.vehicles
  ADD CONSTRAINT vehicles_branch_id_fkey 
  FOREIGN KEY (branch_id) 
  REFERENCES public.branches(id) 
  ON DELETE SET NULL;

-- 3. Force a schema cache reload
-- This is critical for PostgREST to pick up relationship changes
NOTIFY pgrst, 'reload schema';

-- 4. Verify branches table visibility to anonymous/authenticated roles
-- (Optional but helpful if RLS is partially setup)
GRANT SELECT ON public.branches TO authenticated, anon;
