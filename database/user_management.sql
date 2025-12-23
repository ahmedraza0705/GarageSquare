-- ============================================
-- CONSOLIDATED USER MANAGEMENT (LINKUP SCHEMA)
-- ============================================

-- 1. USER PROFILES (Master Table - Picard 1 Match)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  
  -- Identity
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Address / Settings
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  username VARCHAR(255) UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  deactivated_at TIMESTAMP WITH TIME ZONE,
  deactivated_by UUID REFERENCES auth.users(id),
  country VARCHAR(255),
  registry_number VARCHAR(255),
  zip_code VARCHAR(20)
);

-- 2. STAFF (Extension - Text Proposal Only)
-- email, name, username, phno.
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  username VARCHAR(255),
  phone VARCHAR(20)
);

-- 3. CUSTOMER (Extension - Text Proposal Only)
-- email, address, name, username, phno., alt phno.
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  email TEXT,
  address TEXT,
  full_name TEXT,     -- "name" in proposal
  username VARCHAR(255),
  phone VARCHAR(20),  -- "phno." in proposal
  alt_phone VARCHAR(20) -- "alt phno." in proposal
);

-- Indices for linking
CREATE INDEX IF NOT EXISTS idx_staff_id ON public.staff(id);
CREATE INDEX IF NOT EXISTS idx_customers_id ON public.customers(id);

-- RLS Enforcement
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Dynamic isolation policies
CREATE POLICY "Profiles isolation" ON public.user_profiles
  FOR ALL TO authenticated
  USING (company_id = (SELECT company_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Staff isolation" ON public.staff
  FOR ALL TO authenticated
  USING (id IN (SELECT id FROM public.user_profiles WHERE company_id = (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())));

CREATE POLICY "Customers isolation" ON public.customers
  FOR ALL TO authenticated
  USING (id IN (SELECT id FROM public.user_profiles WHERE company_id = (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())));
