import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function AboutScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">About GarageSquare</Text>
            </View>

            <View className="flex-1 items-center justify-center p-5">
                <View className="w-24 h-24 bg-blue-500 rounded-2xl items-center justify-center mb-6 shadow-lg">
                    <Ionicons name="car-sport" size={48} color="white" />
                </View>
                <Text className="text-2xl font-bold text-slate-900 mb-2">GarageSquare</Text>
                <Text className="text-slate-500 mb-8">Version 1.0.0</Text>

                <Text className="text-center text-slate-600 leading-6 px-4">
                    GarageSquare is the ultimate solution for garage management. Streamline your operations, manage technicians, and boost efficiency.
                </Text>
            </View>
        </SafeAreaView>
    );
}
