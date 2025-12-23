-- ==========================================
-- DATABASE SETUP & FIX SCRIPT
-- ==========================================

-- 1. Ensure Roles Exist
insert into public.roles (name, display_name, description)
values 
  ('company_admin', 'Company Admin', 'Full access to company data'),
  ('technician', 'Technician', 'Limited access to assigned jobs')
on conflict (name) do nothing;

-- 2. Ensure a Company Exists
insert into public.companies (name, is_active)
values ('Garage Square', true)
on conflict do nothing;

-- 3. Create Trigger to Auto-Create Profile on Signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_company_id uuid;
  default_role_id uuid;
begin
  -- Get the first company (for single-tenant/demo setup)
  select id into default_company_id from public.companies limit 1;
  
  -- Get default role
  select id into default_role_id from public.roles where name = 'company_admin' limit 1;

  insert into public.user_profiles (id, email, role_id, company_id, full_name, is_active)
  values (
    new.id,
    new.email,
    default_role_id,
    default_company_id,
    new.raw_user_meta_data->>'full_name',
    true
  );
  return new;
end;
$$ language plpgsql security definer;

-- 4. Attach Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. BACKFILL: Fix existing users who are missing profiles
-- This part checks 'auth.users' and creates a profile if one is missing.
insert into public.user_profiles (id, email, role_id, company_id, full_name, is_active)
select 
  au.id, 
  au.email, 
  (select id from public.roles where name = 'company_admin' limit 1),
  (select id from public.companies limit 1),
  'Admin User',
  true
from auth.users au
where not exists (select 1 from public.user_profiles up where up.id = au.id);
