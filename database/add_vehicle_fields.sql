-- ============================================
-- ADD MISSING FIELDS TO VEHICLES TABLE
-- ============================================
-- This migration adds the new fields needed for the vehicle wizard.

-- 1. Add columns if they don't exist
ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS year_purchase INTEGER,
  ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(100);

-- 2. Add comments for documentation
COMMENT ON COLUMN public.vehicles.fuel_type IS 'Type of fuel used by the vehicle';
COMMENT ON COLUMN public.vehicles.year_purchase IS 'The year the vehicle was purchased';
COMMENT ON COLUMN public.vehicles.delivery_type IS 'How the vehicle was delivered (e.g., Walk-in, Pickup)';

-- 3. Refresh PostgREST cache (optional but helpful if your provider supports it)
NOTIFY pgrst, 'reload schema';
