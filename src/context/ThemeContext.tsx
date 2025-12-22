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
    primary: '#4682B4', // Steel Blue from palette
    background: '#F3F4F6', // Lighter gray for background
    surface: '#FFFFFF',
    surfaceAlt: '#E5E7EB',
    text: '#1F2937',
    textMuted: '#6B7280',
    border: '#D1D5DB',
    notification: '#EF4444',
    onPrimary: '#FFFFFF',
    statusBarStyle: 'dark-content',
    statusBarBg: '#FFFFFF',
    headerBg: '#FFFFFF',
    headerText: '#1F2937',
    headerBorder: '#E5E7EB',
    headerIcon: '#1F2937',
    avatarBg: '#4682B4',
    avatarText: '#FFFFFF',
    tabBarBg: '#4682B4',
    tabBarBorder: 'transparent',
    tabIconBg: 'rgba(255, 255, 255, 0.2)',
    tabIconColor: '#FFFFFF',
    tabIconInactiveOpacity: 0.7,
    drawerBackground: '#F0F9FF',
    overlay: 'rgba(0, 0, 0, 0.35)',
    disabledBg: '#D1D5DB',
  },
  dark: {
    primary: '#60a5fa',
    background: '#0b1220',
    surface: '#0f172a',
    surfaceAlt: '#111827',
    text: '#e5e7eb',
    textMuted: '#94a3b8',
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


