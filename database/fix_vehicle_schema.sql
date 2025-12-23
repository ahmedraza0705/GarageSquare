-- ============================================
-- BULLETPROOF VEHICLE SCHEMA & RLS FIX
-- ============================================

-- 1. ENSURE PREREQUISITES (Tables we depend on)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

-- 2. ENSURE VEHICLES TABLE EXISTS
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL, -- Core link
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ADD COMPANY_ID COLUMN (The core fix)
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- 4. RENAME OLD COLUMNS (If any)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'make') THEN
    ALTER TABLE public.vehicles RENAME COLUMN make TO brand;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'year') THEN
    ALTER TABLE public.vehicles RENAME COLUMN year TO year_manufacture;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'mileage') THEN
    ALTER TABLE public.vehicles RENAME COLUMN mileage TO odometer;
  END IF;
END $$;

-- 5. ENSURE OTHER MODERN COLUMNS
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS year_manufacture INTEGER,
ADD COLUMN IF NOT EXISTS license_plate TEXT,
ADD COLUMN IF NOT EXISTS odometer INTEGER,
ADD COLUMN IF NOT EXISTS branch_id UUID;

-- 6. APPLY RLS (Only now that company_id is guaranteed)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vehicles isolation policy" ON public.vehicles;
CREATE POLICY "Vehicles isolation policy" ON public.vehicles
  FOR ALL TO authenticated
  USING (
    company_id = (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
  );

-- 7. INDICES
CREATE INDEX IF NOT EXISTS idx_vehicles_company_id ON public.vehicles(company_id);
