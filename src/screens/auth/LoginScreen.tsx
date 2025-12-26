// ============================================
// LOGIN SCREEN
// ============================================

import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import Input from '@/components/shared/Input';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      // Trim email to avoid whitespace issues, but keep password as-is
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const rawPassword = password;

      console.log('Login attempt:', {
        email: trimmedEmail,+
        passwordLength: rawPassword.length,
      });

    await signIn({ email: trimmedEmail, password: trimmedPassword });
    await signIn({ email: trimmedEmail, password: rawPassword });
  } catch (error: any) {
    console.error('Login error:', error);
    Alert.alert('Login Failed', error.message || 'Invalid email or password');
  }
};

return (
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    className="flex-1 bg-[#F5F5F5]"
  >
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false as boolean}
    >
      {/* Logo Section */}
      <View className="items-center mb-6 mt-4">
        <Image
          source={require('@/assets/login_logo.png')}
          style={{ width: 150, height: 100 }}
          resizeMode="contain"
          fadeDuration={0}
        />
      </View>

      {/* Title */}
      <Text className="text-3xl font-bold text-gray-900 mb-8">
        Log In
      </Text>

      {/* Email Address Field */}
      <Input
        label="Email Address"
        placeholder="Enter Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
      />

      {/* Password Field */}
      <Input
        label="Password"
        placeholder="Enter Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        error={errors.password}
        showPasswordToggle
      />

      {/* Forgot Password Link */}
      <TouchableOpacity
        onPress={() => navigation.navigate('ForgotPassword')}
        className="mb-6"
      >
        <Text className="text-gray-600 underline">Forgot Password?</Text>
      </TouchableOpacity>

      {/* Log In Button */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className={`py-4 rounded-lg items-center justify-center mb-4 ${loading ? 'bg-gray-300' : 'bg-blue-600'
          }`}
      >
        {loading ? (
          <Text className="text-gray-600 font-semibold">Logging in...</Text>
        ) : (
          <Text className="text-white font-semibold text-base">
            Log in
          </Text>
        )}
      </TouchableOpacity>

      {/* Separator */}
      <View className="flex-row items-center justify-center mb-4">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-4 text-gray-500">or</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      {/* Google Login Button */}
      <TouchableOpacity
        className="bg-white border border-gray-300 rounded-lg py-4 items-center justify-center mb-6"
        onPress={() => {
          // TODO: Implement Google Sign-In
          Alert.alert('Google Sign-In', 'Google Sign-In will be implemented soon');
        }}
      >
        <View className="w-6 h-6 relative">
          <View className="absolute left-0 top-0 w-3 h-3 bg-[#EA4335] rounded-tl-full" />
          <View className="absolute right-0 top-0 w-3 h-3 bg-[#FBBC05] rounded-tr-full" />
          <View className="absolute left-0 bottom-0 w-3 h-3 bg-[#34A853] rounded-bl-full" />
          <View className="absolute right-0 bottom-0 w-3 h-3 bg-[#4285F4] rounded-br-full" />
        </View>
      </TouchableOpacity>

      {/* Footer */}
      <View className="flex-row justify-center items-center mb-8">
        <Text className="text-gray-600">Don't Have An Account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text className="text-orange-500 font-semibold underline">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
);
}
