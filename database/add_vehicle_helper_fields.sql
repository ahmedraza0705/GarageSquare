-- ============================================
-- ADD HELPER COLUMNS FOR VEHICLE DETAILS
-- ============================================
-- This script adds branch_name and last_visit columns to allow 
-- easy text-based editing and display as requested.

-- 1. Add columns if they don't exist
ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS branch_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS last_visit VARCHAR(50);

-- 2. Add comments
COMMENT ON COLUMN public.vehicles.branch_name IS 'Text-based branch name for display (fallback if branch_id is null)';
COMMENT ON COLUMN public.vehicles.last_visit IS 'Textual representation of the last visit date (e.g. DD-MM-YYYY)';

-- 3. Force schema cache reload
NOTIFY pgrst, 'reload schema';
