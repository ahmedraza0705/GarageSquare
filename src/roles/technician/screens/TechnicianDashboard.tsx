import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import JobCard from '../components/JobCard';
import { technicianStats, technicianJobs } from '../services/mockData';

export default function TechnicianDashboard() {
    const navigation = useNavigation();

    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Here you would typically re-fetch data
        setTimeout(() => setRefreshing(false), 1200);
    }, []);

    const filteredJobs =
        selectedFilter === 'All'
            ? technicianJobs
            : technicianJobs.filter(
                j => j.status === selectedFilter || j.priority === selectedFilter
            );

    const FilterTab = ({ label }: { label: string }) => (
        <TouchableOpacity
            onPress={() => setSelectedFilter(label)}
            className={`px-4 py-1.5 mr-2 rounded-full border ${selectedFilter === label
                ? 'bg-slate-900 border-slate-900'
                : 'bg-white border-slate-200'
                }`}
        >
            <Text
                className={`text-xs font-semibold ${selectedFilter === label
                    ? 'text-white'
                    : 'text-slate-600'
                    }`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#f1f5f9]">
            <StatusBar barStyle='dark-content' />

            {/* ===== FIXED HEADER ===== */}
            <Header title="Dashboard" />

            {/* ===== MAIN SCROLL ===== */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor='#000'
                    />
                }
                contentContainerStyle={{
                    paddingTop: 20,
                    paddingHorizontal: 20,
                    paddingBottom: 120,
                }}
            >
                {/* ===== STATS SLIDER ===== */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 20 }}
                    className="mb-6"
                >
                    <StatCard
                        label="Pending"
                        value={technicianStats.pending}
                        icon="time-outline"
                        color="#3b82f6"
                        onPress={() => setSelectedFilter('Pending')}
                    />
                    <StatCard
                        label="Completed"
                        value={technicianStats.completed}
                        icon="checkmark-done-circle-outline"
                        color="#22c55e"
                        onPress={() => setSelectedFilter('Completed')}
                    />
                    <StatCard
                        label="Efficiency"
                        value={technicianStats.efficiency}
                        icon="flash-outline"
                        color="#f97316"
                        onPress={() => (navigation as any).navigate('Efficiency')}
                    />
                </ScrollView>

                {/* ===== TODO LIST ===== */}
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-bold text-slate-900">
                        To-Do List
                    </Text>
                    <TouchableOpacity onPress={() => (navigation as any).navigate('My Jobs')}>
                        <Text className="text-blue-600 font-bold text-xs">View All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                    <FilterTab label="All" />
                    <FilterTab label="Urgent" />
                    <FilterTab label="In Progress" />
                    <FilterTab label="Pending" />
                    <FilterTab label="Completed" />
                </ScrollView>

                {filteredJobs.length > 0 ? (
                    filteredJobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onPress={() => (navigation as any).navigate('JobCardDetail', { job })}
                        />
                    ))
                ) : (
                    <View className="items-center justify-center py-10 opacity-50">
                        <Ionicons name="documents-outline" size={48} color="#94a3b8" />
                        <Text className="text-slate-500 font-medium mt-2">No jobs found</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
