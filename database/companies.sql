-- ============================================
-- COMPANIES TABLE (ROBUST SETUP)
-- ============================================

-- 1. Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  CONSTRAINT companies_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 2. Add/Correct columns (Non-destructive safeguards)
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS registry_number TEXT,
ADD COLUMN IF NOT EXISTS company_number TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,    
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS business_email TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Add check constraint (Safe block)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name = 'companies' AND constraint_name = 'companies_subscription_status_check') THEN
        ALTER TABLE public.companies ADD CONSTRAINT companies_subscription_status_check 
        CHECK (subscription_status IN ('active', 'inactive', 'suspended'));
    END IF;
END $$;

-- 4. Indices
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_registry_number ON public.companies(registry_number);
