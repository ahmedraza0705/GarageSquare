import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StatusBar, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TechnicianDashboard() {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);

    // Mock Data mimicking the screenshot
    // Ideally this would be fetched or filtered for the Technician context if different,
    // but the request was "same dashboard", so we keep the visuals identical.
    const activeJobs = 25;
    const customers = 68;
    const vehicles = 60;
    const invoices = 5;

    const checkIn = 7;
    const processing = 10;
    const delivered = 20;

    const staffTotal = 20;
    const staffAvailable = 10;

    const tasks = [
        {
            id: '1',
            tag: 'Urgent',
            tagColor: 'bg-red-500',
            jobId: 'Job Card SA0001',
            price: '₹21,500',
            vehicleName: 'Honda City',
            vehicleReg: 'GJ-05-2134',
            customer: 'Ahmed',
            tech: 'Ahmed raza',
            date: '09-12-2025',
            due: '3:00 PM',
        },
        {
            id: '2',
            tag: 'Waiting',
            tagColor: 'bg-amber-400',
            jobId: 'Job Card SA0002',
            price: '₹10,000',
            vehicleName: 'i20',
            vehicleReg: 'GJ-05-2234',
            customer: 'Ahmed',
            tech: 'Ahmed raza',
            date: '09-12-2025',
            due: '3:00 PM',
        },
    ];

    const onRefresh = async () => {
        setRefreshing(true);
        // Simulate data fetch
        setTimeout(() => setRefreshing(false), 1000);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            {/* Header */}
            <View className="px-5 pt-2 pb-4 flex-row justify-between items-center bg-slate-50">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity>
                        <Ionicons name="menu" size={28} color="#1e293b" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-900">Dashboard</Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity className="p-1.5 rounded-full bg-slate-200">
                        <Ionicons name="moon-outline" size={20} color="#1e293b" />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-1.5 rounded-full bg-slate-200">
                        <Ionicons name="sunny-outline" size={20} color="#1e293b" />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-1.5 rounded-full bg-green-200">
                        <Ionicons name="add" size={20} color="#166534" />
                    </TouchableOpacity>
                    <View className="w-8 h-8 rounded-full bg-red-200 items-center justify-center border border-red-300">
                        <Text className="text-red-800 font-bold">A</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            >

                {/* 2x2 Stats Grid */}
                <View className="flex-row gap-3 mb-3">
                    {/* Active Jobs */}
                    <View className="flex-1 bg-[#3b82f6] p-4 rounded-xl shadow-sm h-32 justify-between">
                        <View className="flex-row justify-between items-start">
                            <Text className="text-white text-xs font-medium">Active Jobs</Text>
                            <Ionicons name="build-outline" size={24} color="white" />
                        </View>
                        <View>
                            <Text className="text-4xl font-bold text-white mb-1">{activeJobs}</Text>
                            <Text className="text-white/80 text-[10px]">+10%</Text>
                        </View>
                    </View>

                    {/* Customers */}
                    <View className="flex-1 bg-white p-4 rounded-xl shadow-sm h-32 justify-between">
                        <View className="flex-row justify-between items-start">
                            <Text className="text-slate-500 text-xs font-medium">Customers</Text>
                            <Ionicons name="people-outline" size={24} color="#334155" />
                        </View>
                        <View>
                            <Text className="text-4xl font-bold text-slate-900 mb-1">{customers}</Text>
                            <Text className="text-green-500 text-[10px] font-bold">↑12%</Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row gap-3 mb-4">
                    {/* Vehicle */}
                    <View className="flex-1 bg-white p-4 rounded-xl shadow-sm h-32 justify-between">
                        <View className="flex-row justify-between items-start">
                            <Text className="text-slate-500 text-xs font-medium">Vehicle</Text>
                            <Ionicons name="car-outline" size={24} color="#000" />
                        </View>
                        <View>
                            <Text className="text-4xl font-bold text-slate-900 mb-1">{vehicles}</Text>
                            <Text className="text-green-500 text-[10px] font-bold">↑9%</Text>
                        </View>
                    </View>

                    {/* Invoice */}
                    <View className="flex-1 bg-[#d97706] p-4 rounded-xl shadow-sm h-32 justify-between">
                        <View className="flex-row justify-between items-start">
                            <Text className="text-white text-xs font-medium">Invoice</Text>
                            <Ionicons name="receipt-outline" size={24} color="white" />
                        </View>
                        <View>
                            <Text className="text-4xl font-bold text-white mb-1">{invoices}</Text>
                            <Text className="text-white/80 text-[10px] font-bold">↑10%</Text>
                        </View>
                    </View>
                </View>

                {/* Status Row */}
                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1 bg-white p-3 rounded-xl shadow-sm">
                        <Text className="text-slate-600 text-xs mb-1">Check-in</Text>
                        <Text className="text-2xl font-bold text-slate-900">{checkIn}</Text>
                    </View>
                    <View className="flex-1 bg-white p-3 rounded-xl shadow-sm">
                        <Text className="text-slate-600 text-xs mb-1">Processing</Text>
                        <Text className="text-2xl font-bold text-slate-900">{processing}</Text>
                    </View>
                    <View className="flex-1 bg-white p-3 rounded-xl shadow-sm">
                        <Text className="text-slate-600 text-xs mb-1">Delivered</Text>
                        <Text className="text-2xl font-bold text-slate-900">{delivered}</Text>
                    </View>
                </View>

                {/* Staff Section */}
                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1 bg-white p-3 rounded-xl shadow-sm flex-row justify-between items-end">
                        <View>
                            <Text className="text-slate-900 text-sm font-semibold mb-2">Staff</Text>
                            <Text className="text-slate-500 text-xs">Technician</Text>
                        </View>
                        <Text className="text-slate-900 text-sm font-semibold">{staffTotal}</Text>
                    </View>
                    <View className="flex-1 bg-white p-3 rounded-xl shadow-sm flex-row justify-between items-end">
                        <View>
                            <Text className="text-slate-900 text-sm font-semibold mb-2">Available Staff</Text>
                            <Text className="text-slate-500 text-xs">Technician</Text>
                        </View>
                        <Text className="text-slate-900 text-sm font-semibold">{staffAvailable}</Text>
                    </View>
                </View>

                {/* To-Do List */}
                <View className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                    <View className="p-3 border-b border-slate-100">
                        <Text className="text-slate-900 font-bold">To-Do list</Text>
                    </View>

                    {tasks.map((task, index) => (
                        <View key={task.id} className={`border-b border-slate-100 ${index === tasks.length - 1 ? 'border-b-0' : ''}`}>
                            <TouchableOpacity
                                className="flex-row items-center justify-between p-2"
                                onPress={() => (navigation as any).navigate('JobCardDetail', { job: task })}
                            >
                                <View className="flex-row items-center gap-2">
                                    <View className={`${task.tagColor} px-3 py-1 rounded-md`}>
                                        <Text className="text-white text-xs font-bold">{task.tag}</Text>
                                    </View>
                                    <Text className="text-slate-900 font-medium text-sm">{task.jobId}</Text>
                                </View>
                                <View className="bg-gray-500 px-2 py-1 rounded">
                                    <Text className="text-white text-xs">{task.price}</Text>
                                </View>
                            </TouchableOpacity>

                            <View className="flex-row p-3 gap-4">
                                <View className="justify-center">
                                    <Ionicons name="car" size={32} color="black" />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row justify-between mb-0.5">
                                        <Text className="text-slate-500 text-xs w-20">Vehicle</Text>
                                        <Text className="text-slate-900 text-xs flex-1">{task.vehicleName}</Text>
                                        <Text className="text-slate-900 text-xs">{task.vehicleReg}</Text>
                                    </View>
                                    <View className="flex-row justify-between mb-0.5">
                                        <Text className="text-slate-500 text-xs w-20">Customer :</Text>
                                        <Text className="text-slate-900 text-xs flex-1">{task.customer}</Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-slate-500 text-xs w-20">Assigned tech:</Text>
                                        <Text className="text-slate-900 text-xs flex-1">{task.tech}</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row justify-between px-3 pb-3">
                                <Text className="text-slate-500 text-[10px]">Delivery date: {task.date}</Text>
                                <Text className="text-slate-900 text-[10px] font-medium">Delivery due: {task.due}</Text>
                            </View>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
