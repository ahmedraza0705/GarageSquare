import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { vehicleService } from '../services/VehicleService';
import JobCard from '../components/JobCard';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

export default function JobCardsScreen() {
    const navigation = useNavigation();
    const [jobs, setJobs] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadJobs = async () => {
        await vehicleService.init();
        const all = vehicleService.getAll();
        // Since this is "My Job Cards", technically it should be all assigned. 
        // We'll show Scheduled and In Shop here.
        const assigned = all.filter(j => j.status === 'Scheduled' || j.status === 'In Shop');

        const mapped = assigned.map(v => {
            const totalTasks = v.tasks?.length || 0;
            const completed = v.tasks?.filter((t: any) => t.status === 'completed').length || 0;
            const progress = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
            return {
                ...v,
                id: v.id,
                job_card_no: `JC-${v.id.substring(0, 4).toUpperCase()}`,
                price: '$150.00',
                vehicle: { make: v.make, model: v.model, reg: v.reg_number },
                assigned_to: v.assigned_to,
                progress,
                delivery_due: 'Today',
                priority: 'Normal',
                status: v.status
            };
        });
        setJobs(mapped);
    };

    useFocusEffect(
        useCallback(() => {
            loadJobs();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadJobs();
        setRefreshing(false);
    };

    return (
        <View className="flex-1 bg-gray-50">
            <Header title="My Job Cards" />
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {jobs.length > 0 ? jobs.map(job => (
                    <JobCard
                        key={job.id}
                        job={job}
                        onPress={() => (navigation as any).navigate('JobTasksDetail', { jobId: job.id })}
                    />
                )) : (
                    <View className="items-center py-20">
                        <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
                        <Text className="text-gray-400 mt-4">No job cards found</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
