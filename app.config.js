// ============================================
// EXPO APP CONFIGURATION
// ============================================
// This file reads environment variables from .env file
// Make sure you have created .env file with your Supabase credentials
// Expo SDK 49+ automatically loads EXPO_PUBLIC_* variables from .env file

module.exports = {
  expo: {
    name: "Garage Square",
    slug: "garage-square",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.garagesquare.app"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      },
      package: "com.garagesquare.app"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: ["expo-router"],
    scheme: "garage-square",
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    }
  }
};

