import React from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

export type ThemeName = 'light' | 'dark';

export type ThemeColors = {
  primary: string;
  primaryDark: string;
  primaryOpacity: string;
  secondary: string;
  secondaryOpacity: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  notification: string;
  onPrimary: string;
  success: string;
  successOpacity: string;
  warning: string;
  warningOpacity: string;
  error: string;
  errorOpacity: string;
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
    primary: '#4682B4', // Steel Blue
    primaryDark: '#2E5677',
    primaryOpacity: 'rgba(70, 130, 180, 0.12)',
    secondary: '#C37125', // Autumn Orange
    secondaryOpacity: 'rgba(195, 113, 37, 0.12)',
    background: '#F1F5F9', // Light Grayish Blue
    surface: '#FFFFFF',
    surfaceAlt: '#E2E8F0',
    text: '#1F2937', // Text Primary
    textMuted: '#64748B', // Text Secondary
    border: '#E2E8F0', // Border/Divider
    notification: '#EF4444',
    onPrimary: '#FFFFFF',
    success: '#22C55E', // Success Green from palette
    successOpacity: 'rgba(34, 197, 94, 0.12)',
    warning: '#F59E0B', // Warning Yellow
    warningOpacity: 'rgba(245, 158, 11, 0.12)',
    error: '#EF4444', // Error Red
    errorOpacity: 'rgba(239, 68, 68, 0.12)',
    statusBarStyle: 'dark-content',
    statusBarBg: '#F1F5F9',
    headerBg: '#F1F5F9',
    headerText: '#1F2937',
    headerBorder: '#E5E7EB',
    headerIcon: '#1F2937',
    avatarBg: '#4682B4',
    avatarText: '#FFFFFF',
    tabBarBg: '#4682B4', // Steel Blue from palette
    tabBarBorder: 'transparent',
    tabIconBg: 'rgba(255, 255, 255, 0.2)',
    tabIconColor: '#FFFFFF',
    tabIconInactiveOpacity: 0.6,
    drawerBackground: '#F8FAFC',
    overlay: 'rgba(0, 0, 0, 0.35)',
    disabledBg: '#D1D5DB',
  },
  dark: {
    primary: '#4682B4', // Keeping Steel Blue as Primary
    primaryDark: '#3A6C95',
    primaryOpacity: 'rgba(70, 130, 180, 0.2)',
    secondary: '#C37125',
    secondaryOpacity: 'rgba(195, 113, 37, 0.2)',
    background: '#0F172A', // Slate 900
    surface: '#1E293B', // Slate 800
    surfaceAlt: '#334155',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    border: '#334155',
    notification: '#F87171',
    onPrimary: '#FFFFFF',
    success: '#4ADE80',
    successOpacity: 'rgba(74, 222, 128, 0.15)',
    warning: '#FBBF24',
    warningOpacity: 'rgba(251, 191, 36, 0.15)',
    error: '#F87171',
    errorOpacity: 'rgba(248, 113, 113, 0.15)',
    statusBarStyle: 'light-content',
    statusBarBg: '#0F172A',
    headerBg: '#1E293B',
    headerText: '#F8FAFC',
    headerBorder: '#334155',
    headerIcon: '#F8FAFC',
    avatarBg: '#4682B4',
    avatarText: '#FFFFFF',
    tabBarBg: '#1E293B',
    tabBarBorder: '#334155',
    tabIconBg: 'rgba(195, 113, 37, 0.15)',
    tabIconColor: '#C37125',
    tabIconInactiveOpacity: 0.6,
    drawerBackground: '#1E293B',
    overlay: 'rgba(0, 0, 0, 0.45)',
    disabledBg: '#334155',
  },
};

export const typography = {
  h1: { fontFamily: 'sans-serif-Bold', fontSize: 32 },
  h2: { fontFamily: 'sans-serif-Bold', fontSize: 28 },
  h3: { fontFamily: 'sans-serif-Bold', fontSize: 26 },
  title1: { fontFamily: 'sans-serif-Medium', fontSize: 20 },
  title2: { fontFamily: 'sans-serif-Medium', fontSize: 18 },
  subtitle1: { fontFamily: 'sans-serif-Light', fontSize: 18, opacity: 0.5 },
  subtitle2: { fontFamily: 'sans-serif-Light', fontSize: 16, opacity: 0.5 },
  body1: { fontFamily: 'Inter-Regular', fontSize: 16 },
  body2: { fontFamily: 'Inter-Regular', fontSize: 14 },
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


