-- ============================================
-- CUSTOMERS TABLE (Linkup Proposal - 1:1 with Profile)
-- ============================================

CREATE TABLE IF NOT EXISTS public.customers (
  -- id === id from user_profiles for perfect linkup
  id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Customer specific data (Text Proposal)
  email TEXT,
  address TEXT,
  full_name TEXT,     -- name
  username VARCHAR(255),
  phone VARCHAR(20),  -- phno.
  alt_phone VARCHAR(20), -- alt phno.
  
  -- Audit / Meta (Minimal)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Dynamic isolation: Users only see records where they have access to the profile
-- (Assuming company_id isolation is handled at the profile/auth level)
CREATE POLICY "Customers company isolation" ON public.customers
  FOR ALL TO authenticated
  USING (
    id IN (
      SELECT id FROM public.user_profiles 
      WHERE company_id = (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
    )
  );
