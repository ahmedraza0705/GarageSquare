import React from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';

export default function WelcomeScreen() {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <View className="flex-1 items-center justify-center px-6">
                <View className="items-center mb-8">
                    <View
                        style={{ backgroundColor: theme.primary }}
                        className="w-64 h-64 rounded-full items-center justify-center mb-8 shadow-sm"
                    >
                        <Text className="text-6xl">🔧</Text>
                    </View>
                </View>

                <Text className="text-3xl font-bold text-center mb-4 text-gray-900">
                    Your Workshop, Your Way
                </Text>

                <Text className="text-gray-500 text-center mb-12 px-8 leading-6 text-lg">
                    Tailored servicing for every vehicle. Track progress, approve estimates, and stay updated — all in one smooth experience.
                </Text>

                <TouchableOpacity
                    style={{ backgroundColor: theme.primary }}
                    className="w-full py-4 rounded-2xl items-center mb-4 shadow-sm"
                    onPress={() => navigation.navigate('PersonalDetails')}
                >
                    <Text className="text-white font-bold text-lg">Continue</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="py-2"
                    onPress={() => navigation.navigate('PersonalDetails')}
                >
                    <Text className="text-orange-500 font-bold text-base">Skip Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
