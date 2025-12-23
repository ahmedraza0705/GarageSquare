-- ============================================
-- THE ULTIMATE RECURSION KILLER
-- ============================================

-- 1. Create a "Security Definer" function.
-- This function runs as the 'admin', so it can look up your company 
-- without triggering a security loop. This is the ONLY 100% fix for recursion.
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS uuid AS $$
  SELECT company_id FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 2. RESET POLICIES
DROP POLICY IF EXISTS "user_profiles_self" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_company" ON public.user_profiles;
DROP POLICY IF EXISTS "Profiles isolation" ON public.user_profiles;
DROP POLICY IF EXISTS "Customers isolation" ON public.customers;
DROP POLICY IF EXISTS "Vehicles isolation policy" ON public.vehicles;

-- 3. APPLY CLEAN, NON-RECURSIVE POLICIES

-- USER PROFILES
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_profiles_non_recursive" ON public.user_profiles
  FOR ALL TO authenticated
  USING (
    id = auth.uid() -- You can see yourself
    OR 
    company_id = get_my_company_id() -- You can see others in your company
  );

-- CUSTOMERS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_non_recursive" ON public.customers
  FOR ALL TO authenticated
  USING (
    company_id = get_my_company_id()
  )
  WITH CHECK (
    company_id = get_my_company_id()
  );

-- VEHICLES
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles_non_recursive" ON public.vehicles
  FOR ALL TO authenticated
  USING (
    company_id = get_my_company_id()
  )
  WITH CHECK (
    company_id = get_my_company_id()
  );

-- 4. VERIFY DATA (Run these last)
-- These should work perfectly now without any errors.
SELECT count(*) as visible_customers FROM public.customers;
SELECT count(*) as visible_vehicles FROM public.vehicles;
