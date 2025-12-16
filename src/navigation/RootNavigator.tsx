// ============================================
// ROOT NAVIGATOR
// ============================================

import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import RoleBasedNavigator from './RoleBasedNavigator';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const { theme, themeName } = useTheme();

  const navigationTheme: NavigationTheme = React.useMemo(() => {
    const base = themeName === 'dark' ? DarkTheme : DefaultTheme;

    return {
      ...base,
      dark: themeName === 'dark',
      colors: {
        ...base.colors,
        primary: theme.primary,
        background: theme.background,
        card: theme.surface,
        text: theme.text,
        border: theme.border,
        notification: theme.notification,
      },
    };
  }, [theme, themeName]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="App" component={RoleBasedNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

