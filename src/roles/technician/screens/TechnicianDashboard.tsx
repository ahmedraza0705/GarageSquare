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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import JobCard from '../components/JobCard';
import { vehicleService } from '../services/VehicleService';

export default function TechnicianDashboard() {
    const navigation = useNavigation();

    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [jobs, setJobs] = useState<any[]>([]);
    const [stats, setStats] = useState({ pending: 0, completed: 0, efficiency: 'N/A' });

    // Mock User for filtering "My Jobs"
    const CURRENT_USER = 'Ahmed Raza';

    const loadData = async () => {
        await vehicleService.init();
        const allVehicles = vehicleService.getAll();

        // 1. Filter for "My Jobs" (assigned to current user)
        const myJobs = allVehicles.filter(v => v.assigned_to === CURRENT_USER);

        // 2. Calculate Stats
        const pendingCount = myJobs.filter(j => j.status === 'Scheduled' || j.status === 'In Shop').length;
        const completedCount = myJobs.filter(j => j.status === 'Completed' || j.status === 'Ready').length;

        setStats({ pending: pendingCount, completed: completedCount, efficiency: '94%' }); // Mock efficiency

        // 3. Map to JobCard format
        const mappedJobs = myJobs.map(v => ({
            ...v,
            id: v.id,
            job_card_no: v.id ? `JC-${v.id.substring(0, 4).toUpperCase()}` : 'JC-####',
            price: '$150.00',
            vehicle: { make: v.make, model: v.model, reg: v.reg_number },
            assigned_to: v.assigned_to,
            progress: calculateProgress(v.tasks || []),
            delivery_due: 'Today',
            priority: (v as any).priority || 'Normal', // Cast to any to avoid strict type error if interface missing priority
            status: v.status
        }));

        setJobs(mappedJobs);
    };

    const calculateProgress = (tasks: any[]) => {
        if (!tasks || tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.status === 'completed').length;
        return Math.round((completed / tasks.length) * 100);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const filteredJobs =
        selectedFilter === 'All'
            ? jobs
            : jobs.filter(
                j => {
                    if (selectedFilter === 'Pending') return j.status === 'Scheduled';
                    if (selectedFilter === 'In Progress') return j.status === 'In Shop';
                    if (selectedFilter === 'Completed') return j.status === 'Completed' || j.status === 'Ready';
                    return j.priority === selectedFilter;
                }
            );

    const FilterTab = ({ label }: { label: string }) => (
        <TouchableOpacity
            onPress={() => setSelectedFilter(label)}
            className={`px-2 py-1 mr-2 rounded-full border ${selectedFilter === label
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
                        value={stats.pending}
                        icon="time-outline"
                        color="#3b82f6"
                        onPress={() => setSelectedFilter('Pending')}
                    />
                    <StatCard
                        label="Completed"
                        value={stats.completed}
                        icon="checkmark-done-circle-outline"
                        color="#22c55e"
                        onPress={() => setSelectedFilter('Completed')}
                    />
                    <StatCard
                        label="Efficiency"
                        value={stats.efficiency}
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
                            onPress={() => (navigation as any).navigate('JobTasksDetail', { jobId: job.id })}
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
