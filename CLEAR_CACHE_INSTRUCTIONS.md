# 🔄 Clear Cache to Fix "Invalid API Key" Error

## Problem
"Invalid API key" error aa raha hai even after disabling Supabase. This is likely due to cached code.

## Solution: Clear All Caches

### Step 1: Stop Expo Server
Press `Ctrl+C` in terminal to stop the current Expo server.

### Step 2: Clear All Caches

Run these commands one by one:

```bash
# Clear Expo cache
npx expo start --clear

# OR if that doesn't work, try:
rm -rf .expo
rm -rf node_modules/.cache
npx expo start --clear
```

### Step 3: For Windows (PowerShell)

```powershell
# Delete .expo folder
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# Delete node_modules cache
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Restart Expo
npx expo start --clear
```

### Step 4: If Still Not Working

1. **Close Metro bundler completely**
2. **Delete these folders**:
   - `.expo/`
   - `node_modules/.cache/`
   - `.expo-shared/` (if exists)

3. **Restart Expo**:
   ```bash
   npx expo start --clear
   ```

### Step 5: Verify

After restarting, check console:
- ✅ Should see: "Supabase is disabled - using local storage"
- ❌ Should NOT see: "Invalid API key" error

---

## What Was Changed

1. ✅ `src/lib/supabase.ts` - Completely disabled, no createClient import
2. ✅ `app.config.js` - Supabase credentials set to null
3. ✅ All screens - Added null checks before Supabase calls

---

## Still Getting Error?

If you're still getting "Invalid API key" error:

1. **Check if .env file exists** - Delete it if it has invalid credentials
2. **Restart your computer** - Sometimes helps clear all caches
3. **Reinstall node_modules**:
   ```bash
   rm -rf node_modules
   npm install
   npx expo start --clear
   ```

---

**After clearing cache, the error should be gone!** ✅

