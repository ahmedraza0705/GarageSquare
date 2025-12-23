-- ============================================
-- STAFF TABLE (1:1 Linkup with user_profiles)
-- ============================================

CREATE TABLE IF NOT EXISTS public.staff (
  -- id === id from user_profiles
  id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Staff specific data
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  username VARCHAR(255),
  phone VARCHAR(20),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy: Users only see staff in their own company
CREATE POLICY "Staff company isolation" ON public.staff
  FOR ALL TO authenticated
  USING (
    id IN (
      SELECT id FROM public.user_profiles 
      WHERE company_id = (SELECT company_id FROM public.user_profiles WHERE id = auth.uid())
    )
  );
