-- ============================================
-- BRANCHES TABLE ENHANCEMENTS
-- ============================================

-- Add missing columns to support full branch management
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Create an index for faster lookups by company
CREATE INDEX IF NOT EXISTS idx_branches_company_id ON branches(company_id);

-- Create an index for manager lookups
CREATE INDEX IF NOT EXISTS idx_branches_manager_id ON branches(manager_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- 1. Only company admins can manage branches
DROP POLICY IF EXISTS "Users can view company branches" ON public.branches;
DROP POLICY IF EXISTS "Staff can manage branches" ON public.branches;

CREATE POLICY "Admins can manage company branches" ON public.branches
  FOR ALL TO authenticated
  USING (
    company_id = (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
    AND (
      SELECT r.name FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid()
    ) = 'company_admin'
  );
