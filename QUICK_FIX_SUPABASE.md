# 🚀 Quick Fix: Supabase Configuration

## ⚡ Fast Setup (2 Minutes)

### Step 1: Get Credentials
1. Open [Supabase Dashboard](https://supabase.com)
2. Go to your project → **Settings** → **API**
3. Copy:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon public** key (long token starting with `eyJ...`)

### Step 2: Create .env File
In your project root (same folder as `package.json`), create `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Restart Expo
```bash
# Stop current server (Ctrl+C)
npx expo start --clear
```

### Step 4: Test Login
1. Try signing up with a new account
2. Try logging in
3. Check console - no more "Supabase is not configured" errors!

---

## ✅ What Was Fixed

1. ✅ Converted `app.json` → `app.config.js` (reads .env properly)
2. ✅ Updated Supabase client with better error messages
3. ✅ Improved all error handling in auth service
4. ✅ Created setup documentation

---

## 🐛 Still Having Issues?

### Check These:
- [ ] `.env` file exists in root directory
- [ ] File is named exactly `.env` (not `.env.txt`)
- [ ] Variables start with `EXPO_PUBLIC_`
- [ ] No spaces around `=` sign
- [ ] You restarted Expo with `--clear`
- [ ] Credentials are correct from Supabase Dashboard

### Common Errors:

**"Invalid API key"**
→ Wrong anon key. Copy it again from Supabase Dashboard → Settings → API

**"Supabase is not configured"**
→ `.env` file missing or not loaded. Restart Expo with `--clear`

**"Network request failed"**
→ Wrong Supabase URL. Check it starts with `https://` and ends with `.supabase.co`

---

## 📚 More Help

See `SETUP_SUPABASE_ENV.md` for detailed troubleshooting.

