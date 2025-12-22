// ============================================
// SIGNUP SCREEN
// ============================================

import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import Input from '@/components/shared/Input';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function SignupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { signUp, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    const emailValid = formData.email.trim() && /\S+@\S+\.\S+/.test(formData.email);
    const passwordValid = formData.password.length >= 6;
    const confirmPasswordValid = formData.confirmPassword && formData.password === formData.confirmPassword;

    return emailValid && passwordValid && confirmPasswordValid && agreedToTerms;
  };

  // Show validation icons only when field has been touched and is valid (no errors)
  const isEmailValid = Boolean(formData.email.trim() && /\S+@\S+\.\S+/.test(formData.email) && !errors.email);
  const isPasswordValid = Boolean(formData.password.length >= 6 && !errors.password && formData.password.length > 0);
  const isConfirmPasswordValid = Boolean(formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && !errors.confirmPassword);

  const handleSignup = async () => {
    if (!validate()) return;

    try {
      const result = await signUp({
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.email.split('@')[0], // Use email prefix as name if no name field
        // Don't pass role_id - let the service handle it based on first user logic
      });

      // At this point, useAuth.signUp has already stored the logged-in user in context.
      // RootNavigator will automatically switch from Auth flow to the App flow.
      // Just inform the user – no need to navigate back to Login.
      Alert.alert(
        'Account Created',
        result.session
          ? 'Your account has been created and you are now logged in.'
          : 'Account created successfully! If required, please check your email to confirm your account.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.message || 'Failed to create account. Please try again.';
      Alert.alert('Signup Failed', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false as boolean}
      >
        {/* Logo Placeholder - You can replace this with your actual logo */}
        <View className="items-center mb-8 mt-8">
          <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
            <Text className="text-white text-3xl">⚙️</Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Sign up
        </Text>

        {/* Email Address Field */}
        <Input
          label="Email Address"
          placeholder="Enter Email Address"
          value={formData.email}
          onChangeText={(text) => {
            setFormData({ ...formData, email: text });
            if (errors.email) {
              setErrors({ ...errors, email: '' });
            }
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
          isValid={isEmailValid}
        />

        {/* Password Field */}
        <Input
          label="Password"
          placeholder="Enter Password"
          value={formData.password}
          onChangeText={(text) => {
            setFormData({ ...formData, password: text });
            if (errors.password) {
              setErrors({ ...errors, password: '' });
            }
            if (errors.confirmPassword && formData.confirmPassword) {
              setErrors({ ...errors, confirmPassword: '' });
            }
          }}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          error={errors.password}
          isValid={isPasswordValid}
          showPasswordToggle
        />

        {/* Confirm Password Field */}
        <Input
          label="Confirm Password"
          placeholder="Enter Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(text) => {
            setFormData({ ...formData, confirmPassword: text });
            if (errors.confirmPassword) {
              setErrors({ ...errors, confirmPassword: '' });
            }
          }}
          secureTextEntry
          autoCapitalize="none"
          error={errors.confirmPassword}
          isValid={isConfirmPasswordValid}
          showPasswordToggle
        />

        {/* Terms & Conditions */}
        <TouchableOpacity
          onPress={() => {
            setAgreedToTerms(!agreedToTerms);
            if (errors.terms) {
              setErrors({ ...errors, terms: '' });
            }
          }}
          className="flex-row items-center mb-6"
        >
          <View className={`w-5 h-5 border-2 rounded mr-2 items-center justify-center ${agreedToTerms ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
            }`}>
            {agreedToTerms && (
              <Text className="text-white text-xs">✓</Text>
            )}
          </View>
          <Text className="text-gray-700 text-sm flex-1">
            I agree to{' '}
            <Text className="text-blue-600 underline">Terms & Conditions</Text>
          </Text>
        </TouchableOpacity>
        {errors.terms && (
          <Text className="text-red-500 text-sm mb-4 -mt-2">{errors.terms}</Text>
        )}

        {/* Create an Account Button */}
        <TouchableOpacity
          onPress={handleSignup}
          disabled={!isFormValid() || loading}
          className={`py-4 rounded-lg items-center justify-center mb-4 ${isFormValid() && !loading
            ? 'bg-blue-600'
            : 'bg-blue-600'
            }`}
        >
          {loading ? (
            <Text className="text-white font-semibold">Creating...</Text>
          ) : (
            <Text className="text-white font-semibold text-base">
              Create an Account
            </Text>
          )}
        </TouchableOpacity>

        {/* Separator */}
        <View className="flex-row items-center justify-center mb-4">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500">or</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Google Sign-up Button */}
        <TouchableOpacity
          className="bg-white border border-gray-300 rounded-lg py-4 items-center justify-center mb-6"
          onPress={() => {
            // TODO: Implement Google Sign-Up
            Alert.alert('Google Sign-Up', 'Google Sign-Up will be implemented soon');
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
          <Text className="text-gray-600">Have An Account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-blue-600 font-semibold">Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

