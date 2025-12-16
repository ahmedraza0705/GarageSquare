// ============================================
// SUPERVISOR DASHBOARD
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeJobCards: 0,
    pendingTasks: 0,
    completedToday: 0,
    teamMembers: 0,
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
          activeJobCards: 0,
          pendingTasks: 0,
          completedToday: 0,
          teamMembers: 0,
        });
        return;
      }

      // Active job cards
      const { count: activeJobCards } = await supabase
        .from('job_cards')
        .select('*', { count: 'exact', head: true })
        .eq('supervisor_id', user?.id)
        .in('status', ['pending', 'in_progress']);

      // Pending tasks
      const { count: pendingTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Completed today
      const today = new Date().toISOString().split('T')[0];
      const { count: completedToday } = await supabase
        .from('job_cards')
        .select('*', { count: 'exact', head: true })
        .eq('supervisor_id', user?.id)
        .eq('status', 'completed')
        .gte('completed_at', today);

      setStats({
        activeJobCards: activeJobCards || 0,
        pendingTasks: pendingTasks || 0,
        completedToday: completedToday || 0,
        teamMembers: 0, // TODO: Calculate team members
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default stats on error
      setStats({
        activeJobCards: 0,
        pendingTasks: 0,
        completedToday: 0,
        teamMembers: 0,
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
          Supervisor Dashboard
        </Text>

        <View className="flex-row flex-wrap -mx-2">
          <View className="w-1/2 px-2">
            <StatCard title="Active Job Cards" value={stats.activeJobCards} />
          </View>
          <View className="w-1/2 px-2">
            <StatCard title="Pending Tasks" value={stats.pendingTasks} />
          </View>
          <View className="w-1/2 px-2">
            <StatCard title="Completed Today" value={stats.completedToday} />
          </View>
          <View className="w-1/2 px-2">
            <StatCard title="Team Members" value={stats.teamMembers} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

