# 🔧 Supabase Environment Setup Guide

## Quick Setup Steps

### Step 1: Get Your Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com) and login
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (long JWT token starting with `eyJ...`)

### Step 2: Create .env File

1. In your project root directory (same level as `package.json`), create a file named `.env`
2. Add these lines (replace with your actual values):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4OCwiZXhwIjoxOTU0NTQzMjg4fQ.example
```

### Step 3: Verify .env File

Make sure:
- ✅ File is named exactly `.env` (not `.env.txt` or `.env.example`)
- ✅ File is in the root directory (same folder as `package.json`)
- ✅ No spaces around the `=` sign
- ✅ No quotes around the values (unless the value itself contains spaces)
- ✅ Both variables start with `EXPO_PUBLIC_`

### Step 4: Restart Expo

**IMPORTANT:** After creating/updating `.env` file, you MUST restart Expo:

```bash
# Stop current Expo server (Ctrl+C)
# Then restart with clear cache:
npx expo start --clear
```

### Step 5: Verify Configuration

After restarting, check the console logs. You should see:
- ✅ No "Missing Supabase environment variables" warnings
- ✅ No "Supabase is not configured" errors

If you still see errors, check:
1. `.env` file exists and is in the root directory
2. Variable names are exactly `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Values are correct (no extra spaces or quotes)
4. You restarted Expo with `--clear` flag

---

## Troubleshooting

### Error: "Invalid API key"
- **Cause:** Wrong anon key or key is corrupted
- **Fix:** 
  1. Go to Supabase Dashboard → Settings → API
  2. Copy the **anon public** key again (make sure it's the "anon" key, not "service_role")
  3. Update `.env` file
  4. Restart Expo

### Error: "Supabase is not configured"
- **Cause:** Environment variables not loaded
- **Fix:**
  1. Check `.env` file exists in root directory
  2. Verify variable names start with `EXPO_PUBLIC_`
  3. Restart Expo with `npx expo start --clear`
  4. Check console for detailed error messages

### Error: "Network request failed"
- **Cause:** Wrong Supabase URL
- **Fix:**
  1. Check Supabase Dashboard → Settings → API
  2. Copy the **Project URL** again
  3. Make sure it starts with `https://` and ends with `.supabase.co`
  4. Update `.env` file and restart

### Variables not loading
- **Cause:** Expo cache or file location issue
- **Fix:**
  1. Delete `.expo` folder (if exists)
  2. Delete `node_modules/.cache` (if exists)
  3. Restart with: `npx expo start --clear`
  4. Make sure `.env` is in root, not in `src/` or other folders

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` file to Git
- The `.env` file is already in `.gitignore`
- The `anon` key is safe for client-side use (it's public)
- Never use `service_role` key in client code (it's secret!)

---

## Next Steps

After setting up `.env`:
1. ✅ Test signup - Create a new account
2. ✅ Test login - Login with your account
3. ✅ Verify in Supabase Dashboard → Authentication → Users
4. ✅ Check user_profiles table in Supabase Dashboard → Table Editor

---

## Need Help?

If you're still having issues:
1. Check console logs for detailed error messages
2. Verify credentials in Supabase Dashboard
3. Make sure you restarted Expo after creating `.env`
4. Check that `.env` file is not corrupted (no special characters)

