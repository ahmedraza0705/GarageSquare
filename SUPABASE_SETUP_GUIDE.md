# Supabase Setup Guide - Step by Step

## 📋 Overview
This guide will help you connect your Garage Square app with Supabase for authentication (Login & Signup).

---

## Step 1: Create a Supabase Account & Project

1. **Go to Supabase**: Visit [https://supabase.com](https://supabase.com)
2. **Sign Up/Login**: Create an account or login
3. **Create New Project**:
   - Click "New Project"
   - Enter project name: "Garage Square" (or any name)
   - Enter database password (save it securely)
   - Select a region closest to you
   - Click "Create new project"
   - Wect to be created
ait 2-3 minutes for proj
---

## Step 2: Get Your Supabase Credentials

1. **Go to Project Settings**:
   - In your Supabase dashboard, click on the gear icon (⚙️) in the left sidebar
   - Click "API" or "Settings" → "API"

2. **Copy Your Credentials**:
   - **Project URL**: Copy the "Project URL" (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon/Public Key**: Copy the "anon" or "public" key (long JWT token starting with `eyJ...`)

   ⚠️ **Important**: Never share your `service_role` key publicly!

---

## Step 3: Create .env File in Your Project

1. **Create `.env` file** in the root directory of your project (same level as `package.json`)

2. **Add your credentials**:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   **Example**:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4OCwiZXhwIjoxOTU0NTQzMjg4fQ.example
   ```

3. **Add `.env` to `.gitignore`** (if not already there):
   ```
   .env
   .env.local
   ```

---

## Step 4: Install Required Packages

The Supabase package is already installed. If you need to reinstall:

```bash
npm install @supabase/supabase-js
```

---

## Step 5: Set Up Supabase Database Schema

1. **Go to SQL Editor** in Supabase dashboard
2. **Run the schema**: Copy and paste the SQL from `database/schema.sql` file
3. **Execute** the SQL to create all necessary tables

---

## Step 6: Configure Supabase Authentication

1. **Go to Authentication** in Supabase dashboard
2. **Enable Email Auth**:
   - Go to "Providers"
   - Make sure "Email" is enabled
   - Configure email templates if needed

3. **Set up Email Templates** (Optional):
   - Go to "Email Templates"
   - Customize confirmation and password reset emails

---

## Step 7: Test the Connection

1. **Restart your Expo app**:
   ```bash
   npx expo start --clear
   ```

2. **Try Signup**:
   - Open the app
   - Go to Signup screen
   - Create a new account
   - Check Supabase dashboard → Authentication → Users to see if user was created

3. **Try Login**:
   - Use the credentials you just created
   - You should be able to login successfully

---

## Step 8: Verify Everything Works

### Check in Supabase Dashboard:

1. **Authentication → Users**: Should show your registered users
2. **Table Editor**: Check `user_profiles` table for user data
3. **Authentication → Logs**: Check for any authentication errors

### Check in Your App:

1. **Signup**: Create a new account
2. **Login**: Login with existing account
3. **Session**: Check if you stay logged in after app restart

---

## Troubleshooting

### Issue: "Missing Supabase environment variables"
**Solution**: 
- Make sure `.env` file exists in root directory
- Check that variables start with `EXPO_PUBLIC_`
- Restart Expo with `npx expo start --clear`

### Issue: "Invalid API key"
**Solution**:
- Double-check your Supabase URL and Anon Key
- Make sure you copied the "anon" key, not "service_role" key
- Verify credentials in Supabase dashboard → Settings → API

### Issue: "Email already registered"
**Solution**:
- This is normal if user already exists
- Try logging in instead of signing up
- Or delete user from Supabase dashboard → Authentication → Users

### Issue: "Network request failed"
**Solution**:
- Check your internet connection
- Verify Supabase project is active (not paused)
- Check Supabase status page: https://status.supabase.com

---

## Security Notes

1. **Never commit `.env` file** to Git
2. **Use environment variables** for all sensitive data
3. **Anon key is safe** for client-side use (it's public)
4. **Service role key** should NEVER be used in client code

---

## Next Steps

After successful setup:
1. ✅ Test signup and login
2. ✅ Verify user data in Supabase
3. ✅ Test role assignment
4. ✅ Set up Row Level Security (RLS) policies if needed

---

## Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Check console logs** for detailed error messages

