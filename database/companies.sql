-- ============================================
-- COMPANIES TABLE (EXACT MATCH TO MOCKUP)
-- ============================================

CREATE TABLE IF NOT EXISTS public.companies (
  -- Core Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  
  -- Location & Contacts
  address TEXT,
  country TEXT,
  state TEXT,
  city TEXT,
  zip_code TEXT,
  website TEXT,
  business_email TEXT,
  logo_url TEXT,
  
  -- Business Details
  description TEXT,
  registry_number TEXT,
  company_number TEXT,
  
  -- Status & Subscription
  subscription_status TEXT DEFAULT 'active',
  onboarding_completed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_registry_number ON public.companies(registry_number);

-- RLS Enforcement
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Dynamic isolation: Users only see the company they belong to
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
CREATE POLICY "Users can view their own company" ON public.companies
  FOR SELECT TO authenticated
  USING (
    id = (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
  );
