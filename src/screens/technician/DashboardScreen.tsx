// ============================================
// TECHNICIAN DASHBOARD
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myJobCards: 0,
    myTasks: 0,
    completedToday: 0,
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
          myJobCards: 0,
          myTasks: 0,
          completedToday: 0,
        });
        return;
      }

      // My job cards
      const { count: myJobCards } = await supabase
        .from('job_cards')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', user?.id)
        .in('status', ['pending', 'in_progress']);

      // My tasks
      const { count: myTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', user?.id)
        .in('status', ['pending', 'in_progress']);

      // Completed today
      const today = new Date().toISOString().split('T')[0];
      const { count: completedToday } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', user?.id)
        .eq('status', 'completed')
        .gte('completed_at', today);

      setStats({
        myJobCards: myJobCards || 0,
        myTasks: myTasks || 0,
        completedToday: completedToday || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default stats on error
      setStats({
        myJobCards: 0,
        myTasks: 0,
        completedToday: 0,
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
          My Dashboard
        </Text>

        <View className="flex-row flex-wrap -mx-2">
          <View className="w-1/2 px-2">
            <StatCard title="My Job Cards" value={stats.myJobCards} />
          </View>
          <View className="w-1/2 px-2">
            <StatCard title="My Tasks" value={stats.myTasks} />
          </View>
          <View className="w-1/2 px-2">
            <StatCard title="Completed Today" value={stats.completedToday} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

