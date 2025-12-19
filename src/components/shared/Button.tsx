// ============================================
// BUTTON COMPONENT
// ============================================

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

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
  const { theme } = useTheme();
  const baseClasses = 'px-6 py-3 rounded-lg items-center justify-center flex-row';

  const variantClasses = {
    primary: '',
    secondary: 'bg-secondary-600',
    outline: 'border-2 bg-transparent',
    danger: 'bg-red-600',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: '',
    danger: 'text-white',
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${isDisabled ? 'opacity-50' : ''} ${className}`}
      style={[
        variant === 'primary' && { backgroundColor: theme.primary },
        variant === 'outline' && { borderColor: theme.primary },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? theme.primary : '#ffffff'}
          size="small"
        />
      ) : (
        <Text
          className={`font-semibold text-base ${textVariantClasses[variant]}`}
          style={[{ color: variant === 'outline' ? theme.primary : (variant === 'primary' ? '#fff' : undefined) }, textStyle]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

