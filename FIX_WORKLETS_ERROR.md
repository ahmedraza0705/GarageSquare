# Fix Worklets Error - Complete Solution

## Error
```
WorkletsError: [Worklets] Mismatch between JavaScript part and native part of Worklets (0.7.1 vs 0.5.1)
```

## Solution Steps

### Step 1: Stop Expo Server
Press `Ctrl+C` in terminal to stop the running Expo server.

### Step 2: Clear All Caches
Run these commands one by one:

```bash
# Clear Expo cache
npx expo start --clear

# OR if that doesn't work, clear everything:
rm -rf node_modules
rm -rf .expo
rm -rf .expo-shared
npm cache clean --force

# For Windows (PowerShell):
# Remove-Item -Recurse -Force node_modules
# Remove-Item -Recurse -Force .expo
# Remove-Item -Recurse -Force .expo-shared
# npm cache clean --force
```

### Step 3: Reinstall Dependencies
```bash
npm install
```

### Step 4: Clear Metro Bundler Cache
```bash
npx expo start --clear
```

### Step 5: Rebuild Native Code (For Android)
If you're testing on Android device/emulator:

1. **Close the app completely** on your device
2. **Uninstall the app** from device (if installed)
3. **Rebuild and reinstall:**
   ```bash
   npx expo run:android
   ```

   OR if using Expo Go:
   ```bash
   npx expo start --clear
   ```
   Then scan QR code again

### Step 6: For iOS (if applicable)
```bash
npx expo run:ios
```

## What Was Fixed

✅ Added `react-native-reanimated/plugin` to `babel.config.js`
- This plugin MUST be the last plugin in the plugins array
- It's required for react-native-reanimated to work properly

## Verification

After following these steps:
1. The error should be gone
2. Drawer navigation should work smoothly
3. All animations should work properly

## If Error Persists

1. **Check babel.config.js** - Make sure `react-native-reanimated/plugin` is the LAST plugin
2. **Restart your device/emulator**
3. **Try development build instead of Expo Go:**
   ```bash
   npx expo prebuild
   npx expo run:android
   ```

## Notes

- The `react-native-reanimated/plugin` must be imported and added as the last plugin
- Always clear cache after changing babel config
- For native modules, you may need to rebuild the app (not just reload)

