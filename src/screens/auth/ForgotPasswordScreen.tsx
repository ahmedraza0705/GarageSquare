// ============================================
// FORGOT PASSWORD SCREEN
// ============================================

import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validate()) return;

    try {
      await resetPassword(email);
      setSent(true);
      Alert.alert(
        'Email Sent',
        'Please check your email for password reset instructions.'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    }
  };

  if (sent) {
    return (
      <View className="flex-1 bg-white justify-center px-6">
        <View className="items-center">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            Check Your Email
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            We've sent password reset instructions to {email}
          </Text>
          <Button
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Reset Password
          </Text>
          <Text className="text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
        </View>

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={error}
        />

        <Button
          title="Send Reset Link"
          onPress={handleResetPassword}
          loading={loading}
          className="mt-4"
        />

        <View className="mt-6 flex-row justify-center">
          <Text
            className="text-primary-600 font-medium"
            onPress={() => navigation.navigate('Login')}
          >
            Back to Login
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

