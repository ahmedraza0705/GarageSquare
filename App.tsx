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

import {
  useFonts,
  Ubuntu_300Light,
  Ubuntu_400Regular,
  Ubuntu_500Medium,
  Ubuntu_700Bold,
} from '@expo-google-fonts/ubuntu';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

function AppContent() {
  const { theme } = useTheme();

  const [fontsLoaded] = useFonts({
    'Ubuntu-Light': Ubuntu_300Light,
    'Ubuntu-Regular': Ubuntu_400Regular,
    'Ubuntu-Medium': Ubuntu_500Medium,
    'Ubuntu-Bold': Ubuntu_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

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

