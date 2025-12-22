
-- Create CUSTOMERS table
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id), -- Optional link to auth user if they have a login
  full_name text not null,
  email text,
  phone text,
  address text,
  branch_id uuid,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.customers enable row level security;

-- Create VEHICLES table
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade not null,
  make text not null,
  model text not null,
  year integer,
  vin text,
  license_plate text,
  color text,
  mileage integer,
  notes text,
  branch_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.vehicles enable row level security;

-- Create simple policies (adjust as needed for roles)
create policy "Enable read access for authenticated users" 
on public.customers for select 
to authenticated 
using (true);

create policy "Enable insert access for authenticated users" 
on public.customers for insert 
to authenticated 
with check (true);

create policy "Enable update access for authenticated users" 
on public.customers for update
to authenticated 
using (true);

create policy "Enable delete access for authenticated users" 
on public.customers for delete
to authenticated 
using (true);

-- Vehicle Policies
create policy "Enable read access for authenticated users" 
on public.vehicles for select 
to authenticated 
using (true);

create policy "Enable insert access for authenticated users" 
on public.vehicles for insert 
to authenticated 
with check (true);

create policy "Enable update access for authenticated users" 
on public.vehicles for update
to authenticated 
using (true);

create policy "Enable delete access for authenticated users" 
on public.vehicles for delete
to authenticated 
using (true);