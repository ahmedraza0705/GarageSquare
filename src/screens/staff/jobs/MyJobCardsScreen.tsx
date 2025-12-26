// ============================================
// MY JOB CARDS SCREEN (Technician)
// ============================================

import React, { useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import JobCard from '@/roles/technician/components/JobCard';
import { vehicleService } from '@/roles/technician/services/VehicleService';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import Header from '@/roles/technician/components/Header';

export default function MyJobCardsScreen() {
  const navigation = useNavigation();
  const [jobs, setJobs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = async () => {
    await vehicleService.init();
    const vehicles = vehicleService.getAll();
    const mappedJobs = vehicles.map(v => {
      const totalTasks = v.tasks?.length || 0;
      const completed = v.tasks?.filter((t: any) => t.status === 'Completed').length || 0;
      const progress = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
      return {
        id: v.id,
        job_card_no: `JC-${v.id.substring(0, 4).toUpperCase()}`,
        price: '$150.00',
        vehicle: {
          make: v.make,
          model: v.model,
          reg: v.reg_number
        },
        assigned_to: v.assigned_to,
        progress: progress,
        delivery_due: 'Today',
        priority: 'Normal',
        status: v.status
      };
    });
    setJobs(mappedJobs);
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
    <View className="flex-1 bg-[#f1f5f9]">
      <Header title="My Jobs" showNotification={true} />
      <ScrollView
        className="flex-1 px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />}
      >
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onPress={() => (navigation as any).navigate('JobCardDetail', { job })}
          />
        ))}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
