-- ============================================
-- DIAGNOSTIC & REPAIR: DATA LINKAGE
-- ============================================

/*
  WHY YOU STILL SEE ERRORS:
  RLS says: "Only show data where record.company_id == user.company_id".
  If your User Profile has company_id = NULL, it can't see anything.
  If your Vehicles/Customers have company_id = NULL, they remain hidden.
*/

-- 1. [DIAGNOSTIC] Check your own profile linkage
-- Look for 'company_id' in the output. If it's NULL, that's the blocker.
SELECT id, email, full_name, company_id, role_id 
FROM public.user_profiles 
WHERE id = auth.uid();

-- 2. [DIAGNOSTIC] Check if data is orphans (Missing Company ID)
SELECT count(*) as orphan_vehicles FROM public.vehicles WHERE company_id IS NULL;
SELECT count(*) as orphan_customers FROM public.customers WHERE company_id IS NULL;

-- 3. [REPAIR] The "Quick Fix" for Developers
-- This will link ALL existing orphan data to YOUR company so you can see it.
DO $$
DECLARE
    my_company_id UUID;
BEGIN
    -- Get your company ID
    SELECT company_id INTO my_company_id FROM public.user_profiles WHERE id = auth.uid();
    
    IF my_company_id IS NOT NULL THEN
        -- Link orphaned vehicles
        UPDATE public.vehicles SET company_id = my_company_id WHERE company_id IS NULL;
        -- Link orphaned customers
        UPDATE public.customers SET company_id = my_company_id WHERE company_id IS NULL;
        -- Link orphaned branches
        UPDATE public.branches SET company_id = my_company_id WHERE company_id IS NULL;
        
        RAISE NOTICE 'Success: Linked all data to company %', my_company_id;
    ELSE
        RAISE WARNING 'Warning: Your user profile does not have a company_id yet!';
    END IF;
END $$;
