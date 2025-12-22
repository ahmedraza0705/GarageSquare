-- ============================================
-- ADD MISSING VEHICLE DETAIL FIELDS
-- ============================================
-- This adds the branch_name and last_visit columns that are used
-- in the Vehicle Details edit modal.

-- Add both columns if they don't exist
ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS branch_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS last_visit VARCHAR(50);

-- Refresh the schema cache (CRITICAL!)
NOTIFY pgrst, 'reload schema';

-- Grant permissions
GRANT SELECT, UPDATE ON public.vehicles TO authenticated, anon;
