import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function CompletedJobsScreen() {
    const navigation = useNavigation();

    // Mock Data
    const completedJobs = [
        {
            id: 'jb3',
            job_card_no: 'SA0005',
            price: '₹5,500',
            vehicle: { make: 'Maruti', model: 'Swift', reg: 'KA-01-XY-9876' },
            assigned_to: 'Technician',
            status: 'Completed',
            completed_on: '06-01-2026'
        },
        {
            id: 'jb1',
            job_card_no: 'SA0001',
            price: '₹2,500',
            vehicle: { make: 'Honda', model: 'City', reg: 'MH-12-AB-1234' },
            assigned_to: 'Technician',
            status: 'Completed',
            completed_on: '05-01-2026'
        }
    ];

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white rounded-xl p-4 mb-3 border border-slate-200">
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base font-bold text-slate-900">Job Card {item.job_card_no}</Text>
                <View className="bg-green-100 px-2 py-1 rounded">
                    <Text className="text-xs font-bold text-green-700">{item.status}</Text>
                </View>
            </View>
            <Text className="text-slate-600 mb-1">{item.vehicle.make} {item.vehicle.model} - {item.vehicle.reg}</Text>
            <Text className="text-slate-500 text-xs">Completed on: {item.completed_on}</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-[#f1f5f9]">
            {/* Header */}
            <View className="flex-row items-center px-5 pt-12 pb-4 bg-white border-b border-slate-200">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Completed Jobs</Text>
            </View>

            <FlatList
                data={completedJobs}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 20 }}
            />
        </View>
    );
}
