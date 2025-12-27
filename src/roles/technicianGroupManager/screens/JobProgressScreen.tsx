import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { vehicleService } from '@/roles/technician/services/VehicleService';

export default function TeamJobsScreen() {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const loadJobs = async () => {
        const allJobs = vehicleService.getAll();
        // Standardize properties
        const mappedJobs = allJobs.map(v => ({
            ...v,
            id: v.id,
            jobIdDisplay: `JOB-${v.id.substring(0, 4).toUpperCase()}`,
            vehicleText: `${v.make} ${v.model}`,
            status: v.status,
            assigned_to: v.assigned_to || 'Unassigned',
            priority: (v as any).priority || 'Normal',
            eta: '2h 30m' // Mock ETA
        }));
        setJobs(mappedJobs);
    };

    useFocusEffect(
        useCallback(() => { loadJobs(); }, [])
    );

    const getFilteredJobs = () => {
        let result = jobs;

        // 1. Status Filter
        if (filter === 'Pending') result = result.filter(j => j.status === 'Scheduled');
        else if (filter === 'In Progress') result = result.filter(j => j.status === 'In Shop');
        else if (filter === 'Completed') result = result.filter(j => j.status === 'Ready' || j.status === 'Completed');
        else if (filter === 'Overdue') result = result.filter(j => j.priority === 'High' && j.status !== 'Completed');

        // 2. Search
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            result = result.filter(j =>
                j.vehicleText.toLowerCase().includes(lower) ||
                j.reg_number.toLowerCase().includes(lower) ||
                j.assigned_to.toLowerCase().includes(lower)
            );
        }

        return result;
    };

    const StatusBadge = ({ status }: { status: string }) => {
        let bg = 'bg-slate-100';
        let text = 'text-slate-600';

        if (status === 'In Shop') { bg = 'bg-blue-100'; text = 'text-blue-700'; }
        else if (status === 'Completed' || status === 'Ready') { bg = 'bg-green-100'; text = 'text-green-700'; }
        else if (status === 'Scheduled') { bg = 'bg-amber-100'; text = 'text-amber-700'; }

        return (
            <View className={`px-2 py-1 rounded-md ${bg}`}>
                <Text className={`text-[10px] font-bold uppercase ${text}`}>{status}</Text>
            </View>
        );
    };

    const renderJobCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => (navigation as any).navigate('JobCardDetail', { job: item })}
            className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-slate-200"
        >
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-xs font-bold text-slate-400">{item.jobIdDisplay}</Text>
                <StatusBadge status={item.status} />
            </View>

            <Text className="text-base font-bold text-slate-900 mb-1">{item.vehicleText}</Text>
            <View className="flex-row items-center mb-3">
                <Text className="text-xs text-slate-500 mr-2 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{item.reg_number}</Text>
                {item.priority === 'High' && (
                    <Text className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded ml-1">URGENT</Text>
                )}
            </View>

            <View className="h-[1px] bg-slate-100 mb-3" />

            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <View className="w-6 h-6 rounded-full bg-slate-200 items-center justify-center mr-2">
                        <Text className="text-[10px] font-bold text-slate-600">{item.assigned_to.charAt(0)}</Text>
                    </View>
                    <Text className="text-xs text-slate-600 font-medium">{item.assigned_to}</Text>
                </View>
                <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={14} color="#64748b" />
                    <Text className="text-xs text-slate-500 ml-1">ETA: {item.eta}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const FilterPill = ({ label }: { label: string }) => (
        <TouchableOpacity
            onPress={() => setFilter(label)}
            className={`mr-2 px-4 py-2 rounded-full border ${filter === label ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-200'}`}
        >
            <Text className={`text-xs font-bold ${filter === label ? 'text-white' : 'text-slate-600'}`}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="bg-white px-5 pt-12 pb-4 border-b border-slate-200">
                <Text className="text-xl font-bold text-slate-900 mb-4">Team Jobs</Text>
                <View className="flex-row bg-slate-100 rounded-lg px-3 py-2 items-center">
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        placeholder="Search jobs, vehicles, or techs..."
                        className="flex-1 ml-2 text-sm text-slate-900"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Filter Row */}
            <View className="py-4">
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    data={['All', 'Pending', 'In Progress', 'Completed', 'Overdue']}
                    renderItem={({ item }) => <FilterPill label={item} />}
                />
            </View>

            {/* Job List */}
            <FlatList
                data={getFilteredJobs()}
                keyExtractor={item => item.id}
                renderItem={renderJobCard}
                contentContainerStyle={{ padding: 20, paddingTop: 0 }}
                refreshControl={
                    <View className="items-center py-4">
                        <Text className="text-xs text-slate-400">Pull to refresh</Text>
                    </View>
                } // Simplified since onRefresh is strict in TS without full props, or can use standard RefreshControl
                onRefresh={loadJobs}
                refreshing={refreshing}
            />
        </View>
    );
}
