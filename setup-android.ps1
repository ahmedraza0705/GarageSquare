# ============================================
# Android Setup Script for Windows
# ============================================

Write-Host "🚀 Starting Android Setup for Garage Square..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "📦 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
Write-Host "📦 Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

# Install project dependencies
Write-Host ""
Write-Host "📦 Installing project dependencies..." -ForegroundColor Yellow
npm install

# Install Expo CLI globally if not installed
Write-Host ""
Write-Host "📦 Checking Expo CLI..." -ForegroundColor Yellow
try {
    $expoVersion = expo --version
    Write-Host "✅ Expo CLI installed: $expoVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Expo CLI globally..." -ForegroundColor Yellow
    npm install -g expo-cli
}

# Check for Android Studio
Write-Host ""
Write-Host "📱 Checking Android Studio..." -ForegroundColor Yellow
$androidStudioPath = "$env:LOCALAPPDATA\Android\Sdk"
if (Test-Path $androidStudioPath) {
    Write-Host "✅ Android SDK found at: $androidStudioPath" -ForegroundColor Green
} else {
    Write-Host "⚠️  Android SDK not found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please install Android Studio:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://developer.android.com/studio" -ForegroundColor Cyan
    Write-Host "2. Install Android Studio" -ForegroundColor Cyan
    Write-Host "3. Open Android Studio → SDK Manager" -ForegroundColor Cyan
    Write-Host "4. Install Android SDK Platform-Tools" -ForegroundColor Cyan
    Write-Host ""
}

# Check for ADB
Write-Host ""
Write-Host "📱 Checking ADB (Android Debug Bridge)..." -ForegroundColor Yellow
$adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (Test-Path $adbPath) {
    Write-Host "✅ ADB found!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Checking connected devices..." -ForegroundColor Yellow
    & $adbPath devices
} else {
    Write-Host "⚠️  ADB not found! Please install Android SDK Platform-Tools" -ForegroundColor Yellow
}

# Setup instructions
Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Enable Developer Options on your Android phone:" -ForegroundColor White
Write-Host "   - Settings → About Phone → Tap 'Build Number' 7 times" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Enable USB Debugging:" -ForegroundColor White
Write-Host "   - Settings → Developer Options → Enable 'USB Debugging'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Install Expo Go app on your phone:" -ForegroundColor White
Write-Host "   - Open Google Play Store" -ForegroundColor Gray
Write-Host "   - Search 'Expo Go' and install" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Connect your phone and run:" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Press 'a' in terminal or scan QR code with Expo Go" -ForegroundColor White
Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan

