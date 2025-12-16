# 📱 Android Install करने का Complete Guide

## 🎯 Step-by-Step Instructions (Hindi/English)

### ✅ Step 1: Node.js Install करें

1. **Download करें:**
   - Website खोलें: https://nodejs.org/
   - "LTS" version download करें (recommended)

2. **Install करें:**
   - Downloaded `.msi` file को double-click करें
   - "Next" → "Next" → "Install" click करें
   - Installation complete होने तक wait करें

3. **Verify करें:**
   ```bash
   node --version
   npm --version
   ```
   Version numbers दिखने चाहिए

---

### ✅ Step 2: Android Studio Install करें

1. **Download करें:**
   - Website: https://developer.android.com/studio
   - "Download Android Studio" button click करें
   - File size: ~1 GB (internet connection अच्छा होना चाहिए)

2. **Install करें:**
   - Downloaded file को run करें
   - "Next" → "Next" → "Install" click करें
   - Installation में 10-15 minutes लग सकते हैं
   - Computer restart करने को कह सकता है

3. **First Time Setup:**
   - Android Studio open करें
   - "More Actions" → "SDK Manager" click करें
   - "SDK Platforms" tab में:
     - ✅ Android 13.0 (Tiramisu) - API 33
     - ✅ Android 12.0 (S) - API 31
   - "SDK Tools" tab में:
     - ✅ Android SDK Build-Tools
     - ✅ Android SDK Platform-Tools
     - ✅ Android SDK Command-line Tools
   - "Apply" click करें और wait करें

---

### ✅ Step 3: Environment Variables Setup (Windows)

1. **System Properties खोलें:**
   - `Windows Key + R` दबाएं
   - `sysdm.cpl` type करें
   - Enter दबाएं

2. **Path Variable Add करें:**
   - "Advanced" tab → "Environment Variables"
   - "System variables" में "Path" select करें
   - "Edit" click करें
   - "New" click करें और add करें:
     ```
     C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools
     C:\Users\YourUsername\AppData\Local\Android\Sdk\tools
     C:\Users\YourUsername\AppData\Local\Android\Sdk\emulator
     ```
   - "OK" click करें

3. **ANDROID_HOME Variable:**
   - "System variables" में "New" click करें
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
   - "OK" click करें
   - सभी windows close करें

4. **Computer Restart करें:**
   - Restart करना important है environment variables के लिए

---

### ✅ Step 4: Project Setup

**PowerShell या Command Prompt में:**

```bash
# Project folder में जाएं
cd "C:\Project by Solution Square\Garage Square"

# Dependencies install करें
npm install

# Verify करें
npm list react-native-safe-area-context
```

---

### ✅ Step 5: Phone Setup

1. **Developer Options Enable करें:**
   - Settings → About Phone
   - "Build Number" को **7 बार tap** करें
   - Message आएगा: "You are now a developer!"

2. **USB Debugging Enable करें:**
   - Settings → Developer Options
   - "USB Debugging" को ON करें
   - "Install via USB" को ON करें (अगर available है)
   - "Stay awake" को ON करें (optional, helpful)

3. **Expo Go App Install करें:**
   - Google Play Store खोलें
   - "Expo Go" search करें
   - Install करें

---

### ✅ Step 6: Connect और Test

1. **Phone Connect करें:**
   - USB cable से phone को computer से connect करें
   - Phone पर "Allow USB Debugging" prompt आने पर "Allow" click करें
   - "Always allow from this computer" check करें

2. **Test करें:**
   ```bash
   # PowerShell में
   adb devices
   ```
   आपको अपना phone दिखना चाहिए:
   ```
   List of devices attached
   ABC123XYZ    device
   ```

3. **App Start करें:**
   ```bash
   npm start
   ```

4. **Phone पर Open करें:**
   - Terminal में **`a`** key press करें
   - या Expo Go app में QR code scan करें

---

## 🚀 Quick Commands

```bash
# Dependencies install
npm install

# App start करें
npm start

# Android पर directly run
npm run android

# Cache clear (अगर problem हो)
npm start -- --clear

# ADB devices check करें
adb devices

# ADB restart करें
adb kill-server
adb start-server
```

---

## 🔧 Troubleshooting

### Problem: "adb: command not found"
**Solution:**
1. Environment variables properly setup नहीं है
2. Computer restart किया है या नहीं check करें
3. Path manually verify करें:
   ```bash
   echo $env:ANDROID_HOME
   ```

### Problem: Phone detect नहीं हो रहा
**Solution:**
1. USB cable check करें (data cable होना चाहिए)
2. USB Debugging enable है या नहीं
3. Different USB port try करें
4. Phone unlock करें
5. Commands:
   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```

### Problem: "Metro bundler failed"
**Solution:**
```bash
# Cache clear करें
npm start -- --clear

# या node_modules delete करें
rm -rf node_modules
npm install
```

### Problem: App load नहीं हो रही
**Solution:**
1. Phone और computer same WiFi पर हैं
2. Firewall settings check करें
3. Antivirus temporarily disable करें
4. Try करें:
   ```bash
   npm start -- --tunnel
   ```

---

## ✅ Final Checklist

- [ ] Node.js installed और working
- [ ] Android Studio installed
- [ ] Android SDK Platform-Tools installed
- [ ] Environment variables setup किया
- [ ] Computer restart किया
- [ ] `adb devices` command working
- [ ] Phone पर Developer Options enabled
- [ ] Phone पर USB Debugging enabled
- [ ] Expo Go app installed
- [ ] `.env` file created
- [ ] `npm install` completed
- [ ] `npm start` working

---

## 🎉 Success!

अगर सब कुछ properly setup है, तो:
1. `npm start` run करें
2. Terminal में `a` press करें
3. App automatically phone पर open होगी!

**Code changes automatically reload होंगे phone पर!**

---

## 📞 Help

अगर कोई problem हो:
1. `ANDROID_INSTALL_GUIDE.md` check करें
2. Expo docs: https://docs.expo.dev/
3. React Native docs: https://reactnative.dev/

