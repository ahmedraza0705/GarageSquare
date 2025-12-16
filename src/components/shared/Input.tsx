// ============================================
// INPUT COMPONENT
// ============================================

import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps, TouchableOpacity } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  showPasswordToggle?: boolean;
  isValid?: boolean;
}

export default function Input({
  label,
  error,
  containerClassName = '',
  showPasswordToggle = false,
  isValid = false,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const showValidationIcon = isValid || error;

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </Text>
      )}
      <View className="relative">
        <TextInput
          className={`px-4 py-3 border rounded-lg pr-12 ${
            error 
              ? 'border-red-500' 
              : isValid 
              ? 'border-green-500' 
              : 'border-gray-300'
          } bg-white text-gray-900`}
          placeholderTextColor="#9ca3af"
          secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
          {...props}
        />
        <View className="absolute right-3 top-0 bottom-0 justify-center flex-row items-center">
          {showPasswordToggle && (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              className="mr-2"
            >
              <Text className="text-gray-500 text-lg">
                {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          )}
          {showValidationIcon && (
            <View className={`w-5 h-5 rounded-full items-center justify-center ${
              error ? 'bg-red-500' : 'bg-green-500'
            }`}>
              <Text className="text-white text-xs font-bold">
                {error ? '!' : '✓'}
              </Text>
            </View>
          )}
        </View>
      </View>
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}

