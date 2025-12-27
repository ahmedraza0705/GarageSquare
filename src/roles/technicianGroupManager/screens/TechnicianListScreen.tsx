import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { vehicleService } from '@/roles/technician/services/VehicleService';
import Header from '@/roles/technician/components/Header';

export default function TechnicianListScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [techs, setTechs] = useState<any[]>([]);

    const loadTechs = async () => {
        // Mocking Technician Data based on assigned jobs
        // In real app, this would come from a Users table
        const allJobs = vehicleService.getAll();

        // Define our team
        const teamMembers = [
            { id: 't1', name: 'Ahmed Raza', status: 'Active' },
            { id: 't2', name: 'Rahul Kumar', status: 'Active' },
            { id: 't3', name: 'John Doe', status: 'Offline' },
            { id: 't4', name: 'Sarah Smith', status: 'Active' },
        ];

        const techsWithStatus = teamMembers.map(tech => {
            const activeJob = allJobs.find(j => j.assigned_to === tech.name && j.status === 'In Shop');
            return {
                ...tech,
                currentJob: activeJob ? `${activeJob.make} ${activeJob.model} (${activeJob.reg_number})` : null,
                jobCount: allJobs.filter(j => j.assigned_to === tech.name && j.status !== 'Completed').length
            };
        });

        setTechs(techsWithStatus);
    };

    useFocusEffect(
        useCallback(() => {
            loadTechs();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTechs();
        setRefreshing(false);
    };

    const renderTech = ({ item }: any) => (
        <View className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-slate-100 flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
                <View className={`w-10 h-10 rounded-full items-center justify-center ${item.status === 'Active' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                    <Text className="font-bold text-slate-700">{item.name.charAt(0)}</Text>
                </View>
                <View>
                    <Text className="font-bold text-slate-800 text-base">{item.name}</Text>
                    <Text className="text-xs text-slate-500">
                        {item.currentJob ? `Working on: ${item.currentJob}` : 'Available'}
                    </Text>
                </View>
            </View>
            <View className="items-end">
                <View className={`px-2 py-1 rounded-full ${item.status === 'Active' ? 'bg-green-100' : 'bg-slate-200'}`}>
                    <Text className={`text-[10px] font-bold ${item.status === 'Active' ? 'text-green-700' : 'text-slate-500'}`}>
                        {item.status}
                    </Text>
                </View>
                {item.jobCount > 0 && (
                    <Text className="text-[10px] text-slate-400 mt-1">{item.jobCount} Jobs Assigned</Text>
                )}
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <Header title="My Team" />
            <FlatList
                data={techs}
                keyExtractor={item => item.id}
                renderItem={renderTech}
                contentContainerStyle={{ padding: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text className="text-center text-slate-400 mt-10">No technicians found.</Text>}
            />
        </View>
    );
}
