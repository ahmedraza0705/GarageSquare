-- ============================================
-- BULLETPROOF AUTO-LINKING TRIGGERS
-- ============================================

-- Function to automatically set company_id on INSERT
CREATE OR REPLACE FUNCTION public.set_company_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- If company_id is NULL, look it up from the creator's profile
  IF NEW.company_id IS NULL THEN
    NEW.company_id := (SELECT company_id FROM public.user_profiles WHERE id = auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Trigger for Vehicles
DROP TRIGGER IF EXISTS tr_set_vehicle_company ON public.vehicles;
CREATE TRIGGER tr_set_vehicle_company
BEFORE INSERT ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION public.set_company_id_on_insert();

-- 2. Trigger for Customers
-- (Check if customers table has company_id, add it if missing)
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

DROP TRIGGER IF EXISTS tr_set_customer_company ON public.customers;
CREATE TRIGGER tr_set_customer_company
BEFORE INSERT ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.set_company_id_on_insert();

-- 3. Trigger for Branches
DROP TRIGGER IF EXISTS tr_set_branch_company ON public.branches;
CREATE TRIGGER tr_set_branch_company
BEFORE INSERT ON public.branches
FOR EACH ROW EXECUTE FUNCTION public.set_company_id_on_insert();
