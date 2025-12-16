import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Linking, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Branch } from '@/types';
import { Ionicons } from '@expo/vector-icons';

export default function BranchDetailsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { branch, onDelete } = route.params as { branch: Branch, onDelete?: (id: string) => void };

    // Mock data for display since these fields aren't in the Branch type yet
    const operatingHours = [
        { day: 'Monday', time: '9:30 - 6:00' },
        { day: 'Tuesday', time: '9:30 - 6:00' },
        { day: 'Wednesday', time: '9:30 - 6:00' },
        { day: 'Thursday', time: '9:30 - 6:00' },
        { day: 'Friday', time: '9:30 - 6:00' },
        { day: 'Saturday', time: '9:30 - 6:00' },
        { day: 'Sunday', time: 'Closed' },
    ];

    const alerts = [
        'Inventory shortage',
        'Employee Shortage',
        'Less revenue'
    ];

    const handleCall = () => {
        if (branch.phone) Linking.openURL(`tel:${branch.phone}`);
    };

    const handleEmail = () => {
        if (branch.email) Linking.openURL(`mailto:${branch.email}`);
    };

    const handleDelete = () => {
        Alert.alert('Delete Branch', 'Are you sure you want to delete this branch?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    if (onDelete) {
                        onDelete(branch.id);
                        navigation.goBack();
                    }
                }
            }
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 px-5 pt-6">

                {/* Header Card */}
                <View className="bg-white rounded-[20px] p-6 shadow-sm border border-orange-50 mb-4 items-center">
                    <Text className="text-2xl font-bold text-gray-900 mb-1 text-center">{branch.name}</Text>
                    <Text className="text-gray-900 font-bold mb-3 text-center text-lg">Workshop, Vesu</Text>
                    <View className="flex-row items-center justify-center">
                        <Ionicons name="location-outline" size={18} color="#4B5563" />
                        <Text className="text-gray-500 text-sm ml-1 text-center" numberOfLines={2}>
                            {branch.address || '1234, Main St. Vesu, Surat, Gujarat'} <Text className="font-bold underline text-gray-900">(MAP)</Text>
                        </Text>
                    </View>
                </View>

                {/* Middle Section: Alerts and Manager */}
                <View className="flex-row mb-4 h-48">

                    {/* Alerts Card */}
                    <View className="flex-[0.8] bg-white rounded-[20px] p-4 shadow-sm border border-orange-50 mr-3 justify-between">
                        <View>
                            <View className="flex-row items-center mb-4">
                                <Ionicons name="warning-outline" size={20} color="#000" />
                                <Text className="font-bold text-gray-900 ml-2 text-base">Alerts</Text>
                            </View>
                            <View className="space-y-3">
                                {alerts.map((alert, index) => (
                                    <Text key={index} className="text-gray-500 text-xs font-medium">{alert}</Text>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Manager Card */}
                    <View className="flex-1 bg-white rounded-[20px] p-4 shadow-sm border border-orange-50 justify-between">
                        <View className="flex-row items-center mb-2">
                            <View className="w-10 h-10 rounded-full bg-[#4A72B2] items-center justify-center mr-3">
                                <Text className="text-white font-bold text-sm">{(branch.manager_id || 'AR').substring(0, 2).toUpperCase()}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>{branch.manager_id || 'Ahmed Raza'}</Text>
                                <Text className="text-[10px] text-gray-500" numberOfLines={1}>Branch Manager</Text>
                            </View>
                        </View>

                        <View className="space-y-2">
                            <TouchableOpacity onPress={handleCall} className="bg-[#4A72B2] flex-row items-center px-3 py-2.5 rounded-xl w-full">
                                <Ionicons name="call" size={14} color="white" />
                                <Text className="text-white text-[10px] font-bold ml-2">{branch.phone || '+91 96622 80843'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleEmail} className="bg-gray-100 flex-row items-center px-3 py-2.5 rounded-xl w-full border border-gray-200">
                                <Ionicons name="mail" size={14} color="#4A72B2" />
                                <Text className="text-gray-600 text-[10px] font-medium ml-2" numberOfLines={1}>{branch.email || 'ahmed.raza@gmail.com'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Operating Hours */}
                <View className="bg-white rounded-[20px] p-5 shadow-sm border border-orange-50 mb-6">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="time-outline" size={22} color="#000" />
                        <Text className="text-lg font-bold text-gray-900 ml-2">Operating Hours</Text>
                    </View>

                    <View className="space-y-2">
                        {operatingHours.map((item, index) => (
                            <View key={index} className="flex-row justify-between items-center">
                                <Text className="text-gray-500 text-sm">{item.day}</Text>
                                <Text className={`text-sm font-bold ${item.time === 'Closed' ? 'text-red-500' : 'text-gray-600'}`}>
                                    {item.time}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Footer Buttons */}
                <View className="flex-row justify-between mb-10 gap-2">
                    <TouchableOpacity onPress={handleDelete} className="border border-red-200 rounded-xl px-4 py-3 bg-white shadow-sm min-w-[80px] items-center">
                        <Text className="text-red-500 font-bold">Delete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="border border-green-200 rounded-xl px-6 py-3 bg-white shadow-sm min-w-[80px] items-center">
                        <Text className="text-green-800 font-bold">Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 bg-white border border-[#EAC4A0] rounded-xl py-3 shadow-sm items-center justify-center"
                        onPress={() => (navigation as any).navigate('BranchExtendedInfo', { branch })}
                    >
                        <Text className="text-gray-800 font-bold">Branch Information</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
