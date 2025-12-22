-- ============================================
-- DEFINITIVE VEHICLES TABLE SCHEMA REPAIR
-- ============================================
-- This script ensures all missing columns are added and the 
-- branch relationship is correctly registered.

-- 1. Add branch_id if missing (The cause of the previous error)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicles' AND column_name='branch_id') THEN
    ALTER TABLE public.vehicles ADD COLUMN branch_id UUID;
  END IF;
END $$;

-- 2. Add other new wizard columns if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicles' AND column_name='fuel_type') THEN
    ALTER TABLE public.vehicles ADD COLUMN fuel_type VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicles' AND column_name='year_purchase') THEN
    ALTER TABLE public.vehicles ADD COLUMN year_purchase INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicles' AND column_name='delivery_type') THEN
    ALTER TABLE public.vehicles ADD COLUMN delivery_type VARCHAR(100);
  END IF;
END $$;

-- 3. Explicitly Re-add Foreign Key Constraint
-- We do this separately to ensure it works whether the column was just added or existed before
ALTER TABLE public.vehicles 
  DROP CONSTRAINT IF EXISTS vehicles_branch_id_fkey;

ALTER TABLE public.vehicles
  ADD CONSTRAINT vehicles_branch_id_fkey 
  FOREIGN KEY (branch_id) 
  REFERENCES public.branches(id) 
  ON DELETE SET NULL;

-- 4. Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';

-- 5. Final Permission Check
GRANT SELECT ON public.branches TO authenticated, anon;
GRANT SELECT ON public.vehicles TO authenticated, anon;
