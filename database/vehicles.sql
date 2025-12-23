-- ============================================
-- VEHICLES TABLE REFINEMENT
-- ============================================

-- 1. RENAME COLUMNS (If they exist with old names)
DO $$ 
BEGIN
  -- make -> brand
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'make') THEN
    ALTER TABLE public.vehicles RENAME COLUMN make TO brand;
  END IF;

  -- year -> year_manufacture
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'year') THEN
    ALTER TABLE public.vehicles RENAME COLUMN year TO year_manufacture;
  END IF;

  -- mileage -> odometer (Previous request)
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'mileage') THEN
    ALTER TABLE public.vehicles RENAME COLUMN mileage TO odometer;
  END IF;
END $$;

-- 2. DROP REDUNDANT COLUMNS
ALTER TABLE public.vehicles DROP COLUMN IF EXISTS branch_name;

-- 3. ENSURE AUDITED COLUMNS EXIST
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS brand TEXT, -- Backup if make didn't exist
ADD COLUMN IF NOT EXISTS year_manufacture INTEGER, -- Backup if year didn't exist
ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS year_purchase INTEGER,
ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS last_visit TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS odometer INTEGER;

-- 4. INDICES
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON public.vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_branch_id ON public.vehicles(branch_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_company_id ON public.vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON public.vehicles(brand);

-- 5. RLS POLICIES
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Dynamic isolation: Users only see vehicles within their company
DROP POLICY IF EXISTS "Vehicles isolation policy" ON public.vehicles;
CREATE POLICY "Vehicles isolation policy" ON public.vehicles
  FOR ALL TO authenticated
  USING (
    company_id = (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
  );
