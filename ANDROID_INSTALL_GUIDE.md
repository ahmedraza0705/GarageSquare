# 📱 Complete Android Installation Guide (Hindi/English)

## 🎯 Android Setup करने के लिए Step-by-Step Guide

### Step 1: Node.js Install करें (अगर नहीं है)

1. **Download करें:**
   - Website: https://nodejs.org/
   - Latest LTS version download करें

2. **Install करें:**
   - Downloaded file को run करें
   - "Next" दबाते रहें
   - Install complete होने तक wait करें

3. **Verify करें:**
   ```bash
   node --version
   npm --version
   ```

---

### Step 2: Android Studio Install करें

1. **Download करें:**
   - Website: https://developer.android.com/studio
   - "Download Android Studio" button click करें

2. **Install करें:**
   - Downloaded file को run करें
   - "Next" → "Next" → "Install" click करें
   - Installation complete होने तक wait करें (10-15 minutes)

3. **First Time Setup:**
   - Android Studio open करें
   - "More Actions" → "SDK Manager" click करें
   - Install करें:
     - ✅ Android SDK Platform-Tools
     - ✅ Android SDK Build-Tools
     - ✅ Android 13 (API 33) या latest
   - "Apply" click करें और wait करें

---

### Step 3: Environment Variables Setup (Windows)

1. **System Properties खोलें:**
   - Windows Key + R दबाएं
   - `sysdm.cpl` type करें और Enter दबाएं

2. **Environment Variables:**
   - "Advanced" tab → "Environment Variables" click करें
   - "System variables" में "Path" select करें
   - "Edit" click करें
   - "New" click करें और add करें:
     ```
     C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools
     C:\Users\YourUsername\AppData\Local\Android\Sdk\tools
     ```

3. **ANDROID_HOME Variable:**
   - "System variables" में "New" click करें
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
   - "OK" click करें

4. **Restart करें:**
   - Computer को restart करें

---

### Step 4: Project Setup

**PowerShell या Command Prompt में:**

```bash
# Project folder में जाएं
cd "C:\Project by Solution Square\Garage Square"

# Dependencies install करें
npm install

# Setup script run करें (optional)
.\setup-android.ps1
```

---

### Step 5: Phone Setup

1. **Developer Options Enable करें:**
   - Settings → About Phone
   - "Build Number" को **7 बार tap** करें
   - Message आएगा: "You are now a developer!"

2. **USB Debugging Enable करें:**
   - Settings → Developer Options
   - "USB Debugging" को ON करें
   - "Install via USB" को ON करें (अगर available है)

3. **Expo Go App Install करें:**
   - Google Play Store खोलें
   - "Expo Go" search करें
   - Install करें

---

### Step 6: Connect और Run

**Option A: USB Cable से (Recommended)**

1. Phone को computer से USB cable से connect करें
2. Phone पर "Allow USB Debugging" prompt आने पर "Allow" click करें
3. Terminal में:
   ```bash
   npm start
   ```
4. Terminal में **`a`** key press करें
5. App automatically phone पर open होगी!

**Option B: WiFi से (Same Network)**

1. Phone और computer same WiFi पर होने चाहिए
2. Terminal में:
   ```bash
   npm start
   ```
3. QR code scan करें Expo Go app से
4. App load होगी!

---

## 🚀 Quick Commands

```bash
# Dependencies install करें
npm install

# App start करें
npm start

# Android पर directly run करें
npm run android

# Cache clear करें (अगर problem हो)
npm start -- --clear
```

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] Android Studio installed
- [ ] Android SDK Platform-Tools installed
- [ ] Environment variables setup किया
- [ ] Computer restart किया
- [ ] Phone पर Developer Options enabled
- [ ] Phone पर USB Debugging enabled
- [ ] Expo Go app installed
- [ ] `.env` file created with Supabase credentials
- [ ] `npm install` completed

---

## 🔧 Troubleshooting

### Problem: "adb: command not found"
**Solution:** Environment variables properly setup नहीं है। Step 3 फिर से follow करें।

### Problem: Phone detect नहीं हो रहा
**Solution:**
1. USB cable check करें (data cable होना चाहिए, charging-only नहीं)
2. USB Debugging enable है या नहीं check करें
3. Different USB port try करें
4. Command run करें:
   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```

### Problem: App load नहीं हो रही
**Solution:**
1. Phone और computer same WiFi पर हैं या नहीं check करें
2. Firewall settings check करें
3. Try करें:
   ```bash
   npm start -- --clear
   ```

### Problem: Metro bundler errors
**Solution:**
```bash
# Cache clear करें
npm start -- --clear

# या node_modules delete करें और फिर install करें
rm -rf node_modules
npm install
```

---

## 📞 Help

अगर कोई problem हो तो:
1. `ANDROID_SETUP.md` file check करें
2. Expo documentation: https://docs.expo.dev/
3. React Native docs: https://reactnative.dev/

---

## 🎉 Success!

Setup complete होने के बाद, आपका app phone पर run होगा और code changes automatically reload होंगे!

