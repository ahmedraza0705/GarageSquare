// ============================================
// TECHNICIAN DASHBOARD
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import StatusBadge from '@/components/StatusBadge';
import { Ionicons } from '@expo/vector-icons';

export default function TechnicianDashboard() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    todayJobs: 0,
    inProgress: 0,
    completed: 0,
    pendingApproval: 0,
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // In a real app with Supabase connected, we'd fetch counts here
      // For now, using static mock data structure as requested

      // Mock Stats
      setStats({
        todayJobs: 3,
        inProgress: 1,
        completed: 2,
        pendingApproval: 1,
      });

      // Mock Recent Jobs
      setRecentJobs([
        {
          id: 'job_001',
          job_number: 'JOB-2023-001',
          vehicle: { make: 'Toyota', model: 'Camry', license_plate: 'ABC-123' },
          status: 'in_progress',
          priority: 'urgent',
          assigned_at: '2025-12-24T09:00:00Z',
        },
        {
          id: 'job_002',
          job_number: 'JOB-2023-002',
          vehicle: { make: 'Honda', model: 'Civic', license_plate: 'XYZ-789' },
          status: 'pending',
          priority: 'normal',
          assigned_at: '2025-12-24T10:30:00Z',
        },
        {
          id: 'job_003',
          job_number: 'JOB-2023-003',
          vehicle: { make: 'Ford', model: 'Focus', license_plate: 'LMN-456' },
          status: 'completed',
          priority: 'normal',
          assigned_at: '2025-12-23T14:15:00Z',
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, color, icon }: any) => (
    <View className={`bg-white rounded-xl p-4 mb-4 shadow-sm border-l-4 ${color} flex-1 mx-1`}>
      <Text className="text-gray-500 text-xs mb-1 font-medium uppercase tracking-wider">{title}</Text>
      <Text className="text-2xl font-bold text-gray-900">{value}</Text>
    </View>
  );

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDashboardData} />}
    >
      {/* Header Section */}
      <View className="bg-white px-6 pt-12 pb-6 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-gray-500 text-sm">Welcome back,</Text>
            <Text className="text-2xl font-bold text-gray-900">
              {user?.profile?.full_name || 'Technician'}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-gray-100 p-2 rounded-full relative"
            onPress={() => navigation.navigate('Notifications' as never)}
          >
            <Ionicons name="notifications-outline" size={24} color="#4b5563" />
            <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 py-6">
        {/* Stats Grid */}
        <View className="flex-row mb-2">
          <StatCard title="Today's Jobs" value={stats.todayJobs} color="border-blue-500" />
          <StatCard title="In Progress" value={stats.inProgress} color="border-indigo-500" />
        </View>
        <View className="flex-row mb-6">
          <StatCard title="Completed" value={stats.completed} color="border-green-500" />
          <StatCard title="Pending App." value={stats.pendingApproval} color="border-orange-500" />
        </View>

        {/* Assigned Jobs Section */}
        <View className="flex-row justify-between items-center mb-4 px-1">
          <Text className="text-lg font-bold text-gray-900">Assigned Jobs</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyJobCards' as never)}>
            <Text className="text-blue-600 text-sm font-semibold">View All</Text>
          </TouchableOpacity>
        </View>

        {recentJobs.map((job) => (
          <TouchableOpacity
            key={job.id}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            onPress={() => navigation.navigate('TechnicianJobDetail' as never, { jobCardId: job.id } as never)}
          >
            <View className="flex-row justify-between items-start mb-2">
              <View>
                <Text className="text-xs text-gray-500 font-medium mb-1">{job.job_number}</Text>
                <Text className="text-base font-bold text-gray-900">
                  {job.vehicle.make} {job.vehicle.model}
                </Text>
                <Text className="text-sm text-gray-600">{job.vehicle.license_plate}</Text>
              </View>
              <StatusBadge status={job.status} size="sm" />
            </View>

            <View className="h-[1px] bg-gray-100 my-3" />

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className={`w-2 h-2 rounded-full mr-2 ${job.priority === 'urgent' ? 'bg-red-500' : 'bg-green-500'}`} />
                <Text className={`text-xs font-medium ${job.priority === 'urgent' ? 'text-red-500' : 'text-gray-500'}`}>
                  {job.priority === 'urgent' ? 'High Priority' : 'Normal Priority'}
                </Text>
              </View>
              <Text className="text-xs text-gray-400">
                {new Date(job.assigned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
