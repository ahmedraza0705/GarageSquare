// ============================================
// SUPABASE CLIENT
// ============================================
// Creates a Supabase client using Expo environment variables.
// Uses Expo SecureStore for session persistence on native.

import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  '';

const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

// Helpful diagnostics to catch missing/misnamed env vars during dev
const logSupabaseConfig = () => {
  if (typeof __DEV__ !== 'undefined' && !__DEV__) return;
  console.log('[Supabase] Config loaded', {
    hasUrl: Boolean(supabaseUrl),
    hasKey: Boolean(supabaseAnonKey),
    url: supabaseUrl || 'Not set',
    keyPreview: supabaseAnonKey ? `${supabaseAnonKey.slice(0, 6)}...` : 'Not set',
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Check your .env at project root and restart with `npx expo start --clear`.'
    );
  }
};

logSupabaseConfig();

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabaseConfig = {
  isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  hasUrl: Boolean(supabaseUrl),
  hasKey: Boolean(supabaseAnonKey),
  url: supabaseUrl || 'Not set',
};

export const supabase: SupabaseClient | null = supabaseConfig.isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
