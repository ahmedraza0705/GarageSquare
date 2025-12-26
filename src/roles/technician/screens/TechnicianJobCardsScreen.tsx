import React, { useState, useCallback } from 'react';
import { View, Platform, StatusBar, ScrollView, Text } from 'react-native';
import JobCard from '../components/JobCard';
import Header from '../components/Header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { vehicleService } from '../services/VehicleService';
import { Ionicons } from '@expo/vector-icons';

export default function TechnicianJobCardsScreen() {
    const navigation = useNavigation();
    const [jobs, setJobs] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {
            const fetchJobs = async () => {
                await vehicleService.init();
                const vehicles = vehicleService.getAll();
                const mappedJobs = vehicles.map(v => {
                    const totalTasks = v.tasks?.length || 0;
                    const completed = v.tasks?.filter((t: any) => t.status === 'Completed').length || 0;
                    const progress = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

                    return {
                        id: v.id,
                        job_card_no: `JC-${v.id.substring(0, 4).toUpperCase()}`,
                        price: '$150.00', // Mock price or calculate
                        vehicle: {
                            make: v.make,
                            model: v.model,
                            reg: v.reg_number
                        },
                        assigned_to: v.assigned_to,
                        progress: progress,
                        delivery_due: 'Today', // Mock or use timeline
                        priority: 'Normal', // Mock or derive
                        status: v.status
                    };
                });
                setJobs(mappedJobs);
            };
            fetchJobs();
        }, [])
    );

    return (
        <View className="flex-1 bg-[#f1f5f9]">
            <StatusBar barStyle="dark-content" />

            <Header title="Job Cards" />

            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {jobs.length > 0 ? (
                    jobs.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onPress={() => (navigation as any).navigate('JobCardDetail', { job })}
                        />
                    ))
                ) : (
                    <View className="items-center justify-center py-20 opacity-50">
                        <Ionicons name="documents-outline" size={64} color="#94a3b8" />
                        <Text className="text-slate-500 font-medium mt-4">No job cards found</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
