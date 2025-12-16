# 📱 How to Run on Android Phone - Simple Steps

## 🎯 Easiest Method (Recommended)

### Step 1: Install Expo Go App
1. Open **Google Play Store** on your Android phone
2. Search for **"Expo Go"**
3. Install it

### Step 2: Enable Developer Mode on Phone
1. Go to **Settings** → **About Phone**
2. Find **Build Number** and tap it **7 times**
3. Go back to **Settings** → **Developer Options**
4. Turn on **USB Debugging**

### Step 3: Connect Phone
**Option A: Same WiFi (Easiest)**
- Make sure phone and computer are on same WiFi network

**Option B: USB Cable**
- Connect phone to computer with USB cable
- When phone asks, tap **"Allow USB Debugging"**

### Step 4: Run Commands

Open PowerShell or Command Prompt in your project folder:

```bash
# First time only - Install packages
npm install

# Start the app
npm start
```

### Step 5: Open on Phone

**Method 1: Scan QR Code (Easiest)**
1. Terminal will show a QR code
2. Open **Expo Go** app on your phone
3. Tap **"Scan QR Code"**
4. Scan the QR code from terminal
5. App will load!

**Method 2: Press 'a' Key**
1. In the terminal where `npm start` is running
2. Press the **`a`** key
3. App will open on your connected Android phone

**Method 3: Direct Command**
```bash
npm run android
```

---

## ⚠️ Troubleshooting

### Phone not detected?
```bash
# Check if phone is connected
adb devices
```

If nothing shows:
1. Try different USB cable (use data cable, not charging-only)
2. Try different USB port
3. Make sure USB Debugging is enabled

### App not loading?
1. Make sure phone and computer are on **same WiFi**
2. Check firewall isn't blocking connection
3. Try: `npm start -- --clear`

### Metro bundler errors?
```bash
# Clear cache and restart
npm start -- --clear
```

---

## ✅ Quick Checklist

- [ ] Expo Go app installed on phone
- [ ] USB Debugging enabled
- [ ] Phone and computer on same WiFi (or USB connected)
- [ ] `npm install` completed
- [ ] `.env` file created with Supabase credentials

---

## 🚀 That's It!

Once running, any code changes will automatically reload on your phone!

**Need help?** Check `ANDROID_SETUP.md` for detailed instructions.

