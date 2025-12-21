import React from 'react';
import { TextInput, View, Text, TextInputProps, Platform } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

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
    const isError = !!error;
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <View className={`mb-4 ${containerClassName}`}>
            <Text className="text-sm font-bold text-gray-900 mb-1.5">
                {label}
            </Text>
            <View className="relative">
                <TextInput
                    className={`px-4 border rounded-2xl text-base ${isError
                        ? 'border-red-500 bg-white'
                        : isFocused
                            ? 'border-[#4682B4] bg-white'
                            : 'border-gray-200 bg-white'
                        } text-gray-900 shadow-sm`}
                    style={{
                        height: 56,
                        textAlignVertical: 'center',
                        ...(Platform.OS === 'ios' ? { paddingTop: 0, paddingBottom: 0 } : {})
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholderTextColor="#9ca3af"
                    value={value}
                    {...props}
                />

                {/* Right Icon */}
                <View className="absolute right-3 top-0 bottom-0 justify-center">
                    {isError && (
                        <AlertCircle size={20} color="#EF4444" />
                    )}
                </View>
            </View>
        </View>
    );
}
