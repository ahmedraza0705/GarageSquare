import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { vehicleService } from '../services/VehicleService';
import Header from '../components/Header';
import JobCard from '../components/JobCard';

export default function JobTasksScreen() {
    const navigation = useNavigation<any>();

    // Local state for combined/filtered jobs
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<'Pending' | 'Active' | 'Done'>('Pending');
    const [counts, setCounts] = useState({ Pending: 0, Active: 0, Done: 0 });
    const [refreshing, setRefreshing] = useState(false);

    // Mock Logged In User (In real app, get from useAuth())
    const CURRENT_USER = 'Ahmed Raza';

    const loadJobs = async () => {
        await vehicleService.init();
        const allVehicleJobs = vehicleService.getAll();

        // 1. Strict Assignment Visibility: Filter by Assigned Technician
        const vehicleJobs = allVehicleJobs.filter(j => j.assigned_to === CURRENT_USER);

        // Calculate Counts (now only for assigned jobs)
        const pendingCount = vehicleJobs.filter(v => v.status === 'Scheduled').length;
        const activeCount = vehicleJobs.filter(v => v.status === 'In Shop').length;
        const doneCount = vehicleJobs.filter(v => v.status === 'Ready').length;
        setCounts({ Pending: pendingCount, Active: activeCount, Done: doneCount });

        // Map to JobCard format
        const mapped = vehicleJobs.map(v => {
            const totalTasks = v.tasks?.length || 0;
            const completed = v.tasks?.filter((t: any) => t.status === 'completed').length || 0;
            const progress = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

            return {
                ...v,
                id: v.id,
                job_card_no: `JC-${v.id.substring(0, 4).toUpperCase()}`,
                price: '$150.00', // Mock
                vehicle: {
                    make: v.make,
                    model: v.model,
                    reg: v.reg_number
                },
                assigned_to: v.assigned_to,
                progress,
                delivery_due: 'Today',
                priority: 'Normal',
                status: v.status || 'Scheduled'
            };
        });

        // Filter Logic
        const filtered = mapped.filter(item => {
            const status = item.status;

            if (selectedFilter === 'Pending') {
                return status === 'Scheduled';
            } else if (selectedFilter === 'Active') {
                return status === 'In Shop';
            } else if (selectedFilter === 'Done') {
                return status === 'Ready';
            }
            return false;
        });

        setJobs(filtered);
    };

    useFocusEffect(
        useCallback(() => {
            loadJobs();
        }, [selectedFilter])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadJobs();
        setRefreshing(false);
    };

    const handleJobPress = (job: any) => {
        // Requirement 3: When assigned (Pending/Scheduled) -> Move to Progress (In Shop)
        if (job.status === 'Scheduled') {
            vehicleService.update(job.id, { status: 'In Shop' });
        }
        navigation.navigate('JobTasksDetail', { jobId: job.id });
    };

    const FilterTab = ({ label, count }: { label: string, count: number }) => (
        <TouchableOpacity
            onPress={() => setSelectedFilter(label as any)}
            className={`px-4 py-2 mr-2 rounded-full border ${selectedFilter === label
                ? 'bg-slate-900 border-slate-900'
                : 'bg-white border-slate-200'
                }`}
        >
            <Text
                className={`text-sm font-semibold ${selectedFilter === label
                    ? 'text-white'
                    : 'text-slate-600'
                    }`}
            >
                {label} ({count})
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#f1f5f9]">
            <StatusBar barStyle="dark-content" />

            {/* Standard Header */}
            <Header title="My Tasks" />

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Dashboard-style Filter Tabs */}
                {/* Using a horizontal ScrollView for tabs to act like tags */}
                <View className="flex-row mb-6">
                    <FilterTab label="Pending" count={counts.Pending} />
                    <FilterTab label="Active" count={counts.Active} />
                    <FilterTab label="Done" count={counts.Done} />
                </View>

                {/* List */}
                {jobs.length === 0 ? (
                    <View className="items-center py-20 opacity-50">
                        <Ionicons name="documents-outline" size={48} color="#94a3b8" />
                        <Text className="text-slate-500 font-medium mt-4">No {selectedFilter.toLowerCase()} tasks found</Text>
                    </View>
                ) : (
                    jobs.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onPress={() => handleJobPress(job)}
                        />
                    ))
                )}
            </ScrollView>
        </View>
    );
}
