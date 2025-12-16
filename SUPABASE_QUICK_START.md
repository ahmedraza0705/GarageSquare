# ⚡ Supabase Quick Start - 5 Minutes Setup

## 🎯 Quick Steps

### 1️⃣ Create Account & Project (2 min)
```
1. Go to: https://supabase.com
2. Sign up (GitHub/Email/Google)
3. Click "New Project"
4. Name: "Garage Square"
5. Set database password (save it!)
6. Select region
7. Click "Create new project"
8. Wait 2-3 minutes ⏱️
```

### 2️⃣ Get Credentials (1 min)
```
1. Click ⚙️ Settings → API
2. Copy "Project URL"
3. Copy "anon" key (NOT service_role!)
```

### 3️⃣ Create .env File (1 min)
```
Location: Project root (where package.json is)

File name: .env

Content:
EXPO_PUBLIC_SUPABASE_URL=paste-your-url-here
EXPO_PUBLIC_SUPABASE_ANON_KEY=paste-your-key-here
```

### 4️⃣ Run SQL Schema (1 min)
```
1. Supabase Dashboard → SQL Editor
2. Open: database/auth_tables.sql
3. Copy ALL SQL
4. Paste in SQL Editor
5. Click "Run"
```

### 5️⃣ Test (1 min)
```
1. Restart app: npx expo start --clear
2. Try signup
3. Check Supabase → Authentication → Users
```

---

## ✅ Verification

Run in Supabase SQL Editor:
```sql
SELECT * FROM roles;
```

Should show 6 roles ✅

---

## 📁 Files You Need

- `SUPABASE_COMPLETE_SETUP.md` - Detailed guide
- `database/auth_tables.sql` - SQL to run
- `.env` - Your credentials (create this)

---

## 🆘 Quick Fixes

**"Missing Supabase environment variables"**
→ Check `.env` file exists and has correct variable names

**"Invalid API key"**
→ Make sure you copied "anon" key, not "service_role"

**"Table doesn't exist"**
→ Run `database/auth_tables.sql` in SQL Editor

---

For detailed instructions, see: `SUPABASE_COMPLETE_SETUP.md`

