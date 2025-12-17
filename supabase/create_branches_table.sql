-- Create branches table
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

-- Enable Row Level Security
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Create policies (Adjust as needed for your security model)
-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to all authenticated users"
ON public.branches
FOR SELECT
TO authenticated
USING (true);

-- Allow write access to authenticated users (e.g. company admins)
CREATE POLICY "Allow insert access to authenticated users"
ON public.branches
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow update access to authenticated users"
ON public.branches
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow delete access to authenticated users"
ON public.branches
FOR DELETE
TO authenticated
USING (true);
