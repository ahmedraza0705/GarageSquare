# 🚀 Complete Supabase Setup Guide

## 📋 Table of Contents
1. [Create Supabase Account](#step-1-create-supabase-account)
2. [Create New Project](#step-2-create-new-project)
3. [Get Your Credentials](#step-3-get-your-credentials)
4. [Create .env File](#step-4-create-env-file)
5. [Set Up Database Schema](#step-5-set-up-database-schema)
6. [Configure Authentication](#step-6-configure-authentication)
7. [Test the Connection](#step-7-test-the-connection)
8. [Troubleshooting](#troubleshooting)

---

## Step 1: Create Supabase Account

### 1.1 Go to Supabase Website
- Visit: **https://supabase.com**
- Click **"Start your project"** or **"Sign Up"**

### 1.2 Sign Up Options
You can sign up with:
- **GitHub** (Recommended)
- **Email**
- **Google**

### 1.3 Verify Your Account
- Check your email for verification link
- Click the verification link
- Complete your profile setup

---

## Step 2: Create New Project

### 2.1 Access Dashboard
- After login, you'll see your Supabase dashboard
- Click **"New Project"** button (usually top right)

### 2.2 Fill Project Details

**Project Information:**
- **Name**: `Garage Square` (or any name you prefer)
- **Database Password**: 
  - Create a strong password (save it securely!)
  - You'll need this if you want to access the database directly
  - Minimum 12 characters recommended
- **Region**: 
  - Select the region closest to you
  - Examples: `Southeast Asia (Singapore)`, `US East (North Virginia)`, etc.

### 2.3 Pricing Plan
- **Free Tier**: Perfect for development and testing
  - 500 MB database
  - 2 GB bandwidth
  - Unlimited API requests
- Click **"Create new project"**

### 2.4 Wait for Project Creation
- ⏱️ This takes **2-3 minutes**
- You'll see a progress screen
- Don't close the browser tab!

---

## Step 3: Get Your Credentials

### 3.1 Navigate to Project Settings
Once your project is ready:
1. Click the **⚙️ Gear icon** in the left sidebar
2. Click **"API"** (under Project Settings)

### 3.2 Copy Your Credentials

You'll see two important values:

#### **Project URL**
- Looks like: `https://abcdefghijklmnop.supabase.co`
- Copy this entire URL

#### **Anon/Public Key**
- Long JWT token starting with `eyJ...`
- This is the **anon** or **public** key
- Copy this entire key

⚠️ **IMPORTANT**: 
- ✅ Use **anon/public** key (safe for client-side)
- ❌ NEVER use **service_role** key in your app (server-side only)

### 3.3 Save Credentials Securely
- Save them in a text file temporarily
- You'll need them in the next step

---

## Step 4: Create .env File

### 4.1 Navigate to Your Project Root
- Open your project folder: `C:\Project by Solution Square\Garage Square`
- Make sure you're in the root directory (where `package.json` is)

### 4.2 Create .env File

**Option A: Using VS Code**
1. Right-click in the file explorer
2. Select "New File"
3. Name it exactly: `.env` (with the dot at the beginning)

**Option B: Using File Explorer**
1. Create a new text file
2. Rename it to `.env` (make sure it's not `.env.txt`)

**Option C: Using Terminal**
```bash
# In your project root directory
touch .env
# or
echo. > .env
```

### 4.3 Add Your Credentials

Open `.env` file and add:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace with your actual values:**

```env
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4OCwiZXhwIjoxOTU0NTQzMjg4fQ.example
```

### 4.4 Verify .env File
- Make sure the file is named exactly `.env` (not `.env.txt` or `env`)
- Make sure variables start with `EXPO_PUBLIC_`
- No spaces around the `=` sign
- No quotes needed around values

### 4.5 Add to .gitignore (Important!)

Check if `.gitignore` exists in your project root. If not, create it.

Add these lines to `.gitignore`:
```
.env
.env.local
.env.*.local
```

This prevents accidentally committing your credentials to Git!

---

## Step 5: Set Up Database Schema

### 5.1 Open SQL Editor
1. In Supabase dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New Query"** button

### 5.2 Run Authentication Tables SQL

1. Open the file: `database/auth_tables.sql` in your project
2. **Copy ALL the SQL code** from that file
3. **Paste** it into Supabase SQL Editor
4. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)

### 5.3 Verify Tables Were Created

Run this query to check:

```sql
-- Check if roles table exists and has data
SELECT * FROM roles ORDER BY name;
```

You should see 6 roles:
- company_admin
- manager
- supervisor
- technician_group_manager
- technician
- customer

### 5.4 (Optional) Run Full Schema

If you want all tables (customers, vehicles, job_cards, etc.):
1. Open `database/schema.sql`
2. Copy and paste into SQL Editor
3. Run it

---

## Step 6: Configure Authentication

### 6.1 Enable Email Authentication
1. In Supabase dashboard, click **"Authentication"** in left sidebar
2. Click **"Providers"** tab
3. Make sure **"Email"** is enabled (toggle should be ON)
4. Configure settings:
   - **Enable email confirmations**: OFF (for development) or ON (for production)
   - **Secure email change**: ON (recommended)

### 6.2 (Optional) Configure Email Templates
1. Go to **"Email Templates"** tab
2. Customize templates if needed:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

For development, you can leave defaults.

---

## Step 7: Test the Connection

### 7.1 Restart Your Expo App

**Stop your current Expo server** (if running):
- Press `Ctrl+C` in terminal

**Start with clear cache**:
```bash
npx expo start --clear
```

### 7.2 Test Signup

1. Open your app
2. Navigate to **Signup** screen
3. Enter:
   - Email: `test@example.com`
   - Password: `test123456` (minimum 6 characters)
4. Click **"Create an Account"**

**Expected Result:**
- ✅ Account created successfully
- ✅ You're logged in automatically
- ✅ Navigate to dashboard

### 7.3 Verify in Supabase Dashboard

1. Go to Supabase dashboard
2. Click **"Authentication"** → **"Users"**
3. You should see your test user
4. Click **"Table Editor"** → **"user_profiles"**
5. You should see the profile automatically created

### 7.4 Test Login

1. Logout from your app
2. Go to **Login** screen
3. Enter the same credentials
4. Click **"Log in"**

**Expected Result:**
- ✅ Login successful
- ✅ Navigate to dashboard

---

## Step 8: Verify Everything Works

### 8.1 Check Console Logs

In your terminal/Expo logs, you should see:
- No Supabase connection errors
- Successful authentication messages

### 8.2 Check Supabase Dashboard

**Authentication → Users:**
- Should show registered users
- User status should be "Active"

**Table Editor → user_profiles:**
- Should show user profiles
- First user should have `company_admin` role
- Other users should have `NULL` role (pending)

**SQL Editor:**
Run this query to see all users:
```sql
SELECT 
  up.email,
  up.full_name,
  r.name as role_name,
  up.is_active,
  up.created_at
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id
ORDER BY up.created_at DESC;
```

---

## Troubleshooting

### ❌ Issue: "Missing Supabase environment variables"

**Symptoms:**
- Console shows: "Supabase is not configured"
- App can't connect to Supabase

**Solutions:**
1. ✅ Check `.env` file exists in project root
2. ✅ Verify variable names start with `EXPO_PUBLIC_`
3. ✅ Check for typos in variable names
4. ✅ Restart Expo: `npx expo start --clear`
5. ✅ Make sure `.env` is not `.env.txt`

### ❌ Issue: "Invalid API key"

**Symptoms:**
- Error: "Invalid API key" or "JWT expired"

**Solutions:**
1. ✅ Double-check you copied the **anon** key (not service_role)
2. ✅ Make sure no extra spaces in `.env` file
3. ✅ Verify key starts with `eyJ...`
4. ✅ Get fresh key from Supabase dashboard → Settings → API

### ❌ Issue: "Email already registered"

**Symptoms:**
- Can't sign up with existing email

**Solutions:**
1. ✅ This is normal - email already exists
2. ✅ Try logging in instead
3. ✅ Or delete user from Supabase → Authentication → Users

### ❌ Issue: "Network request failed"

**Symptoms:**
- Can't connect to Supabase
- Timeout errors

**Solutions:**
1. ✅ Check internet connection
2. ✅ Verify Supabase project is active (not paused)
3. ✅ Check Supabase status: https://status.supabase.com
4. ✅ Verify Project URL is correct

### ❌ Issue: "Table doesn't exist"

**Symptoms:**
- Error: "relation user_profiles does not exist"

**Solutions:**
1. ✅ Make sure you ran `database/auth_tables.sql`
2. ✅ Check SQL Editor for any errors
3. ✅ Verify tables exist: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`

### ❌ Issue: "Trigger not working"

**Symptoms:**
- User created but no profile in `user_profiles` table

**Solutions:**
1. ✅ Check if trigger exists:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```
2. ✅ Re-run the trigger creation part of `auth_tables.sql`
3. ✅ Manually create profile if needed (for existing users)

### ❌ Issue: "First user not getting company_admin role"

**Solutions:**
1. ✅ Check if roles were inserted:
   ```sql
   SELECT * FROM roles;
   ```
2. ✅ Check if trigger function exists:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```
3. ✅ Manually assign role:
   ```sql
   UPDATE user_profiles 
   SET role_id = (SELECT id FROM roles WHERE name = 'company_admin')
   WHERE id = 'your-user-id';
   ```

---

## ✅ Setup Checklist

Use this checklist to verify your setup:

- [ ] Supabase account created
- [ ] Project created and active
- [ ] Credentials copied (URL and Anon Key)
- [ ] `.env` file created in project root
- [ ] Credentials added to `.env` file
- [ ] `.env` added to `.gitignore`
- [ ] `auth_tables.sql` run in Supabase SQL Editor
- [ ] Roles table has 6 roles
- [ ] Email authentication enabled
- [ ] Expo app restarted with `--clear`
- [ ] Test signup works
- [ ] Test login works
- [ ] User appears in Supabase dashboard
- [ ] Profile created automatically

---

## 🎉 Success!

If all checklist items are ✅, your Supabase setup is complete!

### Next Steps:
1. ✅ Start building your app features
2. ✅ Test all authentication flows
3. ✅ Set up Row Level Security (RLS) policies if needed
4. ✅ Configure email templates for production

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Supabase Status**: https://status.supabase.com
- **Expo Environment Variables**: https://docs.expo.dev/guides/environment-variables/

---

## 💡 Tips

1. **Development vs Production**:
   - For development: Disable email confirmations
   - For production: Enable email confirmations

2. **Database Password**:
   - Save it securely - you'll need it for direct database access
   - You can reset it in Supabase dashboard if forgotten

3. **Free Tier Limits**:
   - 500 MB database storage
   - 2 GB bandwidth per month
   - Perfect for development and small projects

4. **Security**:
   - Never commit `.env` file to Git
   - Never share your service_role key
   - Anon key is safe for client-side use

---

## 🆘 Need Help?

If you're stuck:
1. Check the troubleshooting section above
2. Check Supabase dashboard → Logs for errors
3. Check your app console for detailed error messages
4. Visit Supabase Discord for community support

Good luck! 🚀

