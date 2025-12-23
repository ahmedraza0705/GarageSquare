-- Create inventory_categories table
create table if not exists public.inventory_categories (
  id uuid default gen_random_uuid() primary key,
  company_id uuid not null,
  name text not null,
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create inventory_items table
create table if not exists public.inventory_items (
  id uuid default gen_random_uuid() primary key,
  company_id uuid not null,
  branch_id uuid,
  category_id uuid references public.inventory_categories(id),
  name text not null,
  sku text,
  quantity integer default 0,
  unit text not null default 'piece',
  unit_price decimal(10,2) default 0.00,
  low_stock_threshold integer default 10,
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.inventory_categories enable row level security;
alter table public.inventory_items enable row level security;

-- Policies for inventory_categories
create policy "Users can view categories of their company"
on public.inventory_categories for select
using (
  company_id in (
    select company_id from public.user_profiles where id = auth.uid()
  )
);

create policy "Users can insert categories for their company"
on public.inventory_categories for insert
with check (
  company_id in (
    select company_id from public.user_profiles where id = auth.uid()
  )
);

create policy "Users can update categories of their company"
on public.inventory_categories for update
using (
  company_id in (
    select company_id from public.user_profiles where id = auth.uid()
  )
);

create policy "Users can delete categories of their company"
on public.inventory_categories for delete
using (
  company_id in (
    select company_id from public.user_profiles where id = auth.uid()
  )
);

-- Policies for inventory_items
create policy "Users can view items of their company"
on public.inventory_items for select
using (
  company_id in (
    select company_id from public.user_profiles where id = auth.uid()
  )
);

create policy "Users can insert items for their company"
on public.inventory_items for insert
with check (
  company_id in (
    select company_id from public.user_profiles where id = auth.uid()
  )
);

create policy "Users can update items of their company"
on public.inventory_items for update
using (
  company_id in (
    select company_id from public.user_profiles where id = auth.uid()
  )
);

create policy "Users can delete items of their company"
on public.inventory_items for delete
using (
  company_id in (
    select company_id from public.user_profiles where id = auth.uid()
  )
);
