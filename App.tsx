// ============================================
// APP ENTRY POINT
// ============================================

import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, StatusBar } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import './global.css';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

function AppContent() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.statusBarBg} />
      <RootNavigator />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

