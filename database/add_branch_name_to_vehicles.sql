-- ============================================
-- ADD BRANCH_NAME COLUMN TO VEHICLES TABLE
-- ============================================
-- This ensures the branch name field exists so it can be displayed
-- on both the Vehicle Details and Vehicles Management screens.

-- Add the column if it doesn't exist
ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS branch_name VARCHAR(255);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Grant permissions
GRANT SELECT, UPDATE ON public.vehicles TO authenticated, anon;
