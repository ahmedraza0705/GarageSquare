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
    background: '#F1F5F9', // Steel bluish gray for background
    surface: '#FFFFFF',
    surfaceAlt: '#E2E8F0',
    text: '#272727',
    textMuted: '#64748B',
    border: '#E2E8F0',
    notification: '#EF4444',
    onPrimary: '#FFFFFF',
    statusBarStyle: 'dark-content',
    statusBarBg: '#F1F5F9',
    headerBg: '#F1F5F9',
    headerText: '#1F2937',
    headerBorder: '#E5E7EB',
    headerIcon: '#1F2937',
    avatarBg: '#4682B4',
    avatarText: '#FFFFFF',
    tabBarBg: '#4682B4',
    tabBarBorder: 'transparent',
    tabIconBg: 'rgba(70, 130, 180, 0.12)',
    tabIconColor: '#FFFFFF',
    tabIconInactiveOpacity: 0.7,
    drawerBackground: '#F0F9FF',
    overlay: 'rgba(0, 0, 0, 0.35)',
    disabledBg: '#D1D5DB',
  },
  dark: {
    primary: '#C37125', // Autumn Orange
    background: '#0B1222', // Deep Steel Blue
    surface: '#152033', // Steel Blue Surface
    surfaceAlt: '#1E293B',
    text: '#F9FAFB',
    textMuted: '#94A3B8',
    border: '#1E293B',
    notification: '#F87171',
    onPrimary: '#FFFFFF',
    statusBarStyle: 'light-content',
    statusBarBg: '#0B1222',
    headerBg: '#152033',
    headerText: '#F9FAFB',
    headerBorder: '#1E293B',
    headerIcon: '#F9FAFB',
    avatarBg: '#C37125',
    avatarText: '#FFFFFF',
    tabBarBg: '#152033',
    tabBarBorder: '#1E293B',
    tabIconBg: 'rgba(195, 113, 37, 0.14)',
    tabIconColor: '#C37125',
    tabIconInactiveOpacity: 0.6,
    drawerBackground: '#152033',
    overlay: 'rgba(0, 0, 0, 0.45)',
    disabledBg: '#1E293B',
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


