import React from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

export type ThemeName = 'light' | 'dark';

export type ThemeColors = {
  primary: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  textSecondary: string; // Added for inventory screens
  card: string; // Added for inventory screens
  border: string;
  notification: string;
  onPrimary: string;
  statusBarStyle: 'light-content' | 'dark-content';
  statusBarBg: string;
  headerBg: string;
  headerText: string;
  headerBorder: string;
  headerIcon: string;
  avatarBg: string;
  avatarText: string;
  tabBarBg: string;
  tabBarBorder: string;
  tabIconBg: string;
  tabIconColor: string;
  tabIconInactiveOpacity: number;
  drawerBackground: string;
  overlay: string;
  disabledBg: string;
};

export const themes: Record<ThemeName, ThemeColors> = {
  light: {
    primary: '#2563eb',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    text: '#0f172a',
    textMuted: '#475569',
    textSecondary: '#6B7280',
    card: '#ffffff',
    border: '#e2e8f0',
    notification: '#ef4444',
    onPrimary: '#ffffff',
    statusBarStyle: 'dark-content',
    statusBarBg: '#ffffff',
    headerBg: '#ffffff',
    headerText: '#0f172a',
    headerBorder: '#e5e7eb',
    headerIcon: '#0f172a',
    avatarBg: '#2563eb',
    avatarText: '#ffffff',
    tabBarBg: '#2563eb',
    tabBarBorder: 'transparent',
    tabIconBg: 'rgba(255, 255, 255, 0.2)',
    tabIconColor: '#ffffff',
    tabIconInactiveOpacity: 0.7,
    drawerBackground: '#eef2ff',
    overlay: 'rgba(0, 0, 0, 0.35)',
    disabledBg: '#e2e8f0',
  },
  dark: {
    primary: '#60a5fa',
    background: '#0b1220',
    surface: '#0f172a',
    surfaceAlt: '#111827',
    text: '#e5e7eb',
    textMuted: '#94a3b8',
    textSecondary: '#9CA3AF',
    card: '#1F2937',
    border: '#1f2937',
    notification: '#f87171',
    onPrimary: '#0b1220',
    statusBarStyle: 'light-content',
    statusBarBg: '#0b1220',
    headerBg: '#0f172a',
    headerText: '#e5e7eb',
    headerBorder: '#1f2937',
    headerIcon: '#e5e7eb',
    avatarBg: '#2563eb',
    avatarText: '#ffffff',
    tabBarBg: '#0f172a',
    tabBarBorder: '#1f2937',
    tabIconBg: 'rgba(255, 255, 255, 0.14)',
    tabIconColor: '#e5e7eb',
    tabIconInactiveOpacity: 0.6,
    drawerBackground: '#0f172a',
    overlay: 'rgba(255, 255, 255, 0.07)',
    disabledBg: '#1f2937',
  },
};

type ThemeContextValue = {
  themeName: ThemeName;
  theme: ThemeColors;
  setThemeName: (name: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme: ColorSchemeName = useColorScheme();
  const initialTheme: ThemeName = colorScheme === 'dark' ? 'dark' : 'light';
  const [themeName, setThemeName] = React.useState<ThemeName>(initialTheme);

  const toggleTheme = React.useCallback(() => {
    setThemeName((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = React.useMemo(
    () => ({
      themeName,
      theme: themes[themeName],
      setThemeName,
      toggleTheme,
    }),
    [themeName, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}


