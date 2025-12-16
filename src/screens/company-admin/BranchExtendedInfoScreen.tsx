import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Branch } from '@/types';
import { Ionicons } from '@expo/vector-icons';

export default function BranchExtendedInfoScreen() {
    const route = useRoute();
    const { branch } = route.params as { branch: Branch };

    // Mock data matching the image
    const stats = [
        { title: 'Jobs Today', value: '22' },
        { title: 'Jobs in Progress', value: '10' },
        { title: 'Pending Payment', value: '22' },
        { title: 'Revenue Week', value: '25,000' },
        { title: 'Revenue Month', value: '2,50,000' },
        { title: 'Revenue Year', value: '25,00,000' },
    ];

    const inventory = [
        { name: 'OIL', status: '12 Units remaining', color: 'text-gray-600' },
        { name: 'Tyre Stock', status: 'Out of Stock', color: 'text-red-500' },
        { name: 'Brake Fluid', status: '3 Units remaining', color: 'text-gray-600' },
        { name: 'Coolant', status: '16 Units remaining', color: 'text-gray-600' },
    ];

    const staff = [
        { role: 'Branch Manager', count: 1 },
        { role: 'Supervisor', count: 4 },
        { role: 'Technician Manager', count: 10 },
        { role: 'Technician', count: 40 },
    ];

    const vehiclesStatus = [
        { status: 'Check In', count: 12 },
        { status: 'In Progress', count: 10 },
        { status: 'On Hold', count: 10 },
        { status: 'Ready To Deliver', count: 12 },
        { status: 'Delivered', count: 18 },
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 px-5 pt-6 pb-20">

                {/* Stats Grid */}
                <View className="flex-row flex-wrap justify-between mb-2">
                    {stats.map((stat, index) => (
                        <View key={index} className="w-[48%] bg-white rounded-[20px] p-4 mb-3 shadow-sm border border-gray-200">
                            <Text className="text-gray-900 text-xs font-bold mb-2">{stat.title}</Text>
                            <Text className="text-xl font-bold text-gray-900">{stat.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Inventory Status */}
                <View className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-200 mb-4 h-64 justify-between">
                    <View>
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="cube-outline" size={24} color="#000" />
                            <Text className="text-lg font-bold text-gray-900 ml-2">Inventory Status</Text>
                        </View>

                        <View className="space-y-3">
                            {inventory.map((item, index) => (
                                <View key={index} className="flex-row justify-between">
                                    <Text className="text-gray-500 font-medium">{item.name}</Text>
                                    <Text className={`text-sm ${item.color.replace('text-gray-600', 'text-gray-500')}`}>{item.status}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity className="w-full py-2.5 bg-white rounded-full border border-gray-300 items-center">
                        <Text className="text-gray-600 font-medium text-sm">Open Branch Inventory</Text>
                    </TouchableOpacity>
                </View>

                {/* Staff and Vehicles Row */}
                <View className="flex-row justify-between">

                    {/* Staff */}
                    <View className="w-[48%] bg-white rounded-[20px] p-4 shadow-sm border border-gray-200">
                        <Text className="text-lg font-bold text-gray-900 mb-4">Staff</Text>
                        <View className="space-y-3">
                            {staff.map((s, i) => (
                                <View key={i} className="flex-row justify-between items-center">
                                    <Text className="text-gray-500 text-[11px] flex-1 mr-1" numberOfLines={1}>{s.role}</Text>
                                    <Text className="text-gray-900 font-bold text-sm">{s.count}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Vehicles Status */}
                    <View className="w-[48%] bg-white rounded-[20px] p-4 shadow-sm border border-gray-200">
                        <Text className="text-lg font-bold text-gray-900 mb-4">Vehicles Status</Text>
                        <View className="space-y-3">
                            {vehiclesStatus.map((v, i) => (
                                <View key={i} className="flex-row justify-between items-center">
                                    <Text className="text-gray-500 text-[11px] flex-1 mr-1">{v.status}</Text>
                                    <Text className="text-gray-900 font-bold text-sm">{v.count}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                </View>
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
