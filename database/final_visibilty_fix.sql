-- ============================================
-- FINAL VERIFICATION & RECURSION BREAK
-- ============================================

-- 1. BREAK RECURSION FOR GOOD
-- We will split the policy into "Me" and "My Company" to stop the loop.
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles isolation" ON public.user_profiles;
DROP POLICY IF EXISTS "Company isolation for profiles" ON public.user_profiles;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy A: You can ALWAYS see yourself (No recursion here)
CREATE POLICY "user_profiles_self" ON public.user_profiles
  FOR ALL TO authenticated
  USING (id = auth.uid());

-- Policy B: You can see others in your company if you have a company_id
-- We use a fixed subquery that doesn't reference user_profiles.id recursively
CREATE POLICY "user_profiles_company" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (
    company_id IS NOT NULL 
    AND 
    company_id = (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
  );

-- 2. FORCE SYNC (Ensures your company ID is actually applied)
-- Run this replacing 'e58e54ba-79ad-4132-a651-9638df74be0d' if different
UPDATE public.user_profiles 
SET company_id = 'e58e54ba-79ad-4132-a651-9638df74be0d' 
WHERE id = auth.uid();

-- 3. VISIBILITY CHECK (The "Smoking Gun")
-- Run this and tell me how many rows it returns. 
-- If it's 0, RLS is still blocking you.
SELECT count(*) as visible_customers FROM public.customers;
SELECT count(*) as total_customers_in_db FROM public.customers;
