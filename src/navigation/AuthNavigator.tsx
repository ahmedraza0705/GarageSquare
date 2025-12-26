~// ============================================
// AUTH NAVIGATOR
// ============================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StartingScreen from '@/screens/auth/StartingScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import SignupScreen from '@/screens/auth/SignupScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';

export type AuthStackParamList = {
  Starting: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Starting"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Starting" component={StartingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

