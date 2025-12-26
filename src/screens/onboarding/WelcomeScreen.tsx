import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';

export default function WelcomeScreen() {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <View className="flex-1 items-center justify-center px-6">
                <View className="items-center mb-8">
                    {/* Find a better image or use a placeholder */}
                    <View className="w-64 h-64 bg-blue-100 rounded-full items-center justify-center mb-8">
                        <Text className="text-6xl">🔧</Text>
                    </View>
                </View>

                <Text className="text-2xl font-bold text-center mb-4 text-gray-900">
                    Your Workshop, Your Way
                </Text>

                <Text className="text-gray-500 text-center mb-12 px-4 leading-6">
                    Tailored servicing for every vehicle. Track progress, approve estimates, and stay updated — all in one smooth experience.
                </Text>

                <TouchableOpacity
                    className="w-full bg-blue-600 py-4 rounded-xl items-center mb-4 shadow-sm"
                    onPress={() => navigation.navigate('PersonalDetails')}
                >
                    <Text className="text-white font-semibold text-lg">Continue</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="py-2"
                    onPress={() => navigation.navigate('PersonalDetails')} // Skip behavior? Might be same as continue or skip specific steps. For now proceed.
                >
                    <Text className="text-orange-500 font-medium">Skip</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
