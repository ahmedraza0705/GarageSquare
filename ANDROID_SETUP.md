# Android Setup & Installation Guide

## 📱 Running on Android Phone

### Prerequisites

1. **Android Phone Requirements:**
   - Android 6.0 (API level 23) or higher
   - USB debugging enabled
   - Developer options enabled

2. **Computer Requirements:**
   - Windows, macOS, or Linux
   - Node.js installed (v16 or higher)
   - Android Studio (for Android SDK)

---

## 🚀 Step-by-Step Setup

### Step 1: Enable Developer Options on Your Phone

1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times until you see "You are now a developer!"
3. Go back to **Settings** → **Developer Options**
4. Enable **USB Debugging**
5. Enable **Install via USB** (if available)

### Step 2: Install Android Studio (if not installed)

1. Download Android Studio from: https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio → **More Actions** → **SDK Manager**
4. Install:
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - Android 13 (API 33) or latest
5. Accept all licenses

### Step 3: Set Up Environment Variables (Windows)

1. Open **System Properties** → **Environment Variables**
2. Add to **Path**:
   ```
   C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools
   C:\Users\YourUsername\AppData\Local\Android\Sdk\tools
   ```
3. Create new variable `ANDROID_HOME`:
   ```
   C:\Users\YourUsername\AppData\Local\Android\Sdk
   ```

### Step 4: Connect Your Phone

1. Connect your Android phone to computer via USB
2. On your phone, when prompted, tap **Allow USB Debugging**
3. Check if device is detected:
   ```bash
   adb devices
   ```
   You should see your device listed

### Step 5: Install Project Dependencies

```bash
# Navigate to project directory
cd "C:\Project by Solution Square\Garage Square"

# Install dependencies
npm install
```

### Step 6: Set Up Environment Variables

1. Create `.env` file in project root:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### Step 7: Start the Development Server

```bash
# Start Expo development server
npm start
```

This will open Expo DevTools in your browser.

### Step 8: Run on Android Phone

**Option A: Using Expo Go App (Easiest)**

1. Install **Expo Go** from Google Play Store on your phone
2. Make sure your phone and computer are on the same WiFi network
3. In the terminal, press `a` to open on Android
4. Or scan the QR code with Expo Go app

**Option B: Direct USB Connection**

1. Connect phone via USB
2. Run:
   ```bash
   npm run android
   ```
   or
   ```bash
   npx expo start --android
   ```

**Option C: Build APK (For Testing)**

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Build APK:
   ```bash
   eas build --platform android --profile preview
   ```

3. Download and install the APK on your phone

---

## 🔧 Troubleshooting

### Issue: "adb: command not found"
**Solution:** Add Android SDK platform-tools to your PATH (see Step 3)

### Issue: Device not detected
**Solution:**
1. Check USB cable (use data cable, not charging-only)
2. Enable USB debugging again
3. Try different USB port
4. Run: `adb kill-server` then `adb start-server`

### Issue: "Metro bundler failed"
**Solution:**
```bash
# Clear cache and restart
npm start -- --clear
```

### Issue: "Cannot connect to development server"
**Solution:**
1. Make sure phone and computer are on same WiFi
2. Check firewall settings
3. Try using USB connection instead

### Issue: "Expo Go app not opening"
**Solution:**
1. Update Expo Go app to latest version
2. Clear Expo Go app cache
3. Restart development server

---

## 📲 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android (connected device)
npm run android

# Clear cache and restart
npm start -- --clear
```

---

## 🎯 Recommended Workflow

1. **Development:** Use Expo Go app for quick testing
2. **Testing:** Build APK for more realistic testing
3. **Production:** Use EAS Build for production APK/AAB

---

## 📝 Notes

- Keep your phone unlocked while developing
- Keep USB debugging enabled
- Use same WiFi network for wireless debugging
- Expo Go has some limitations; for full features, build APK

---

## 🆘 Need Help?

If you encounter issues:
1. Check Expo documentation: https://docs.expo.dev/
2. Check React Native docs: https://reactnative.dev/
3. Check Android Studio setup: https://developer.android.com/studio

