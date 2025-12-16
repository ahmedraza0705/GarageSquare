# 🚀 Quick Start Guide - Run on Android Phone

## Fastest Way (Using Expo Go)

### 1. Install Expo Go on Your Phone
- Open **Google Play Store**
- Search for **"Expo Go"**
- Install the app

### 2. Connect Phone to Computer
- Connect via USB cable
- Enable USB Debugging on phone
- Or use same WiFi network

### 3. Run These Commands

```bash
# Navigate to project
cd "C:\Project by Solution Square\Garage Square"

# Install dependencies (first time only)
npm install

# Start the app
npm start
```

### 4. Open on Phone

**Method 1: Scan QR Code**
- Terminal will show a QR code
- Open Expo Go app
- Tap "Scan QR Code"
- Scan the code from terminal

**Method 2: Press 'a' Key**
- In the terminal where `npm start` is running
- Press `a` key
- App will open on connected Android device

**Method 3: Use USB**
```bash
npm run android
```

---

## ⚡ One-Line Commands

```bash
# Install and start
npm install && npm start

# Run on Android directly
npm run android

# Clear cache if issues
npm start -- --clear
```

---

## ✅ Checklist Before Running

- [ ] Node.js installed (check: `node --version`)
- [ ] Android phone connected or on same WiFi
- [ ] USB Debugging enabled on phone
- [ ] Expo Go app installed on phone
- [ ] `.env` file created with Supabase credentials
- [ ] Dependencies installed (`npm install`)

---

## 🎯 That's It!

Once running, any code changes will automatically reload on your phone!

