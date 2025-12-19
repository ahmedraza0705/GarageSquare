-- =========================================================================
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Open your project
-- 3. Click on "SQL Editor" in the left sidebar
-- 4. Click "New Query"
-- 5. Copy and Paste ALL the code below into the query editor
-- 6. Click "Run" or "Run selected"
-- =========================================================================

-- 1. Create the branches table
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    manager_id TEXT, -- Can be UUID if linking to auth.users later 
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) is important for security
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- 3. Create Access Policies
-- Allow anyone logged in to SEE branches
CREATE POLICY "Allow read access to all authenticated users"
ON public.branches
FOR SELECT
TO authenticated
USING (true);

-- Allow anyone logged in to CREATE branches
CREATE POLICY "Allow insert access to authenticated users"
ON public.branches
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow anyone logged in to UPDATE branches
CREATE POLICY "Allow update access to authenticated users"
ON public.branches
FOR UPDATE
TO authenticated
USING (true);

-- Allow anyone logged in to DELETE branches
CREATE POLICY "Allow delete access to authenticated users"
ON public.branches
FOR DELETE
TO authenticated
USING (true);

-- 4. Enable Realtime (Optional, good for live updates)
alter publication supabase_realtime add table branches;
