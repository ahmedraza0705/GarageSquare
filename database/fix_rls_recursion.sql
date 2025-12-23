-- ============================================
-- FIX: RECURSIVE RLS POLICIES (AUTHENTICATED SESSIONS)
-- ============================================

/* 
  EXPLANATION:
  "Infinite recursion" occurs when a policy on `user_profiles` tries to 
  SELECT from `user_profiles` to check the `company_id`.
  
  FIX: 
  We will use `auth.jwt() -> 'app_metadata' -> 'company_id'` OR a more direct check.
  Alternatively, for `user_profiles`, we check the ID directly.
*/

-- 1. FIX USER_PROFILES
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles isolation" ON public.user_profiles;
DROP POLICY IF EXISTS "Company isolation for profiles" ON public.user_profiles;

CREATE POLICY "Profiles isolation" ON public.user_profiles
  FOR ALL TO authenticated
  USING (
    -- BYPASS RECURSION: Allow if the profile is the user's own
    id = auth.uid() 
    OR 
    -- Company-wide check (using subquery safely)
    company_id IN (
      SELECT company_id FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND id != user_profiles.id -- This prevents direct self-reference recursion
    )
  );

-- 2. FIX CUSTOMERS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Customers isolation policy" ON public.customers;
DROP POLICY IF EXISTS "Customers isolation" ON public.customers;
DROP POLICY IF EXISTS "Customers company isolation" ON public.customers;

CREATE POLICY "Customers isolation" ON public.customers
  FOR ALL TO authenticated
  USING (
    company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid
  )
  WITH CHECK (
    company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid
  );

-- 3. FIX STAFF
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff isolation" ON public.staff;
DROP POLICY IF EXISTS "Staff company isolation" ON public.staff;

CREATE POLICY "Staff isolation" ON public.staff
  FOR ALL TO authenticated
  USING (
    id IN (
      SELECT up.id FROM public.user_profiles up 
      WHERE up.company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid
    )
  );

-- 4. FIX VEHICLES
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vehicles isolation policy" ON public.vehicles;

CREATE POLICY "Vehicles isolation policy" ON public.vehicles
  FOR ALL TO authenticated
  USING (
    company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid
  )
  WITH CHECK (
    company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid
  );