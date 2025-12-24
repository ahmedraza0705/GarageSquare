// ============================================
// PROFILE SCREEN
// ============================================

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                        } catch (error) {
                            console.error('Logout failed', error);
                            Alert.alert('Error', 'Failed to logout');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header / Banner */}
            <View className="h-40 bg-gray-900 justify-center items-center">
                <Text className="text-white text-2xl font-bold">My Profile</Text>
            </View>

            {/* Profile Card */}
            <View className="px-4 -mt-12 mb-6">
                <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 items-center">
                    <View className="w-24 h-24 bg-gray-200 rounded-full mb-4 justify-center items-center border-4 border-white shadow-sm overflow-hidden">
                        <Image
                            source={{ uri: 'https://via.placeholder.com/150' }}
                            className="w-full h-full"
                        />
                    </View>
                    <Text className="text-xl font-bold text-gray-900">John Doe ({user?.email})</Text>
                    <Text className="text-blue-600 font-semibold">Senior Technician</Text>
                    <View className="bg-gray-100 px-3 py-1 rounded-full mt-2">
                        <Text className="text-xs text-gray-500">ID: TECH-042</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-4">
                <Text className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Performance Stats</Text>

                <View className="flex-row justify-between mb-6">
                    <View className="w-[48%] bg-green-50 p-4 rounded-xl border border-green-100 items-center">
                        <Text className="text-3xl font-bold text-green-700">142</Text>
                        <Text className="text-xs text-green-800 font-semibold mt-1">Jobs Completed</Text>
                    </View>
                    <View className="w-[48%] bg-blue-50 p-4 rounded-xl border border-blue-100 items-center">
                        <Text className="text-3xl font-bold text-blue-700">4.8</Text>
                        <Text className="text-xs text-blue-800 font-semibold mt-1">Rating</Text>
                    </View>
                </View>

                <Text className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Settings</Text>

                <View className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                    <TouchableOpacity className="p-4 border-b border-gray-100 flex-row justify-between items-center">
                        <Text className="text-gray-700 font-medium">Change Password</Text>
                        <Text className="text-gray-400">›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="p-4 border-b border-gray-100 flex-row justify-between items-center">
                        <Text className="text-gray-700 font-medium">Notification Preferences</Text>
                        <Text className="text-gray-400">›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="p-4 flex-row justify-between items-center">
                        <Text className="text-gray-700 font-medium">Help & Support</Text>
                        <Text className="text-gray-400">›</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    className="bg-red-50 py-4 rounded-xl border border-red-100 mb-10"
                    onPress={handleLogout}
                >
                    <Text className="text-red-600 text-center font-bold">Logout</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}
