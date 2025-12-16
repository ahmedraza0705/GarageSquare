// ============================================
// TECHNICIAN GROUP MANAGER DASHBOARD
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function TechnicianGroupManagerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    assignedJobCards: 0,
    pendingAssignments: 0,
    activeTasks: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Check if Supabase is disabled
      if (!supabase) {
        console.warn('Supabase is disabled - using default stats');
        setStats({
          assignedJobCards: 0,
          pendingAssignments: 0,
          activeTasks: 0,
        });
        return;
      }

      // This would need to be filtered by assignments made by this manager
      const { count: assignedJobCards } = await supabase
        .from('job_cards')
        .select('*', { count: 'exact', head: true })
        .not('assigned_to', 'is', null);

      const { count: pendingAssignments } = await supabase
        .from('job_cards')
        .select('*', { count: 'exact', head: true })
        .is('assigned_to', null)
        .eq('status', 'pending');

      const { count: activeTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress']);

      setStats({
        assignedJobCards: assignedJobCards || 0,
        pendingAssignments: pendingAssignments || 0,
        activeTasks: activeTasks || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default stats on error
      setStats({
        assignedJobCards: 0,
        pendingAssignments: 0,
        activeTasks: 0,
      });
    }
  };

  const StatCard = ({ title, value }: { title: string; value: string | number }) => (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      <Text className="text-gray-500 text-sm mb-2">{title}</Text>
      <Text className="text-2xl font-bold text-gray-900">{value}</Text>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-6 py-4">
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Assignment Dashboard
        </Text>

        <View className="flex-row flex-wrap -mx-2">
          <View className="w-1/2 px-2">
            <StatCard title="Assigned Jobs" value={stats.assignedJobCards} />
          </View>
          <View className="w-1/2 px-2">
            <StatCard title="Pending Assignments" value={stats.pendingAssignments} />
          </View>
          <View className="w-1/2 px-2">
            <StatCard title="Active Tasks" value={stats.activeTasks} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

