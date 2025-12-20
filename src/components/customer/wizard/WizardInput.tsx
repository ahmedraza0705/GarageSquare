import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps, TouchableOpacity, Image } from 'react-native';

interface WizardInputProps extends TextInputProps {
    label: string;
    error?: string;
    touched?: boolean;
    value?: string;
    containerClassName?: string;
}

export default function WizardInput({
    label,
    error,
    touched,
    value,
    containerClassName = '',
    ...props
}: WizardInputProps) {
    const hasValue = value && value.length > 0;
    const isError = !!error;
    const isSuccess = touched && !error && hasValue;

    return (
        <View className={`mb-3 ${containerClassName}`}>
            <Text className="text-sm font-semibold text-gray-900 mb-1.5">
                {label}
            </Text>
            <View className="relative">
                <TextInput
                    className={`px-4 py-3.5 border rounded-lg text-base ${isError
                        ? 'border-red-400 bg-red-50'
                        : isSuccess
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        } text-gray-900`}
                    placeholderTextColor="#9ca3af"
                    value={value}
                    {...props}
                />

                {/* Right Icon */}
                <View className="absolute right-3 top-0 bottom-0 justify-center">
                    {isError && (
                        <View className="w-5 h-5 rounded-full bg-red-500 items-center justify-center">
                            <Text className="text-white text-xs font-bold">!</Text>
                        </View>
                    )}
                    {isSuccess && (
                        <View className="w-5 h-5 rounded-full bg-green-500 items-center justify-center">
                            <Text className="text-white text-xs font-bold">✓</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}
