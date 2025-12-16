// ============================================
// BUTTON COMPONENT
// ============================================

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  style,
  textStyle,
}: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-lg items-center justify-center flex-row';
  
  const variantClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    outline: 'border-2 border-primary-600 bg-transparent',
    danger: 'bg-red-600',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary-600',
    danger: 'text-white',
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${isDisabled ? 'opacity-50' : ''} ${className}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? '#0ea5e9' : '#ffffff'} 
          size="small" 
        />
      ) : (
        <Text className={`font-semibold text-base ${textVariantClasses[variant]}`} style={textStyle}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

