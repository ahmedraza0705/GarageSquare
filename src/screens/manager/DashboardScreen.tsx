// ============================================
// MANAGER DASHBOARD
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';

export default function ManagerDashboard() {
  const { branchId } = useRole();
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    jobCards: 0,
    revenue: 0,
  });

  useEffect(() => {
    if (branchId) {
      loadStats();
    }
  }, [branchId]);

  const loadStats = async () => {
    try {
      // Check if Supabase is disabled
      if (!supabase) {
        console.warn('Supabase is disabled - using default stats');
        setStats({
          customers: 0,
          vehicles: 0,
          jobCards: 0,
          revenue: 0,
        });
        return;
      }

      // Get customers count
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', branchId);

      // Get vehicles count
      const { count: vehiclesCount } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', branchId);

      // Get job cards count
      const { count: jobCardsCount } = await supabase
        .from('job_cards')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', branchId);

      // Get revenue
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      const revenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      setStats({
        customers: customersCount || 0,
        vehicles: vehiclesCount || 0,
        jobCards: jobCardsCount || 0,
        revenue,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default stats on error
      setStats({
        customers: 0,
        vehicles: 0,
        jobCards: 0,
        revenue: 0,
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
          Branch Dashboard
        </Text>

        <View className="flex-row flex-wrap -mx-2">
          <View className="w-1/2 px-2">
            <StatCard title="Customers" value={stats.customers} />
          </View>
          <View className="w-1/2 px-2">
            <StatCard title="Vehicles" value={stats.vehicles} />
          </View>
          <View className="w-1/2 px-2">
            <StatCard title="Job Cards" value={stats.jobCards} />
          </View>
          <View className="w-1/2 px-2">
            <StatCard title="Revenue" value={`$${stats.revenue.toFixed(2)}`} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

