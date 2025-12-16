# Quick Setup Guide - Login & Signup Tables

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### Step 2: Run the Authentication Tables SQL
1. Open the file `database/auth_tables.sql`
2. Copy **ALL** the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Step 3: Verify Setup
Run these verification queries in SQL Editor:

```sql
-- Check if roles were created
SELECT * FROM roles ORDER BY name;
```

You should see 6 roles:
- company_admin
- manager
- supervisor
- technician_group_manager
- technician
- customer

```sql
-- Check if user_profiles table exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles';
```

### Step 4: Test Signup
1. Go to your app
2. Try to sign up with a new email
3. Check Supabase dashboard → **Authentication → Users**
4. Check **Table Editor → user_profiles** to see if profile was created automatically

---

## 📁 Files You Need

1. **`database/auth_tables.sql`** - Main SQL file with all authentication tables
   - Roles table
   - User profiles table
   - Auto-create profile trigger
   - RLS policies
   - Helper functions

2. **`database/schema.sql`** - Complete database schema (optional, for full app)

---

## 🔑 What Gets Created

### Tables:
1. **`roles`** - Stores all user roles
2. **`user_profiles`** - Extends Supabase auth.users with profile data

### Functions:
1. **`handle_new_user()`** - Automatically creates user_profile when user signs up
2. **`update_updated_at_column()`** - Auto-updates timestamps
3. **`get_user_role()`** - Helper to get user's role

### Triggers:
1. **`on_auth_user_created`** - Fires when new user signs up
2. **`update_roles_updated_at`** - Updates roles.updated_at
3. **`update_user_profiles_updated_at`** - Updates user_profiles.updated_at

### Policies (RLS):
- Users can view/update their own profile
- Company admins can view/update all profiles
- Anyone authenticated can view roles

---

## ✅ Expected Behavior

### On Signup:
1. User signs up → Supabase creates entry in `auth.users`
2. Trigger fires → Automatically creates entry in `user_profiles`
3. First user → Gets `company_admin` role automatically
4. Other users → Get `NULL` role (pending assignment by Company Admin)

### On Login:
1. User logs in → Supabase authenticates
2. App fetches user profile from `user_profiles` table
3. Profile includes role information

---

## 🐛 Troubleshooting

### Issue: "relation auth.users does not exist"
**Solution**: This is normal - `auth.users` is managed by Supabase automatically. The reference will work.

### Issue: "Trigger not firing"
**Solution**: 
- Make sure you ran the entire SQL file
- Check if trigger exists: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';`

### Issue: "First user not getting company_admin role"
**Solution**:
- Check if roles were inserted: `SELECT * FROM roles;`
- Check if trigger function exists: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user';`

### Issue: "RLS blocking queries"
**Solution**:
- Make sure user is authenticated
- Check policies: `SELECT * FROM pg_policies WHERE tablename = 'user_profiles';`

---

## 📝 Notes

- **First User**: Automatically becomes Company Admin
- **Other Users**: Need role assignment by Company Admin
- **Profile Creation**: Happens automatically via trigger
- **Security**: RLS policies protect user data

---

## 🔄 Next Steps

After running `auth_tables.sql`:
1. ✅ Test signup in your app
2. ✅ Test login in your app
3. ✅ Verify user appears in Supabase dashboard
4. ✅ Check if profile was created automatically
5. ✅ Run full schema if needed: `database/schema.sql`

